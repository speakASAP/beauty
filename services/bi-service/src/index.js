/**
 * BI Service
 * Aggregates, analytics, read models, business intelligence
 * Purely reactive - consumes all domain events and maintains read models
 */

import express from 'express';
import { Pool } from 'pg';
import {
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  tenantStateValidationMiddleware,
  createLoggingContext
} from '@beauty/tenant-middleware';
import { createEventBus } from '@beauty/event-bus';
import { createLogger, loggingMiddleware } from '@beauty/logger';

const app = express();
app.use(express.json());

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Event bus
const eventBus = createEventBus(process.env.NATS_URL || 'nats://nats:4222');

// Logger
const logger = createLogger(process.env.SERVICE_NAME || 'bi-service');

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to ALL domain events for BI aggregation
    // Note: Subscriptions must be inside connect().then() to avoid race conditions
    const eventTypes = [
      'appointment.*',
      'order.*',
      'payment.*',
      'inventory.*',
      'visit.*',
      'client.*'
    ];

    for (const eventType of eventTypes) {
      try {
        await eventBus.subscribe(eventType, async (event) => {
          await processEvent(event);
        });
        await logger.info(`Subscribed to ${eventType} events`);
      } catch (error) {
        await logger.error(`Failed to subscribe to ${eventType}`, { error: error.message });
      }
    }
  } catch (error) {
    await logger.error('Failed to connect to event bus', { error: error.message });
  }
})();

// Order-to-client mapping cache (for LTV calculation)
// Maps order_id -> client_id from order.created events
// Used when processing order.closed events
const orderClientCache = new Map();

// Process event (idempotent)
async function processEvent(event) {
  const client = await db.connect();
  try {
    // Set tenant context from event
    await client.query('SET app.tenant_id = $1', [event.tenant_id]);
    await client.query('SET app.is_franchisor = false');

    // Check if event already processed (idempotency)
    const existingLog = await client.query(
      'SELECT id FROM bi.event_processing_log WHERE event_id = $1',
      [event.event_id]
    );

    if (existingLog.rows.length > 0) {
      await logger.debug('Event already processed, skipping', {
        event_id: event.event_id,
        event_type: event.event_type
      });
      return;
    }

    // Process event based on type
    await handleEvent(event, client);

    // Log event processing
    await client.query(
      'INSERT INTO bi.event_processing_log (event_id, event_type, tenant_id) VALUES ($1, $2, $3)',
      [event.event_id, event.event_type, event.tenant_id]
    );

    await logger.debug('Event processed', {
      event_id: event.event_id,
      event_type: event.event_type,
      tenant_id: event.tenant_id
    });
  } catch (error) {
    await logger.error('Error processing event', {
      error: error.message,
      stack: error.stack,
      event_id: event.event_id,
      event_type: event.event_type,
      tenant_id: event.tenant_id
    });
  } finally {
    await client.query('RESET app.tenant_id').catch(() => {});
    await client.query('RESET app.is_franchisor').catch(() => {});
    client.release();
  }
}

// Handle event and update aggregates
async function handleEvent(event, client) {
  const eventType = event.event_type;
  const payload = event.payload || {};
  const occurredAt = new Date(event.occurred_at);
  const saleDate = occurredAt.toISOString().split('T')[0]; // Extract date

  // Appointment events
  if (eventType === 'appointment.booked') {
    await updateAppointmentAggregates(client, event.tenant_id, saleDate, 'booked');
  } else if (eventType === 'appointment.completed') {
    await updateAppointmentAggregates(client, event.tenant_id, saleDate, 'completed');
    if (payload.master_id) {
      const duration = payload.actual_duration_minutes || payload.duration_minutes || 0;
      await updateMasterUtilization(client, event.tenant_id, payload.master_id, saleDate, duration);
    }
  } else if (eventType === 'appointment.cancelled') {
    await updateAppointmentAggregates(client, event.tenant_id, saleDate, 'cancelled');
  } else if (eventType === 'appointment.no_show') {
    await updateAppointmentAggregates(client, event.tenant_id, saleDate, 'no_show');
  }

  // Order events
  else if (eventType === 'order.created') {
    const totalAmount = payload.total_amount || 0;
    const vatAmount = payload.vat_amount || 0;
    const orderId = payload.order_id;
    const clientId = payload.client_id;
    
    // Store order -> client mapping for LTV calculation when order.closed arrives
    if (orderId && clientId) {
      orderClientCache.set(orderId, clientId);
      // Clean up old entries (keep cache size reasonable - last 10000 orders)
      if (orderClientCache.size > 10000) {
        const firstKey = orderClientCache.keys().next().value;
        orderClientCache.delete(firstKey);
      }
    }
    
    await updateDailySales(client, event.tenant_id, saleDate, totalAmount, vatAmount, 1, 0);
  } else if (eventType === 'order.closed') {
    // Order closed - update client LTV from final order amount
    // P1.6: LTV skeleton - track client lifetime value from completed orders
    const orderId = payload.order_id;
    const finalTotalAmount = payload.final_total_amount || 0;
    
    if (orderId && finalTotalAmount > 0) {
      // Get client_id from cache (stored from order.created event)
      let clientId = orderClientCache.get(orderId);
      
      // Fallback: Query client_id from order if not in cache
      if (!clientId) {
        const orderResult = await client.query(`
          SELECT client_id FROM pos.orders
          WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
        `, [orderId]);
        
        if (orderResult.rows.length > 0 && orderResult.rows[0].client_id) {
          clientId = orderResult.rows[0].client_id;
        }
      }
      
      if (clientId) {
        await updateClientLTV(client, event.tenant_id, clientId, finalTotalAmount, saleDate);
      } else {
        await logger.warn('Could not find client_id for order.closed event', {
          order_id: orderId,
          tenant_id: event.tenant_id
        });
      }
    }
  }

  // Payment events
  else if (eventType === 'payment.received') {
    await updateDailySales(client, event.tenant_id, saleDate, 0, 0, 0, 1);
  } else if (eventType === 'payment.confirmed') {
    // Payment confirmed - no additional aggregation needed
  }

  // Client events
  else if (eventType === 'client.registered') {
    // Client registered - initialize LTV if not exists (will be updated when orders are closed)
    const clientId = payload.client_id;
    if (clientId) {
      // Check if LTV record exists, if not create with zero values
      const existing = await client.query(
        'SELECT id FROM bi.client_ltv WHERE tenant_id = $1 AND client_id = $2',
        [event.tenant_id, clientId]
      );
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO bi.client_ltv (
            tenant_id, client_id, total_visits, total_spent, first_visit_date, last_visit_date, average_visit_value
          ) VALUES ($1, $2, 0, 0, NULL, NULL, 0)
          ON CONFLICT (tenant_id, client_id) DO NOTHING
        `, [event.tenant_id, clientId]);
      }
    }
  } else if (eventType === 'client.visit_recorded') {
    // Legacy event - if it exists, use it; otherwise LTV is updated from order.closed
    const clientId = payload.client_id;
    const visitAmount = payload.total_amount || 0;
    const visitDate = payload.visit_date ? new Date(payload.visit_date).toISOString().split('T')[0] : saleDate;
    if (clientId && visitAmount > 0) {
      await updateClientLTV(client, event.tenant_id, clientId, visitAmount, visitDate);
    }
  }

  // Visit events
  else if (eventType === 'visit.started') {
    // Visit started - track for future analytics (visit duration, walk-in vs appointment)
    // For MVP, we just acknowledge the event
    await logger.debug('Visit started event received', {
      visit_id: payload.visit_id,
      tenant_id: event.tenant_id
    });
  } else if (eventType === 'visit.closed') {
    // Visit closed - track for future analytics
    // Sales are tracked via order.created/order.closed, not visit.closed
    // LTV is updated from order.closed which contains client_id and final_total_amount
    // For MVP, we just acknowledge the event
    await logger.debug('Visit closed event received', {
      visit_id: payload.visit_id,
      tenant_id: event.tenant_id
    });
  }

  // Inventory events
  else if (eventType === 'inventory.decreased') {
    const itemId = payload.item_id;
    const quantity = payload.quantity || 0;
    if (itemId && quantity > 0) {
      await updateInventoryUsage(client, event.tenant_id, itemId, saleDate, quantity);
    }
  }
}

// Update daily sales aggregate
async function updateDailySales(client, tenantId, saleDate, amount, vatAmount, orderCount, paymentCount) {
  await client.query(`
    INSERT INTO bi.daily_sales (
      tenant_id, sale_date, total_amount, total_vat_amount, order_count, payment_count
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tenant_id, sale_date)
    DO UPDATE SET
      total_amount = bi.daily_sales.total_amount + EXCLUDED.total_amount,
      total_vat_amount = bi.daily_sales.total_vat_amount + EXCLUDED.total_vat_amount,
      order_count = bi.daily_sales.order_count + EXCLUDED.order_count,
      payment_count = bi.daily_sales.payment_count + EXCLUDED.payment_count,
      updated_at = NOW()
  `, [tenantId, saleDate, amount, vatAmount, orderCount, paymentCount]);
}

// Update master utilization aggregate
async function updateMasterUtilization(client, tenantId, masterId, utilizationDate, durationMinutes) {
  await client.query(`
    INSERT INTO bi.master_utilization (
      tenant_id, master_id, utilization_date, appointments_completed, total_duration_minutes
    ) VALUES ($1, $2, $3, 1, $4)
    ON CONFLICT (tenant_id, master_id, utilization_date)
    DO UPDATE SET
      appointments_completed = bi.master_utilization.appointments_completed + 1,
      total_duration_minutes = bi.master_utilization.total_duration_minutes + EXCLUDED.total_duration_minutes,
      updated_at = NOW()
  `, [tenantId, masterId, utilizationDate, durationMinutes]);
}

// Update client LTV aggregate
async function updateClientLTV(client, tenantId, clientId, visitAmount, visitDate) {
  // Get current LTV
  const current = await client.query(
    'SELECT * FROM bi.client_ltv WHERE tenant_id = $1 AND client_id = $2',
    [tenantId, clientId]
  );

  if (current.rows.length === 0) {
    // First visit
    await client.query(`
      INSERT INTO bi.client_ltv (
        tenant_id, client_id, total_visits, total_spent, first_visit_date, last_visit_date, average_visit_value
      ) VALUES ($1, $2, 1, $3, $4, $4, $3)
    `, [tenantId, clientId, visitAmount, visitDate]);
  } else {
    // Update existing
    const totalVisits = current.rows[0].total_visits + 1;
    const totalSpent = current.rows[0].total_spent + visitAmount;
    const averageVisitValue = Math.round(totalSpent / totalVisits);
    const firstVisitDate = current.rows[0].first_visit_date || visitDate;

    await client.query(`
      UPDATE bi.client_ltv
      SET
        total_visits = $1,
        total_spent = $2,
        last_visit_date = $3,
        average_visit_value = $4,
        updated_at = NOW()
      WHERE tenant_id = $5 AND client_id = $6
    `, [totalVisits, totalSpent, visitDate, averageVisitValue, tenantId, clientId]);
  }
}

// Update inventory usage aggregate
async function updateInventoryUsage(client, tenantId, itemId, usageDate, quantity) {
  await client.query(`
    INSERT INTO bi.inventory_usage (
      tenant_id, item_id, usage_date, quantity_used
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (tenant_id, item_id, usage_date)
    DO UPDATE SET
      quantity_used = bi.inventory_usage.quantity_used + EXCLUDED.quantity_used,
      updated_at = NOW()
  `, [tenantId, itemId, usageDate, quantity]);
}

// Update appointment aggregates
async function updateAppointmentAggregates(client, tenantId, appointmentDate, status) {
  const fieldMap = {
    booked: 'appointments_booked',
    completed: 'appointments_completed',
    cancelled: 'appointments_cancelled',
    no_show: 'appointments_no_show'
  };

  const field = fieldMap[status];
  if (!field) return;

  await client.query(`
    INSERT INTO bi.appointment_aggregates (
      tenant_id, appointment_date, ${field}
    ) VALUES ($1, $2, 1)
    ON CONFLICT (tenant_id, appointment_date)
    DO UPDATE SET
      ${field} = bi.appointment_aggregates.${field} + 1,
      updated_at = NOW()
  `, [tenantId, appointmentDate]);

  // Recalculate rates
  await client.query(`
    UPDATE bi.appointment_aggregates
    SET
      cancellation_rate = CASE
        WHEN appointments_booked > 0 THEN
          ROUND((appointments_cancelled::DECIMAL / appointments_booked::DECIMAL) * 100, 2)
        ELSE 0
      END,
      no_show_rate = CASE
        WHEN appointments_booked > 0 THEN
          ROUND((appointments_no_show::DECIMAL / appointments_booked::DECIMAL) * 100, 2)
        ELSE 0
      END
    WHERE tenant_id = $1 AND appointment_date = $2
  `, [tenantId, appointmentDate]);
}

// Health check endpoint (before tenant middleware - no auth required)
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const dbHealthy = true;
    const eventBusHealthy = eventBusConnected && eventBus.isConnected();

    const health = {
      status: dbHealthy && eventBusHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        eventBus: eventBusHealthy ? 'healthy' : 'unhealthy'
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    await logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Tenant context middleware (extract and validate)
app.use(tenantContextMiddleware());

// Database tenant context middleware (set app.tenant_id for RLS)
app.use(dbTenantContextMiddleware(db));

// Tenant state validation middleware (for read operations - allows SUSPENDED tenants)
app.use(tenantStateValidationMiddleware(db, { allowReadOnly: true }));

// Logging middleware (attaches req.logger with tenant context)
app.use(loggingMiddleware(logger));

// GET /analytics/daily-sales - Get daily sales by date range
app.get('/analytics/daily-sales', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['from_date', 'to_date']
      });
    }

    const result = await dbClient.query(`
      SELECT * FROM bi.daily_sales
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND sale_date >= $1
        AND sale_date <= $2
      ORDER BY sale_date ASC
    `, [from_date, to_date]);

    res.json({
      daily_sales: result.rows.map(row => ({
        sale_date: row.sale_date.toISOString().split('T')[0],
        total_amount: row.total_amount,
        total_vat_amount: row.total_vat_amount,
        order_count: row.order_count,
        payment_count: row.payment_count
      }))
    });
  } catch (error) {
    await logger.error('Error getting daily sales', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /analytics/master-utilization - Get master utilization by date range
app.get('/analytics/master-utilization', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { master_id, from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['from_date', 'to_date']
      });
    }

    let query = `
      SELECT * FROM bi.master_utilization
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND utilization_date >= $1
        AND utilization_date <= $2
    `;
    const params = [from_date, to_date];

    if (master_id) {
      query += ' AND master_id = $3';
      params.push(master_id);
    }

    query += ' ORDER BY utilization_date ASC, master_id ASC';

    const result = await dbClient.query(query, params);

    res.json({
      master_utilization: result.rows.map(row => ({
        master_id: row.master_id,
        utilization_date: row.utilization_date.toISOString().split('T')[0],
        appointments_completed: row.appointments_completed,
        total_duration_minutes: row.total_duration_minutes,
        utilization_percentage: parseFloat(row.utilization_percentage || 0)
      }))
    });
  } catch (error) {
    await logger.error('Error getting master utilization', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /analytics/client-ltv - Get client lifetime value
app.get('/analytics/client-ltv', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { client_id, limit = 100 } = req.query;

    let query = `
      SELECT * FROM bi.client_ltv
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
    `;
    const params = [];

    if (client_id) {
      query += ' AND client_id = $1';
      params.push(client_id);
    }

    query += ' ORDER BY total_spent DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await dbClient.query(query, params);

    res.json({
      client_ltv: result.rows.map(row => ({
        client_id: row.client_id,
        total_visits: row.total_visits,
        total_spent: row.total_spent,
        first_visit_date: row.first_visit_date?.toISOString().split('T')[0],
        last_visit_date: row.last_visit_date?.toISOString().split('T')[0],
        average_visit_value: row.average_visit_value
      }))
    });
  } catch (error) {
    await logger.error('Error getting client LTV', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /analytics/appointment-aggregates - Get appointment aggregates by date range
app.get('/analytics/appointment-aggregates', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['from_date', 'to_date']
      });
    }

    const result = await dbClient.query(`
      SELECT * FROM bi.appointment_aggregates
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND appointment_date >= $1
        AND appointment_date <= $2
      ORDER BY appointment_date ASC
    `, [from_date, to_date]);

    res.json({
      appointment_aggregates: result.rows.map(row => ({
        appointment_date: row.appointment_date.toISOString().split('T')[0],
        appointments_booked: row.appointments_booked,
        appointments_completed: row.appointments_completed,
        appointments_cancelled: row.appointments_cancelled,
        appointments_no_show: row.appointments_no_show,
        cancellation_rate: parseFloat(row.cancellation_rate || 0),
        no_show_rate: parseFloat(row.no_show_rate || 0)
      }))
    });
  } catch (error) {
    await logger.error('Error getting appointment aggregates', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /analytics/inventory-usage - Get inventory usage by date range
app.get('/analytics/inventory-usage', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { item_id, from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        error: 'Missing required query parameters',
        required: ['from_date', 'to_date']
      });
    }

    let query = `
      SELECT * FROM bi.inventory_usage
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND usage_date >= $1
        AND usage_date <= $2
    `;
    const params = [from_date, to_date];

    if (item_id) {
      query += ' AND item_id = $3';
      params.push(item_id);
    }

    query += ' ORDER BY usage_date ASC, item_id ASC';

    const result = await dbClient.query(query, params);

    res.json({
      inventory_usage: result.rows.map(row => ({
        item_id: row.item_id,
        usage_date: row.usage_date.toISOString().split('T')[0],
        quantity_used: row.quantity_used
      }))
    });
  } catch (error) {
    await logger.error('Error getting inventory usage', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  const requestLogger = req.logger || logger;
  await requestLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 4115;
app.listen(PORT, async () => {
  await logger.info(`BI service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});


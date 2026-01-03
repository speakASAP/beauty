/**
 * Beauty POS Service
 * Sales logic, order creation, visit management
 */

import express from 'express';
import { Pool } from 'pg';
import { randomUUID } from 'uuid';
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
const logger = createLogger(process.env.SERVICE_NAME || 'beauty-pos-service');

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to appointment.completed events (to create visit from appointment)
    try {
      await eventBus.subscribe('appointment.completed', async (event) => {
        // Get a client from the pool for this event processing
        const client = await db.connect();
        try {
          // Set tenant context from event
          await client.query('SET app.tenant_id = $1', [event.tenant_id]);
          await client.query('SET app.is_franchisor = false');

          await logger.info('Received appointment.completed event', {
            event_id: event.event_id,
            appointment_id: event.aggregate_id,
            tenant_id: event.tenant_id
          });

          // SYNC F: Create visit automatically from appointment.completed
          const appointmentId = event.aggregate_id;
          const payload = event.payload || {};
          const clientId = payload.client_id;
          const masterId = payload.master_id;

          if (!clientId || !masterId) {
            await logger.warn('Missing client_id or master_id in appointment.completed event', {
              appointment_id: appointmentId,
              tenant_id: event.tenant_id,
              payload
            });
            return;
          }

          // Check if visit already exists for this appointment
          const existingVisit = await client.query(`
            SELECT id FROM pos.visits
            WHERE appointment_id = $1
              AND tenant_id = current_setting('app.tenant_id')::uuid
          `, [appointmentId]);

          if (existingVisit.rows.length > 0) {
            await logger.debug('Visit already exists for appointment', {
              appointment_id: appointmentId,
              visit_id: existingVisit.rows[0].id,
              tenant_id: event.tenant_id
            });
            return;
          }

          // Create visit from appointment
          const startedAt = new Date();
          const visitResult = await client.query(`
            INSERT INTO pos.visits (
              tenant_id, client_id, master_id, appointment_id,
              started_at, is_walk_in
            ) VALUES (
              current_setting('app.tenant_id')::uuid,
              $1, $2, $3, $4, false
            ) RETURNING *
          `, [clientId, masterId, appointmentId, startedAt]);

          const visit = visitResult.rows[0];

          // Publish visit.started event
          const tenantContext = {
            tenantId: event.tenant_id,
            userId: event.metadata?.user_id || null,
            correlationId: event.metadata?.correlation_id || randomUUID()
          };

          await publishEvent(
            'visit.started',
            'v1',
            visit.id,
            {
              visit_id: visit.id,
              client_id: visit.client_id,
              master_id: visit.master_id,
              started_at: visit.started_at.toISOString(),
              is_walk_in: visit.is_walk_in,
              appointment_id: visit.appointment_id
            },
            tenantContext,
            event.event_id // causation_id
          );

          await logger.info('Visit created from appointment.completed', {
            visit_id: visit.id,
            appointment_id: appointmentId,
            tenant_id: event.tenant_id
          });
        } catch (error) {
          await logger.error('Error processing appointment.completed event', {
            error: error.message,
            stack: error.stack,
            event_id: event.event_id,
            tenant_id: event.tenant_id
          });
        } finally {
          // Clean up tenant context and release client
          await client.query('RESET app.tenant_id').catch(() => {});
          await client.query('RESET app.is_franchisor').catch(() => {});
          client.release();
        }
      });
      await logger.info('Subscribed to appointment.completed events');
    } catch (error) {
      await logger.error('Failed to subscribe to appointment.completed', { error: error.message });
    }
  } catch (error) {
    await logger.error('Failed to connect to event bus', { error: error.message });
  }
})();

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

// Tenant state validation middleware (for write operations)
app.use(tenantStateValidationMiddleware(db, { allowReadOnly: false }));

// Logging middleware (attaches req.logger with tenant context)
app.use(loggingMiddleware(logger));

// Helper function to publish event
async function publishEvent(eventType, eventVersion, aggregateId, payload, tenantContext, causationId = null) {
  if (!eventBusConnected) {
    throw new Error('Event bus not connected');
  }
  if (!tenantContext.tenantId) {
    throw new Error('Cannot publish domain event: tenant_id is required');
  }

  await eventBus.publish({
    event_type: eventType,
    event_version: eventVersion,
    tenant_id: tenantContext.tenantId,
    aggregate_id: aggregateId,
    occurred_at: new Date().toISOString(),
    payload,
    metadata: {
      user_id: tenantContext.userId,
      correlation_id: tenantContext.correlationId,
      causation_id: causationId
    }
  }, {}, tenantContext);
}

// POST /visits - Start a visit (walk-in or from appointment)
app.post('/visits', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { client_id, master_id, appointment_id, is_walk_in = false } = req.body;

    if (!client_id || !master_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['client_id', 'master_id']
      });
    }

    const startedAt = new Date();

    // Create visit
    const result = await dbClient.query(`
      INSERT INTO pos.visits (
        tenant_id, client_id, master_id, appointment_id,
        started_at, is_walk_in
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, $5
      ) RETURNING *
    `, [client_id, master_id, appointment_id || null, startedAt, is_walk_in]);

    const visit = result.rows[0];

    // Publish visit.started event
    await publishEvent(
      'visit.started',
      'v1',
      visit.id,
      {
        visit_id: visit.id,
        client_id: visit.client_id,
        master_id: visit.master_id,
        started_at: visit.started_at.toISOString(),
        is_walk_in: visit.is_walk_in,
        appointment_id: visit.appointment_id
      },
      tenantContext
    );

    res.status(201).json({
      visit: {
        id: visit.id,
        client_id: visit.client_id,
        master_id: visit.master_id,
        appointment_id: visit.appointment_id,
        started_at: visit.started_at.toISOString(),
        is_walk_in: visit.is_walk_in
      }
    });
  } catch (error) {
    await logger.error('Error starting visit', {
      error: error.message,
      stack: error.stack,
      client_id,
      master_id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /visits/:id/close - Close a visit
app.post('/visits/:id/close', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { id } = req.params;

    // Get visit
    const result = await dbClient.query(`
      SELECT * FROM pos.visits
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = result.rows[0];

    if (visit.closed_at) {
      return res.status(400).json({
        error: 'Visit already closed',
        closed_at: visit.closed_at.toISOString()
      });
    }

    const closedAt = new Date();

    // Update visit
    await dbClient.query(`
      UPDATE pos.visits
      SET closed_at = $1, updated_at = NOW()
      WHERE id = $2
    `, [closedAt, id]);

    // Publish visit.closed event
    await publishEvent(
      'visit.closed',
      'v1',
      id,
      {
        visit_id: id,
        closed_at: closedAt.toISOString(),
        appointment_id: visit.appointment_id
      },
      tenantContext
    );

    res.json({ success: true, visit_id: id, closed_at: closedAt.toISOString() });
  } catch (error) {
    await logger.error('Error closing visit', {
      error: error.message,
      stack: error.stack,
      visit_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /orders - Create an order from a visit
app.post('/orders', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { visit_id, items } = req.body;

    if (!visit_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['visit_id', 'items']
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.service_id && !item.product_id) {
        return res.status(400).json({
          error: 'Each item must have either service_id or product_id'
        });
      }
      if (item.service_id && item.product_id) {
        return res.status(400).json({
          error: 'Item cannot have both service_id and product_id'
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          error: 'Item quantity must be greater than 0'
        });
      }
      if (!item.unit_price || item.unit_price < 0) {
        return res.status(400).json({
          error: 'Item unit_price must be non-negative'
        });
      }
      if (!item.vat_rate || item.vat_rate < 0) {
        return res.status(400).json({
          error: 'Item vat_rate must be non-negative'
        });
      }
    }

    // Get visit
    const visitResult = await dbClient.query(`
      SELECT * FROM pos.visits
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [visit_id]);

    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = visitResult.rows[0];

    // Calculate totals
    let totalAmount = 0;
    let totalVatAmount = 0;

    for (const item of items) {
      const itemTotal = item.unit_price * item.quantity;
      const itemVat = Math.round(itemTotal * (item.vat_rate / 100));
      totalAmount += itemTotal;
      totalVatAmount += itemVat;
    }

    // Create order
    const orderResult = await dbClient.query(`
      INSERT INTO pos.orders (
        tenant_id, visit_id, client_id,
        total_amount, vat_amount, status
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, 'open'
      ) RETURNING *
    `, [visit_id, visit.client_id, totalAmount, totalVatAmount]);

    const order = orderResult.rows[0];

    // Create order items
    const orderItems = [];
    for (const item of items) {
      const itemTotal = item.unit_price * item.quantity;
      const itemVat = Math.round(itemTotal * (item.vat_rate / 100));

      const itemResult = await dbClient.query(`
        INSERT INTO pos.order_items (
          tenant_id, order_id, service_id, product_id,
          quantity, unit_price, vat_rate, vat_amount, total_amount
        ) VALUES (
          current_setting('app.tenant_id')::uuid,
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
      `, [
        order.id,
        item.service_id || null,
        item.product_id || null,
        item.quantity,
        item.unit_price,
        item.vat_rate,
        itemVat,
        itemTotal
      ]);

      orderItems.push(itemResult.rows[0]);
    }

    // Publish order.created event
    await publishEvent(
      'order.created',
      'v1',
      order.id,
      {
        order_id: order.id,
        visit_id: order.visit_id,
        client_id: order.client_id,
        total_amount: order.total_amount,
        vat_amount: order.vat_amount,
        items: orderItems.map(item => ({
          order_item_id: item.id,
          service_id: item.service_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: parseFloat(item.vat_rate)
        }))
      },
      tenantContext
    );

    res.status(201).json({
      order: {
        id: order.id,
        visit_id: order.visit_id,
        client_id: order.client_id,
        total_amount: order.total_amount,
        vat_amount: order.vat_amount,
        status: order.status,
        items: orderItems.map(item => ({
          id: item.id,
          service_id: item.service_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          vat_rate: parseFloat(item.vat_rate),
          total_amount: item.total_amount
        }))
      }
    });
  } catch (error) {
    await logger.error('Error creating order', {
      error: error.message,
      stack: error.stack,
      visit_id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /orders/:id/close - Close an order
app.post('/orders/:id/close', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { id } = req.params;

    // Get order
    const result = await dbClient.query(`
      SELECT * FROM pos.orders
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];

    if (order.status !== 'open') {
      return res.status(400).json({
        error: 'Order cannot be closed',
        current_status: order.status
      });
    }

    const closedAt = new Date();

    // Get order items for event payload (needed by integration hub)
    const orderItemsResult = await dbClient.query(`
      SELECT 
        service_id,
        product_id,
        quantity,
        unit_price,
        vat_rate
      FROM pos.order_items
      WHERE order_id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    const orderItems = orderItemsResult.rows.map(row => ({
      service_id: row.service_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: parseFloat(row.unit_price),
      vat_rate: parseFloat(row.vat_rate)
    }));

    // Get payment method from payment.received events (via event bus subscription cache)
    // For now, we'll track it when payment.received is processed
    // Integration hub will get payment method from payment.received event if needed
    // Default to 'card' if not available
    const paymentMethod = 'card'; // Will be enriched by integration hub from payment.received events

    // Update order
    await dbClient.query(`
      UPDATE pos.orders
      SET status = 'closed', closed_at = $1, updated_at = NOW()
      WHERE id = $2
    `, [closedAt, id]);

    // Get payment status (would check payments service)
    // For now, assume all payments received
    const allPaymentsReceived = true; // TODO: Check actual payment status

    // Publish order.closed event with enriched payload
    await publishEvent(
      'order.closed',
      'v1',
      id,
      {
        order_id: id,
        closed_at: closedAt.toISOString(),
        final_total_amount: order.total_amount,
        final_vat_amount: order.vat_amount,
        payment_status: 'completed',
        all_payments_received: allPaymentsReceived,
        items: orderItems
      },
      tenantContext
    );

    res.json({ success: true, order_id: id, status: 'closed', closed_at: closedAt.toISOString() });
  } catch (error) {
    await logger.error('Error closing order', {
      error: error.message,
      stack: error.stack,
      order_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /orders - List orders
app.get('/orders', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { status, client_id, visit_id, from_date, to_date } = req.query;

    let query = 'SELECT * FROM pos.orders WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (client_id) {
      paramCount++;
      query += ` AND client_id = $${paramCount}`;
      params.push(client_id);
    }

    if (visit_id) {
      paramCount++;
      query += ` AND visit_id = $${paramCount}`;
      params.push(visit_id);
    }

    if (from_date) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(new Date(from_date));
    }

    if (to_date) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(new Date(to_date));
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await dbClient.query(query, params);

    res.json({
      orders: result.rows.map(row => ({
        id: row.id,
        visit_id: row.visit_id,
        client_id: row.client_id,
        total_amount: row.total_amount,
        vat_amount: row.vat_amount,
        status: row.status,
        created_at: row.created_at.toISOString(),
        closed_at: row.closed_at?.toISOString()
      }))
    });
  } catch (error) {
    await logger.error('Error listing orders', {
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
const PORT = process.env.PORT || 4111;
app.listen(PORT, async () => {
  await logger.info(`Beauty POS service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});

/**
 * Customer Service
 * Client data, GDPR compliance, visit history
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
const logger = createLogger(process.env.SERVICE_NAME || 'customer-service');

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to visit.closed events (to record visit in client history)
    try {
      await eventBus.subscribe('visit.closed', async (event) => {
        // Get a client from the pool for this event processing
        const client = await db.connect();
        try {
          // Set tenant context from event
          await client.query('SET app.tenant_id = $1', [event.tenant_id]);
          await client.query('SET app.is_franchisor = false');

          await logger.info('Received visit.closed event', {
            event_id: event.event_id,
            visit_id: event.payload?.visit_id,
            tenant_id: event.tenant_id
          });

          // Process visit.closed event to update client visit history
          // Note: This requires order data which comes from order.created event
          // For now, we record the visit closure - full history will be updated when order data is available
          if (event.payload?.visit_id) {
            // In future, we'll query order data and update client visit history
            // For P1.4, we just log the event
          }
        } catch (error) {
          await logger.error('Error processing visit.closed event', {
            error: error.message,
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
      await logger.info('Subscribed to visit.closed events');
    } catch (error) {
      await logger.error('Failed to subscribe to visit.closed', { error: error.message });
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

// POST /clients - Register a new client
app.post('/clients', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { first_name, last_name, phone, email, gdpr_consent } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['first_name', 'last_name']
      });
    }

    if (!phone && !email) {
      return res.status(400).json({
        error: 'Either phone or email must be provided'
      });
    }

    if (gdpr_consent !== true) {
      return res.status(400).json({
        error: 'GDPR consent is required'
      });
    }

    // Create client
    const result = await dbClient.query(`
      INSERT INTO customer.clients (
        tenant_id, first_name, last_name, phone, email
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4
      ) RETURNING *
    `, [first_name, last_name, phone || null, email || null]);

    const client = result.rows[0];

    // Create GDPR consent record
    await dbClient.query(`
      INSERT INTO customer.client_consents (
        tenant_id, client_id, consent_type, granted, granted_at
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, 'gdpr', true, NOW()
      )
    `, [client.id]);

    // Publish client.registered event
    await publishEvent(
      'client.registered',
      'v1',
      client.id,
      {
        client_id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        phone: client.phone,
        email: client.email,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString()
      },
      tenantContext
    );

    res.status(201).json({
      client: {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        phone: client.phone,
        email: client.email,
        created_at: client.created_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error registering client', {
      error: error.message,
      stack: error.stack,
      first_name,
      last_name
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /clients - List clients
app.get('/clients', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { search, phone, email } = req.query;

    let query = 'SELECT * FROM customer.clients WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (phone) {
      paramCount++;
      query += ` AND phone = $${paramCount}`;
      params.push(phone);
    }

    if (email) {
      paramCount++;
      query += ` AND email = $${paramCount}`;
      params.push(email);
    }

    query += ' ORDER BY last_name, first_name LIMIT 100';

    const result = await dbClient.query(query, params);

    res.json({
      clients: result.rows.map(row => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        email: row.email,
        created_at: row.created_at.toISOString()
      }))
    });
  } catch (error) {
    await logger.error('Error listing clients', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /clients/:id - Get client by ID
app.get('/clients/:id', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { id } = req.params;

    const result = await dbClient.query(`
      SELECT * FROM customer.clients
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = result.rows[0];

    res.json({
      client: {
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        phone: client.phone,
        email: client.email,
        created_at: client.created_at.toISOString(),
        updated_at: client.updated_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error getting client', {
      error: error.message,
      stack: error.stack,
      client_id: id
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
const PORT = process.env.PORT || 4114;
app.listen(PORT, async () => {
  await logger.info(`Customer service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});

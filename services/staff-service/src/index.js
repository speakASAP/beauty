/**
 * Staff Service
 * Master/staff management - manages masters who provide services
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
const logger = createLogger(process.env.SERVICE_NAME || 'staff-service');

// Initialize event bus connection
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');
  } catch (error) {
    await logger.error('Failed to connect to event bus', { error: error.message });
  }
})();

// Health check endpoint (before tenant middleware - no auth required)
app.get('/health', async (req, res) => {
  try {
    // Check database connection (use pool directly for health check)
    await db.query('SELECT 1');
    const dbHealthy = true;

    // Check event bus connection
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

// POST /masters - Create a new master
app.post('/masters', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { first_name, last_name, email, phone, specializations = [] } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['first_name', 'last_name']
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Either email or phone must be provided'
      });
    }

    // Create master
    const result = await dbClient.query(`
      INSERT INTO staff.masters (
        tenant_id, first_name, last_name, email, phone, specializations
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, $5
      ) RETURNING *
    `, [first_name, last_name, email || null, phone || null, specializations]);

    const master = result.rows[0];

    // Publish master.created event
    await publishEvent(
      'master.created',
      'v1',
      master.id,
      {
        master_id: master.id,
        tenant_id: master.tenant_id,
        first_name: master.first_name,
        last_name: master.last_name,
        email: master.email,
        phone: master.phone,
        specializations: master.specializations || [],
        created_at: master.created_at.toISOString()
      },
      tenantContext
    );

    res.status(201).json({
      master: {
        id: master.id,
        first_name: master.first_name,
        last_name: master.last_name,
        email: master.email,
        phone: master.phone,
        specializations: master.specializations || [],
        is_active: master.is_active,
        created_at: master.created_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error creating master', {
      error: error.message,
      stack: error.stack,
      first_name,
      last_name
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /masters - List masters
app.get('/masters', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { search, is_active } = req.query;

    let query = 'SELECT * FROM staff.masters WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY last_name, first_name LIMIT 100';

    const result = await dbClient.query(query, params);

    res.json({
      masters: result.rows.map(row => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        specializations: row.specializations || [],
        is_active: row.is_active,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString()
      }))
    });
  } catch (error) {
    await logger.error('Error listing masters', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /masters/:id - Get master by ID
app.get('/masters/:id', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { id } = req.params;

    const result = await dbClient.query(`
      SELECT * FROM staff.masters
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Master not found' });
    }

    const master = result.rows[0];

    res.json({
      master: {
        id: master.id,
        first_name: master.first_name,
        last_name: master.last_name,
        email: master.email,
        phone: master.phone,
        specializations: master.specializations || [],
        is_active: master.is_active,
        created_at: master.created_at.toISOString(),
        updated_at: master.updated_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error getting master', {
      error: error.message,
      stack: error.stack,
      master_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PATCH /masters/:id - Update master
app.patch('/masters/:id', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { id } = req.params;
    const { first_name, last_name, email, phone, specializations, is_active } = req.body;

    // Get existing master
    const existingResult = await dbClient.query(`
      SELECT * FROM staff.masters
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Master not found' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (first_name !== undefined) {
      paramCount++;
      updates.push(`first_name = $${paramCount}`);
      params.push(first_name);
    }

    if (last_name !== undefined) {
      paramCount++;
      updates.push(`last_name = $${paramCount}`);
      params.push(last_name);
    }

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email);
    }

    if (phone !== undefined) {
      paramCount++;
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
    }

    if (specializations !== undefined) {
      paramCount++;
      updates.push(`specializations = $${paramCount}`);
      params.push(specializations);
    }

    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    paramCount++;
    params.push(id);

    const updateQuery = `
      UPDATE staff.masters
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND tenant_id = current_setting('app.tenant_id')::uuid
      RETURNING *
    `;

    const result = await dbClient.query(updateQuery, params);
    const master = result.rows[0];

    res.json({
      master: {
        id: master.id,
        first_name: master.first_name,
        last_name: master.last_name,
        email: master.email,
        phone: master.phone,
        specializations: master.specializations || [],
        is_active: master.is_active,
        created_at: master.created_at.toISOString(),
        updated_at: master.updated_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error updating master', {
      error: error.message,
      stack: error.stack,
      master_id: id
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
const PORT = process.env.PORT || 4117;
app.listen(PORT, async () => {
  await logger.info(`Staff service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});


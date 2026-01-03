/**
 * Inventory Service
 * Stock movements, inventory tracking, warehouse management
 * Uses existing warehouse-microservice via adapter (to be implemented in P1.5)
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
const logger = createLogger(process.env.SERVICE_NAME || 'inventory-service');

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to order.created events (to decrease inventory for services/products sold)
    try {
      await eventBus.subscribe('order.created', async (event) => {
        // Get a client from the pool for this event processing
        const client = await db.connect();
        try {
          // Set tenant context from event
          await client.query('SET app.tenant_id = $1', [event.tenant_id]);
          await client.query('SET app.is_franchisor = false');

          await logger.info('Received order.created event', {
            event_id: event.event_id,
            order_id: event.payload?.order_id,
            visit_id: event.payload?.visit_id,
            tenant_id: event.tenant_id
          });

          const orderId = event.payload?.order_id;
          const visitId = event.payload?.visit_id;
          const items = event.payload?.items || [];

          if (!orderId || items.length === 0) {
            await logger.warn('Missing order data in order.created event', {
              event_id: event.event_id,
              payload: event.payload
            });
            return;
          }

          // Decrease inventory for each product in the order
          // Note: Services don't consume inventory, only products do
          for (const item of items) {
            if (item.product_id) {
              // Get product inventory item mapping (would need catalog service or local mapping)
              // For now, assume product_id maps directly to inventory item_id
              // In production, this would query catalog service or have a mapping table
              const inventoryItemId = item.product_id;
              const quantity = item.quantity || 1;
              const idempotencyKey = `order_${orderId}_item_${item.product_id}_${event.event_id}`;

              try {
                // Check if inventory decrease already processed (idempotency)
                const existingMovement = await client.query(`
                  SELECT * FROM inventory.inventory_movements
                  WHERE tenant_id = current_setting('app.tenant_id')::uuid
                    AND idempotency_key = $1
                `, [idempotencyKey]);

                if (existingMovement.rows.length > 0) {
                  await logger.info('Inventory already decreased for order item', {
                    order_id: orderId,
                    product_id: item.product_id,
                    movement_id: existingMovement.rows[0].id
                  });
                  continue;
                }

                // Get current stock
                const stockResult = await client.query(`
                  SELECT quantity FROM inventory.stock_levels
                  WHERE tenant_id = current_setting('app.tenant_id')::uuid
                    AND item_id = $1
                `, [inventoryItemId]);

                if (stockResult.rows.length === 0) {
                  await logger.warn('Inventory item not found for product', {
                    product_id: item.product_id,
                    inventory_item_id: inventoryItemId,
                    order_id: orderId
                  });
                  continue;
                }

                const previousQuantity = stockResult.rows[0].quantity;

                if (previousQuantity < quantity) {
                  await logger.warn('Insufficient stock for order item', {
                    product_id: item.product_id,
                    available: previousQuantity,
                    requested: quantity,
                    order_id: orderId
                  });
                  // Continue with other items, but log the issue
                  continue;
                }

                const newQuantity = previousQuantity - quantity;

                // Create movement (negative quantity)
                const movementId = randomUUID();
                await client.query(`
                  INSERT INTO inventory.inventory_movements (
                    id, tenant_id, item_id, quantity, reason, visit_id, idempotency_key
                  ) VALUES (
                    $1, current_setting('app.tenant_id')::uuid, $2, $3, $4, $5, $6
                  )
                `, [movementId, inventoryItemId, -quantity, 'order_created', visitId || null, idempotencyKey]);

                // Update stock level
                await client.query(`
                  UPDATE inventory.stock_levels
                  SET quantity = $1, last_movement_id = $2, updated_at = NOW()
                  WHERE tenant_id = current_setting('app.tenant_id')::uuid
                    AND item_id = $3
                `, [newQuantity, movementId, inventoryItemId]);

                // Update inventory item quantity
                await client.query(`
                  UPDATE inventory.inventory_items
                  SET quantity = $1, updated_at = NOW()
                  WHERE id = $2
                `, [newQuantity, inventoryItemId]);

                // Publish inventory.decreased event
                const tenantContext = {
                  tenantId: event.tenant_id,
                  userId: event.metadata?.user_id || null,
                  correlationId: event.metadata?.correlation_id || randomUUID()
                };
                await eventBus.publish({
                  event_type: 'inventory.decreased',
                  event_version: 'v1',
                  tenant_id: event.tenant_id,
                  aggregate_id: movementId,
                  occurred_at: new Date().toISOString(),
                  payload: {
                    movement_id: movementId,
                    item_id: inventoryItemId,
                    quantity: quantity,
                    reason: 'order_created',
                    visit_id: visitId || null,
                    order_id: orderId,
                    previous_quantity: previousQuantity,
                    new_quantity: newQuantity
                  },
                  metadata: {
                    user_id: tenantContext.userId,
                    correlation_id: tenantContext.correlationId,
                    causation_id: event.event_id
                  }
                }, {}, tenantContext);

                await logger.info('Inventory decreased for order item', {
                  movement_id: movementId,
                  product_id: item.product_id,
                  quantity: quantity,
                  order_id: orderId,
                  previous_quantity: previousQuantity,
                  new_quantity: newQuantity
                });
              } catch (itemError) {
                await logger.error('Error decreasing inventory for order item', {
                  error: itemError.message,
                  product_id: item.product_id,
                  order_id: orderId,
                  tenant_id: event.tenant_id
                });
                // Continue with other items
              }
            }
          }
        } catch (error) {
          await logger.error('Error processing order.created event', {
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
      await logger.info('Subscribed to order.created events');
    } catch (error) {
      await logger.error('Failed to subscribe to order.created', { error: error.message });
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

// POST /inventory/items - Create inventory item
app.post('/inventory/items', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { name, sku, quantity = 0, unit = 'piece', reorder_level } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name']
      });
    }

    // Create inventory item
    const result = await dbClient.query(`
      INSERT INTO inventory.inventory_items (
        tenant_id, name, sku, quantity, unit, reorder_level
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, $5
      ) RETURNING *
    `, [name, sku || null, quantity, unit, reorder_level || null]);

    const item = result.rows[0];

    // Create stock level record
    await dbClient.query(`
      INSERT INTO inventory.stock_levels (
        tenant_id, item_id, quantity
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2
      )
    `, [item.id, quantity]);

    res.status(201).json({
      item: {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        reorder_level: item.reorder_level
      }
    });
  } catch (error) {
    await logger.error('Error creating inventory item', {
      error: error.message,
      stack: error.stack,
      name,
      sku
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /inventory/items/:id/increase - Increase inventory
app.post('/inventory/items/:id/increase', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { id } = req.params;
    const { quantity, reason, idempotency_key } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'Reason is required'
      });
    }

    // Check idempotency
    if (idempotency_key) {
      const existingMovement = await dbClient.query(`
        SELECT * FROM inventory.inventory_movements
        WHERE tenant_id = current_setting('app.tenant_id')::uuid
          AND idempotency_key = $1
      `, [idempotency_key]);

      if (existingMovement.rows.length > 0) {
        return res.json({
          movement: {
            id: existingMovement.rows[0].id,
            item_id: existingMovement.rows[0].item_id,
            quantity: existingMovement.rows[0].quantity,
            reason: existingMovement.rows[0].reason
          }
        });
      }
    }

    // Get current stock
    const stockResult = await dbClient.query(`
      SELECT quantity FROM inventory.stock_levels
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND item_id = $1
    `, [id]);

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const previousQuantity = stockResult.rows[0].quantity;
    const newQuantity = previousQuantity + quantity;

    // Create movement
    const movementId = randomUUID();
    await dbClient.query(`
      INSERT INTO inventory.inventory_movements (
        id, tenant_id, item_id, quantity, reason, idempotency_key
      ) VALUES (
        $1, current_setting('app.tenant_id')::uuid, $2, $3, $4, $5
      )
    `, [movementId, id, quantity, reason, idempotency_key || null]);

    // Update stock level
    await dbClient.query(`
      UPDATE inventory.stock_levels
      SET quantity = $1, last_movement_id = $2, updated_at = NOW()
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND item_id = $3
    `, [newQuantity, movementId, id]);

    // Update inventory item quantity
    await dbClient.query(`
      UPDATE inventory.inventory_items
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2
    `, [newQuantity, id]);

    // Publish inventory.increased event
    await publishEvent(
      'inventory.increased',
      'v1',
      movementId,
      {
        movement_id: movementId,
        item_id: id,
        quantity: quantity,
        reason: reason,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity
      },
      tenantContext
    );

    res.status(201).json({
      movement: {
        id: movementId,
        item_id: id,
        quantity: quantity,
        reason: reason,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity
      }
    });
  } catch (error) {
    await logger.error('Error increasing inventory', {
      error: error.message,
      stack: error.stack,
      item_id: id,
      quantity
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /inventory/items/:id/decrease - Decrease inventory
app.post('/inventory/items/:id/decrease', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { id } = req.params;
    const { quantity, reason, visit_id, idempotency_key } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'Reason is required'
      });
    }

    // Check idempotency
    if (idempotency_key) {
      const existingMovement = await dbClient.query(`
        SELECT * FROM inventory.inventory_movements
        WHERE tenant_id = current_setting('app.tenant_id')::uuid
          AND idempotency_key = $1
      `, [idempotency_key]);

      if (existingMovement.rows.length > 0) {
        return res.json({
          movement: {
            id: existingMovement.rows[0].id,
            item_id: existingMovement.rows[0].item_id,
            quantity: existingMovement.rows[0].quantity,
            reason: existingMovement.rows[0].reason
          }
        });
      }
    }

    // Get current stock
    const stockResult = await dbClient.query(`
      SELECT quantity FROM inventory.stock_levels
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND item_id = $1
    `, [id]);

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const previousQuantity = stockResult.rows[0].quantity;

    if (previousQuantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available: previousQuantity,
        requested: quantity
      });
    }

    const newQuantity = previousQuantity - quantity;

    // Create movement (negative quantity)
    const movementId = randomUUID();
    await dbClient.query(`
      INSERT INTO inventory.inventory_movements (
        id, tenant_id, item_id, quantity, reason, visit_id, idempotency_key
      ) VALUES (
        $1, current_setting('app.tenant_id')::uuid, $2, $3, $4, $5, $6
      )
    `, [movementId, id, -quantity, reason, visit_id || null, idempotency_key || null]);

    // Update stock level
    await dbClient.query(`
      UPDATE inventory.stock_levels
      SET quantity = $1, last_movement_id = $2, updated_at = NOW()
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND item_id = $3
    `, [newQuantity, movementId, id]);

    // Update inventory item quantity
    await dbClient.query(`
      UPDATE inventory.inventory_items
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2
    `, [newQuantity, id]);

    // Publish inventory.decreased event
    await publishEvent(
      'inventory.decreased',
      'v1',
      movementId,
      {
        movement_id: movementId,
        item_id: id,
        quantity: quantity,
        reason: reason,
        visit_id: visit_id || null,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity
      },
      tenantContext
    );

    res.status(201).json({
      movement: {
        id: movementId,
        item_id: id,
        quantity: quantity,
        reason: reason,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity
      }
    });
  } catch (error) {
    await logger.error('Error decreasing inventory', {
      error: error.message,
      stack: error.stack,
      item_id: id,
      quantity
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /inventory/items - List inventory items
app.get('/inventory/items', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { search, low_stock } = req.query;

    let query = 'SELECT * FROM inventory.inventory_items WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (low_stock === 'true') {
      query += ` AND reorder_level IS NOT NULL AND quantity <= reorder_level`;
    }

    query += ' ORDER BY name LIMIT 100';

    const result = await dbClient.query(query, params);

    res.json({
      items: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        quantity: row.quantity,
        unit: row.unit,
        reorder_level: row.reorder_level
      }))
    });
  } catch (error) {
    await logger.error('Error listing inventory items', {
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
const PORT = process.env.PORT || 4113;
app.listen(PORT, async () => {
  await logger.info(`Inventory service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});

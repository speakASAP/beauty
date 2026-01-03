/**
 * Payments Service
 * Payment execution, payment processing
 * Uses existing payments-microservice via adapter (to be implemented in P1.5)
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
import { PaymentAdapter } from '@beauty/adapters';

const app = express();
app.use(express.json());

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Event bus
const eventBus = createEventBus(process.env.NATS_URL || 'nats://nats:4222');

// Logger
const logger = createLogger(process.env.SERVICE_NAME || 'payments-service');

// Payment Adapter (connects to existing payments-microservice)
const paymentAdapter = new PaymentAdapter({
  endpoint: process.env.PAYMENTS_MICROSERVICE_URL || 'http://payments-microservice:3367',
  apiKey: process.env.PAYMENT_API_KEY,
  timeout: 10000,
  retryAttempts: 3
});

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to order.created events (to initiate payment)
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
            tenant_id: event.tenant_id
          });

          const orderId = event.payload?.order_id;
          const totalAmount = event.payload?.total_amount;
          const items = event.payload?.items || [];

          if (!orderId || !totalAmount) {
            await logger.warn('Missing order data in order.created event', {
              event_id: event.event_id,
              payload: event.payload
            });
            return;
          }

          // P1.5: Use PaymentAdapter to automatically process payment
          // Default payment method is 'card' for automatic processing
          // In production, this could be determined by order metadata or client preferences
          const paymentMethod = 'card';
          const idempotencyKey = `auto_payment_${orderId}_${event.event_id}`;

          try {
            // Check if payment already exists (idempotency)
            const existingPayment = await client.query(`
              SELECT * FROM payments.payments
              WHERE tenant_id = current_setting('app.tenant_id')::uuid
                AND order_id = $1
                AND idempotency_key = $2
            `, [orderId, idempotencyKey]);

            if (existingPayment.rows.length > 0) {
              await logger.info('Payment already exists for order', {
                order_id: orderId,
                payment_id: existingPayment.rows[0].id,
                tenant_id: event.tenant_id
              });
              return;
            }

            // Create payment record
            const paymentId = randomUUID();
            await client.query(`
              INSERT INTO payments.payments (
                id, tenant_id, order_id, amount, method, status, idempotency_key
              ) VALUES (
                $1, current_setting('app.tenant_id')::uuid, $2, $3, $4, 'pending', $5
              )
            `, [paymentId, orderId, totalAmount, paymentMethod, idempotencyKey]);

            // Publish payment.initiated event
            const tenantContext = {
              tenantId: event.tenant_id,
              userId: event.metadata?.user_id || null,
              correlationId: event.metadata?.correlation_id || randomUUID()
            };
            await eventBus.publish({
              event_type: 'payment.initiated',
              event_version: 'v1',
              tenant_id: event.tenant_id,
              aggregate_id: paymentId,
              occurred_at: new Date().toISOString(),
              payload: {
                payment_id: paymentId,
                order_id: orderId,
                amount: totalAmount,
                method: paymentMethod
              },
              metadata: {
                user_id: tenantContext.userId,
                correlation_id: tenantContext.correlationId,
                causation_id: event.event_id
              }
            }, {}, tenantContext);

            // Use PaymentAdapter to process payment
            const paymentResult = await paymentAdapter.capturePayment(
              orderId,
              totalAmount,
              paymentMethod,
              event.tenant_id,
              idempotencyKey
            );

            if (paymentResult && paymentResult.status === 'completed') {
              // Update payment status
              await client.query(`
                UPDATE payments.payments
                SET status = 'completed', captured_at = NOW(), updated_at = NOW()
                WHERE id = $1
              `, [paymentId]);

              // Create payment transaction record
              await client.query(`
                INSERT INTO payments.payment_transactions (
                  tenant_id, payment_id, transaction_id, status, amount
                ) VALUES (
                  current_setting('app.tenant_id')::uuid,
                  $1, $2, 'completed', $3
                )
              `, [paymentId, paymentResult.id || `txn_${randomUUID()}`, totalAmount]);

              // Publish payment.received event
              await eventBus.publish({
                event_type: 'payment.received',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: paymentId,
                occurred_at: new Date().toISOString(),
                payload: {
                  payment_id: paymentId,
                  order_id: orderId,
                  amount: totalAmount,
                  method: paymentMethod,
                  received_at: new Date().toISOString(),
                  transaction_id: paymentResult.id || `txn_${randomUUID()}`
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: paymentId
                }
              }, {}, tenantContext);

              // Publish payment.confirmed event
              await eventBus.publish({
                event_type: 'payment.confirmed',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: paymentId,
                occurred_at: new Date().toISOString(),
                payload: {
                  payment_id: paymentId,
                  confirmed_at: new Date().toISOString()
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: paymentId
                }
              }, {}, tenantContext);

              await logger.info('Automatic payment processed successfully', {
                payment_id: paymentId,
                order_id: orderId,
                amount: totalAmount,
                tenant_id: event.tenant_id
              });
            } else {
              // Payment failed
              await client.query(`
                UPDATE payments.payments
                SET status = 'failed', updated_at = NOW()
                WHERE id = $1
              `, [paymentId]);

              // Publish payment.failed event
              await eventBus.publish({
                event_type: 'payment.failed',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: paymentId,
                occurred_at: new Date().toISOString(),
                payload: {
                  payment_id: paymentId,
                  failed_at: new Date().toISOString(),
                  failure_reason: 'payment_processing_failed'
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: paymentId
                }
              }, {}, tenantContext);

              await logger.warn('Automatic payment failed', {
                payment_id: paymentId,
                order_id: orderId,
                tenant_id: event.tenant_id
              });
            }
          } catch (error) {
            await logger.error('Payment adapter failed in order.created handler', {
              error: error.message,
              order_id: orderId,
              tenant_id: event.tenant_id,
              adapter_error: error.adapter,
              retryable: error.retryable
            });

            // Update payment status to failed
            try {
              await client.query(`
                UPDATE payments.payments
                SET status = 'failed', updated_at = NOW()
                WHERE id = $1
              `, [paymentId]);
            } catch (updateError) {
              // Payment might not exist yet
            }

            // Publish payment.failed event
            const tenantContext = {
              tenantId: event.tenant_id,
              userId: event.metadata?.user_id || null,
              correlationId: event.metadata?.correlation_id || randomUUID()
            };
            await eventBus.publish({
              event_type: 'payment.failed',
              event_version: 'v1',
              tenant_id: event.tenant_id,
              aggregate_id: paymentId || randomUUID(),
              occurred_at: new Date().toISOString(),
              payload: {
                payment_id: paymentId || randomUUID(),
                failed_at: new Date().toISOString(),
                failure_reason: error.message
              },
              metadata: {
                user_id: tenantContext.userId,
                correlation_id: tenantContext.correlationId,
                causation_id: event.event_id
              }
            }, {}, tenantContext);
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

// POST /payments - Capture payment for an order
app.post('/payments', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { order_id, amount, method, idempotency_key } = req.body;

    if (!order_id || !amount || !method) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['order_id', 'amount', 'method']
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be greater than 0'
      });
    }

    const validMethods = ['card', 'cash', 'online', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        valid_methods: validMethods
      });
    }

    // Check if payment already exists (idempotency)
    if (idempotency_key) {
      const existingPayment = await dbClient.query(`
        SELECT * FROM payments.payments
        WHERE tenant_id = current_setting('app.tenant_id')::uuid
          AND idempotency_key = $1
      `, [idempotency_key]);

      if (existingPayment.rows.length > 0) {
        return res.json({
          payment: {
            id: existingPayment.rows[0].id,
            order_id: existingPayment.rows[0].order_id,
            amount: existingPayment.rows[0].amount,
            method: existingPayment.rows[0].method,
            status: existingPayment.rows[0].status
          }
        });
      }
    }

    // Create payment record
    const paymentId = randomUUID();
    const result = await dbClient.query(`
      INSERT INTO payments.payments (
        id, tenant_id, order_id, amount, method, status, idempotency_key
      ) VALUES (
        $1, current_setting('app.tenant_id')::uuid, $2, $3, $4, 'pending', $5
      ) RETURNING *
    `, [paymentId, order_id, amount, method, idempotency_key || null]);

    const payment = result.rows[0];

    // Publish payment.initiated event
    await publishEvent(
      'payment.initiated',
      'v1',
      payment.id,
      {
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        method: payment.method
      },
      tenantContext
    );

    // Use PaymentAdapter to process payment
    let paymentResult;
    try {
      paymentResult = await paymentAdapter.capturePayment(
        order_id,
        amount,
        method,
        tenantContext.tenantId,
        idempotency_key
      );
    } catch (error) {
      await logger.error('Payment adapter failed', {
        error: error.message,
        order_id,
        amount,
        method,
        adapter_error: error.adapter,
        retryable: error.retryable
      });

      // Update payment status to failed
      await dbClient.query(`
        UPDATE payments.payments
        SET status = 'failed', updated_at = NOW()
        WHERE id = $1
      `, [payment.id]);

      // Publish payment.failed event
      await publishEvent(
        'payment.failed',
        'v1',
        payment.id,
        {
          payment_id: payment.id,
          failed_at: new Date().toISOString(),
          failure_reason: error.message
        },
        tenantContext,
        payment.id
      );

      return res.status(500).json({
        error: 'Payment processing failed',
        message: error.message,
        payment_id: payment.id
      });
    }

    if (paymentResult && paymentResult.status === 'completed') {
      // Update payment status
      await dbClient.query(`
        UPDATE payments.payments
        SET status = 'completed', captured_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [payment.id]);

      // Create payment transaction record
      await dbClient.query(`
        INSERT INTO payments.payment_transactions (
          tenant_id, payment_id, transaction_id, status, amount
        ) VALUES (
          current_setting('app.tenant_id')::uuid,
          $1, $2, 'completed', $3
        )
      `, [payment.id, paymentResult.id || `txn_${randomUUID()}`, payment.amount]);

      // Publish payment.received event
      await publishEvent(
        'payment.received',
        'v1',
        payment.id,
        {
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          method: payment.method,
          received_at: new Date().toISOString(),
          transaction_id: `txn_${randomUUID()}`
        },
        tenantContext,
        payment.id // causation_id points to payment.initiated
      );

      // Publish payment.confirmed event
      await publishEvent(
        'payment.confirmed',
        'v1',
        payment.id,
        {
          payment_id: payment.id,
          confirmed_at: new Date().toISOString()
        },
        tenantContext,
        payment.id // causation_id points to payment.received
      );
    } else {
      // Update payment status
      await dbClient.query(`
        UPDATE payments.payments
        SET status = 'failed', updated_at = NOW()
        WHERE id = $1
      `, [payment.id]);

      // Publish payment.failed event
      await publishEvent(
        'payment.failed',
        'v1',
        payment.id,
        {
          payment_id: payment.id,
          failed_at: new Date().toISOString(),
          failure_reason: 'payment_processing_failed'
        },
        tenantContext,
        payment.id // causation_id points to payment.initiated
      );
    }

    // Get updated payment
    const updatedPayment = await dbClient.query(`
      SELECT * FROM payments.payments WHERE id = $1
    `, [payment.id]);

    res.status(201).json({
      payment: {
        id: updatedPayment.rows[0].id,
        order_id: updatedPayment.rows[0].order_id,
        amount: updatedPayment.rows[0].amount,
        method: updatedPayment.rows[0].method,
        status: updatedPayment.rows[0].status,
        captured_at: updatedPayment.rows[0].captured_at?.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error processing payment', {
      error: error.message,
      stack: error.stack,
      order_id,
      amount,
      method
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /payments - List payments
app.get('/payments', async (req, res) => {
  try {
    const { dbClient, logger } = req;
    const { order_id, status, from_date, to_date } = req.query;

    let query = 'SELECT * FROM payments.payments WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (order_id) {
      paramCount++;
      query += ` AND order_id = $${paramCount}`;
      params.push(order_id);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
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
      payments: result.rows.map(row => ({
        id: row.id,
        order_id: row.order_id,
        amount: row.amount,
        method: row.method,
        status: row.status,
        captured_at: row.captured_at?.toISOString(),
        created_at: row.created_at.toISOString()
      }))
    });
  } catch (error) {
    await logger.error('Error listing payments', {
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
const PORT = process.env.PORT || 4112;
app.listen(PORT, async () => {
  await logger.info(`Payments service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});

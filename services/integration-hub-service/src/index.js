/**
 * Integration Hub Service
 * External system adapters, integration orchestration
 * Consumes domain events and uses adapters to integrate with external systems
 */

import express from 'express';
import { Pool } from 'pg';
import { randomUUID } from 'uuid';
import {
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  createLoggingContext
} from '@beauty/tenant-middleware';
import { createEventBus } from '@beauty/event-bus';
import { createLogger, loggingMiddleware } from '@beauty/logger';
import { AccountingAdapter, NotificationAdapter } from '@beauty/adapters';

const app = express();
app.use(express.json());

// Database connection (for integration logs, if needed)
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Event bus
const eventBus = createEventBus(process.env.NATS_URL || 'nats://nats:4222');

// Logger
const logger = createLogger(process.env.SERVICE_NAME || 'integration-hub-service');

// Accounting Adapter (connects to accounting systems)
const accountingAdapter = new AccountingAdapter({
  endpoint: process.env.ACCOUNTING_SERVICE_URL || 'http://accounting-service:3367',
  system: process.env.ACCOUNTING_SYSTEM || 'money_s3',
  timeout: 10000,
  retryAttempts: 3
});

// Notification Adapter (connects to notifications-microservice)
// BaseAdapter will check NOTIFICATION_SERVICE_URL or NOTIFICATION_MICROSERVICE_URL
// We also support NOTIFICATIONS_MICROSERVICE_URL for backward compatibility
const notificationAdapter = new NotificationAdapter({
  endpoint: process.env.NOTIFICATIONS_MICROSERVICE_URL || process.env.NOTIFICATION_MICROSERVICE_URL || process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-microservice:3367',
  timeout: 5000,
  retryAttempts: 3
});

// Client phone cache (populated from client.registered events)
// Maps: client_id -> phone
const clientPhoneCache = new Map();

// Payment method cache (populated from payment.received events)
// Maps: order_id -> payment_method
const paymentMethodCache = new Map();

// Initialize event bus connection and subscriptions
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');

    // Subscribe to client.registered events to cache client phone
    try {
      await eventBus.subscribe('client.registered', async (event) => {
        const clientId = event.payload?.client_id;
        const phone = event.payload?.phone;
        if (clientId && phone) {
          clientPhoneCache.set(clientId, phone);
          await logger.debug('Cached client phone', { client_id: clientId, phone });
        }
      });
      await logger.info('Subscribed to client.registered events for phone cache');
    } catch (error) {
      await logger.error('Failed to subscribe to client.registered', { error: error.message });
    }

    // Subscribe to payment.received events to cache payment method
    try {
      await eventBus.subscribe('payment.received', async (event) => {
        const orderId = event.payload?.order_id;
        const method = event.payload?.method;
        if (orderId && method) {
          paymentMethodCache.set(orderId, method);
          await logger.debug('Cached payment method', { order_id: orderId, method });
        }
      });
      await logger.info('Subscribed to payment.received events for payment method cache');
    } catch (error) {
      await logger.error('Failed to subscribe to payment.received for cache', { error: error.message });
    }

    // Subscribe to payment.received events (to export to accounting)
    try {
      await eventBus.subscribe('payment.received', async (event) => {
        try {
          await logger.info('Received payment.received event', {
            event_id: event.event_id,
            payment_id: event.payload?.payment_id,
            order_id: event.payload?.order_id,
            tenant_id: event.tenant_id
          });

          // Get order details (would need to query order service or get from event)
          // For now, we'll use data from the event payload
          const orderId = event.payload?.order_id;
          const paymentId = event.payload?.payment_id;
          const amount = event.payload?.amount;
          const method = event.payload?.method;

          if (!orderId || !amount) {
            await logger.warn('Missing order data in payment.received event', {
              event_id: event.event_id,
              payload: event.payload
            });
            return;
          }

          // Publish accounting.export_requested event
          // Note: Actual accounting export will be done when order.closed event is received
          // This is just to track that export was requested
          const exportId = randomUUID();
          const tenantContext = {
            tenantId: event.tenant_id,
            userId: event.metadata?.user_id || null,
            correlationId: event.metadata?.correlation_id || randomUUID()
          };
          await eventBus.publish({
            event_type: 'accounting.export_requested',
            event_version: 'v1',
            tenant_id: event.tenant_id,
            aggregate_id: exportId,
            occurred_at: new Date().toISOString(),
            payload: {
              export_id: exportId,
              order_id: orderId,
              payment_id: paymentId,
              requested_at: new Date().toISOString()
            },
            metadata: {
              user_id: event.metadata?.user_id || null,
              correlation_id: tenantContext.correlationId,
              causation_id: event.event_id
            }
          }, {}, tenantContext);
        } catch (error) {
          await logger.error('Error processing payment.received event', {
            error: error.message,
            event_id: event.event_id,
            tenant_id: event.tenant_id
          });
        }
      });
      await logger.info('Subscribed to payment.received events');
    } catch (error) {
      await logger.error('Failed to subscribe to payment.received', { error: error.message });
    }

    // Subscribe to order.closed events (to export to accounting)
    try {
      await eventBus.subscribe('order.closed', async (event) => {
        try {
          await logger.info('Received order.closed event', {
            event_id: event.event_id,
            order_id: event.payload?.order_id,
            tenant_id: event.tenant_id
          });

          const orderId = event.payload?.order_id;
          const finalTotalAmount = event.payload?.final_total_amount;
          const finalVatAmount = event.payload?.final_vat_amount;
          const orderItems = event.payload?.items || [];

          if (!orderId || !finalTotalAmount) {
            await logger.warn('Missing order data in order.closed event', {
              event_id: event.event_id,
              payload: event.payload
            });
            return;
          }

          // Use order items from event payload (enriched in beauty-pos-service)
          const items = orderItems.map(item => ({
            name: item.service_id 
              ? `Service ${item.service_id}` 
              : `Product ${item.product_id}`,
            quantity: item.quantity || 1,
            price: item.unit_price || 0,
            vatRate: parseFloat(item.vat_rate) || 0.21
          }));

          // Get payment method from cache (populated from payment.received events)
          const paymentMethod = paymentMethodCache.get(orderId) || 'card'; // Default to card if not cached

          // Export to accounting system
          try {
            const exportId = randomUUID();
            const exportResult = await accountingAdapter.exportTransaction(
              {
                orderId,
                amount: finalTotalAmount,
                vatAmount: finalVatAmount || 0,
                items,
                occurredAt: new Date(event.occurred_at),
                paymentMethod
              },
              event.tenant_id,
              `export_${orderId}_${event.event_id}`
            );

            // Publish accounting.export_completed event
            const tenantContext = {
              tenantId: event.tenant_id,
              userId: event.metadata?.user_id || null,
              correlationId: event.metadata?.correlation_id || randomUUID()
            };
            await eventBus.publish({
              event_type: 'accounting.export_completed',
              event_version: 'v1',
              tenant_id: event.tenant_id,
              aggregate_id: exportId,
              occurred_at: new Date().toISOString(),
              payload: {
                export_id: exportId,
                order_id: orderId,
                completed_at: new Date().toISOString(),
                external_system: process.env.ACCOUNTING_SYSTEM || 'money_s3',
                external_reference: exportResult.externalId || null
              },
              metadata: {
                user_id: event.metadata?.user_id || null,
                correlation_id: tenantContext.correlationId,
                causation_id: event.event_id
              }
            }, {}, tenantContext);

            await logger.info('Accounting export completed', {
              export_id: exportId,
              order_id: orderId,
              tenant_id: event.tenant_id
            });
          } catch (error) {
            await logger.error('Accounting export failed', {
              error: error.message,
              order_id: orderId,
              tenant_id: event.tenant_id,
              adapter_error: error.adapter,
              retryable: error.retryable
            });

            // Publish integration.failed event
            const tenantContext = {
              tenantId: event.tenant_id,
              userId: event.metadata?.user_id || null,
              correlationId: event.metadata?.correlation_id || randomUUID()
            };
            await eventBus.publish({
              event_type: 'integration.failed',
              event_version: 'v1',
              tenant_id: event.tenant_id,
              aggregate_id: randomUUID(),
              occurred_at: new Date().toISOString(),
              payload: {
                integration_type: 'accounting',
                order_id: orderId,
                error: error.message,
                failed_at: new Date().toISOString()
              },
              metadata: {
                user_id: event.metadata?.user_id || null,
                correlation_id: tenantContext.correlationId,
                causation_id: event.event_id
              }
              }, {}, tenantContext);
            }
          } catch (error) {
            await logger.error('Accounting export failed', {
              error: error.message,
              order_id: orderId,
              tenant_id: event.tenant_id,
              adapter_error: error.adapter,
              retryable: error.retryable
            });

            // Publish integration.failed event
            const tenantContext = {
              tenantId: event.tenant_id,
              userId: event.metadata?.user_id || null,
              correlationId: event.metadata?.correlation_id || randomUUID()
            };
            await eventBus.publish({
              event_type: 'integration.failed',
              event_version: 'v1',
              tenant_id: event.tenant_id,
              aggregate_id: randomUUID(),
              occurred_at: new Date().toISOString(),
              payload: {
                integration_type: 'accounting',
                order_id: orderId,
                error: error.message,
                failed_at: new Date().toISOString()
              },
              metadata: {
                user_id: tenantContext.userId,
                correlation_id: tenantContext.correlationId,
                causation_id: event.event_id
              }
            }, {}, tenantContext);
          }
        } catch (error) {
          await logger.error('Error processing order.closed event', {
            error: error.message,
            event_id: event.event_id,
            tenant_id: event.tenant_id
          });
        }
      });
      await logger.info('Subscribed to order.closed events');
    } catch (error) {
      await logger.error('Failed to subscribe to order.closed', { error: error.message });
    }

    // Subscribe to appointment.booked events (to send SMS)
    try {
      await eventBus.subscribe('appointment.booked', async (event) => {
        try {
          await logger.info('Received appointment.booked event', {
            event_id: event.event_id,
            appointment_id: event.payload?.appointment_id,
            tenant_id: event.tenant_id
          });

          // P1.5: Send SMS confirmation using NotificationAdapter
          // Get client phone from cache (populated from client.registered events)
          const clientId = event.payload?.client_id;
          const startsAt = event.payload?.starts_at;
          
          if (!clientId) {
            await logger.warn('Missing client_id in appointment.booked event', {
              event_id: event.event_id,
              tenant_id: event.tenant_id
            });
            return;
          }

          // Get client phone from cache (populated from client.registered events)
          const clientPhone = clientPhoneCache.get(clientId);

          if (!clientPhone) {
            await logger.warn('Client phone not found in cache (client may not be registered yet)', {
              client_id: clientId,
              tenant_id: event.tenant_id
            });
            return;
          }
            const appointmentDate = startsAt ? new Date(startsAt).toLocaleString('cs-CZ') : 'the scheduled time';
            const smsMessage = `Vaše rezervace je potvrzena na ${appointmentDate}. Děkujeme!`;

            // Send SMS via NotificationAdapter
            try {
              const notificationResult = await notificationAdapter.sendSms(
                clientPhone,
                smsMessage,
                event.tenant_id
              );

              // Publish sms.sent event
              const tenantContext = {
                tenantId: event.tenant_id,
                userId: event.metadata?.user_id || null,
                correlationId: event.metadata?.correlation_id || randomUUID()
              };
              await eventBus.publish({
                event_type: 'sms.sent',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: notificationResult.id,
                occurred_at: new Date().toISOString(),
                payload: {
                  notification_id: notificationResult.id,
                  phone: clientPhone,
                  message: smsMessage,
                  sent_at: notificationResult.sentAt.toISOString(),
                  status: notificationResult.status
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: event.event_id
                }
              }, {}, tenantContext);

              // Also publish notification.sent event
              await eventBus.publish({
                event_type: 'notification.sent',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: notificationResult.id,
                occurred_at: new Date().toISOString(),
                payload: {
                  notification_id: notificationResult.id,
                  client_id: clientId,
                  channel: 'sms',
                  message: smsMessage,
                  sent_at: notificationResult.sentAt.toISOString(),
                  status: notificationResult.status
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: event.event_id
                }
              }, {}, tenantContext);

              await logger.info('Appointment confirmation SMS sent', {
                notification_id: notificationResult.id,
                appointment_id: event.payload?.appointment_id,
                client_id: clientId,
                tenant_id: event.tenant_id
              });
            } catch (error) {
              await logger.error('Failed to send appointment confirmation SMS', {
                error: error.message,
                client_id: clientId,
                appointment_id: event.payload?.appointment_id,
                tenant_id: event.tenant_id,
                adapter_error: error.adapter,
                retryable: error.retryable
              });

              // Publish integration.failed event
              const tenantContext = {
                tenantId: event.tenant_id,
                userId: event.metadata?.user_id || null,
                correlationId: event.metadata?.correlation_id || randomUUID()
              };
              await eventBus.publish({
                event_type: 'integration.failed',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: randomUUID(),
                occurred_at: new Date().toISOString(),
                payload: {
                  integration_type: 'sms',
                  appointment_id: event.payload?.appointment_id,
                  client_id: clientId,
                  error: error.message,
                  failed_at: new Date().toISOString()
                },
                metadata: {
                  user_id: tenantContext.userId,
                  correlation_id: tenantContext.correlationId,
                  causation_id: event.event_id
                }
              }, {}, tenantContext);
            }
        } catch (error) {
          await logger.error('Error processing appointment.booked event', {
            error: error.message,
            event_id: event.event_id,
            tenant_id: event.tenant_id
          });
        }
      });
      await logger.info('Subscribed to appointment.booked events');
    } catch (error) {
      await logger.error('Failed to subscribe to appointment.booked', { error: error.message });
    }

    // Subscribe to client.registered events (to send welcome email)
    try {
      await eventBus.subscribe('client.registered', async (event) => {
        try {
          await logger.info('Received client.registered event', {
            event_id: event.event_id,
            client_id: event.payload?.client_id,
            tenant_id: event.tenant_id
          });

          const clientEmail = event.payload?.email;
          if (clientEmail) {
            try {
              const notificationResult = await notificationAdapter.sendEmail(
                clientEmail,
                'Welcome to our salon!',
                'Thank you for registering with us. We look forward to serving you!',
                event.tenant_id
              );

              // Publish email.sent event
              const tenantContext = {
                tenantId: event.tenant_id,
                userId: event.metadata?.user_id || null,
                correlationId: event.metadata?.correlation_id || randomUUID()
              };
              await eventBus.publish({
                event_type: 'email.sent',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: notificationResult.id,
                occurred_at: new Date().toISOString(),
                payload: {
                  notification_id: notificationResult.id,
                  email: clientEmail,
                  subject: 'Welcome to our salon!',
                  sent_at: notificationResult.sentAt.toISOString(),
                  status: notificationResult.status
                },
                metadata: {
                  user_id: event.metadata?.user_id || null,
                  correlation_id: tenantContext.correlationId,
                  causation_id: event.event_id
                }
              }, {}, tenantContext);

              await logger.info('Welcome email sent', {
                notification_id: notificationResult.id,
                client_id: event.payload?.client_id,
                tenant_id: event.tenant_id
              });
            } catch (error) {
              await logger.error('Failed to send welcome email', {
                error: error.message,
                client_id: event.payload?.client_id,
                tenant_id: event.tenant_id,
                adapter_error: error.adapter,
                retryable: error.retryable
              });

              // Publish integration.failed event
              const tenantContext = {
                tenantId: event.tenant_id,
                userId: event.metadata?.user_id || null,
                correlationId: event.metadata?.correlation_id || randomUUID()
              };
              await eventBus.publish({
                event_type: 'integration.failed',
                event_version: 'v1',
                tenant_id: event.tenant_id,
                aggregate_id: randomUUID(),
                occurred_at: new Date().toISOString(),
                payload: {
                  integration_type: 'email',
                  client_id: event.payload?.client_id,
                  error: error.message,
                  failed_at: new Date().toISOString()
                },
                metadata: {
                  user_id: event.metadata?.user_id || null,
                  correlation_id: tenantContext.correlationId,
                  causation_id: event.event_id
                }
              }, {}, tenantContext);
            }
          }
        } catch (error) {
          await logger.error('Error processing client.registered event', {
            error: error.message,
            event_id: event.event_id,
            tenant_id: event.tenant_id
          });
        }
      });
      await logger.info('Subscribed to client.registered events');
    } catch (error) {
      await logger.error('Failed to subscribe to client.registered', { error: error.message });
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

    // Check adapter health
    const accountingHealth = await accountingAdapter.checkHealth().catch(() => ({
      adapter: 'accounting',
      status: 'unhealthy'
    }));
    const notificationHealth = await notificationAdapter.checkHealth().catch(() => ({
      adapter: 'notification',
      status: 'unhealthy'
    }));

    const health = {
      status: dbHealthy && eventBusHealthy && accountingHealth.status === 'healthy' && notificationHealth.status === 'healthy'
        ? 'healthy'
        : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        eventBus: eventBusHealthy ? 'healthy' : 'unhealthy',
        accountingAdapter: accountingHealth.status,
        notificationAdapter: notificationHealth.status
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

// Logging middleware (attaches req.logger with tenant context)
app.use(loggingMiddleware(logger));

// POST /integrations/sms - Send SMS manually (for testing)
app.post('/integrations/sms', async (req, res) => {
  try {
    const { tenantContext, logger } = req;
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['phone', 'message']
      });
    }

    try {
      const result = await notificationAdapter.sendSms(phone, message, tenantContext.tenantId);

      // Publish sms.sent event
      await eventBus.publish({
        event_type: 'sms.sent',
        event_version: 'v1',
        tenant_id: tenantContext.tenantId,
        aggregate_id: result.id,
        occurred_at: new Date().toISOString(),
        payload: {
          notification_id: result.id,
          phone,
          message,
          sent_at: result.sentAt.toISOString(),
          status: result.status
        },
        metadata: {
          user_id: tenantContext.userId,
          correlation_id: tenantContext.correlationId,
          causation_id: null
        }
      }, {}, tenantContext);

      res.json({
        notification: {
          id: result.id,
          status: result.status,
          sent_at: result.sentAt.toISOString(),
          channel: 'sms'
        }
      });
    } catch (error) {
      await logger.error('SMS send failed', {
        error: error.message,
        phone,
        adapter_error: error.adapter,
        retryable: error.retryable
      });

      res.status(500).json({
        error: 'SMS send failed',
        message: error.message
      });
    }
  } catch (error) {
    await logger.error('Error sending SMS', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /integrations/accounting/export - Export transaction manually (for testing)
app.post('/integrations/accounting/export', async (req, res) => {
  try {
    const { tenantContext, logger } = req;
    const { transaction, idempotency_key } = req.body;

    if (!transaction || !transaction.orderId || !transaction.amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['transaction.orderId', 'transaction.amount']
      });
    }

    try {
      const result = await accountingAdapter.exportTransaction(
        transaction,
        tenantContext.tenantId,
        idempotency_key
      );

      res.json({
        export: {
          id: result.id,
          status: result.status,
          exported_at: result.exportedAt.toISOString(),
          external_id: result.externalId
        }
      });
    } catch (error) {
      await logger.error('Accounting export failed', {
        error: error.message,
        order_id: transaction.orderId,
        adapter_error: error.adapter,
        retryable: error.retryable
      });

      res.status(500).json({
        error: 'Accounting export failed',
        message: error.message
      });
    }
  } catch (error) {
    await logger.error('Error exporting to accounting', {
      error: error.message,
      stack: error.stack
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
const PORT = process.env.PORT || 4116;
app.listen(PORT, async () => {
  await logger.info(`Integration hub service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});


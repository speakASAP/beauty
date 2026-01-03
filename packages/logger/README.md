# Logger Package

Shared logger library for beauty platform. Integrates with centralized logging microservice.

## Features

- Centralized logging via logging microservice
- Automatic tenant context injection
- Fallback to console logging if service unavailable
- Request-scoped logging with middleware
- Child loggers for additional context

## Usage

### Basic Setup

```javascript
import { createLogger, loggingMiddleware } from '@beauty/logger';
import { tenantContextMiddleware } from '@beauty/tenant-middleware';

const app = express();

// Create base logger
const logger = createLogger(process.env.SERVICE_NAME || 'beauty-service');

// Tenant context middleware (must be before logging middleware)
app.use(tenantContextMiddleware());

// Logging middleware (attaches req.logger with tenant context)
app.use(loggingMiddleware(logger));

// Use logger in route handlers
app.post('/appointments', async (req, res) => {
  const { logger } = req; // Logger includes tenant context automatically

  try {
    // Log with tenant context automatically included
    await logger.info('Appointment created', {
      appointment_id: appointmentId,
      client_id: clientId
    });

    res.json({ success: true });
  } catch (error) {
    await logger.error('Failed to create appointment', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Manual Usage (without middleware)

```javascript
import { createLogger } from '@beauty/logger';
import { createLoggingContext } from '@beauty/tenant-middleware';

const logger = createLogger('booking-service');

// Create logging context from tenant context
const logContext = createLoggingContext(tenantContext, {
  appointment_id: appointmentId
});

// Log with context
await logger.info('Appointment created', logContext);
```

### Child Logger

```javascript
// Create child logger with additional context
const requestLogger = logger.child({
  request_id: requestId,
  endpoint: '/appointments'
});

// All logs from this logger will include the child context
await requestLogger.info('Processing request');
await requestLogger.error('Request failed', { error: error.message });
```

### Log Levels

```javascript
await logger.error('Error message', { error: errorDetails });
await logger.warn('Warning message', { warning: warningDetails });
await logger.info('Info message', { data: someData });
await logger.debug('Debug message', { debug: debugData }); // Only in development
```

## Environment Variables

```env
# Logging service URL (internal Docker network)
LOGGING_SERVICE_URL=http://logging-microservice:3367

# Service name (used in all logs)
SERVICE_NAME=booking-service

# Log level (optional, defaults to info)
LOG_LEVEL=info
```

## Integration with Tenant Context

The logger automatically includes tenant context when used with `loggingMiddleware`:

- `tenant_id` - From `req.tenantContext.tenantId`
- `user_id` - From `req.tenantContext.userId`
- `is_franchisor` - From `req.tenantContext.isFranchisor`
- `correlation_id` - From `req.tenantContext.correlationId` or `x-correlation-id` header

## Fallback Behavior

If the logging microservice is unavailable:
- Logs automatically fall back to console logging
- No errors are thrown (non-blocking)
- Service continues to operate normally

## Log Format

Logs sent to the logging microservice follow this format:

```json
{
  "level": "info",
  "message": "Appointment created",
  "service": "booking-service",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "metadata": {
    "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440003",
    "appointment_id": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```


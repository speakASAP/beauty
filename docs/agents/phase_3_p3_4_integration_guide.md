# P3.4 - Observability Integration Guide

**Status:** 📋 READY FOR INTEGRATION  
**Date:** 2026-01-XX

---

## Overview

This guide shows how to integrate observability packages (metrics, tracing, error tracking) into all services.

---

## Integration Steps

### Step 1: Update Package Dependencies

**Add to each service's `package.json`:**

```json
{
  "dependencies": {
    "@beauty/metrics": "workspace:*",
    "@beauty/tracing": "workspace:*",
    "@beauty/error-tracking": "workspace:*"
  }
}
```

---

### Step 2: Initialize Observability (Service Startup)

**Add to service startup (before Express app setup):**

```javascript
// Error tracking (must be first)
import { initErrorTracking } from '@beauty/error-tracking';
initErrorTracking({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION
});

// Tracing
import { initTracing } from '@beauty/tracing';
initTracing({
  serviceName: process.env.SERVICE_NAME || 'booking-service',
  jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
  enabled: process.env.TRACING_ENABLED !== 'false'
});
```

---

### Step 3: Add Middleware (After Tenant Middleware)

**Add observability middleware in correct order:**

```javascript
import express from 'express';
import {
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  tenantStateValidationMiddleware
} from '@beauty/tenant-middleware';
import { loggingMiddleware, createLogger } from '@beauty/logger';
import { metricsMiddleware, getMetrics } from '@beauty/metrics';
import {
  errorTrackingMiddleware,
  errorHandlerMiddleware,
  tenantContextErrorTrackingMiddleware
} from '@beauty/error-tracking';
import { tracingMiddleware } from '@beauty/tracing';

const app = express();
app.use(express.json());

// 1. Error tracking request handler (first)
app.use(errorTrackingMiddleware());

// 2. Tenant context (required for observability)
app.use(tenantContextMiddleware());
app.use(dbTenantContextMiddleware(db));
app.use(tenantStateValidationMiddleware(db, { allowReadOnly: false }));

// 3. Tenant context for error tracking
app.use(tenantContextErrorTrackingMiddleware());

// 4. Logging (uses tenant context)
app.use(loggingMiddleware(logger));

// 5. Tracing (uses tenant context)
app.use(tracingMiddleware(process.env.SERVICE_NAME || 'booking-service'));

// 6. Metrics (uses tenant context)
app.use(metricsMiddleware(process.env.SERVICE_NAME || 'booking-service'));

// ... routes ...

// 7. Error handler (last, after all routes)
app.use(errorHandlerMiddleware());
```

---

### Step 4: Expose Metrics Endpoint

**Add metrics endpoint:**

```javascript
// GET /metrics - Expose metrics (JSON format)
app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});
```

---

### Step 5: Track Business Metrics (Optional)

**Track business events:**

```javascript
import { trackOrder, trackAppointment, trackClient } from '@beauty/metrics';

// When order created
trackOrder(tenantId, 'open', order.total_amount);

// When appointment booked
trackAppointment(tenantId, 'booked');

// When client registered
trackClient(tenantId);
```

---

## Service Integration Checklist

### Booking Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint
- [ ] Track appointment metrics

### Beauty POS Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint
- [ ] Track order metrics

### Payments Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint
- [ ] Track payment metrics

### Customer Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint
- [ ] Track client metrics

### Inventory Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint

### Staff Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint

### BI Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint

### Integration Hub Service
- [ ] Add package dependencies
- [ ] Initialize error tracking
- [ ] Initialize tracing
- [ ] Add middleware (in correct order)
- [ ] Expose `/metrics` endpoint

---

## Environment Variables

**Add to each service's environment:**

```bash
# Tracing
TRACING_ENABLED=true
JAEGER_ENDPOINT=http://jaeger:14268/api/traces

# Error Tracking
SENTRY_ENABLED=true
SENTRY_DSN=https://xxx@sentry.io/xxx
APP_VERSION=1.0.0
```

---

## Testing

**After integration, test:**

1. **Metrics:**
   ```bash
   curl http://localhost:4110/metrics
   ```
   Should return JSON with metrics data.

2. **Tracing:**
   - Make a request to service
   - Check Jaeger UI at http://localhost:16686
   - Should see trace for the request

3. **Error Tracking:**
   - Trigger an error (5xx)
   - Check Sentry dashboard
   - Should see error with tenant context

---

## Middleware Order (Critical)

**Correct order is critical:**

1. `errorTrackingMiddleware()` - First
2. `tenantContextMiddleware()` - Extract tenant context
3. `dbTenantContextMiddleware()` - Set DB context
4. `tenantStateValidationMiddleware()` - Validate tenant state
5. `tenantContextErrorTrackingMiddleware()` - Set tenant in Sentry
6. `loggingMiddleware()` - Logging with tenant context
7. `tracingMiddleware()` - Tracing with tenant context
8. `metricsMiddleware()` - Metrics with tenant context
9. Routes
10. `errorHandlerMiddleware()` - Last, after all routes

---

**Documentation:** `docs/agents/phase_3_p3_4_integration_guide.md`  
**Status:** 📋 READY FOR INTEGRATION


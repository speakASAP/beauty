# Tenant Middleware Package

Shared tenant middleware library for beauty platform.

## Features

- JWT token validation and tenant context extraction
- Database session tenant binding (RLS support)
- Tenant state validation
- Logging context creation
- Express middleware integration

## Usage

### Basic Setup

```javascript
import express from 'express';
import { Pool } from 'pg';
import {
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  tenantStateValidationMiddleware
} from '@beauty/tenant-middleware';

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

// Extract and validate tenant context
app.use(tenantContextMiddleware());

// Set tenant context in DB session (for RLS)
app.use(dbTenantContextMiddleware(db));

// For write operations, validate tenant state
app.post('/appointments', tenantStateValidationMiddleware(db), async (req, res) => {
  const { tenantId, userId } = req.tenantContext;
  // tenant_id is already set in DB session via RLS
  // Use req.dbClient (from dbTenantContextMiddleware) for all queries
  // This ensures tenant context is maintained on the same connection
  const result = await req.dbClient.query('SELECT * FROM booking.appointments');
  res.json(result.rows);
});
```

### Manual Usage

```javascript
import {
  extractTenantContext,
  validateTenantContext,
  setTenantContext,
  createLoggingContext
} from '@beauty/tenant-middleware';

// Extract tenant context from request
const tenantContext = extractTenantContext(req);

// Validate tenant context
const validation = validateTenantContext(tenantContext);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Set tenant context in DB session (requires a client, not pool)
// Note: dbTenantContextMiddleware handles this automatically
// For manual usage, acquire a client first:
const client = await db.connect();
await setTenantContext(client, tenantContext.tenantId, tenantContext.isFranchisor);
// Use client for queries, then release: client.release();

// Create logging context
const logContext = createLoggingContext(tenantContext, { service: 'booking-service' });
logger.info('Appointment created', logContext);
```

## Tenant Context Structure

```javascript
{
  tenantId: '550e8400-e29b-41d4-a716-446655440001', // UUID or null for franchisor
  userId: '550e8400-e29b-41d4-a716-446655440002',    // User UUID
  roles: ['salon_owner', 'master'],                  // User roles
  isFranchisor: false,                              // Is franchisor
  correlationId: '550e8400-e29b-41d4-a716-446655440003' // Request correlation ID
}
```

## Middleware Order

1. `tenantContextMiddleware()` - Extract and validate tenant context
2. `dbTenantContextMiddleware(db)` - Acquire client from pool, set tenant context in DB session, attach to `req.dbClient`
3. `tenantStateValidationMiddleware(db, options)` - Validate tenant state
   - For write operations: `tenantStateValidationMiddleware(db)` (default, blocks non-ACTIVE)
   - For read operations: `tenantStateValidationMiddleware(db, { allowReadOnly: true })` (allows SUSPENDED tenants)

**Important:** After `dbTenantContextMiddleware`, use `req.dbClient` for all database queries (not the pool directly). The middleware automatically releases the client when the response is sent.

**Tenant State Rules:**

- ACTIVE: All operations allowed
- SUSPENDED: Read-only (use `allowReadOnly: true` for read operations)
- CREATING: No access
- ARCHIVED: No access

## Franchisor Support

Franchisor tokens have `tenant_id: null` and `is_franchisor: true`. They bypass tenant state validation and use special database roles that bypass RLS (with audit logging).

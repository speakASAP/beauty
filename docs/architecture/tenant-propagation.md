# Tenant Propagation (immutable)

> This document is immutable once approved.  
> Defines how tenant context flows through the entire system.

---

## Related Documentation

- [Domain Glossary](domain-glossary.md) - Tenant definition
- [Tenant Model](tenant-model.md) - Tenant isolation and RLS policies
- [Event Catalog](event-catalog.md) - Events that include tenant_id
- [Technical Design Document](tdd.md) - Overall architecture
- [Business Goal](../business/business-goal.md) - Business context

---

## End-to-End Flow

```text
User Request
  ↓
Auth Service (JWT with tenant_id)
  ↓
API Gateway (extract tenant_id, inject header)
  ↓
Service (extract tenant_id, set DB session)
  ↓
Database (RLS enforces tenant isolation)
  ↓
Event Bus (tenant_id in event metadata)
  ↓
Logging (tenant_id in log context)
```

---

## 1. Authentication (Auth Service)

### JWT Token Structure

**Standard Claims:**

```json
{
  "sub": "user_uuid",
  "tenant_id": "tenant_uuid",
  "roles": ["salon_owner", "master", "staff"],
  "permissions": ["appointments:write", "orders:read"],
  "iat": 1234567890,
  "exp": 1234571490,
  "jti": "jwt_id"
}
```

**Required Claims:**

- `sub` (string, required) - User UUID (subject)
- `tenant_id` (uuid, required) - Tenant UUID (except franchisor)
- `roles` (array, required) - User roles within tenant
- `permissions` (array, required) - Fine-grained permissions
- `iat` (number, required) - Issued at timestamp
- `exp` (number, required) - Expiration timestamp
- `jti` (string, optional) - JWT ID for revocation

**Optional Claims:**

- `email` (string, optional) - User email
- `name` (string, optional) - User display name

### Special Cases

#### Franchisor Token

```json
{
  "sub": "franchisor_uuid",
  "tenant_id": null,
  "roles": ["franchisor"],
  "permissions": ["*:read", "tenants:write"],
  "is_franchisor": true,
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Rules:**

- `tenant_id` is `null` (not missing)
- `is_franchisor` flag is `true`
- Can access all tenant data (read-only for BI)
- Can manage tenant lifecycle
- Cannot write tenant operational data

#### Tenant Token

```json
{
  "sub": "user_uuid",
  "tenant_id": "tenant_uuid",
  "roles": ["salon_owner"],
  "permissions": ["appointments:write", "orders:read"],
  "is_franchisor": false,
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Rules:**

- `tenant_id` is REQUIRED (must be valid UUID)
- `is_franchisor` is `false` or omitted
- Can only access own tenant's data
- Permissions are tenant-scoped

### Token Validation Rules

1. **Signature Validation:**
   - Token must be signed by Auth Service
   - Signature must be valid
   - Reject if signature invalid → 401 Unauthorized

2. **Expiration Validation:**
   - Token must not be expired
   - Reject if expired → 401 Unauthorized

3. **Tenant ID Validation:**
   - If `tenant_id` is missing and `is_franchisor` is not `true` → REJECT → 403 Forbidden
   - If `tenant_id` is invalid UUID format → REJECT → 403 Forbidden
   - If `tenant_id` is null and `is_franchisor` is not `true` → REJECT → 403 Forbidden

4. **Tenant State Validation:**
   - If tenant state is not ACTIVE and user is not franchisor:
     - For writes: REJECT → 403 Forbidden
     - For reads (if SUSPENDED): ALLOW (read-only)
     - For reads (if ARCHIVED): REJECT → 403 Forbidden (except franchisor)

5. **Role Validation:**
   - `roles` array must not be empty
   - Roles must be valid for tenant context
   - Reject if invalid → 403 Forbidden

---

## 2. API Gateway

### Responsibilities

1. **Validate JWT Token:**
   - Verify signature
   - Check expiration
   - Validate claims structure

2. **Extract Tenant Context:**
   - Extract `tenant_id` from JWT claims
   - Extract `user_id` from JWT `sub` claim
   - Extract `roles` from JWT claims
   - Extract `is_franchisor` flag

3. **Inject Headers:**
   - Add `X-Tenant-ID` header (for services that need it)
   - Add `X-User-ID` header
   - Add `X-User-Roles` header
   - Add `X-Is-Franchisor` header

4. **Set Request Context:**
   - Store tenant context in request object
   - Make available to downstream services

5. **Validate Tenant State:**
   - Check tenant state (if tenant_id present)
   - Reject if tenant cannot perform requested operation

### Gateway Contract

**Incoming Request Headers:**

```text
Authorization: Bearer {jwt_token}
```

**Gateway Adds (Downstream Headers):**

```text
X-Tenant-ID: {tenant_uuid}        // From JWT tenant_id claim
X-User-ID: {user_uuid}             // From JWT sub claim
X-User-Roles: salon_owner,master   // From JWT roles (comma-separated)
X-Is-Franchisor: true|false        // From JWT is_franchisor flag
X-Correlation-ID: {correlation_id} // Generated for request tracing
```

**Gateway Validates:**

- JWT signature (must be valid)
- JWT expiration (must not be expired)
- `tenant_id` presence (unless franchisor)
- `tenant_id` format (must be valid UUID if present)
- Tenant state (if tenant_id present)

**Gateway Rejects If:**

- Invalid JWT signature → 401 Unauthorized
- JWT expired → 401 Unauthorized
- Missing `tenant_id` (non-franchisor) → 403 Forbidden
- Invalid `tenant_id` format → 403 Forbidden
- Tenant SUSPENDED (for write operations) → 403 Forbidden
- Tenant ARCHIVED (for all operations, except franchisor) → 403 Forbidden

**Gateway Allows:**

- Valid JWT with `tenant_id` → Forward to service
- Valid JWT with `is_franchisor: true` → Forward to service (special handling)

### Gateway Implementation Notes

**Nginx Configuration:**

- JWT validation via `auth_request` module
- Header injection via `proxy_set_header`
- Tenant state check via upstream service call

**Request Flow:**

1. Client sends request with `Authorization: Bearer {token}`
2. Gateway validates JWT (signature, expiration)
3. Gateway extracts claims
4. Gateway validates tenant state (if applicable)
5. Gateway injects headers
6. Gateway forwards request to service

---

## 3. Service Layer

### Tenant Context Extraction

**From Request (Express.js example):**

```javascript
// Option 1: From JWT (already validated by Gateway)
const tenantId = req.user.tenant_id;  // From JWT claim (if Gateway attached)

// Option 2: From header (if Gateway injected)
const tenantId = req.headers['x-tenant-id'];

// Option 3: From request context (if middleware attached)
const tenantId = req.tenantContext.tenantId;
```

**From Request (Generic):**

- Extract from `X-Tenant-ID` header (preferred)
- Or extract from JWT claims (if Gateway attached user object)
- Or extract from request context (if middleware attached)

### Database Session Binding

**Before ANY database operation:**

```javascript
// Set tenant context in DB session
await db.query('SET app.tenant_id = $1', [tenantId]);

// Now all queries are tenant-scoped by RLS
const appointments = await db.query('SELECT * FROM booking.appointments');
// RLS automatically filters by tenant_id
```

**Connection Pooling:**

- Each request gets a connection from pool
- Set `app.tenant_id` at start of request
- Connection returns to pool after request (session variable cleared)
- Next request sets its own `app.tenant_id`

**Transaction Handling:**

```javascript
// Start transaction
await db.query('BEGIN');
await db.query('SET app.tenant_id = $1', [tenantId]);

// Perform operations (all tenant-scoped)
await db.query('INSERT INTO booking.appointments ...');
await db.query('UPDATE booking.time_slots ...');

// Commit transaction
await db.query('COMMIT');
```

### Service Contract

**Every service MUST:**

1. **Extract tenant_id from request context:**
   - From `X-Tenant-ID` header (preferred)
   - Validate it's not null (unless franchisor)
   - Validate it's valid UUID format

2. **Set `app.tenant_id` in DB session before queries:**
   - Must be set before ANY database operation
   - Must be set in every database connection used
   - Must be set in transactions

3. **Include tenant_id in all events:**
   - All events must include `tenant_id` field
   - Extract from request context
   - Never hardcode or omit

4. **Include tenant_id in all logs:**
   - All log entries must include tenant context
   - Use logging middleware (don't manually add)
   - Logs must be tenant-filterable

5. **Validate tenant_id is not null (unless franchisor):**
   - Check `is_franchisor` flag
   - Reject if `tenant_id` is null and not franchisor
   - Return 403 Forbidden if invalid

**Service Rejects If:**

- `tenant_id` is missing (non-franchisor request) → 403 Forbidden
- `tenant_id` is invalid UUID format → 403 Forbidden
- Cannot set DB session tenant context → 500 Internal Server Error
- Tenant state is not ACTIVE (for writes) → 403 Forbidden

### Service Middleware Pattern

```javascript
// Tenant context middleware
async function tenantContextMiddleware(req, res, next) {
  // Extract tenant_id from header
  const tenantId = req.headers['x-tenant-id'];
  const isFranchisor = req.headers['x-is-franchisor'] === 'true';

  // Validate tenant_id (unless franchisor)
  if (!isFranchisor && !tenantId) {
    return res.status(403).json({ error: 'Missing tenant_id' });
  }

  if (!isFranchisor && !isValidUUID(tenantId)) {
    return res.status(403).json({ error: 'Invalid tenant_id' });
  }

  // Attach to request context
  req.tenantContext = {
    tenantId: tenantId,
    isFranchisor: isFranchisor,
    userId: req.headers['x-user-id'],
    roles: req.headers['x-user-roles']?.split(',') || []
  };

  // Set DB session tenant context (if not franchisor)
  if (!isFranchisor && tenantId) {
    await db.query('SET app.tenant_id = $1', [tenantId]);
  }

  next();
}
```

---

## 4. Database Layer

### Session Context Setting

**Required Before Queries:**

```sql
SET app.tenant_id = '550e8400-e29b-41d4-a716-446655440000';
```

**This must be set:**

- Before any SELECT queries
- Before any INSERT queries
- Before any UPDATE queries
- Before any DELETE queries
- In every database connection
- In every transaction

### RLS Enforcement

**All SELECT queries filtered:**

```sql
-- RLS policy automatically filters
SELECT * FROM booking.appointments;
-- Equivalent to:
-- SELECT * FROM booking.appointments WHERE tenant_id = current_setting('app.tenant_id')::uuid;
```

**All INSERT queries require:**

```sql
-- RLS policy automatically checks
INSERT INTO booking.appointments (tenant_id, ...) VALUES (...);
-- RLS ensures tenant_id matches current_setting('app.tenant_id')::uuid
```

**All UPDATE queries filtered and checked:**

```sql
-- RLS policy filters rows and checks updates
UPDATE booking.appointments SET ... WHERE id = ...;
-- Only updates rows where tenant_id matches current_setting('app.tenant_id')::uuid
-- And ensures updated tenant_id still matches
```

**All DELETE queries filtered:**

```sql
-- RLS policy automatically filters
DELETE FROM booking.appointments WHERE id = ...;
-- Only deletes rows where tenant_id matches current_setting('app.tenant_id')::uuid
```

### Validation

**If `app.tenant_id` is not set:**

- RLS policies reject queries (return empty result or error)
- Application must set it before any operation
- Application should return 403 Forbidden if RLS blocks

**If `app.tenant_id` is invalid:**

- RLS policies reject queries
- Application must validate UUID format before setting
- Application should return 403 Forbidden if invalid

**If `app.tenant_id` doesn't match row `tenant_id`:**

- RLS policies filter out rows
- SELECT returns empty result
- UPDATE/DELETE affects 0 rows
- This is expected behavior (tenant isolation)

---

## 5. Event Bus

### Event Metadata

**All events MUST include:**

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "appointment.booked",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440002",
  "occurred_at": "2024-01-01T12:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440004",
    "causation_id": "550e8400-e29b-41d4-a716-446655440005"
  },
  "payload": {
    // Domain-specific fields
  }
}
```

**Required Fields:**

- `tenant_id` (uuid, required) - From request context
- `event_id` (uuid, required) - Unique event identifier
- `event_type` (string, required) - Event type name
- `event_version` (string, required) - Schema version
- `aggregate_id` (uuid, required) - Aggregate root ID
- `occurred_at` (timestamp, required) - When event occurred

**Metadata Fields:**

- `user_id` (uuid, optional) - Who triggered the event
- `correlation_id` (uuid, optional) - Request correlation ID
- `causation_id` (uuid, optional) - Previous event that caused this

### Event Publishing

**Service publishes event:**

```javascript
await eventBus.publish({
  eventType: 'appointment.booked',
  tenantId: req.tenantContext.tenantId,  // From request context
  aggregateId: appointmentId,
  occurredAt: new Date(),
  payload: {
    appointment_id: appointmentId,
    client_id: clientId,
    master_id: masterId,
    // ... other payload fields
  },
  metadata: {
    user_id: req.tenantContext.userId,
    correlation_id: req.headers['x-correlation-id']
  }
});
```

**Event Bus ensures:**

- `tenant_id` is present (reject if missing)
- `tenant_id` is valid UUID (reject if invalid)
- Event is routed to tenant-specific topics (if applicable)
- Event is logged with tenant_id
- Event is stored with tenant_id for filtering

**Event Bus rejects if:**

- `tenant_id` is missing → Reject event, log error
- `tenant_id` is invalid UUID → Reject event, log error
- `tenant_id` is null (unless system event) → Reject event, log error

### Event Consumption

**Consumers filter by tenant:**

```javascript
// Consumer subscribes to events
eventBus.subscribe('appointment.booked', async (event) => {
  // Event already filtered by tenant (if topic-based routing)
  // Or consumer filters by tenant_id
  if (event.tenant_id !== expectedTenantId) {
    return; // Skip event from other tenant
  }

  // Process event
  await processAppointmentBooked(event);
});
```

---

## 6. Logging

### Log Context

**Every log entry MUST include:**

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "info",
  "message": "Appointment created",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440003",
  "service": "booking-service",
  "correlation_id": "550e8400-e29b-41d4-a716-446655440004",
  "data": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440002"
  }
}
```

**Required Fields:**

- `tenant_id` (uuid, required) - From request context
- `timestamp` (timestamp, required) - When log entry created
- `level` (string, required) - Log level (info, error, warn, debug)
- `message` (string, required) - Log message
- `service` (string, required) - Service name

**Optional Fields:**

- `user_id` (uuid, optional) - User who triggered action
- `correlation_id` (uuid, optional) - Request correlation ID
- `data` (object, optional) - Additional context data

### Logging Middleware

**Automatically adds:**

- `tenant_id` (from request context)
- `user_id` (from JWT or request context)
- `correlation_id` (from request header or generated)
- `service` name (from environment or config)

**No manual tenant_id in log statements:**

```javascript
// ❌ BAD (manual tenant_id)
logger.info('Appointment created', { 
  appointmentId, 
  tenantId: req.tenantContext.tenantId 
});

// ✅ GOOD (middleware adds tenant_id automatically)
logger.info('Appointment created', { appointmentId });
```

**Logging Middleware Implementation:**

```javascript
// Logging middleware
function loggingMiddleware(req, res, next) {
  // Attach logger with context
  req.logger = logger.child({
    tenant_id: req.tenantContext.tenantId,
    user_id: req.tenantContext.userId,
    correlation_id: req.headers['x-correlation-id'],
    service: process.env.SERVICE_NAME
  });

  next();
}
```

### Log Filtering

**All logs must be filterable by tenant:**

- Logging service must support tenant filtering
- Log queries must include tenant_id filter
- Log aggregation must be tenant-aware
- Log retention must be tenant-aware

---

## 7. Error Handling

### Tenant Context Errors

**If tenant_id is missing:**

- Return 403 Forbidden
- Log error with request context (without tenant_id)
- Do not process request
- Do not emit events
- Do not write to database

**If tenant_id is invalid:**

- Return 403 Forbidden
- Log error with request context
- Do not process request
- Do not emit events
- Do not write to database

**If tenant state is not ACTIVE:**

- For writes: Return 403 Forbidden
- For reads (if SUSPENDED): Allow (read-only)
- For reads (if ARCHIVED): Return 403 Forbidden (except franchisor)
- Log state violation
- Do not emit events (for writes)

**If DB session tenant context cannot be set:**

- Return 500 Internal Server Error
- Log error with request context
- Do not process request
- Alert operations team

### Error Response Format

```json
{
  "error": "Missing tenant_id",
  "code": "TENANT_MISSING",
  "status": 403,
  "timestamp": "2024-01-01T12:00:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440004"
}
```

---

## 8. Testing Tenant Isolation

### Test Scenarios

1. **Cross-tenant read attempt:**
   - Set `app.tenant_id` to Tenant A
   - Try to read Tenant B data
   - Expected: RLS blocks, returns empty result
   - Verify: No data from Tenant B returned

2. **Missing tenant_id:**
   - Request without `tenant_id` in JWT
   - Expected: Gateway rejects with 403 Forbidden
   - Verify: Request never reaches service

3. **Invalid tenant_id:**
   - Request with invalid UUID format
   - Expected: Gateway rejects with 403 Forbidden
   - Verify: Request never reaches service

4. **Suspended tenant write:**
   - Tenant state: SUSPENDED
   - Try to create appointment
   - Expected: Service rejects with 403 Forbidden
   - Verify: No database write, no event emitted

5. **Suspended tenant read:**
   - Tenant state: SUSPENDED
   - Try to read appointments
   - Expected: Service allows (read-only)
   - Verify: Data returned, but writes blocked

6. **Archived tenant access:**
   - Tenant state: ARCHIVED
   - Try to access data
   - Expected: Service rejects with 403 Forbidden
   - Verify: No access (except franchisor)

7. **Franchisor cross-tenant access:**
   - Franchisor token with `tenant_id: null`
   - Try to read all tenant data
   - Expected: Service allows (read-only)
   - Verify: Can see all tenants' data

---

## 9. Franchisor Access

### Special Handling

**Franchisor token:**

- `tenant_id: null` in JWT
- `is_franchisor: true` in JWT
- Gateway allows through (no tenant_id validation)
- Services check `is_franchisor` flag
- Database: Use special role that bypasses RLS (with audit)
- Events: Can subscribe to all tenant events
- Logs: Include `is_franchisor: true`

**Franchisor Queries:**

```sql
-- Franchisor uses special role
SET ROLE franchisor_readonly;
-- This role has RLS bypass (with audit logging)
SELECT * FROM booking.appointments;  -- Can see all tenants
```

**Franchisor Restrictions:**

- Cannot write tenant operational data
- Can only read for BI/reporting
- All queries are audited
- Cannot modify tenant data directly

### Audit Logging

**All franchisor queries logged:**

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "user_id": "franchisor_uuid",
  "action": "SELECT",
  "table": "booking.appointments",
  "tenant_id_accessed": ["tenant_uuid_1", "tenant_uuid_2"],
  "query": "SELECT * FROM booking.appointments",
  "result_count": 100
}
```

**Audit Log Requirements:**

- All franchisor queries logged
- Include: query, tenant_id accessed, user_id, timestamp
- Stored in `platform.franchisor_audit_log` table
- Compliance requirement
- Retention: 7 years (legal requirement)

---

## 10. Sequence Diagram

```text
User
  ↓ (HTTP Request + JWT)
API Gateway
  ↓ (Validate JWT, Extract tenant_id)
  ↓ (Inject X-Tenant-ID header)
Service
  ↓ (Extract tenant_id from header)
  ↓ (SET app.tenant_id in DB session)
Database
  ↓ (RLS filters queries by tenant_id)
  ↓ (Return tenant-scoped results)
Service
  ↓ (Publish event with tenant_id)
Event Bus
  ↓ (Route/store event with tenant_id)
Service
  ↓ (Log with tenant_id)
Logging Service
  ↓ (Store log with tenant_id)
```

**Detailed Flow:**

1. User sends request with JWT token
2. API Gateway validates JWT (signature, expiration)
3. API Gateway extracts `tenant_id` from JWT claims
4. API Gateway validates tenant state (if applicable)
5. API Gateway injects `X-Tenant-ID` header
6. Service receives request with `X-Tenant-ID` header
7. Service extracts `tenant_id` from header
8. Service sets `app.tenant_id` in DB session
9. Service performs database operations (RLS filters automatically)
10. Service publishes event with `tenant_id`
11. Service logs action with `tenant_id`
12. Response returned to user

---

## 11. Implementation Checklist

### API Gateway

- [ ] JWT validation middleware
- [ ] Tenant ID extraction from JWT
- [ ] Header injection (`X-Tenant-ID`, `X-User-ID`, etc.)
- [ ] Tenant state validation
- [ ] Error handling (401, 403)

### Service Layer

- [ ] Tenant context extraction middleware
- [ ] DB session tenant context setting
- [ ] Tenant validation (null check, UUID format)
- [ ] Tenant state check (for writes)
- [ ] Event publishing with tenant_id
- [ ] Logging with tenant context

### Database Layer

- [ ] RLS policies enabled on all tables
- [ ] Session variable `app.tenant_id` used in policies
- [ ] Connection pooling with session variable handling
- [ ] Transaction handling with tenant context

### Event Bus

- [ ] Event validation (tenant_id required)
- [ ] Tenant-based routing (if applicable)
- [ ] Event storage with tenant_id
- [ ] Consumer filtering by tenant

### Logging

- [ ] Logging middleware with tenant context
- [ ] Tenant-aware log filtering
- [ ] Log aggregation by tenant
- [ ] Log retention by tenant

---

**Status:** IMMUTABLE (Frozen after Phase 0 approval)  
**Version:** 1.0  
**Created:** Phase 0 - T0.4  
**Last Updated:** 2024

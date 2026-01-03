# Tenant Model (immutable)

> This document is immutable
---

## Related Documentation

- [Domain Glossary](domain-glossary.md) - Domain terms (Tenant, Franchisor)
- [Event Catalog](event-catalog.md) - Events with tenant_id
- [Tenant Propagation](tenant-propagation.md) - How tenant_id flows through system
- [Technical Design Document](tdd.md) - Architectural foundation

---

## Multi-Tenant Strategy

### Database Architecture

- **Shared PostgreSQL database** - Single database for all tenants
- **Row-Level Security (RLS)** - Enabled on all tenant-scoped tables
- **tenant_id column (UUID)** - Present in all domain tables
- **Global catalogs** - Use `tenant_id = NULL` (explicit exception)

### Tenant Isolation Rules

1. All domain tables MUST have `tenant_id` column (UUID, NOT NULL for tenant data)
2. RLS policies enforce tenant isolation at database level
3. No application-level tenant filtering (RLS is source of truth)
4. Global catalogs (e.g., service templates) use `tenant_id = NULL`
5. Cross-tenant queries are forbidden (except franchisor read-only BI)
6. All events MUST include `tenant_id`
7. All logs MUST include `tenant_id`

---

## Row-Level Security (RLS) Policies

### Policy Template

For tenant-scoped tables:

```sql
-- Enable RLS on table
ALTER TABLE {schema}.{table_name} ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT
CREATE POLICY {table_name}_tenant_select
ON {schema}.{table_name}
FOR SELECT
USING (tenant_id = current_setting('app.tenant_id')::uuid OR tenant_id IS NULL);

-- Create policy for INSERT
CREATE POLICY {table_name}_tenant_insert
ON {schema}.{table_name}
FOR INSERT
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Create policy for UPDATE
CREATE POLICY {table_name}_tenant_update
ON {schema}.{table_name}
FOR UPDATE
USING (tenant_id = current_setting('app.tenant_id')::uuid)
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- Create policy for DELETE
CREATE POLICY {table_name}_tenant_delete
ON {schema}.{table_name}
FOR DELETE
USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### Global Catalog Exception

For tables with `tenant_id = NULL` (global catalogs):

```sql
-- Enable RLS on table
ALTER TABLE {schema}.{table_name} ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT (all tenants can read global catalogs)
CREATE POLICY {table_name}_global_read
ON {schema}.{table_name}
FOR SELECT
USING (tenant_id IS NULL);

-- Create policy for INSERT (only franchisor can write)
CREATE POLICY {table_name}_global_insert
ON {schema}.{table_name}
FOR INSERT
WITH CHECK (tenant_id IS NULL AND current_setting('app.is_franchisor')::boolean = true);

-- Create policy for UPDATE (only franchisor can update)
CREATE POLICY {table_name}_global_update
ON {schema}.{table_name}
FOR UPDATE
USING (tenant_id IS NULL AND current_setting('app.is_franchisor')::boolean = true)
WITH CHECK (tenant_id IS NULL AND current_setting('app.is_franchisor')::boolean = true);

-- Create policy for DELETE (only franchisor can delete)
CREATE POLICY {table_name}_global_delete
ON {schema}.{table_name}
FOR DELETE
USING (tenant_id IS NULL AND current_setting('app.is_franchisor')::boolean = true);
```

### Tables Requiring RLS

#### Booking Context

- `appointments` - Tenant-scoped
- `time_slots` - Tenant-scoped
- `master_schedules` - Tenant-scoped
- `masters` - Tenant-scoped

#### POS / Orders Context

- `orders` - Tenant-scoped
- `order_items` - Tenant-scoped
- `visits` - Tenant-scoped

#### Payments Context

- `payments` - Tenant-scoped
- `payment_transactions` - Tenant-scoped

#### Inventory Context

- `inventory_items` - Tenant-scoped
- `inventory_movements` - Tenant-scoped

#### Customer Context

- `clients` - Tenant-scoped
- `client_consents` - Tenant-scoped
- `client_preferences` - Tenant-scoped

#### Reporting Context

- `bi_daily_sales` - Tenant-scoped
- `bi_master_utilization` - Tenant-scoped
- `bi_client_ltv` - Tenant-scoped

#### Global Catalogs (tenant_id = NULL)

- `service_templates` - Global (readable by all, writable by franchisor)
- `product_templates` - Global (readable by all, writable by franchisor)
- `pricing_rules` - Global (readable by all, writable by franchisor)

### Superuser Bypass

- **Superuser (postgres)** can bypass RLS (for migrations, admin)
- **Application users** MUST use tenant context
- **No application-level superuser queries allowed** (except migrations)
- **Franchisor access** uses special role with RLS bypass (with audit logging)

---

## Tenant Lifecycle

### States

1. **CREATING** - Tenant being provisioned (no data access)
2. **ACTIVE** - Tenant fully operational
3. **SUSPENDED** - Tenant temporarily disabled (data read-only, no writes)
4. **ARCHIVED** - Tenant permanently disabled (data read-only, no access)
5. **DELETED** - Not in MVP (data retention required)

### State Transitions

```text
CREATING → ACTIVE (after provisioning complete)
ACTIVE → SUSPENDED (franchisor action)
SUSPENDED → ACTIVE (franchisor action)
SUSPENDED → ARCHIVED (franchisor action)
ARCHIVED → [no transitions] (permanent)
```

### State Rules

#### CREATING

- **No data access** - Cannot query tenant data
- **Can create tenant record only** - Initial setup allowed
- **Cannot set tenant context** - Cannot perform domain operations
- **Provisioning in progress** - System is setting up tenant

#### ACTIVE

- **Full read/write access** - All operations allowed
- **Can create all domain entities** - Appointments, orders, clients, etc.
- **Can emit events** - All event types allowed
- **Normal operations** - Standard business flow

#### SUSPENDED

- **Read-only access** - Can view tenant data
- **Cannot create new entities** - No writes allowed
- **Cannot emit events** - No domain events (except read-only queries)
- **Cannot process payments** - Payment operations blocked
- **Can view historical data** - For reporting/audit
- **Franchisor can still access** - For reporting purposes

#### ARCHIVED

- **No access** - Even read-only blocked for tenant users
- **Data retained** - For compliance and historical reporting
- **Franchisor can access** - For historical reporting only
- **Cannot be reactivated** - Permanent state
- **No operations allowed** - All operations blocked

### Tenant Creation Process

1. **Franchisor creates tenant record** (via admin API)
   - Tenant UUID generated
   - Tenant name, address, contact info
   - Initial state: CREATING

2. **System provisions tenant:**
   - Default catalog items (copied from global catalog)
   - Default settings (business hours, timezone, etc.)
   - Initial admin user (salon owner)
   - Default permissions and roles

3. **Tenant state transition:** CREATING → ACTIVE
   - System marks tenant as ACTIVE
   - Tenant can now operate

4. **Tenant can now operate:**
   - Create appointments
   - Process orders
   - Manage inventory
   - Access all features

---

## Global vs Tenant-Scoped Data

### Global Data (`tenant_id = NULL`)

**Purpose:** Shared templates and configurations readable by all tenants

**Examples:**

- Service templates (base catalog)
- Product templates (base catalog)
- System configuration
- Franchisor settings
- Global pricing rules (templates)

**Rules:**

- **Readable by all tenants** - All tenants can read global catalogs
- **Writable only by franchisor** - Only franchisor can create/update/delete
- **Copied to tenant catalog on tenant creation** - Tenant gets own copy
- **Tenant can override** - Tenant can customize their copy

**RLS Policy:**

```sql
-- All tenants can read
USING (tenant_id IS NULL)

-- Only franchisor can write
WITH CHECK (tenant_id IS NULL AND current_setting('app.is_franchisor')::boolean = true)
```

### Tenant-Scoped Data (`tenant_id = UUID`)

**Purpose:** All operational data belonging to a specific tenant

**Examples:**

- All domain entities (appointments, orders, clients, etc.)
- Tenant-specific catalog items (customized services/products)
- Tenant-specific pricing (overrides of global templates)
- Tenant-specific settings (business hours, timezone, etc.)

**Rules:**

- **Isolated by RLS** - Database enforces isolation
- **Accessible only by tenant** - Tenant can only see their own data
- **Franchisor can read for BI** - Read-only access for analytics
- **Franchisor cannot write** - Cannot modify tenant data

**RLS Policy:**

```sql
-- Tenant can only see their own data
USING (tenant_id = current_setting('app.tenant_id')::uuid)

-- Tenant can only insert their own data
WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
```

---

## Tenant Context Setting

### Database Session

**Before ANY database operation:**

```sql
SET app.tenant_id = '{tenant_uuid}';
```

**This must be set:**

- Before any domain queries
- After authentication
- Before any writes
- Before any reads
- In every database connection/session

### Validation

**If `app.tenant_id` is not set:**

- RLS policies reject queries
- Application must set it before any operation
- Return error: "Tenant context not set"

**If `app.tenant_id` is invalid:**

- RLS policies reject queries
- Application must validate UUID format
- Return error: "Invalid tenant ID"

**If tenant state is not ACTIVE:**

- For writes: Reject with error "Tenant is not active"
- For reads (if SUSPENDED): Allow (read-only)
- For reads (if ARCHIVED): Reject with error "Tenant is archived"
- For reads (if CREATING): Reject with error "Tenant is being provisioned"

---

## Tenant Data Isolation Guarantees

### 1. Database Level

- **RLS enforces isolation** - PostgreSQL Row-Level Security
- **No cross-tenant queries possible** - RLS blocks automatically
- **tenant_id required in all tables** - Schema enforcement

### 2. Application Level

- **tenant_id required in all domain operations** - Code enforcement
- **Tenant context set before queries** - Middleware enforcement
- **No tenant_id = no operation** - Validation enforcement

### 3. Event Level

- **tenant_id in all events** - Event schema enforcement
- **Event bus routes by tenant** - If applicable
- **Event consumers respect tenant_id** - Consumer enforcement

### 4. Logging Level

- **tenant_id in all logs** - Logging middleware
- **Logs partitioned by tenant** - For compliance
- **No cross-tenant log access** - Log access control

### 5. API Level

- **tenant_id in all API requests** - Implicit from auth token
- **API Gateway validates tenant_id** - Gateway enforcement
- **No tenant_id = 403 Forbidden** - API validation

---

## Exceptions

### Franchisor Access

**Franchisor can:**

- Read all tenant data (for BI and reporting)
- Create/update/delete global catalogs
- Manage tenant lifecycle (create, suspend, archive)
- Access cross-tenant analytics

**Franchisor cannot:**

- Write tenant data (cannot modify tenant operations)
- Access tenant data without audit logging
- Bypass tenant isolation without special role

**Franchisor Access Implementation:**

```sql
-- Franchisor uses special role
SET ROLE franchisor_readonly;
SET app.is_franchisor = true;

-- This role has RLS bypass (with audit logging)
SELECT * FROM appointments;  -- Can see all tenants

-- All queries are logged for audit
```

**Audit Logging:**

- All franchisor queries logged
- Include: query, tenant_id accessed, user_id, timestamp
- Compliance requirement
- Stored in separate audit log table

### Cross-Tenant Operations

**FORBIDDEN in MVP:**

- Tenant-to-tenant data access
- Cross-tenant queries
- Cross-tenant event processing
- Cross-tenant API calls

**Future (Post-MVP):**

- Tenant-to-tenant referrals (with explicit consent)
- Cross-tenant analytics (franchisor only)
- Multi-tenant promotions (franchisor managed)

---

## Tenant Table Schema

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  state VARCHAR(20) NOT NULL DEFAULT 'CREATING',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT tenants_state_check CHECK (state IN ('CREATING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'))
);

CREATE INDEX idx_tenants_state ON tenants(state);
```

**Note:** `tenants` table does NOT have `tenant_id` column (it's the tenant itself).

---

## Tenant Provisioning Checklist

When creating a new tenant:

1. ✅ Create tenant record in `tenants` table
2. ✅ Generate tenant UUID
3. ✅ Set state to CREATING
4. ✅ Copy global service templates to tenant catalog
5. ✅ Copy global product templates to tenant catalog
6. ✅ Create default settings (business hours, timezone, etc.)
7. ✅ Create initial admin user (salon owner)
8. ✅ Assign default roles and permissions
9. ✅ Set state to ACTIVE
10. ✅ Enable tenant operations

---

## Change Log

### Version 1.0 (Frozen - 2024)

- Initial complete tenant model
- RLS policies defined for all domain tables
- Tenant lifecycle state machine defined
- Global vs tenant-scoped data rules explicit
- Tenant creation process defined
- State transition rules explicit
- Franchisor access rules documented
- Ready for Phase 0 freeze

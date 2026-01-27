# Existing Services Mapping (immutable)

> Defines how existing alfares.cz microservices are used in the beauty platform.

---

## Related Documentation

- [Bounded Contexts](bounded-contexts.md) - Context boundaries that use these services
- [Adapter Interfaces](adapter-interfaces.md) - Adapter contracts for wrapped services
- [Technical Design Document](tdd.md) - Architectural foundation
- [Business Goal](../business/business-goal.md) - Business context

---

## Service Inventory

### Existing Microservices (from alfares.cz platform)

These services already exist and are production-ready. They must NOT be modified for the beauty domain.

---

## 1. Auth Service

**Current Role:** Identity & tenant source, user authentication

**Decision:** ✅ **KEEP** (use as-is)

**Usage:**

- JWT token issuance
- User authentication
- Tenant context in JWT claims
- Role-based access control (RBAC)

**Adapter Required:** ❌ **No** (direct integration)

**Changes Required:** None (already supports `tenant_id` in JWT claims)

**Anti-Corruption Layer:** None needed

**Integration Method:**

- Direct API calls to Auth Service
- JWT tokens validated by API Gateway
- Tenant context extracted from JWT claims

**Service Endpoint:** `auth-microservice` (existing)

**Documentation:** Uses existing Auth Service API

---

## 2. Catalog Service

**Current Role:** Services & pricing management

**Decision:** ✅ **WRAP** (create adapter)

**Usage:**

- Service catalog (beauty services)
- Product catalog (beauty products)
- Pricing templates
- Tenant-specific pricing overrides

**Adapter Required:** ✅ **Yes** (`CatalogAdapter`)

**Changes Required:** None (use existing Catalog Service API)

**Anti-Corruption Layer:** ✅ **Required**

**Reason for Adapter:**

- Map external Catalog Service models to beauty domain `Service` aggregate
- Handle tenant-specific pricing overrides
- Translate between beauty domain and catalog service models

**Adapter Location:** `beauty-service/infrastructure/adapters/catalog-adapter`

**Service Endpoint:** `catalog-microservice` (existing)

**Integration Method:**

- HTTP API calls via `CatalogAdapter`
- Adapter translates between domain and external models
- No direct domain code imports Catalog Service models

---

## 3. Orders Service

**Current Role:** Generic order management, sales backend

**Decision:** ⚠️ **EVALUATE** → **REPLACE** (create new Beauty POS Service)

**Evaluation:**

**Beauty Domain Needs:**

- Appointment-based orders (order created from appointment)
- Visit-based orders (order created from visit)
- Service + product combinations
- Master assignment to orders
- Time-based pricing (appointments have time slots)
- Walk-in clients (no appointment)

**Existing Orders Service:**

- Generic order management
- May not support appointment/visit concepts
- May not support beauty-specific pricing rules
- May not support master assignment

**Decision:** ✅ **REPLACE with Beauty POS Service**

**Reasoning:**

1. Beauty domain has specific needs (appointment/visit concepts are core)
2. Better domain alignment with beauty aggregates
3. Avoids forcing generic service into beauty domain model
4. Cleaner architecture (domain owns its aggregates)

**New Service:** `beauty-pos-service` (new, to be built)

**Adapter Required:** ❌ **No** (new service, no adapter needed)

**Migration Strategy:**

- New Beauty POS Service implements beauty domain aggregates
- Existing Orders Service remains for other domains
- No migration needed (new service from scratch)

**Note:** If existing Orders Service has reusable components (payment processing, etc.), those are accessed via Payments Service adapter, not directly.

---

## 4. Payments Service

**Current Role:** Payment processing, payment adapter

**Decision:** ✅ **WRAP** (create adapter)

**Usage:**

- Payment capture
- Payment refunds
- Payment status queries
- Payment method handling (card, cash, online)

**Adapter Required:** ✅ **Yes** (`PaymentAdapter`)

**Changes Required:** None (use existing Payments Service API)

**Anti-Corruption Layer:** ✅ **Required**

**Reason for Adapter:**

- Map external Payments Service models to beauty domain `Payment` aggregate
- Handle beauty-specific payment flows (appointment-based payments)
- Translate between beauty domain and payments service models

**Adapter Location:** `beauty-service/infrastructure/adapters/payment-adapter`

**Service Endpoint:** `payments-microservice` (existing)

**Integration Method:**

- HTTP API calls via `PaymentAdapter`
- Adapter translates between domain and external models
- No direct domain code imports Payments Service models

---

## 5. Warehouse Service

**Current Role:** Inventory management, stock tracking

**Decision:** ✅ **WRAP** (create adapter)

**Usage:**

- Inventory item management
- Stock level tracking
- Inventory movements (increase/decrease)
- Stock queries

**Adapter Required:** ✅ **Yes** (`InventoryAdapter`)

**Changes Required:** None (use existing Warehouse Service API)

**Anti-Corruption Layer:** ✅ **Required**

**Reason for Adapter:**

- Map external Warehouse Service models to beauty domain `InventoryItem` and `InventoryMovement` aggregates
- Handle beauty-specific inventory needs (service consumption tracking)
- Translate between beauty domain and warehouse service models

**Adapter Location:** `beauty-service/infrastructure/adapters/inventory-adapter`

**Service Endpoint:** `warehouse-microservice` (existing)

**Integration Method:**

- HTTP API calls via `InventoryAdapter`
- Adapter translates between domain and external models
- No direct domain code imports Warehouse Service models

---

## 6. Notifications Service

**Current Role:** SMS / Email notifications

**Decision:** ✅ **WRAP** (create adapter)

**Usage:**

- SMS notifications (appointment confirmations, reminders)
- Email notifications (welcome emails, receipts)
- Czech SMS gateway integration (BulkGate, GoSMS)

**Adapter Required:** ✅ **Yes** (`NotificationAdapter`)

**Changes Required:** None (use existing Notifications Service API)

**Anti-Corruption Layer:** ✅ **Required**

**Reason for Adapter:**

- Map beauty domain events to notification requests
- Handle beauty-specific notification templates
- Translate between beauty domain and notifications service models

**Adapter Location:** `beauty-service/infrastructure/adapters/notification-adapter`

**Service Endpoint:** `notifications-microservice` (existing)

**Integration Method:**

- HTTP API calls via `NotificationAdapter`
- Adapter translates between domain events and notification requests
- No direct domain code imports Notifications Service models

---

## 7. Suppliers Service

**Current Role:** Procurement, supplier management

**Decision:** ⏸️ **IGNORE** (post-MVP)

**Usage:** Not in MVP scope

**Adapter Required:** ❌ **No** (post-MVP)

**Changes Required:** None

**Note:** May be integrated in future phases for procurement automation.

---

## 8. AI Service

**Current Role:** AI-driven optimization, recommendations

**Decision:** ⏸️ **IGNORE** (post-MVP)

**Usage:** Not in MVP scope

**Adapter Required:** ❌ **No** (post-MVP)

**Changes Required:** None

**Note:** May be integrated in future phases for:

- Appointment optimization
- Pricing recommendations
- Client behavior analysis

---

## 9. Logging Service

**Current Role:** Centralized logging, log aggregation

**Decision:** ✅ **KEEP** (use as-is)

**Usage:**

- Centralized logging
- Log aggregation
- Tenant-aware logging
- Log querying and analysis

**Adapter Required:** ❌ **No** (direct integration)

**Changes Required:** None (already supports `tenant_id` in logs)

**Anti-Corruption Layer:** None needed

**Integration Method:**

- Direct logging library integration
- Logs automatically include `tenant_id` from request context
- No adapter needed (logging is infrastructure concern)

**Service Endpoint:** `logging-microservice` (existing)

**Documentation:** Uses existing Logging Service API

---

## 10. Database Server

**Current Role:** PostgreSQL database

**Decision:** ✅ **KEEP** (use as-is)

**Usage:**

- Shared PostgreSQL database
- Row-Level Security (RLS) enabled
- Multi-tenant data storage

**Adapter Required:** ❌ **No** (direct access)

**Changes Required:**

- Enable RLS on all tenant-scoped tables
- Create schemas per bounded context
- Configure tenant context setting

**Integration Method:**

- Direct database access via connection pool
- RLS enforces tenant isolation
- No adapter needed (database is infrastructure)

**Service Endpoint:** `database-server` (existing)

**Documentation:** See [Tenant Model](tenant-model.md) for RLS configuration

---

## 11. Nginx Microservice

**Current Role:** API Gateway, blue/green deployments, request routing

**Decision:** ✅ **KEEP** (use as-is)

**Usage:**

- API Gateway (tenant propagation)
- Request routing
- Blue/green deployment management
- Load balancing

**Adapter Required:** ❌ **No** (direct integration)

**Changes Required:**

- Configure tenant propagation (extract `tenant_id` from JWT, inject headers)
- Configure routing rules for beauty services
- No code changes (configuration only)

**Anti-Corruption Layer:** None needed

**Integration Method:**

- Configuration-based (nginx config)
- Gateway extracts `tenant_id` from JWT
- Gateway injects `X-Tenant-ID` header
- Services read tenant context from headers

**Service Endpoint:** `nginx-microservice` (existing)

**Documentation:** See [Tenant Propagation](tenant-propagation.md) for gateway configuration

---

## Decision Matrix

| Service | Decision | Adapter | ACL Required | Changes | Integration Method |
| ------ | ------ | ----- | ---------- | ----- | ----------------- |
| Auth | KEEP | No | No | None | Direct API |
| Catalog | WRAP | Yes | Yes | None | HTTP via adapter |
| Orders | REPLACE | No | No | New service | New Beauty POS Service |
| Payments | WRAP | Yes | Yes | None | HTTP via adapter |
| Warehouse | WRAP | Yes | Yes | None | HTTP via adapter |
| Notifications | WRAP | Yes | Yes | None | HTTP via adapter |
| Suppliers | IGNORE | No | No | Post-MVP | N/A |
| AI | IGNORE | No | No | Post-MVP | N/A |
| Logging | KEEP | No | No | None | Direct library |
| Database | KEEP | No | No | Enable RLS | Direct access |
| Nginx | KEEP | No | No | Config only | Configuration |

---

## Adapter Requirements Summary

### Required Adapters

1. **CatalogAdapter**
   - Purpose: Map Catalog Service to beauty domain Service aggregate
   - Location: `beauty-service/infrastructure/adapters/catalog-adapter`
   - Interface: See [Adapter Interfaces](adapter-interfaces.md)

2. **PaymentAdapter**
   - Purpose: Map Payments Service to beauty domain Payment aggregate
   - Location: `beauty-service/infrastructure/adapters/payment-adapter`
   - Interface: See [Adapter Interfaces](adapter-interfaces.md)

3. **InventoryAdapter**
   - Purpose: Map Warehouse Service to beauty domain Inventory aggregates
   - Location: `beauty-service/infrastructure/adapters/inventory-adapter`
   - Interface: See [Adapter Interfaces](adapter-interfaces.md)

4. **NotificationAdapter**
   - Purpose: Map beauty domain events to notification requests
   - Location: `beauty-service/infrastructure/adapters/notification-adapter`
   - Interface: See [Adapter Interfaces](adapter-interfaces.md)

### No Adapters Needed

- Auth Service (direct integration)
- Logging Service (direct library integration)
- Database Server (direct access)
- Nginx Microservice (configuration only)

---

## Service Integration Rules

### Rule 1: No Direct Imports

**Beauty domain code MUST NOT:**

- Directly import existing service models
- Directly import existing service clients
- Share models with existing services

**Beauty domain code MUST:**

- Use adapters for all external service communication
- Define own domain models (Service, Payment, InventoryItem, etc.)
- Translate between domain and external models via adapters

### Rule 2: Adapter Only

**All communication with wrapped services:**

- Via adapters only
- No direct HTTP calls from domain code
- Adapters live in `infrastructure/adapters/` layer

### Rule 3: Event-Driven

**Adapters can:**

- Consume domain events
- Publish integration events
- React to domain changes

**Adapters MUST NOT:**

- Contain domain logic
- Make business decisions
- Store domain state

### Rule 4: Swappable

**Adapters must be swappable:**

- `PaymentAdapter` → `StripeAdapter` (future)
- `NotificationAdapter` → `TwilioAdapter` (future)
- `InventoryAdapter` → `CustomInventoryAdapter` (future)

**Implementation:**

- Adapters implement interfaces (see [Adapter Interfaces](adapter-interfaces.md))
- Domain code depends on interfaces, not implementations
- Dependency injection for adapter implementations

---

## New Services to Build

### Beauty POS Service

**Purpose:** Replace generic Orders Service with beauty-specific POS

**Reason:** Beauty domain has specific needs (appointments, visits, masters)

**Owns:**

- Order aggregates
- Visit aggregates
- Order-Visit relationships

**Communicates Via:**

- Events (`order.*`, `visit.*`)
- Adapters (Payments, Inventory, Notifications)

**Location:** `beauty-pos-service` (new microservice)

**See:** [Bounded Contexts](bounded-contexts.md) - POS/Orders Context

---

## Service Dependencies Graph

```text
Auth Service (JWT)
  ↓
Nginx Gateway (tenant propagation)
  ↓
Beauty Services (booking, pos, payments, inventory, customer)
  ↓
Adapters (catalog, payments, warehouse, notifications)
  ↓
Existing Services (catalog, payments, warehouse, notifications)
```

**Legend:**

- `→` = Direct integration
- `↓` = Via adapter

---

## Validation Checklist

- [x] All services have explicit "Keep / Wrap / Ignore" decisions
- [x] All adapters have explicit requirements
- [x] Anti-corruption layer requirements explicit
- [x] Orders Service evaluation complete (decision: REPLACE)
- [x] Decision matrix complete
- [x] Integration methods documented
- [x] Service dependencies documented

---

**Status:** IMMUTABLE (Frozen after Phase 0 approval)  
**Version:** 1.0  
**Created:** Phase 0 - T0.7  
**Last Updated:** 2026

---

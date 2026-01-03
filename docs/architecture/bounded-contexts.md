# Bounded Contexts (immutable)

> Defines all bounded contexts, their ownership, and communication contracts.

---

## Related Documentation

- [Domain Glossary](domain-glossary.md) - Domain terms used in contexts
- [Event Catalog](event-catalog.md) - Events for context communication
- [Event Storming](event-storming.md) - Event chains showing context interactions
- [Tenant Model](tenant-model.md) - Tenant isolation rules
- [Technical Design Document](tdd.md) - Architectural foundation

---

## Context Map

### Core Domains

#### Booking Context

**Responsibility:** Time & resource scheduling, appointment management

**Owns:**

- Appointments (aggregate root)
- Time Slots
- Master Schedules
- Availability Windows

**Knows About:**

- Masters (read-only via events or shared read model)
- Clients (read-only via events or shared read model)
- Services (read-only from Catalog - global or tenant catalog)

**Does NOT Know:**

- Payments
- Inventory
- Accounting
- Order details
- Visit details (except appointment completion)

**Communication:**

- **Publishes Events:**
  - `appointment.booked`
  - `appointment.confirmed`
  - `appointment.started`
  - `appointment.completed`
  - `appointment.cancelled`
  - `appointment.no_show`
  - `slot.requested`
  - `slot.released`
  - `availability.checked`
- **Consumes Events:**
  - `client.registered` (to know about new clients)
  - `master.created` (to know about available masters)

**Database:**

- Schema: `booking`
- Tables: `appointments`, `time_slots`, `master_schedules`, `availability_windows`
- Write Model: Owns appointment aggregates
- Read Model: Can read client data (via events or shared read model)

**Service Name:** `booking-service`

---

#### POS / Orders Context

**Responsibility:** Sales logic, order creation, visit management

**Owns:**

- Orders (aggregate root)
- Order Items
- Visits (aggregate root)
- Visit Items

**Knows About:**

- Services (read-only from Catalog)
- Clients (read-only via events or shared read model)
- Appointments (read-only via events)

**Does NOT Know:**

- Booking details (except appointment completion event)
- Accounting
- Inventory movements (reacts to events, doesn't know inventory state)
- Payment processing details

**Communication:**

- **Publishes Events:**
  - `order.created`
  - `order.closed`
  - `visit.started`
  - `visit.closed`
- **Consumes Events:**
  - `appointment.completed` (to create visit from appointment)
  - `service.updated` (to know service pricing)

**Database:**

- Schema: `pos`
- Tables: `orders`, `order_items`, `visits`, `visit_items`
- Write Model: Owns order and visit aggregates
- Read Model: Can read service catalog, client data

**Service Name:** `beauty-pos-service`

---

#### Payments Context

**Responsibility:** Payment execution, payment processing

**Owns:**

- Payments (aggregate root)
- Payment Transactions
- Refunds

**Knows About:**

- Orders (read-only via events)

**Does NOT Know:**

- Booking
- Inventory
- Accounting details
- Client details (except order context)

**Communication:**

- **Publishes Events:**
  - `payment.initiated`
  - `payment.received`
  - `payment.confirmed`
  - `payment.failed`
  - `payment.refunded`
- **Consumes Events:**
  - `order.created` (to initiate payment)

**Database:**

- Schema: `payments`
- Tables: `payments`, `payment_transactions`, `refunds`
- Write Model: Owns payment aggregates
- Read Model: Can read order data (via events)

**Service Name:** `payments-service` (uses existing Payments microservice via adapter)

---

#### Inventory Context

**Responsibility:** Stock movements, inventory tracking, warehouse management

**Owns:**

- Inventory Items (aggregate root)
- Inventory Movements (aggregate root)
- Stock Levels

**Knows About:**

- Products (catalog - read-only)
- Services (which consume inventory - read-only)

**Does NOT Know:**

- Clients
- Orders
- Payments
- Booking

**Communication:**

- **Publishes Events:**
  - `inventory.item.received`
  - `inventory.increased`
  - `inventory.decreased`
  - `inventory.adjusted`
  - `inventory.audit.started`
- **Consumes Events:**
  - `visit.closed` (to decrease inventory for services/products used)

**Database:**

- Schema: `inventory`
- Tables: `inventory_items`, `inventory_movements`, `stock_levels`
- Write Model: Owns inventory aggregates
- Read Model: Can read service catalog (to know what inventory is needed)

**Service Name:** `inventory-service` (uses existing Warehouse microservice via adapter)

---

#### Customer Context

**Responsibility:** Client data, GDPR compliance, visit history, client preferences

**Owns:**

- Clients (aggregate root)
- Client Consents (GDPR)
- Client Preferences
- Client Visit History (read-only aggregate from events)

**Knows About:**

- Visits (read-only via events)

**Does NOT Know:**

- Payments
- Inventory
- Booking details (except via visit history)
- Order details (except via visit history)

**Communication:**

- **Publishes Events:**
  - `client.registered`
  - `client.updated`
  - `client.consent.given`
  - `client.consent.revoked`
  - `client.visit_recorded`
- **Consumes Events:**
  - `visit.closed` (to record visit in client history)

**Database:**

- Schema: `customer`
- Tables: `clients`, `client_consents`, `client_preferences`, `client_visit_history`
- Write Model: Owns client aggregates
- Read Model: Can read visit data (via events)

**Service Name:** `customer-service`

---

#### Reporting / BI Context

**Responsibility:** Aggregates, analytics, read models, business intelligence

**Owns:**

- Read models (denormalized aggregates)
- BI tables
- Analytics views

**Knows About:**

- All events (read-only)

**Does NOT Know:**

- Commands
- Write models
- Domain logic

**Communication:**

- **Publishes Events:** None (read-only context)
- **Consumes Events:** ALL domain events
  - `appointment.*`
  - `order.*`
  - `payment.*`
  - `inventory.*`
  - `visit.*`
  - `client.*`

**Database:**

- Schema: `bi`
- Tables: `daily_sales`, `master_utilization`, `client_ltv`, `inventory_usage`, `appointment_aggregates`
- Write Model: None (read-only)
- Read Model: All aggregates

**Service Name:** `bi-service`

**Note:** BI context is purely reactive. It never emits commands or events. It only consumes events and maintains read models.

---

#### Integrations Context

**Responsibility:** External system adapters, integration orchestration

**Owns:**

- Adapter configurations
- Integration logs
- Integration state (if needed)

**Knows About:**

- External APIs (Stripe, Money S3, SMS gateways, etc.)

**Does NOT Know:**

- Domain logic
- Domain models

**Communication:**

- **Publishes Events:**
  - `accounting.export_requested`
  - `accounting.export_completed`
  - `sms.sent`
  - `email.sent`
  - `integration.failed`
- **Consumes Events:**
  - `payment.received` (to export to accounting)
  - `order.closed` (to export to accounting)
  - `appointment.booked` (to send SMS)
  - `client.registered` (to send welcome email)

**Database:**

- Schema: `integrations`
- Tables: `adapter_configs`, `integration_logs`, `integration_state`
- Write Model: None (stateless adapters)
- Read Model: Can read domain events

**Service Name:** `integration-hub-service`

**Note:** Integrations context contains NO domain logic. It only translates between domain events and external system APIs.

---

#### Catalog Context (Shared / Global)

**Responsibility:** Service catalog, pricing templates, product catalog

**Owns:**

- Services (global templates)
- Products (global templates)
- Pricing Rules (templates)

**Knows About:**

- Nothing (standalone context)

**Does NOT Know:**

- Any domain context (catalog is reference data)

**Communication:**

- **Publishes Events:**
  - `service.created`
  - `service.updated`
  - `product.created`
  - `product.updated`
- **Consumes Events:** None

**Database:**

- Schema: `catalog`
- Tables: `services`, `products`, `pricing_rules`
- Write Model: Owns catalog aggregates
- Read Model: Readable by all contexts

**Service Name:** `catalog-service` (uses existing Catalog microservice)

**Note:** Catalog is global (`tenant_id = NULL` for templates). Tenants can have tenant-specific overrides.

---

## Context Communication Rules

### Allowed Communication

1. **Events Only:** Contexts communicate via events (asynchronous)
2. **Read Models:** Contexts can read shared read models (if exists)
3. **Catalog Access:** Contexts can directly read Catalog (it's reference data)
4. **No Direct DB Access:** Contexts cannot access other contexts' databases
5. **No Sync Calls:** Contexts cannot make synchronous HTTP calls to other contexts

### Forbidden Communication

1. ❌ **Direct database queries** across contexts
2. ❌ **Synchronous HTTP calls** between contexts
3. ❌ **Shared write models** between contexts
4. ❌ **Direct imports** of other contexts' models/entities
5. ❌ **Commands** sent directly to other contexts (use events)

### Communication Patterns

#### Pattern 1: Event-Driven (Primary)

```text
Context A publishes event → Event Bus → Context B consumes event
```

#### Pattern 2: Read Model (Secondary)

```text
Context A publishes event → BI builds read model → Context B reads read model
```

#### Pattern 3: Catalog Access (Exception)

```text
Context A directly reads Catalog (reference data, no writes)
```

---

## Context Ownership Matrix

| Entity / Aggregate | Owner Context | Other Contexts Can Access Via |
| ------------------ | ------------- | ------------------------------ |
| Appointment | Booking | Events (`appointment.*`) |
| Order | POS/Orders | Events (`order.*`) |
| Payment | Payments | Events (`payment.*`) |
| Inventory Item | Inventory | Events (`inventory.*`) |
| Client | Customer | Events (`client.*`) |
| Visit | POS/Orders | Events (`visit.*`) |
| Master | Booking | Events or shared read model |
| Service | Catalog | Direct read (catalog is global) |
| Product | Catalog | Direct read (catalog is global) |
| Stock Level | Inventory | Events (`inventory.*`) |
| Visit History | Customer | Events (aggregated from `visit.closed`) |
| Sales Aggregate | BI | Read model (query API) |
| Utilization | BI | Read model (query API) |

---

## Context Boundaries Enforcement

### Database Level

- **Schema Isolation:** Each context has own schema
  - `booking` schema for Booking context
  - `pos` schema for POS/Orders context
  - `payments` schema for Payments context
  - `inventory` schema for Inventory context
  - `customer` schema for Customer context
  - `bi` schema for BI context
  - `integrations` schema for Integrations context
  - `catalog` schema for Catalog context

- **No Cross-Schema Queries:** Contexts cannot query other contexts' schemas
- **RLS Enforcement:** RLS enforces tenant isolation within each schema

### Application Level

- **Service Isolation:** Each context is separate service/microservice
- **No Shared Code:** No shared domain models between contexts (except shared libraries for events, logging)
- **Events Only:** Events are the only communication mechanism between contexts

### Testing Level

- **Isolated Testing:** Each context can be tested in isolation
- **Mock Event Bus:** Use mock event bus for testing
- **No Dependencies:** Unit tests have no dependencies on other contexts

---

## Context Evolution Rules

### Adding New Context

1. Define context responsibility
2. Define owned aggregates
3. Define published events
4. Define consumed events
5. Define database schema
6. Define service name
7. Update this document

### Splitting Context

1. Define split strategy
2. Define event contracts for split
3. Define migration path for existing data
4. Update this document

### Merging Contexts

1. **Discouraged** - Only if contexts are too tightly coupled
2. Define merge strategy
3. Define event contract consolidation
4. Update this document

### Breaking Changes

1. **Forbidden** - Context boundaries are immutable once frozen
2. If change needed, create new context version
3. Maintain backward compatibility via events

---

## Context Dependencies Graph

```text
Catalog (standalone)
  ↓ (read access)
Booking → POS/Orders → Payments
  ↓         ↓            ↓
Customer   Inventory   Integrations
  ↓
BI (consumes all events)
```

**Legend:**

- `→` = Publishes events consumed by target
- `↓` = Reads data (via events or read models)

---

## Context Responsibilities Summary

| Context | Primary Responsibility | Key Aggregates | Key Events Published |
| ------- | ---------------------- | -------------- | -------------------- |
| Booking | Time scheduling | Appointment | `appointment.*` |
| POS/Orders | Sales, orders | Order, Visit | `order.*`, `visit.*` |
| Payments | Payment processing | Payment | `payment.*` |
| Inventory | Stock management | InventoryItem, Movement | `inventory.*` |
| Customer | Client data | Client | `client.*` |
| BI | Analytics | Aggregates | None (read-only) |
| Integrations | External systems | None | `integration.*` |
| Catalog | Reference data | Service, Product | `service.*`, `product.*` |

---

## Validation Checklist

- [x] All contexts have explicit ownership rules
- [x] All contexts have explicit communication contracts
- [x] No cross-context DB access allowed
- [x] Events-only communication enforced
- [x] Database schemas assigned
- [x] Context boundaries explicit
- [x] Forbidden communication patterns documented
- [x] Context evolution rules defined

---

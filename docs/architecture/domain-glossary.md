# Domain Glossary (immutable)

> This document is immutable

## Beauty Franchise Multi-Tenant Platform

> This document is immutable.  
> Any change to a term = new version of the document.

---

## Related Documentation

- [Business Goal](../business/business-goal.md) - Business context
- [Event Storming](event-storming.md) - Event chains using these terms
- [Technical Design Document](tdd.md) - Architectural foundation referencing this glossary
- [Delivery Plan](../plans/delivery-plan.md) - Implementation phases
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Platform Decomposition Plan](../plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

---

## Platform Terms

### Tenant

**Context:** Platform  
**Description:** Legally and operationally isolated salon (franchise location). Each tenant represents one franchise unit (salon) managed by a franchisee (the person/entity operating the salon). In business context, "Salon" is the business term for Tenant (technical term), and "Franchisee" refers to the manager entity.  
**Invariants:**

- All data belongs to exactly one tenant
- Tenant does not have access to other tenants' data
- Tenant can be active / suspended / archived
- Managed by Franchisor at platform level

---

### Franchisor

**Context:** Platform  
**Description:** Network owner managing multiple tenants (salons).  
**Invariants:**

- Has access to cross-tenant analytics
- Manages tenant lifecycle
- Does not have access to tenant operational data

---

### Catalog

**Context:** Platform  
**Description:** Collection of Services and Products available to tenants.  
**Invariants:**

- Can be global (tenant_id = NULL) or tenant-specific
- Contains Services and Products

---

### Event

**Context:** Platform  
**Description:** Fact that occurred in the past.  
**Invariants:**

- Immutable
- Versioned
- Tenant-aware
- Contains tenant_id, aggregate_id, timestamp, version
- All domain events must include these mandatory fields

---

## Booking Context

### Master

**Context:** Staff / Booking  
**Description:** Specialist providing services.  
**Invariants:**

- Bound to tenant
- Participates in schedule slots
- Can have KPI, but does not manage finances
- Primary staff type in beauty salon context

**Note:** "Staff" in bounded context names refers to the context managing Masters.

---

### Slot

**Context:** Booking  
**Description:** Available time period for appointment booking.  
**Invariants:**

- Bound to Master
- Has start and end time
- Can be available / booked / blocked
- Tenant-scoped
- Basis for Appointment

---

### Availability

**Context:** Booking  
**Description:** Master's available time slots for booking.  
**Invariants:**

- Tenant-scoped
- Time-based (date/time ranges)
- Can be checked before booking
- Affected by Master schedule and existing Appointments
- Derived from Schedule and Slot states

---

### Schedule

**Context:** Booking  
**Description:** Time-based view of Master availability and Appointments.  
**Invariants:**

- Bound to Tenant
- Contains Slots and Appointments
- Used for availability checking

---

### Appointment

**Context:** Booking  
**Description:** Booked time slot.  
**Invariants:**

- Does not contain financial data
- Can be cancelled, completed, or marked as no-show
- Cancellation releases the Slot
- No-show is when client does not arrive (may trigger Penalty)
- Basis for Visit (when completed)
- Occupies a Slot
- Tenant-scoped

---

### Penalty (Post-MVP)

**Context:** Booking  
**Description:** Charge applied for no-show or late cancellation.  
**Invariants:**

- Optional (post-MVP feature)
- Tenant-configurable
- Can be applied to Appointment
- Generates Payment

---

## POS / Orders Context

### Service

**Context:** Catalog  
**Description:** Time-based service provided (haircut, manicure, etc.). Catalog entity that can be sold.  
**Invariants:**

- Has price and VAT
- Can use inventory (consumables)
- Not equal to Order Item (Service is catalog entity, Order Item is transaction line)
- Distinct from Product (Service is time-based, Product is physical item)

---

### Visit

**Context:** POS / Orders  
**Description:** Actually provided service (result of appointment).  
**Invariants:**

- Visit = business fact
- Can generate Order
- Cannot be deleted
- Tenant-scoped

---

### Walk-in

**Context:** POS / Orders  
**Description:** Client visit without prior Appointment.  
**Invariants:**

- Can create Visit directly
- No Appointment required
- Can generate Order
- Tenant-scoped

---

### Order

**Context:** POS / Orders  
**Description:** Commercial receipt (services + products).  
**Invariants:**

- Immutable after closing
- Can have multiple Payments
- Bound to Visit or Walk-in
- Contains Order Items (Services and/or Products)
- Tenant-scoped

---

### Order Item

**Context:** POS / Orders  
**Description:** Individual line item within an Order representing a Service or Product.  
**Invariants:**

- Belongs to exactly one Order
- References either a Service or a Product
- Has quantity and price
- Not the same as Service (Service is catalog entity, Order Item is transaction line)
- Tenant-scoped

---

### Payment

**Context:** Payments  
**Description:** Monetary transaction.  
**Invariants:**

- Idempotent
- Does not know about Booking
- Can be partial
- Tenant-scoped
- Bound to Order

---

## Inventory Context

### Product

**Context:** Inventory / POS  
**Description:** Physical item sold (consumables, retail products).  
**Invariants:**

- Has inventory quantity
- Can be sold independently or as part of Service
- Not the same as Service (which is time-based)

---

### Inventory Item

**Context:** Inventory  
**Description:** Product or consumable tracked in inventory.  
**Invariants:**

- Tracked by quantity
- Changed only through movements
- Can be bound to Service
- Includes both Products and consumables used in Services
- Tenant-scoped

---

### Inventory Movement

**Context:** Inventory  
**Description:** Change in stock levels.  
**Invariants:**

- Always based on an event
- Immutable
- Tenant-scoped

---

### Audit

**Context:** Inventory  
**Description:** Inventory count verification process.  
**Invariants:**

- Creates Inventory Movement records
- Immutable record
- Tenant-scoped
- Can result in adjustments

---

## Customer Context

### Client

**Context:** Customer  
**Description:** End customer of the salon.  
**Invariants:**

- Can only exist within a tenant
- GDPR consent is required
- Client can have a visit history
- Tenant-scoped

---

### GDPR Consent

**Context:** Customer  
**Description:** Legal consent for data processing.  
**Invariants:**

- Required for Client creation
- Can be withdrawn
- Must be auditable
- Tenant-scoped

---

## Integration Context

### Notification

**Context:** Integrations / Communications  
**Description:** Communication sent to Client (SMS/email).  
**Invariants:**

- Triggered by domain events
- Tenant-aware
- Immutable record
- Can be sent, delivered, or failed
- Tenant-scoped

---

## Reporting Context

### BI Aggregate

**Context:** Reporting  
**Description:** Pre-computed business metric derived from events.  
**Invariants:**

- Read-only
- Event-driven (updated reactively)
- Tenant-partitioned

---

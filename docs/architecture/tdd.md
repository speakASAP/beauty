# Technical Design Document (TDD)

## Multi-Tenant Event-Driven Platform for Beauty Franchise (MVP)

---

## Related Documentation

- [Business Goal](../business/business-goal.md) - Business context and objectives
- [Domain Glossary](domain-glossary.md) - Immutable domain terms (source of truth)
- [Event Storming](event-storming.md) - Event chains and business flows
- [Delivery Plan](../plans/delivery-plan.md) - Implementation phases
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Platform Decomposition Plan](../plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

## 1. Overview

### 1.1 Purpose

This document defines the **architectural foundation** for a multi-tenant,
event-driven beauty franchise platform.  
Its goal is to **fix the domain model, tenant invariants, bounded
contexts, and event contracts** so that the system can scale to 100+
salons **without refactoring the core**.

### 1.2 MVP Scope

Included:

- Booking / Scheduling
- POS / Orders
- Payments
- Inventory
- Customer (CRM)
- BI Read Model
- Integration Layer

Excluded (post-MVP):

- Payroll / HR accounting
- Advanced loyalty & promotions
- AI-driven optimization

### 1.3 Architectural Principles

- Domain-Driven Design (DDD)
- Event-Driven Architecture
- Multi-Tenancy by design
- Core domain isolated from integrations
- Existing microservices used via adapters

---

## 2. Domain Glossary (Ubiquitous Language)

> See [Domain Glossary](domain-glossary.md) for the complete immutable glossary.

| Term | Context | Definition | Invariants |
| -- | -- | -- | -- |
| Tenant | Platform | One salon / franchise unit | Data isolated |
| Client | Customer | End customer | GDPR consent required |
| Appointment | Booking | Reserved time slot | Time-based |
| Visit | POS | Fulfilled appointment | Billable |
| Service | Catalog | Beauty service | VAT aware |
| Order | POS | Commercial transaction | Immutable |
| Payment | Payments | Monetary settlement | Idempotent |
| Inventory Item | Inventory | Stock unit | Quantity tracked |

---

## 3. Event Storming Summary

> See [Event Storming](event-storming.md) for complete event chains.

### 3.1 Core Customer Journey

appointment.booked
→ appointment.confirmed
→ appointment.started
→ appointment.completed
→ order.created
→ payment.received
→ inventory.decreased

### 3.2 Business Invariants

- An appointment **does not require payment**
- Inventory reacts only to **completed visits**
- Accounting is downstream from payments

---

## 4. Bounded Contexts

### 4.1 Core Domains

| Context | Responsibility | Knows About | Does NOT Know |
| ---- | ---- | ---- | ---- |
| Booking | Time & resources | Slots, masters | Payments, stock |
| POS / Orders | Sales logic | Services, prices | Accounting |
| Payments | Payment execution | Orders | Booking |
| Inventory | Stock movements | Products | Clients |
| Customer | Client data | Visits | Payments |
| Reporting | Aggregates | Events | Commands |
| Integrations | External systems | APIs | Domain logic |

---

## 5. Tenant Model

### 5.1 Multi-Tenant Strategy

- Shared PostgreSQL database
- `tenant_id` present in all domain tables
- Global catalogs use `tenant_id = NULL`

### 5.2 Row-Level Security (RLS)

```sql
USING (tenant_id = current_setting('app.tenant_id')::uuid)

### 5.3 Tenant Propagation
Auth service issues JWT with tenant_id
API Gateway injects tenant context
Each service sets:
DB session tenant
Log context
Event metadata
### 5.4 Tenant Lifecycle
Create
Suspend
Archive (no delete in MVP)
## 6. Event Model & Contracts (Central Event Catalog)
### 6.1 Event Format
JSON / CloudEvents
Versioned (v1, v2)
### 6.2 Core Events
'''json
appointment.booked {
  "tenant_id": "uuid",
  "appointment_id": "uuid",
  "client_id": "uuid",
  "master_id": "uuid",
  "starts_at": "datetime"
}
appointment.completed {
  "tenant_id": "uuid",
  "appointment_id": "uuid",
  "final_price": "number",
  "services": []
}
payment.received {
  "tenant_id": "uuid",
  "order_id": "uuid",
  "amount": "number",
  "method": "card|cash|online"
}
inventory.decreased {
  "tenant_id": "uuid",
  "product_id": "uuid",
  "quantity": "number"
}
'''
### 6.3 Event Rules
Events are immutable
Consumers must be idempotent
No synchronous dependencies
## 7. Service Map
### 7.1 Domain Services (New)
Booking Core Service
Beauty POS Service
BI Read Model Service
Integration Hub
### 7.2 Existing Services Usage
Service Role
Auth Identity & tenant source
Catalog Services & pricing
Orders Sales backend
Payments Payment adapter
Warehouse Inventory engine
Notifications SMS / Email adapter
Suppliers Procurement (downstream)
AI Optional (future)

## 8. Integration Layer (Adapters)
### 8.1 Interfaces
'''ts
interface PaymentProvider {
  capturePayment(...)
}
interface AccountingAdapter {
  exportTransaction(...)
}
interface SmsProvider {
  sendMessage(...)
}
'''

### 8.2 Czech Integrations
Stripe / GoPay / Comgate
Money S3 / Pohoda / ABRA Flexi
BulkGate / GoSMS
## 9. Data Model & Storage
### 9.1 Write Models
Transactional
Tenant-scoped
Optimized for consistency
### 9.2 Read Models (BI)
Denormalized
Event-driven
Tenant-partitioned
## 10. BI Read Model
### 10.1 Aggregates
daily_sales_by_tenant
master_utilization
client_visit_count
### 10.2 Evolution
PostgreSQL → ClickHouse
## 11. Non-Functional Requirements
Tenant-aware logging & tracing
Performance for 100+ tenants
Backup / restore per tenant
GDPR compliance
Zero cross-tenant access
## 12. UI & API (High-Level)
### 12.1 UX Flows
Online booking
POS checkout
Franchise dashboard
### 12.2 API Principles
REST / gRPC
Tenant context implicit
Event emission mandatory
## 13. Open Questions & Risks
Existing Orders service domain fit
Inventory data model alignment
VAT & fiscal extensions
## 14. Appendix
Event versioning strategy
Anti-corruption patterns
Migration strategy


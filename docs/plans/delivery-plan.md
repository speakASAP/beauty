# Delivery Plan

## End-to-End Implementation Guide (AI-Consumable)

## Related Documentation

- [Business Goal](../business/business-goal.md) - Business context
- [Domain Glossary](../architecture/domain-glossary.md) - Immutable domain terms
- [Event Storming](../architecture/event-storming.md) - Event chains
- [Technical Design Document](../architecture/tdd.md) - Architectural foundation
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Platform Decomposition Plan](ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

## Goal

Implement a multi-tenant, event-driven IT platform for beauty franchise
using existing microservices and adapters.

---

## Phase 0. Preparation

- Finalize Domain Glossary (immutable)
- Finalize Event Contracts
- Adopt tenant strategy (Shared DB + RLS)

---

## Phase 1. Platform and Infrastructure

### Infrastructure

- PostgreSQL (shared DB, RLS enabled)
- NATS / Kafka (event bus)
- API Gateway (tenant propagation)
- Central logging + tracing (tenant-aware)

### Security

- JWT with tenant_id
- RBAC (franchisor / owner / staff)

---

## Phase 2. Core Domain Services

### Build / Adapt

- Booking Core (new)
- Beauty POS Core (new)
- BI Read Model Service (new)

### Wrap existing services via adapters

- Auth → Identity Provider
- Orders → Sales backend
- Payments → Payment Adapter
- Warehouse → Inventory backend
- Notifications → SMS adapter
- Catalog → Services & pricing

---

## Phase 3. Event-Driven Backbone

- Implement central event schema
- Enforce event emission on:
  - appointment.*
  - order.*
  - payment.*
  - inventory.*

- Make all consumers idempotent

---

## Phase 4. Tenant Enforcement

- tenant_id propagation:
  - Auth → Gateway → Service → DB → Event
- Enable PostgreSQL RLS
- Add tenant-aware logging

---

## Phase 5. BI Read Model

- Subscribe to all core events
- Build aggregates:
  - daily_sales_by_tenant
  - master_utilization
  - client_visit_count
- Expose read-only API

---

## Phase 6. Public Website & POS UI

### Website

- Online booking
- Slot availability
- SMS confirmation

### POS

- Visit handling
- Order creation
- Payment processing

---

## Phase 7. Integrations (Czech market)

- Payment providers:
  - Stripe (MVP)
  - GoPay / Comgate (later)
- Accounting adapters:
  - Money S3
  - Pohoda
- SMS:
  - BulkGate / GoSMS

---

## Phase 8. Hardening & Scale

- Load testing (100+ tenants)
- Backup & restore per tenant
- Event versioning strategy
- Prepare DB → ClickHouse migration for BI

---

## Prohibitions (Hard Rules)

- ❌ Do not add shared tables without tenant_id
- ❌ Do not make sync calls between core domains
- ❌ Do not embed Czech-specific logic in core
- ❌ Do not change event contracts retroactively

---

## Result

- Scalable franchising platform
- Ready for 100+ salons
- Minimal refactoring when scaling

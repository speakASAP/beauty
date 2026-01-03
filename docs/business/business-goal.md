# Business Context & Goal  

## Franchise Beauty Salon IT Platform (Czech Republic)

---

## Related Documentation

- [Domain Glossary](../architecture/domain-glossary.md) - Domain terms
- [Event Storming](../architecture/event-storming.md) - Event chains
- [Technical Design Document](../architecture/tdd.md) - Architectural foundation
- [Delivery Plan](../plans/delivery-plan.md) - Implementation phases
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Platform Decomposition Plan](../plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

---

## Short Summary

The goal is to build a **centrally managed, locally flexible multi-tenant
IT platform** for a network of beauty salons in the Czech Republic,
designed from day one for **franchise scaling**.

---

## Overall Objective

Build a **platform business**, not “software for a single salon”.

The platform must:

- act as a **single IT core** for the entire network,
- enable **fast, standardized launch of new salons** “out of the box”,
- give the **franchisor full control** over data, standards, and
analytics,
- while allowing **local operational flexibility** for each franchise
salon.

---

## Current State

- All core business processes (booking, sales, inventory, accounting)
**already exist and work offline**.
- There is **no IT system**, no centralized data, and no unified
analytics.
- One operating salon today → planned **franchise network across the
Czech Republic**.

---

## Target System Model

### System Type

- **Multi-tenant platform**
- **Central core + isolated tenants (salons)**
- **Event-driven microservices architecture**

### Governance Model

- Centralized network management (franchisor portal)
- Local salon autonomy within centrally defined rules

---

## MVP Focus (Phase 1)

Develop the **IT core**, not full automation of everything.

### Included in MVP

- **POS** (services and product sales)
- **CRM** (clients, history, GDPR consents)
- **Booking** (online and offline scheduling)
- **Inventory / Warehouse**
- **Basic ERP logic** (no payroll)
- **Reporting / BI** (minimal but mandatory)
- **Public website + online booking**

### Explicitly Excluded from MVP

- Full accounting automation
- Payroll / HR systems
- Advanced marketing automation
- Franchise fee billing

---

## Mandatory Architectural Principles

- **Multi-tenant from day one**, not “later”
- ❌ No shared tables without `tenant_id`
- **Accounting = adapter**, never a core domain
- **All business facts → events**
- **BI and analytics are mandatory in MVP**
- Architecture must be **franchise-ready**, even with a single salon

---

## Analytics (Core Platform Value)

Unified reporting across the network:

- Revenue per salon
- Margin
- Capacity utilization (staff / time slots)
- Customer LTV

Analytics must consume **events**, not access operational databases
directly.

---

## Integrations (Czech Republic)

### Required for MVP

- **Payments**: Stripe (MVP), later ČSOB / GP
- **SMS**: Czech SMS gateways for client notifications

### Adapter-based Integrations

- **Accounting**: Money S3, Pohoda, ABRA, Fakturama
- **VAT / EET**: system must be data-ready (EET may return)

---

## Role of AI Agents in This Project

AI agents are expected to:

- think in **platform and franchise terms**, not single-salon logic,
- prioritize **scalability and standardization**,
- strictly follow multi-tenant and event-driven principles,
- assist with **architecture and design**, not only feature delivery,
- actively prevent architectural mistakes (monoliths, shared state,
missing BI).

---

## Success Criteria

The system is successful if:

- a new salon can be launched **quickly and consistently**,
- the franchisor has **real-time, reliable business metrics**,
- the architecture **does not require rewriting** when scaling to 10–100
salons.

---

## Important Note

This is **not local salon software** and not a simple accounting tool.  
This is a **franchise IT platform**, starting with an MVP and designed to
scale.

# Phase 2 Orchestrator - Execution Plan

**Date:** 2026-01-XX  
**Orchestrator:** Phase 2 Orchestrator Agent  
**Status:** 🔄 IN PROGRESS

---

## Executive Summary

Phase 2 Orchestrator has been activated to build UI layers (POS UI and Franchise Portal) on top of the approved Phase 1 backend. This plan documents the execution strategy, task breakdown, and progress tracking.

**Prerequisites:**
- ✅ Phase 1 approved (see `phase_1_validation_report.md`)
- ✅ Backend APIs operational
- ✅ Event bus functional
- ✅ Multi-tenant safety verified

**Current Status:**
- ⏳ P2.1 - UX & Flow Definition (Starting)
- ⏳ P2.2 - UI Architecture (Pending)
- ⏳ P2.3 - POS UI (Pending)
- ⏳ P2.4 - Franchise Portal (Pending)
- ⏳ P2.5 - Auth & Tenant UX (Pending)
- ⏳ P2.6 - Validation & Hardening (Pending)

---

## Phase 2 Structure

```text
P2.1  UX & Flow Definition  ─┐
                             ├──► SYNC H (UX Freeze)
P2.2  UI Architecture       ─┘

P2.3  POS UI                ─┐
P2.4  Franchise Portal      ├──► SYNC I (UI Feature Complete)
P2.5  Auth & Tenant UX      ─┘

P2.6  Validation & Hardening ─► SYNC J (READY FOR SCALE)
```

---

## P2.1 — UX & Flow Definition ⏳

**Status:** IN PROGRESS

**Agent:** UX / Product Flow Agent

**Scope:**

### Salon Workflows (POS UI)

1. **Booking Workflow:**
   - View calendar/schedule
   - Check availability
   - Book appointment
   - Confirm appointment
   - Start appointment
   - Complete appointment
   - Cancel appointment

2. **Visit Workflow:**
   - Start visit (from appointment or walk-in)
   - Add services/products to visit
   - Close visit

3. **Checkout Workflow:**
   - Create order from visit
   - Select payment method
   - Process payment
   - Close order

4. **Shift Close Workflow:**
   - View daily summary
   - Review transactions
   - Close shift

### Franchise Workflows (Franchise Portal)

1. **Tenant Overview:**
   - List all tenants
   - View tenant details
   - Tenant state management

2. **KPIs Dashboard:**
   - Revenue by tenant
   - Master utilization
   - Client LTV
   - Sales trends

3. **Pricing Control:**
   - View global catalog
   - Manage tenant-specific pricing
   - Set pricing rules

4. **Catalog Governance:**
   - Manage service templates
   - Manage product templates
   - Control catalog visibility

**Output:**
- Screen flow diagrams (textual)
- User intent → API mapping
- Event subscription requirements

**Next Action:** Create UX flow documentation

---

## P2.2 — UI Architecture ⏳

**Status:** PENDING (After P2.1)

**Agent:** Frontend Architect Agent

**Decisions Required:**

1. **Application Type:**
   - SPA (Single Page Application) vs MPA (Multi-Page Application)
   - Recommendation: SPA for better UX, MPA for SEO (public booking)

2. **State Management:**
   - Redux / Zustand / Context API
   - Tenant state isolation strategy

3. **API Client Strategy:**
   - REST client library
   - Tenant context injection
   - Error handling

4. **Event Subscription Model:**
   - Polling (simple, reliable)
   - WebSocket (real-time)
   - Server-Sent Events (SSE)
   - Recommendation: Polling for MVP, upgrade to WebSocket later

**Rules:**
- No shared mutable state between tenants
- No backend-specific hacks
- Tenant context explicit in all API calls

**Next Action:** Define UI architecture document

---

## SYNC H — UX FREEZE ⏳

**Status:** PENDING

**Criteria:**
- ✅ All flows mapped
- ✅ No domain assumptions
- ✅ Backend untouched
- ✅ User intent → API mapping complete

**Next Action:** Execute SYNC H validation

---

## P2.3 — POS UI (Salon) ⏳

**Status:** PENDING (After SYNC H)

**Agent:** POS UI Agent

**Scope:**

1. **Booking Calendar:**
   - View master schedules
   - Check availability
   - Book appointments
   - Manage appointments

2. **Client Card:**
   - View client details
   - Client history
   - GDPR consents

3. **Service Selection:**
   - Browse services
   - Add to visit
   - View pricing

4. **Checkout:**
   - Review order
   - Select payment method
   - Process payment
   - Print receipt

5. **Shift Close:**
   - Daily summary
   - Transaction review
   - Close shift

**Rules:**
- Talks ONLY to:
  - Booking API (`/appointments/*`)
  - POS API (`/visits/*`, `/orders/*`)
  - Customer API (`/clients/*`)
  - BI API (read-only aggregates)
- No direct Payments logic (handled by backend)
- No business rules in UI

**Next Action:** Implement POS UI components

---

## P2.4 — Franchise Portal (Central) ⏳

**Status:** PENDING (After SYNC H)

**Agent:** Franchise Portal Agent

**Scope:**

1. **Tenant List:**
   - View all tenants
   - Filter by state
   - Tenant details

2. **Performance Dashboards:**
   - Revenue by tenant
   - Master utilization
   - Client LTV
   - Sales trends

3. **Central Catalog & Pricing:**
   - Manage global catalog
   - Set tenant-specific pricing
   - Pricing rules

4. **Marketing Controls:**
   - Campaign management (future)
   - Promotions (future)

**Rules:**
- Read-only over tenants (except allowed commands)
- BI read model only
- No direct tenant data access

**Next Action:** Implement Franchise Portal components

---

## P2.5 — Auth & Tenant UX ⏳

**Status:** PENDING (After SYNC H)

**Agent:** Identity UX Agent

**Scope:**

1. **Login:**
   - Username/password
   - JWT token handling
   - Tenant context extraction

2. **Tenant Selection:**
   - If user has multiple tenants
   - Explicit tenant selection
   - No implicit switching

3. **Role-Based UI Visibility:**
   - Franchisor view
   - Salon owner view
   - Staff view
   - Client view (public booking)

**Rules:**
- Auth service is source of truth
- No client-side role guessing
- Tenant context explicit in routing

**Next Action:** Implement auth and tenant selection UI

---

## SYNC I — UI FEATURE COMPLETE ⏳

**Status:** PENDING

**Criteria:**
- ✅ POS usable by salon
- ✅ Portal usable by franchisor
- ✅ No backend changes required
- ✅ All workflows functional

**Next Action:** Execute SYNC I validation

---

## P2.6 — Validation & Hardening ⏳

**Status:** PENDING (After SYNC I)

**Agent:** Phase 2 Validator Agent

**Scope:**

1. **Tenant Leakage Tests:**
   - Cross-tenant data access attempts
   - Tenant context validation
   - RLS enforcement in UI

2. **UX Abuse Scenarios:**
   - Invalid input handling
   - Permission violations
   - Race conditions

3. **Event Delay Scenarios:**
   - Event processing delays
   - Read model staleness
   - Optimistic updates

4. **Permission Violations:**
   - Role-based access control
   - Unauthorized operations
   - Tenant switching attempts

**Next Action:** Execute Phase 2 validation

---

## SYNC J — READY FOR SCALE ⏳

**Status:** PENDING

**Exit Criteria:**
- ✅ UI works with 10+ tenants
- ✅ No shared UI state
- ✅ Backend untouched
- ✅ Replaceable frontend confirmed

**Next Action:** Execute SYNC J validation

---

## Phase 1 API Contracts (Available Endpoints)

### Booking Service (Port 4110)
- `POST /appointments` - Book appointment
- `POST /appointments/:id/confirm` - Confirm appointment
- `POST /appointments/:id/start` - Start appointment
- `POST /appointments/:id/complete` - Complete appointment
- `POST /appointments/:id/cancel` - Cancel appointment
- `GET /appointments` - List appointments

### Beauty POS Service (Port 4111)
- `POST /visits` - Start visit
- `POST /visits/:id/close` - Close visit
- `POST /orders` - Create order
- `POST /orders/:id/close` - Close order
- `GET /visits` - List visits
- `GET /orders` - List orders

### Payments Service (Port 4112)
- `POST /payments` - Initiate payment
- `GET /payments/:id` - Get payment status
- `GET /payments` - List payments

### Customer Service (Port 4114)
- `POST /clients` - Register client
- `GET /clients/:id` - Get client
- `GET /clients` - List clients
- `GET /clients/:id/history` - Get client visit history

### Staff Service (Port 4117)
- `POST /masters` - Create master
- `GET /masters/:id` - Get master
- `GET /masters` - List masters

### BI Service (Port 4115)
- `GET /aggregates/daily-sales` - Daily sales by tenant
- `GET /aggregates/master-utilization` - Master utilization
- `GET /aggregates/client-ltv` - Client LTV
- `GET /aggregates/inventory-usage` - Inventory usage

### Inventory Service (Port 4113)
- `GET /inventory/items` - List inventory items
- `GET /inventory/items/:id` - Get inventory item
- `POST /inventory/movements` - Create inventory movement

---

## Non-Negotiable Rules

### 1. UI IS NOT A DOMAIN LAYER
- ❌ No pricing logic
- ❌ No booking rules
- ❌ No inventory rules
- ❌ No accounting decisions

UI only:
- ✅ Sends commands
- ✅ Renders projections
- ✅ Subscribes to read models

### 2. TENANT ISOLATION IS VISIBLE
- ❌ No cross-tenant selection
- ❌ No implicit tenant switching
- ✅ tenant_id explicit in:
  - Auth
  - Routing
  - API calls

### 3. EVENT-BASED UX THINKING
- ❌ No immediate consistency assumptions
- ✅ UI reacts to:
  - Command accepted
  - Event received
  - Projection updated

---

## Next Steps

1. **P2.1 - UX & Flow Definition** ⏳
   - Create screen flow diagrams
   - Map user intents to APIs
   - Define event subscriptions

2. **P2.2 - UI Architecture** ⏳
   - Choose SPA/MPA
   - Define state management
   - Design API client
   - Choose event subscription model

3. **SYNC H - UX Freeze** ⏳
   - Validate all flows mapped
   - Ensure no domain assumptions
   - Verify backend untouched

4. **P2.3, P2.4, P2.5 - UI Implementation** ⏳
   - Build POS UI
   - Build Franchise Portal
   - Build Auth & Tenant UX

5. **SYNC I - UI Feature Complete** ⏳
   - Validate POS usable
   - Validate Portal usable
   - Verify no backend changes

6. **P2.6 - Validation & Hardening** ⏳
   - Tenant leakage tests
   - UX abuse scenarios
   - Event delay scenarios

7. **SYNC J - Ready for Scale** ⏳
   - Validate multi-tenant support
   - Verify replaceable frontend

---

## Success Criteria

Phase 2 is **COMPLETE** when:

✅ POS UI usable by salon staff  
✅ Franchise Portal usable by franchisor  
✅ Auth & Tenant UX functional  
✅ No backend changes required  
✅ All validation tests pass  
✅ UI works with 10+ tenants  
✅ Frontend is replaceable  

**Current Status:** 🔄 IN PROGRESS - Starting P2.1

---

## Related Documentation

- [Phase 2 Orchestrator](phase_2_orchestrator_agent.md)
- [Phase 1 Validation Report](phase_1_validation_report.md)
- [Domain Glossary](../architecture/domain-glossary.md)
- [Event Catalog](../architecture/event-catalog.md)
- [Bounded Contexts](../architecture/bounded-contexts.md)

---

**Report Generated:** 2026-01-XX  
**Next Review:** After P2.1 completion


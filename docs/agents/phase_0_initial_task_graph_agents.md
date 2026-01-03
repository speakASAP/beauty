# Phase 0 — Foundation Freeze (Contracts & Tenant Model)

**Goal:** Freeze the architectural foundation so that no future refactoring of tenant model, domain language, or event contracts is required.

**Rule:** No application code beyond schemas, interfaces, and adapters stubs.

---

## Related Documentation

- [Master Prompt](master-prompt.md) - Lead Orchestrator Agent role
- [Domain Glossary](../architecture/domain-glossary.md) - Immutable domain terms (output of T0.1)
- [Event Storming](../architecture/event-storming.md) - Event chains (output of T0.5)
- [Technical Design Document](../architecture/tdd.md) - Architectural foundation
- [Delivery Plan](../plans/delivery-plan.md) - Implementation phases
- [Platform Decomposition Plan](../plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy
- [Phase 0 Validation Agent](phase_0_validation_agent.md) - Validates foundation freeze
- [Phase 1 Orchestrator](phase_1_orchestrator_master_prompt.md) - Next phase after Phase 0 approval

## Phase 0 Overview

Phase 0 is **purely analytical and contractual**.  
All outputs are **immutable** once approved.

**Artifacts frozen in Phase 0:**

- Domain Glossary
- Bounded Context boundaries
- Tenant rules & propagation model
- Event Catalog & schemas
- Service responsibility matrix

---

## Task Graph (High Level)

```text
T0.1  Domain Glossary Agent  ─┐
                             ├──►  SYNC A (Domain Freeze)
T0.2  Bounded Context Agent  ─┘

T0.3  Tenant Model Agent     ─┐
                             ├──►  SYNC B (Tenant Freeze)
T0.4  Auth & Propagation     ─┘

T0.5  Event Storming Agent   ─┐
                             ├──►  SYNC C (Event Freeze)
T0.6  Event Contract Agent   ─┘

T0.7  Existing Services Map  ─┐
                             ├──►  SYNC D (Integration Freeze)
T0.8  ACL / Adapter Agent    ─┘

SYNC D ──► Phase 0 Validator ──► Phase 1 Approval
```

---

## SYNC POINTS (HARD GATES)

### SYNC A — Domain Freeze

- No new domain terms allowed afterward
- Glossary becomes immutable

### SYNC B — Tenant Freeze

- tenant_id rules frozen
- RLS policies defined
- Propagation path fixed

### SYNC C — Event Freeze

- Event names, payloads, versioning frozen
- No breaking changes allowed later

### SYNC D — Integration Freeze

- Existing services roles fixed
- Anti-Corruption Layers defined

---

## TASK DEFINITIONS & AGENTS

---

### T0.1 — Domain Glossary Agent

**Agent type:** Domain Agent

**Goal:** Produce the canonical Domain Glossary

**Scope:**

- Business nouns, verbs, invariants
- Beauty franchise specific language

**Inputs:**

- Offline salon processes
- Existing microservice capabilities

**Outputs:**

- `domain-glossary.md`

**Forbidden:**

- Technical terms (DB, API, tables)
- Synonyms for same concept

---

### T0.2 — Bounded Context Agent

**Agent type:** Domain Architect Agent

**Goal:** Define bounded contexts and ownership

**Contexts (initial):**

- Booking
- POS / Orders
- Inventory
- Billing / Accounting
- Staff
- Customer & Loyalty
- Reporting (Read-only)

**Outputs:**

- Context map
- Responsibility matrix

**Forbidden:**

- Shared write models
- Cross-context DB access

---

### T0.3 — Tenant Model Agent

**Agent type:** Platform Architect Agent

**Goal:** Formalize multi-tenant rules

**Scope:**

- tenant lifecycle
- tenant isolation
- shared vs global data

**Outputs:**

- `tenant-model.md`
- RLS policy definitions (PostgreSQL)

**Non-negotiable:**

- tenant_id everywhere
- No shared tables without tenant_id

---

### T0.4 — Auth & Tenant Propagation Agent

**Agent type:** Security / Identity Agent

**Goal:** Ensure tenant context flows end-to-end

**Scope:**

- Auth token structure
- Gateway propagation
- DB session binding
- Logging & tracing

**Outputs:**

- Tenant propagation sequence
- Auth contract (JWT claims)

---

### T0.5 — Event Storming Agent

**Agent type:** Event Modeling Agent

**Goal:** Capture business behavior as events

**Format:**

- Textual chains (no diagrams)

**Outputs:**

- `event-storming.md`

**Rules:**

- Past tense events
- Business facts only

---

### T0.6 — Event Contract Agent

**Agent type:** Event Architect Agent

**Goal:** Define canonical event schemas

**Scope:**

- Event naming
- Mandatory fields
- Versioning rules

**Outputs:**

- `event-catalog.md`
- JSON schema per event

**Mandatory fields:**

- tenant_id
- aggregate_id
- occurred_at
- event_version

---

### T0.7 — Existing Services Mapping Agent

**Agent type:** Integration Analyst Agent

**Goal:** Map current microservices to new domain

**Scope:**

- Identify reuse
- Identify mismatches

**Outputs:**

- Service role table
- Keep / Wrap / Ignore decisions

---

### T0.8 — Anti-Corruption & Adapter Agent

**Agent type:** Integration Architect Agent

**Goal:** Define adapter boundaries

**Scope:**

- Payments adapter
- Accounting adapter
- SMS adapter
- Orders facade

**Outputs:**

- Adapter interfaces
- Dependency direction rules

---

## Phase 0 Validator (Mandatory)

**Agent type:** Architecture Validator Agent

**Responsibilities:**

- Enforce invariants
- Detect coupling
- Detect tenant leaks
- Validate event completeness

**Authority:**

- Reject outputs
- Send tasks back
- Block Phase 1

---

## EXIT CRITERIA (Phase 0 COMPLETE)

All true:

- ✅ Glossary immutable
- ✅ Events immutable
- ✅ Tenant rules enforced
- ✅ Existing services isolated
- ✅ Validator approval issued

**STATUS: PHASE 0 COMPLETE AND FROZEN** ✅

**Validation Report:** [Phase 0 Validation Report](phase_0_validation_report.md)

Only then Phase 1 (Implementation) may start.

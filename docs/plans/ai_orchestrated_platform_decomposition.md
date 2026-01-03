# Lead AI Decomposition Plan

## Phase Graph

---

## Related Documentation

- [Business Goal](../business/business-goal.md) - Business context
- [Domain Glossary](../architecture/domain-glossary.md) - Immutable domain terms
- [Event Storming](../architecture/event-storming.md) - Event chains
- [Technical Design Document](../architecture/tdd.md) - Architectural foundation
- [Delivery Plan](delivery-plan.md) - Implementation phases
- [Master Prompt](../agents/master-prompt.md) - Lead Orchestrator Agent role
- [Phase 0 Task Graph](../agents/phase_0_initial_task_graph_agents.md) - Foundation freeze tasks
- [Phase 1 Orchestrator](../agents/phase_1_orchestrator_master_prompt.md) - Implementation orchestrator
- [Phase 2 Orchestrator](../agents/phase_2_orchestrator_agent.md) - UI orchestrator

Phase 0 (Foundations)
→ Phase 1 (Parallel Core Skeletons)
→ Sync Point A
→ Phase 2 (Parallel Business Capabilities)
→ Sync Point B
→ Phase 3 (Parallel Integrations & Ops)
→ Sync Point C
→ Phase 4 (Hardening & Franchise Readiness)

---

## Phase 0 — Foundations (Single Agent)

**Goal:** Freeze all shared contracts.

**Artifacts frozen after phase:**

- Domain Glossary
- Event Names + Payload schemas
- Tenant model & invariants
- Service boundaries

**Why:** Any later change explodes parallel work.

---

## Phase 1 — Core Skeletons (PARALLEL)

### Task Group 1: Infrastructure Skeletons

- Parallel: YES
- Agents: 2
- Output:
  - docker-compose.yml
  - base Dockerfiles
  - shared env conventions

### Task Group 2: Event Contracts

- Parallel: YES
- Agents: 1
- Output:
  - /contracts/events/*.json
  - versioning rules

### Task Group 3: Auth & Tenant Core

- Parallel: YES
- Agents: 2
- Output:
  - auth-service skeleton
  - tenant middleware

---

## SYNC POINT A — Contract Freeze

**Frozen:**

- Event schemas
- Tenant headers
- Auth token structure

---

## Phase 2 — Business Capabilities (PARALLEL)

### Task Group 4: Booking & Calendar

- Agents: 2
- Output:
  - booking-service
  - calendar projections

### Task Group 5: Sales & Payments

- Agents: 2
- Output:
  - sales-service
  - invoice events

### Task Group 6: Inventory & Warehouse

- Agents: 1
- Output:
  - inventory-service

### Task Group 7: CRM & Clients

- Agents: 1
- Output:
  - client-service

---

## SYNC POINT B — Business Events Alignment

**Frozen:**

- Cross-service event usage
- Read model expectations

---

## Phase 3 — Integrations & Ops (PARALLEL)

### Task Group 8: Accounting (CZ)

- Agents: 1
- Output:
  - accounting-adapter

### Task Group 9: BI / Analytics

- Agents: 1
- Output:
  - event consumers
  - reporting schemas

### Task Group 10: Public Website & API Gateway

- Agents: 2
- Output:
  - gateway-service
  - website backend

---

## SYNC POINT C — Franchise Template Freeze

**Frozen:**

- Config structure
- Tenant bootstrap process

---

## Phase 4 — Franchise Readiness (PARALLEL)

### Task Group 11: Franchise Bootstrap Automation

- Agents: 1
- Output:
  - new-city bootstrap scripts

### Task Group 12: Operations

- Agents: 1
- Output:
  - logging

### Task Group 13: Security & Compliance

- Agents: 1
- Output:
  - GDPR flows
  - audit logs

---

## Merge Strategy

1. Phase-based merges only
2. Sync point owner validates
3. Contracts override implementations
4. Conflicts resolved by glossary + events

---

## Parallel Agent Count Summary

- Max parallel agents: **10–12**
- Zero file overlap guaranteed
- Deterministic merge path

---

## Execution Rule

> No agent starts work beyond its phase.
> No agent edits frozen artifacts.

This plan is ready for AI-based parallel execution.

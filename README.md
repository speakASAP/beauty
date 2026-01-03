# Beauty Franchise IT Platform

## Multi-Tenant Event-Driven Platform for Beauty Franchise (Czech Republic)

---

## Overview

This project implements a **centrally managed, locally flexible multi-tenant IT platform** for a network of beauty salons in the Czech Republic, designed from day one for **franchise scaling**.

The goal is to build a **platform business**, not "software for a single salon".

---

## Project Structure

### Documentation

- **[Business Goal](docs/business/business-goal.md)** - Business context and objectives
- **[Architecture](docs/architecture/)** - Technical design and domain documentation
  - [Technical Design Document](docs/architecture/tdd.md) - Architectural foundation
  - [Domain Glossary](docs/architecture/domain-glossary.md) - Immutable domain terms
  - [Event Storming](docs/architecture/event-storming.md) - Event chains and business flows
- **[Plans](docs/plans/)** - Implementation and decomposition plans
  - [Delivery Plan](docs/plans/delivery-plan.md) - Implementation phases
  - [Platform Decomposition Plan](docs/plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy
- **[Agents](docs/agents/)** - AI agent prompts and orchestrators
  - [Master Prompt](docs/agents/master-prompt.md) - Lead Orchestrator Agent role
  - [Prompt Orchestrator](docs/agents/prompt-orchestrator.md) - Task decomposition orchestrator
  - Phase-specific orchestrators and validators
  - **Validation Guides:**
    - [P1.7 Testing Guide](docs/agents/p1_7_testing_guide.md) - Complete P1.7 testing reference
    - [P1.7 Documentation Index](docs/agents/p1_7_index.md) - P1.7 documentation overview
    - [SYNC E Validation Guide](docs/agents/sync_e_validation_guide.md) - Platform spine validation
    - [SYNC F Validation Guide](docs/agents/sync_f_validation_guide.md) - Business flow validation

---

## Core Objectives

The platform must:

- Act as a **single IT core** for the entire network
- Enable **fast, standardized launch of new salons** "out of the box"
- Give the **franchisor full control** over data, standards, and analytics
- Allow **local operational flexibility** for each franchise salon

---

## MVP Scope

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

## Architectural Principles

- **Multi-tenant from day one**, not "later"
- ❌ No shared tables without `tenant_id`
- **Accounting = adapter**, never a core domain
- **All business facts → events**
- **BI and analytics are mandatory in MVP**
- Architecture must be **franchise-ready**, even with a single salon

---

## Technology Stack

- **Architecture**: Domain-Driven Design (DDD), Event-Driven Architecture
- **Multi-tenancy**: Shared DB + Row-Level Security (RLS)
- **Runtime**: Docker + docker-compose
- **Database**: PostgreSQL (shared DB, RLS enabled)
- **Event Bus**: NATS / Kafka
- **Integration**: Adapter-based integrations with existing microservices

## Port Configuration

**Port Range**: 41xx

**Note**: All ports and configuration are in `.env` file. Copy `.env.example` to `.env` and configure your values.

---

## Integrations (Czech Republic)

### Required for MVP

- **Payments**: Stripe (MVP), later ČSOB / GP
- **SMS**: Czech SMS gateways for client notifications

### Adapter-based Integrations

- **Accounting**: Money S3, Pohoda, ABRA, Fakturama
- **VAT / EET**: system must be data-ready (EET may return)

---

## Success Criteria

The system is successful if:

- A new salon can be launched **quickly and consistently**
- The franchisor has **real-time, reliable business metrics**
- The architecture **does not require rewriting** when scaling to 10–100 salons

---

## Important Note

This is **not local salon software** and not a simple accounting tool.  
This is a **franchise IT platform**, starting with an MVP and designed to scale.

---

## Getting Started

### Quick Setup

1. **Copy environment variables:**

```bash
cp .env.example .env
# Edit .env and set your actual values (passwords, API keys, etc.)
```

2. **Create Docker network (if not exists):**

```bash
docker network create nginx-network
```

3. **Start all services:**

```bash
docker compose up -d
```

4. **Verify services are healthy:**

```bash
docker compose ps
```

5. **Run validation:**

```bash
# SYNC E - Platform spine validation
node scripts/validation/sync_e_validation.js
```

### Detailed Implementation Guidance

For detailed implementation guidance, see:

1. [Business Goal](docs/business/business-goal.md) - Understand the business context
2. [Technical Design Document](docs/architecture/tdd.md) - Review the architecture
3. [Delivery Plan](docs/plans/delivery-plan.md) - Follow the implementation phases
4. [Master Prompt](docs/agents/master-prompt.md) - Understand the orchestration approach
5. [Phase 1 Execution Report](docs/agents/phase_1_execution_report.md) - Current implementation status

---

## Related Documentation

- [Domain Glossary](docs/architecture/domain-glossary.md) - Immutable domain terms
- [Event Storming](docs/architecture/event-storming.md) - Event chains
- [Platform Decomposition Plan](docs/plans/ai_orchestrated_platform_decomposition.md) - Task decomposition strategy

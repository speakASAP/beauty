# CLAUDE.md (beauty)

Ecosystem defaults: sibling [`../CLAUDE.md`](../CLAUDE.md) and [`../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md`](../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md).

Read this repo's `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json` first.

---

## beauty

**Purpose**: Multi-tenant IT platform for beauty salon franchise network — POS, CRM, booking, inventory, ERP, and BI reporting.  
**Stack**: NestJS microservices · PostgreSQL · NATS/Kafka

### Key constraints
- Tenant data isolation is mandatory — no cross-tenant data access (schema-per-tenant or row-level security)
- Never modify GDPR consent records
- Financial calculations must be deterministic — never use LLM for POS math
- Booking changes must trigger client notifications via notifications-microservice
- Platform uptime target: > 99.5%

### Domain modules
POS · CRM · Booking · Inventory · ERP · BI Reporting · Public website

### Quick ops
```bash
docker compose logs -f
./scripts/deploy.sh
```

# System: beauty

## Architecture

Multi-tenant event-driven platform. NestJS microservices + PostgreSQL + NATS/Kafka.

- Domain modules: POS, CRM, Booking, Inventory, ERP, BI, Public website
- Tenant isolation via DB schema-per-tenant or row-level security

## Integrations

| Service | Usage |
|---------|-------|
| auth-microservice:3370 | User auth |
| database-server:5432 | PostgreSQL |
| logging-microservice:3367 | Logs |
| notifications-microservice:3368 | Client notifications |
| payments-microservice:3468 | Service payments |

## Current State
<!-- AI-maintained -->
Stage: active

## Known Issues
<!-- AI-maintained -->
- None

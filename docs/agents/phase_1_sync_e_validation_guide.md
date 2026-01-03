# SYNC E - Platform Spine Ready Validation Guide

**Status:** Validation Script Created  
**Date:** 2026-01-XX

---

## Overview

SYNC E validates that the platform spine is ready:

- ✅ All services boot successfully
- ✅ tenant_id flows through all services
- ✅ Events are published and consumed correctly

---

## Validation Criteria

### 1. All Services Boot ✅

**Test:** Health check each service

**Services to Test:**

- ✅ booking-service (port 4110)
- ✅ beauty-pos-service (port 4111)
- ✅ payments-service (port 4112)
- ✅ inventory-service (port 4113)
- ✅ customer-service (port 4114)
- ✅ bi-service (port 4115)
- ✅ integration-hub-service (port 4116)
- ✅ staff-service (port 4117)

**Expected:** All services return `200 OK` with `status: 'healthy'` or `status: 'degraded'` (degraded is acceptable if external services are unavailable)

---

### 2. Tenant ID Flows ✅

**Test:** Make requests with tenant context headers to each service

**Headers:**

- `X-Tenant-ID` - Tenant UUID
- `X-User-ID` - User UUID
- `X-Correlation-ID` - Correlation UUID

**Expected:**

- Services accept tenant context (not 403 Forbidden)
- Services process requests with tenant context
- RLS enforces tenant isolation

**Test Endpoints:**

- `GET /appointments` (booking-service)
- `GET /orders` (beauty-pos-service)
- `GET /payments` (payments-service)
- `GET /inventory/items` (inventory-service)
- `GET /clients` (customer-service)
- `GET /analytics/daily-sales` (bi-service)
- `GET /masters` (staff-service)

---

### 3. Events Work ✅

**Test:** Publish and consume events

**Event Publishing Test:**

- Create an appointment (publishes `appointment.booked`)
- Verify event is published to NATS
- Verify event has correct tenant_id

**Event Consumption Test:**

- Verify BI service subscribes to events
- Verify events are processed idempotently
- Verify aggregates are updated

**Expected:**

- Events published with correct tenant_id
- Events consumed by subscribers
- Event processing is idempotent

---

## Running Validation

### Prerequisites

1. **Start all services:**

   ```bash
   docker compose up -d
   ```

2. **Wait for services to be healthy:**

   ```bash
   docker compose ps
   # Wait until all services show "healthy" status
   ```

3. **Run validation script:**

   ```bash
   node scripts/validation/sync_e_validation.js
   ```

### Environment Variables

```bash
# Optional: Override defaults
export BASE_URL=http://localhost
export TEST_TENANT_ID=550e8400-e29b-41d4-a716-446655440001
export TEST_USER_ID=550e8400-e29b-41d4-a716-446655440002
```

---

## Manual Validation Steps

### Step 1: Verify Services Boot

```bash
# Check all services are running
docker compose ps

# Check individual service health
curl http://localhost:4110/health  # booking-service
curl http://localhost:4111/health  # beauty-pos-service
curl http://localhost:4112/health  # payments-service
curl http://localhost:4113/health  # inventory-service
curl http://localhost:4114/health  # customer-service
curl http://localhost:4115/health  # bi-service
curl http://localhost:4116/health  # integration-hub-service
curl http://localhost:4117/health  # staff-service
```

**Expected:** All return `200 OK`` with health status

---

### Step 2: Verify Tenant Context Flow

```bash
# Test tenant context with headers
curl -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001" \
     -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002" \
     -H "X-Correlation-ID: $(uuidgen)" \
     http://localhost:4110/appointments

# Should return 200 OK (empty list is fine) or 400/404 (business logic error)
# Should NOT return 403 (tenant context error)
```

**Expected:** `200 OK` or business logic error (400/404), NOT `403 Forbidden`

---

### Step 3: Verify Event Publishing

```bash
# Create an appointment (publishes appointment.booked event)
curl -X POST http://localhost:4110/appointments \
  -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001" \
  -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002" \
  -H "X-Correlation-ID: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "550e8400-e29b-41d4-a716-446655440003",
    "master_id": "550e8400-e29b-41d4-a716-446655440004",
    "service_id": "550e8400-e29b-41d4-a716-446655440005",
    "starts_at": "2024-12-31T14:00:00Z",
    "duration_minutes": 60
  }'
```

**Expected:**

- `201 Created` (if client/master/service exist)
- `400 Bad Request` or `409 Conflict` (business logic error)
- Event published to NATS with correct tenant_id

---

### Step 4: Verify Event Consumption

```bash
# Check BI service has processed events
curl -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001" \
     -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002" \
     http://localhost:4115/analytics/daily-sales?from_date=2024-01-01&to_date=2024-12-31
```

**Expected:** `200 OK` with analytics data (or empty if no events processed yet)

---

## Validation Checklist

### Service Boot ✅

- [ ] All services start without errors
- [ ] All services pass health checks
- [ ] Database connection works
- [ ] NATS connection works
- [ ] Event bus subscriptions active

### Tenant Context Flow ✅

- [ ] All services accept `X-Tenant-ID` header
- [ ] All services validate tenant context
- [ ] All services set `app.tenant_id` in DB session
- [ ] RLS policies enforce tenant isolation
- [ ] No cross-tenant data access possible

### Event Publishing ✅

- [ ] Events published with correct tenant_id
- [ ] Events published with all mandatory fields
- [ ] Events validated before publishing
- [ ] Events reach NATS successfully

### Event Consumption ✅

- [ ] BI service subscribes to all event types
- [ ] Events processed idempotently
- [ ] Aggregates updated correctly
- [ ] Tenant context set from events

---

## Troubleshooting

### Services Not Booting

**Check:**

1. Database is running: `docker compose ps database`
2. NATS is running: `docker compose ps nats`
3. Service logs: `docker compose logs <service-name>`
4. Port conflicts: Check if ports are already in use

### Tenant Context Errors

**Check:**

1. Headers are set correctly
2. Tenant exists in `platform.tenants` table
3. Tenant state is `ACTIVE`
4. Middleware order is correct

### Event Publishing Failures

**Check:**

1. NATS is running: `docker compose ps nats`
2. Event bus connection: Check service logs
3. Event validation: Check event structure
4. Tenant_id is present: Events require tenant_id

### Event Consumption Failures

**Check:**

1. BI service is running: `docker compose ps bi-service`
2. Event subscriptions: Check BI service logs
3. Database connection: Check BI service can write to bi schema
4. Event processing log: Check for duplicate events

---

## Success Criteria

**SYNC E is PASSED when:**

✅ All 8 services boot successfully  
✅ All services accept tenant context  
✅ Events are published correctly  
✅ Events are consumed correctly  
✅ No tenant isolation violations  
✅ Platform spine is operational  

---

## Next Steps

After SYNC E passes:

- ⏳ **SYNC F** - Business Flow Works (end-to-end flow validation)
- ⏳ **P1.7** - Validation & Hardening (contract validation, tenant isolation tests)

---

**Validation Script:** `scripts/validation/sync_e_validation.js`  
**Status:** Ready for execution

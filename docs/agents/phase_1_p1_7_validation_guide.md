# P1.7 - Validation & Hardening Guide

**Status:** Validation Scripts Created  
**Date:** 2026-01-XX

---

## Overview

P1.7 validates and hardens the platform through:
- ✅ Contract validation (event schemas)
- ✅ Tenant isolation tests (RLS enforcement)
- ✅ Failure scenarios (error handling, resilience)

---

## Validation Criteria

### 1. Contract Validation ✅

**Tests:**
- Event schema validation (mandatory fields)
- Tenant ID mandatory in all events
- Event versioning
- Aggregate root mapping
- Payload structure validation

**Script:** `scripts/validation/p1_7_contract_validation.js`

---

### 2. Tenant Isolation Tests ✅

**Tests:**
- Cross-tenant read prevention
- Cross-tenant write prevention
- Tenant-scoped list operations
- RLS policy enforcement

**Script:** `scripts/validation/p1_7_tenant_isolation.js`

**Critical:** Any failure in tenant isolation is a **SECURITY BREACH** and must be fixed immediately.

---

### 3. Failure Scenarios ✅

**Tests:**
- Invalid input validation
- Missing tenant context handling
- Non-existent resource handling
- Service health monitoring
- Event idempotency mechanism

**Script:** `scripts/validation/p1_7_failure_scenarios.js`

---

## Running Validation

### Prerequisites

1. **SYNC E and SYNC F must pass first:**
   ```bash
   node scripts/validation/sync_e_validation.js
   node scripts/validation/sync_f_validation.js
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Wait for services to be healthy:**
   ```bash
   docker compose ps
   ```

### Run All Tests

```bash
# Run all P1.7 validation tests
./scripts/validation/p1_7_run_all.sh
```

### Run Individual Tests

```bash
# Contract validation only
node scripts/validation/p1_7_contract_validation.js

# Tenant isolation only
node scripts/validation/p1_7_tenant_isolation.js

# Failure scenarios only
node scripts/validation/p1_7_failure_scenarios.js
```

### Environment Variables

```bash
# Base configuration
export BASE_URL=http://localhost
export TEST_TENANT_ID=550e8400-e29b-41d4-a716-446655440001
export TEST_USER_ID=550e8400-e29b-41d4-a716-446655440002

# For tenant isolation tests (requires 2 tenants)
export TENANT_1_ID=550e8400-e29b-41d4-a716-446655440001
export TENANT_2_ID=550e8400-e29b-41d4-a716-446655440002
```

---

## Test Details

### Contract Validation Tests

1. **Event Schema Validation**
   - Verifies mandatory fields: `event_id`, `event_type`, `event_version`, `tenant_id`, `aggregate_id`, `occurred_at`
   - Validates UUID formats
   - Validates ISO 8601 timestamps

2. **Tenant ID in Events**
   - Verifies `tenant_id` is mandatory (never null)
   - Tests multiple services enforce tenant validation
   - Validates tenant context propagation

3. **Event Versioning**
   - Verifies event bus includes versioning
   - Checks version format (v1, v2, etc.)

4. **Aggregate Root Mapping**
   - Verifies `aggregate_id` matches aggregate root
   - Tests mapping for different event types

---

### Tenant Isolation Tests

1. **Create Resources for Both Tenants**
   - Creates test data for Tenant 1 and Tenant 2
   - Sets up test scenario for isolation validation

2. **Cross-Tenant Read Prevention**
   - Attempts to read Tenant 1's data with Tenant 2's context
   - Verifies 404/403 response or empty/different data
   - Tests reverse direction (Tenant 2 → Tenant 1)

3. **Cross-Tenant Write Prevention**
   - Attempts to update Tenant 1's data with Tenant 2's context
   - Verifies 404/403/400 response
   - Prevents unauthorized modifications

4. **Tenant-Scoped List Operations**
   - Lists resources for Tenant 1 (should only see Tenant 1's data)
   - Lists resources for Tenant 2 (should only see Tenant 2's data)
   - Verifies no cross-tenant data leakage

---

### Failure Scenarios Tests

1. **Invalid Input Validation**
   - Missing required fields → 400/422
   - Invalid UUID format → 400/404
   - Invalid date format → 400/422

2. **Missing Tenant Context**
   - Request without `X-Tenant-ID` header → 403/400
   - Verifies tenant context is mandatory

3. **Non-Existent Resource Access**
   - Access non-existent resource → 404
   - Proper error handling

4. **Service Health Check**
   - Verifies all services are healthy
   - Checks health endpoint responses

5. **Event Idempotency**
   - Verifies BI service has event processing log
   - Checks idempotency mechanism exists

---

## Success Criteria

**P1.7 is PASSED when:**

✅ All event contracts validated  
✅ Tenant isolation enforced (no cross-tenant access)  
✅ Failure scenarios handled correctly  
✅ Error responses are proper (400, 403, 404, 422)  
✅ Services are resilient to failures  

**P1.7 is FAILED if:**

❌ Any tenant isolation violation (SECURITY BREACH)  
❌ Invalid events accepted  
❌ Cross-tenant data access allowed  
❌ Failure scenarios not handled  

---

## Troubleshooting

### Tenant Isolation Failures

**CRITICAL:** Tenant isolation failures are security breaches.

**Check:**
1. RLS policies are enabled: `\d+ table_name` in PostgreSQL
2. `app.tenant_id` is set in DB session: Check service logs
3. Tenant context middleware is active: Check service logs
4. Database session binding works: Check `dbTenantContextMiddleware`

**Fix:**
- Review RLS policy definitions
- Verify `SET app.tenant_id` is called before queries
- Check tenant middleware order in Express app

---

### Contract Validation Failures

**Check:**
1. Event bus validation is active: Check `EventValidator.validate`
2. Event structure matches Event Catalog: Compare with `docs/architecture/event-catalog.md`
3. Mandatory fields are present: Check event payloads

**Fix:**
- Update event publishing code to include all mandatory fields
- Verify event version is set correctly
- Check aggregate_id mapping

---

### Failure Scenario Failures

**Check:**
1. Input validation middleware is active
2. Error handling middleware is configured
3. Service health endpoints are working

**Fix:**
- Add input validation middleware
- Improve error handling
- Fix service health checks

---

## Next Steps

After P1.7 passes:

- ⏳ **SYNC G** - MVP READY
  - New tenant onboarding via config
  - No code changes required
  - Events observable
  - BI populated

---

## Related Documentation

- [P1.7 Testing Guide](p1_7_testing_guide.md) - **Complete testing reference with step-by-step instructions**
- [P1.7 Completion Report](p1_7_completion.md) - Completion status and deliverables
- [Event Catalog](../architecture/event-catalog.md) - Event schemas and contracts
- [Tenant Model](../architecture/tenant-model.md) - Tenant isolation rules
- [SYNC E Validation Guide](sync_e_validation_guide.md) - Platform spine validation
- [SYNC F Validation Guide](sync_f_validation_guide.md) - Business flow validation
- [Phase 1 Orchestrator](phase_1_orchestrator_master_prompt.md) - Phase 1 implementation plan

---

**Validation Scripts:**
- `scripts/validation/p1_7_contract_validation.js`
- `scripts/validation/p1_7_tenant_isolation.js`
- `scripts/validation/p1_7_failure_scenarios.js`
- `scripts/validation/p1_7_run_all.sh` (runs all tests)

**For detailed testing instructions, see:** [P1.7 Testing Guide](p1_7_testing_guide.md)

**Status:** ✅ READY FOR VALIDATION


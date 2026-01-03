# P1.7 Testing Guide - Complete Reference

**Status:** ✅ Complete Testing Documentation  
**Date:** 2026-01-XX

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Test Instructions](#detailed-test-instructions)
5. [Test Scripts Reference](#test-scripts-reference)
6. [Expected Results](#expected-results)
7. [Troubleshooting](#troubleshooting)
8. [Integration with Phase 1 Workflow](#integration-with-phase-1-workflow)

---

## Overview

P1.7 (Validation & Hardening) is the final validation step before MVP readiness. It ensures:

- ✅ **Contract Validation**: All events comply with Event Catalog schemas
- ✅ **Tenant Isolation**: RLS policies prevent cross-tenant data access (CRITICAL SECURITY)
- ✅ **Failure Scenarios**: System handles errors gracefully and is resilient

**Why P1.7 is Critical:**

- **Security**: Tenant isolation failures are security breaches
- **Reliability**: Contract validation ensures system stability
- **Resilience**: Failure scenario handling prevents system crashes

---

## Prerequisites

### 1. Previous Validations Must Pass

**SYNC E** (Platform Spine Ready) must pass:
```bash
node scripts/validation/sync_e_validation.js
```

**SYNC F** (Business Flow Works) must pass:
```bash
node scripts/validation/sync_f_validation.js
```

### 2. Services Must Be Running

```bash
# Start all services
docker compose up -d

# Verify all services are healthy
docker compose ps

# Check individual service health
curl http://localhost:4110/health  # booking-service
curl http://localhost:4111/health  # beauty-pos-service
curl http://localhost:4112/health  # payments-service
curl http://localhost:4114/health  # customer-service
curl http://localhost:4115/health  # bi-service
```

### 3. Database Must Be Initialized

```bash
# Verify database is accessible
docker compose exec database psql -U beauty_user -d beauty_platform -c "SELECT 1;"

# Verify RLS is enabled (check any tenant table)
docker compose exec database psql -U beauty_user -d beauty_platform -c "\d+ customer.clients"
# Should show "Row Security Policies" section
```

### 4. NATS Must Be Running

```bash
# Check NATS health
curl http://localhost:4103/healthz

# Or via docker
docker compose ps nats
```

---

## Quick Start

### Run All P1.7 Tests

```bash
# From project root
./scripts/validation/p1_7_run_all.sh
```

This will:
1. Run contract validation
2. Run tenant isolation tests
3. Run failure scenario tests
4. Provide a summary report

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║     P1.7 Validation & Hardening - Complete Suite          ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: Contract Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ P1.7 Contract Validation: PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 2: Tenant Isolation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ P1.7 Tenant Isolation Validation: PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 3: Failure Scenarios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ P1.7 Failure Scenarios Validation: PASSED

╔════════════════════════════════════════════════════════════╗
║     P1.7 Validation & Hardening - Final Summary           ║
╚════════════════════════════════════════════════════════════╝

Tests Passed: 3
Tests Failed: 0

✅ P1.7 Validation & Hardening: ALL TESTS PASSED
```

---

## Detailed Test Instructions

### Test 1: Contract Validation

**Purpose:** Verify all events comply with Event Catalog schemas.

**Script:** `scripts/validation/p1_7_contract_validation.js`

**What It Tests:**

1. **Event Schema Validation**
   - Mandatory fields: `event_id`, `event_type`, `event_version`, `tenant_id`, `aggregate_id`, `occurred_at`
   - UUID format validation
   - ISO 8601 timestamp validation

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

**Run Individually:**
```bash
node scripts/validation/p1_7_contract_validation.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║     P1.7 Contract Validation                               ║
╚════════════════════════════════════════════════════════════╝

📋 Test 1: Event Schema Validation (Mandatory Fields)
────────────────────────────────────────────────────────────
  ✅ Appointment created, event structure validated

📋 Test 2: Tenant ID in Events (MANDATORY)
────────────────────────────────────────────────────────────
  ✅ booking-service: Tenant context accepted
  ✅ customer-service: Tenant context accepted
  ✅ beauty-pos-service: Tenant context accepted

📋 Test 3: Event Versioning
────────────────────────────────────────────────────────────
  ✅ Event bus library configured for versioning

📋 Test 4: Aggregate Root Mapping
────────────────────────────────────────────────────────────
  ✅ Aggregate root mapping validated

📊 Validation Summary
════════════════════════════════════════════════════════════
✅ Passed: 8
❌ Failed: 0
⚠️  Warnings: 0

✅ P1.7 Contract Validation: PASSED
```

**What to Look For:**
- ✅ All tests pass
- ✅ No validation errors
- ✅ Tenant ID is mandatory in all events

**If Tests Fail:**
- Check event publishing code includes all mandatory fields
- Verify `EventValidator.validate` is being called
- Check Event Catalog schema matches implementation

---

### Test 2: Tenant Isolation

**Purpose:** Verify RLS policies prevent cross-tenant data access (CRITICAL SECURITY TEST).

**Script:** `scripts/validation/p1_7_tenant_isolation.js`

**What It Tests:**

1. **Create Resources for Both Tenants**
   - Creates test clients for Tenant 1 and Tenant 2
   - Sets up test scenario for isolation validation

2. **Cross-Tenant Read Prevention**
   - Attempts to read Tenant 1's client with Tenant 2's context
   - Verifies 404/403 response or empty/different data
   - Tests reverse direction (Tenant 2 → Tenant 1)

3. **Cross-Tenant Write Prevention**
   - Attempts to update Tenant 1's client with Tenant 2's context
   - Verifies 404/403/400 response
   - Prevents unauthorized modifications

4. **Tenant-Scoped List Operations**
   - Lists clients for Tenant 1 (should only see Tenant 1's clients)
   - Lists clients for Tenant 2 (should only see Tenant 2's clients)
   - Verifies no cross-tenant data leakage

**Run Individually:**
```bash
# Requires 2 tenant IDs
export TENANT_1_ID=550e8400-e29b-41d4-a716-446655440001
export TENANT_2_ID=550e8400-e29b-41d4-a716-446655440002
node scripts/validation/p1_7_tenant_isolation.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║     P1.7 Tenant Isolation Validation                       ║
╚════════════════════════════════════════════════════════════╝

📋 Test 1: Create Resources for Both Tenants
────────────────────────────────────────────────────────────
  ✅ Tenant 1 client created: <uuid>
  ✅ Tenant 2 client created: <uuid>

📋 Test 2: Cross-Tenant Read Prevention
────────────────────────────────────────────────────────────
  ✅ Cross-tenant read prevented
  ✅ Cross-tenant read prevented (reverse direction)

📋 Test 3: Cross-Tenant Write Prevention
────────────────────────────────────────────────────────────
  ✅ Cross-tenant write prevented

📋 Test 4: Tenant-Scoped List Operations
────────────────────────────────────────────────────────────
  ✅ Tenant 1 list contains only Tenant 1 clients
  ✅ Tenant 2 list contains only Tenant 2 clients

📊 Validation Summary
════════════════════════════════════════════════════════════
✅ Passed: 7
❌ Failed: 0
⚠️  Warnings: 0

✅ P1.7 Tenant Isolation Validation: PASSED
```

**What to Look For:**
- ✅ **CRITICAL:** No cross-tenant data access
- ✅ All read attempts return 404/403 or empty data
- ✅ All write attempts return 404/403/400
- ✅ List operations are tenant-scoped

**If Tests Fail:**
- **THIS IS A SECURITY BREACH - FIX IMMEDIATELY**
- Check RLS policies are enabled: `\d+ table_name` in PostgreSQL
- Verify `app.tenant_id` is set in DB session
- Check tenant middleware order in Express app
- Review RLS policy definitions in migration scripts

---

### Test 3: Failure Scenarios

**Purpose:** Verify system handles errors gracefully and is resilient.

**Script:** `scripts/validation/p1_7_failure_scenarios.js`

**What It Tests:**

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

**Run Individually:**
```bash
node scripts/validation/p1_7_failure_scenarios.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║     P1.7 Failure Scenarios Validation                      ║
╚════════════════════════════════════════════════════════════╝

📋 Test 1: Invalid Input Validation
────────────────────────────────────────────────────────────
  ✅ Invalid input properly rejected
  ✅ Invalid UUID format properly rejected
  ✅ Invalid date format properly rejected

📋 Test 2: Missing Tenant Context
────────────────────────────────────────────────────────────
  ✅ Missing tenant context properly rejected

📋 Test 3: Non-Existent Resource Access
────────────────────────────────────────────────────────────
  ✅ Non-existent resource properly returns 404

📋 Test 4: Service Health Check
────────────────────────────────────────────────────────────
  ✅ booking-service: Healthy
  ✅ customer-service: Healthy
  ✅ payments-service: Healthy
  ✅ bi-service: Healthy

📋 Test 5: Event Idempotency (Basic Check)
────────────────────────────────────────────────────────────
  ✅ BI service configured for event idempotency

📊 Validation Summary
════════════════════════════════════════════════════════════
✅ Passed: 9
❌ Failed: 0
⚠️  Warnings: 0

✅ P1.7 Failure Scenarios Validation: PASSED
```

**What to Look For:**
- ✅ Proper HTTP status codes (400, 403, 404, 422)
- ✅ Error responses are consistent
- ✅ Services handle invalid input gracefully
- ✅ Health checks work correctly

**If Tests Fail:**
- Check input validation middleware is active
- Verify error handling middleware is configured
- Fix service health endpoints
- Review error response structure

---

## Test Scripts Reference

### Environment Variables

All scripts support the following environment variables:

```bash
# Base configuration
export BASE_URL=http://localhost                    # Base URL for services
export TEST_TENANT_ID=<uuid>                       # Test tenant UUID
export TEST_USER_ID=<uuid>                         # Test user UUID

# For tenant isolation tests (requires 2 tenants)
export TENANT_1_ID=<uuid>                          # Tenant 1 UUID
export TENANT_2_ID=<uuid>                          # Tenant 2 UUID
```

### Script Locations

```bash
# Contract validation
scripts/validation/p1_7_contract_validation.js

# Tenant isolation
scripts/validation/p1_7_tenant_isolation.js

# Failure scenarios
scripts/validation/p1_7_failure_scenarios.js

# Run all tests
scripts/validation/p1_7_run_all.sh
```

### Script Execution

All scripts are Node.js ES modules and require Node.js 18+:

```bash
# Make scripts executable (if needed)
chmod +x scripts/validation/p1_7_*.js
chmod +x scripts/validation/p1_7_run_all.sh

# Run scripts
node scripts/validation/p1_7_contract_validation.js
node scripts/validation/p1_7_tenant_isolation.js
node scripts/validation/p1_7_failure_scenarios.js

# Or use the run-all script
./scripts/validation/p1_7_run_all.sh
```

---

## Expected Results

### Success Criteria

**P1.7 is PASSED when:**

✅ **Contract Validation:**
- All event schemas validated
- Mandatory fields enforced
- Tenant ID mandatory in all events
- Event versioning working
- Aggregate root mapping correct

✅ **Tenant Isolation:**
- Cross-tenant read prevented
- Cross-tenant write prevented
- Tenant-scoped list operations
- RLS policies enforced
- **NO SECURITY BREACHES**

✅ **Failure Scenarios:**
- Invalid input validation (400/422)
- Missing tenant context handling (403/400)
- Non-existent resource handling (404)
- Service health monitoring
- Event idempotency mechanism

### Failure Criteria

**P1.7 is FAILED if:**

❌ **Any tenant isolation violation** (SECURITY BREACH - FIX IMMEDIATELY)
❌ Invalid events accepted
❌ Cross-tenant data access allowed
❌ Failure scenarios not handled
❌ Services not resilient to failures

---

## Troubleshooting

### Common Issues

#### 1. Services Not Responding

**Symptoms:**
- Tests fail with connection errors
- Health checks return errors

**Solutions:**
```bash
# Check services are running
docker compose ps

# Check service logs
docker compose logs booking-service
docker compose logs customer-service

# Restart services
docker compose restart booking-service
```

#### 2. Tenant Isolation Failures

**Symptoms:**
- Cross-tenant read/write succeeds
- List operations return cross-tenant data

**CRITICAL:** This is a security breach!

**Solutions:**
```bash
# 1. Verify RLS is enabled
docker compose exec database psql -U beauty_user -d beauty_platform -c "\d+ customer.clients"
# Should show "Row Security Policies" section

# 2. Check RLS policies
docker compose exec database psql -U beauty_user -d beauty_platform -c "
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'customer' AND tablename = 'clients';
"

# 3. Verify app.tenant_id is set
# Check service logs for "SET app.tenant_id" calls

# 4. Check tenant middleware order
# Verify tenantContextMiddleware and dbTenantContextMiddleware are active
```

#### 3. Contract Validation Failures

**Symptoms:**
- Events missing mandatory fields
- Invalid event structure

**Solutions:**
```bash
# 1. Check Event Catalog schema
cat docs/architecture/event-catalog.md

# 2. Verify EventValidator.validate is called
grep -r "EventValidator.validate" packages/event-bus/src/

# 3. Check event publishing code
grep -r "eventBus.publish" services/*/src/
```

#### 4. Failure Scenario Failures

**Symptoms:**
- Invalid input not rejected
- Missing tenant context not rejected
- Wrong HTTP status codes

**Solutions:**
```bash
# 1. Check input validation middleware
grep -r "express.json\|body-parser" services/*/src/

# 2. Check error handling middleware
grep -r "error.*middleware\|catch.*error" services/*/src/

# 3. Verify tenant middleware
grep -r "tenantContextMiddleware" services/*/src/
```

---

## Integration with Phase 1 Workflow

### Phase 1 Validation Sequence

```
P1.1 → P1.2 → P1.3 → SYNC E → P1.4 → P1.5 → P1.6 → SYNC F → P1.7 → SYNC G
```

**P1.7 Position:**
- **After:** SYNC F (Business Flow Works)
- **Before:** SYNC G (MVP READY)

### When to Run P1.7

1. **After SYNC F passes** - Business flows must work first
2. **Before SYNC G** - MVP readiness requires validation
3. **After any tenant isolation changes** - Security must be verified
4. **After event schema changes** - Contracts must be validated

### P1.7 Exit Criteria

P1.7 must pass before proceeding to SYNC G:

✅ All contract validations pass  
✅ All tenant isolation tests pass (NO SECURITY BREACHES)  
✅ All failure scenario tests pass  
✅ System is hardened and resilient  

---

## Manual Testing

### Manual Contract Validation

```bash
# 1. Create an appointment (should publish appointment.booked event)
curl -X POST http://localhost:4110/appointments \
  -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001" \
  -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002" \
  -H "X-Correlation-ID: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "<uuid>",
    "master_id": "<uuid>",
    "service_id": "<uuid>",
    "starts_at": "2024-12-31T14:00:00Z",
    "duration_minutes": 60
  }'

# 2. Check service logs for event structure
docker compose logs booking-service | grep "appointment.booked"
```

### Manual Tenant Isolation Test

```bash
# 1. Create client for Tenant 1
TENANT_1_ID=550e8400-e29b-41d4-a716-446655440001
CLIENT_1=$(curl -X POST http://localhost:4114/clients \
  -H "X-Tenant-ID: $TENANT_1_ID" \
  -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"Client","phone":"+420123456789"}' \
  | jq -r '.id')

# 2. Try to read Tenant 1's client with Tenant 2's context (should fail)
TENANT_2_ID=550e8400-e29b-41d4-a716-446655440002
curl -X GET http://localhost:4114/clients/$CLIENT_1 \
  -H "X-Tenant-ID: $TENANT_2_ID" \
  -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440002"

# Expected: 404 or 403 (NOT 200 with data)
```

---

## Related Documentation

- [P1.7 Validation Guide](p1_7_validation_guide.md) - Detailed validation criteria
- [P1.7 Completion Report](p1_7_completion.md) - Completion status
- [SYNC E Validation Guide](sync_e_validation_guide.md) - Platform spine validation
- [SYNC F Validation Guide](sync_f_validation_guide.md) - Business flow validation
- [Event Catalog](../architecture/event-catalog.md) - Event schemas
- [Tenant Model](../architecture/tenant-model.md) - Tenant isolation rules
- [Phase 1 Orchestrator](phase_1_orchestrator_master_prompt.md) - Phase 1 plan

---

## Quick Reference

### Run All Tests
```bash
./scripts/validation/p1_7_run_all.sh
```

### Run Individual Tests
```bash
node scripts/validation/p1_7_contract_validation.js
node scripts/validation/p1_7_tenant_isolation.js
node scripts/validation/p1_7_failure_scenarios.js
```

### Check Service Health
```bash
curl http://localhost:4110/health  # booking-service
curl http://localhost:4114/health  # customer-service
```

### Check Database RLS
```bash
docker compose exec database psql -U beauty_user -d beauty_platform -c "\d+ customer.clients"
```

---

**Status:** ✅ Complete Testing Documentation  
**Last Updated:** 2026-01-XX


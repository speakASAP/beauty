# SYNC G Validation Guide

**SYNC G — MVP READY**

This validation ensures the platform is MVP-ready with tenant onboarding via configuration (no code changes).

---

## Validation Criteria

SYNC G validates the following:

1. **New Tenant Onboarding via Config**
   - Tenant can be onboarded using SQL script (no code changes)
   - Tenant onboarding script exists and works
   - No service restarts required

2. **Events Observable**
   - Events are published to NATS
   - Events are consumed by subscribers
   - Event bus is accessible and healthy

3. **BI Populated**
   - BI service aggregation endpoints accessible
   - BI aggregates can be queried
   - BI service is healthy

4. **No Code Changes Required**
   - Tenant onboarding uses SQL/config only
   - No service code modifications needed
   - No service deployments required

---

## Running SYNC G Validation

### Prerequisites

1. All previous validations must pass:
   - SYNC E (Platform Spine Ready)
   - SYNC F (Business Flow Works)
   - P1.7 (Validation & Hardening)

2. All services must be running:
   ```bash
   docker compose up -d
   ```

3. Database must be initialized:
   ```bash
   docker compose ps database
   ```

### Command

```bash
node scripts/validation/sync_g_validation.js
```

### Environment Variables

```bash
BASE_URL=http://localhost          # Base URL for services
TEST_TENANT_NAME="Test Salon"      # Test tenant name
```

---

## Tenant Onboarding

### Using SQL Script

```bash
# Direct SQL execution
docker compose exec database psql -U beauty_user -d beauty_platform <<EOF
\set tenant_name 'Salon Name'
\set tenant_address 'Address'
\set tenant_phone '+420123456789'
\set tenant_email 'salon@example.com'
\i scripts/tenant/onboard_tenant.sql
EOF
```

### Using Shell Script

```bash
# Using shell script (recommended)
./scripts/tenant/onboard_tenant.sh "Salon Name" "Address" "+420123456789" "salon@example.com"

# Or with environment variables
export TENANT_NAME="Salon Name"
export TENANT_ADDRESS="Address"
export TENANT_PHONE="+420123456789"
export TENANT_EMAIL="salon@example.com"
./scripts/tenant/onboard_tenant.sh
```

### Manual SQL Execution

```sql
-- Connect to database
psql -U beauty_user -d beauty_platform

-- Set variables
\set tenant_name 'Salon Name'
\set tenant_address 'Address'
\set tenant_phone '+420123456789'
\set tenant_email 'salon@example.com'

-- Run onboarding script
\i scripts/tenant/onboard_tenant.sql
```

---

## Test Flow Details

### Test 1: Tenant Onboarding Script

Validates that:
- Tenant onboarding SQL script exists
- Script contains tenant creation SQL
- Shell script exists (optional but recommended)

**Expected:**
- ✅ Script exists at `scripts/tenant/onboard_tenant.sql`
- ✅ Script contains `INSERT INTO platform.tenants`
- ✅ Shell script exists at `scripts/tenant/onboard_tenant.sh`

---

### Test 2: Events Observable

Validates that:
- BI service is connected to event bus
- Other services are connected to event bus
- Events can be published and consumed

**Expected:**
- ✅ BI service health check shows event bus connected
- ✅ Other services show event bus connected
- ✅ Events are observable via NATS

---

### Test 3: BI Populated

Validates that:
- BI service aggregation endpoints are accessible
- BI service returns proper data structure
- BI service is healthy

**Expected:**
- ✅ BI service `/analytics/daily-sales` endpoint accessible
- ✅ BI service returns aggregation data structure
- ✅ BI service health check passes

---

### Test 4: No Code Changes Required

Validates that:
- Tenant onboarding uses SQL only
- No schema changes required
- No service code modifications needed

**Expected:**
- ✅ Tenant onboarding script uses SQL only
- ✅ Script does not require schema changes
- ✅ No service code changes needed

---

## Success Criteria

SYNC G validation **PASSES** if:

✅ Tenant onboarding script exists and works  
✅ Events are observable (published and consumed)  
✅ BI service is populated and accessible  
✅ No code changes required for tenant onboarding  

SYNC G validation **FAILS** if:

❌ Tenant onboarding script missing or broken  
❌ Events not observable  
❌ BI service not accessible  
❌ Code changes required for tenant onboarding  

---

## Troubleshooting

### Tenant Onboarding Script Not Found

**Check:**
- Script exists at `scripts/tenant/onboard_tenant.sql`
- Script is readable and executable

**Fix:**
- Create script if missing
- Check file permissions

---

### Events Not Observable

**Check:**
- NATS is running: `docker compose ps nats`
- Services are connected to NATS: Check service logs
- Event bus health checks: `curl http://localhost:4115/health`

**Fix:**
- Restart NATS if needed
- Check NATS connection strings in service configs
- Verify event bus subscriptions in service logs

---

### BI Service Not Accessible

**Check:**
- BI service is running: `docker compose ps bi-service`
- BI service health: `curl http://localhost:4115/health`
- Database connection: Check BI service logs

**Fix:**
- Restart BI service if needed
- Check database connection string
- Verify BI service can access database

---

### Code Changes Required

**Check:**
- Tenant onboarding uses SQL only
- No service code modifications needed
- Script does not require schema changes

**Fix:**
- Ensure tenant onboarding is SQL-based
- Remove any code dependencies from onboarding
- Use configuration files instead of code changes

---

## Next Steps

After SYNC G validation passes:

1. **Platform is MVP READY**
   - New tenants can be onboarded via config
   - No code changes required
   - Events observable
   - BI populated

2. **Ready for Production**
   - Platform is production-ready
   - Tenant onboarding process documented
   - All validations passed

---

## Related Documentation

- [Tenant Model](../architecture/tenant-model.md) - Tenant lifecycle and states
- [SYNC E Validation Guide](sync_e_validation_guide.md) - Platform spine validation
- [SYNC F Validation Guide](sync_f_validation_guide.md) - Business flow validation
- [P1.7 Testing Guide](p1_7_testing_guide.md) - Validation & hardening
- [Phase 1 Orchestrator](phase_1_orchestrator_master_prompt.md) - Phase 1 implementation plan

---

**Validation Script:** `scripts/validation/sync_g_validation.js`  
**Tenant Onboarding Script:** `scripts/tenant/onboard_tenant.sql`  
**Status:** Ready for validation


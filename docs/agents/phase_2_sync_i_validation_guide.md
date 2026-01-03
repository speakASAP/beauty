# SYNC I - UI Feature Complete - Validation Guide

**Status:** ⏳ PENDING  
**Date:** 2026-01-XX

---

## Overview

SYNC I validates that:
- ✅ POS usable by salon
- ✅ Portal usable by franchisor
- ✅ No backend changes required

---

## Validation Criteria

### 1. POS Usable by Salon ✅

**Requirements:**
- All POS workflows functional
- Booking calendar works
- Client registration works
- Visit management works
- Checkout works
- Shift close works
- All APIs accessible
- Tenant isolation enforced

---

### 2. Portal Usable by Franchisor ✅

**Requirements:**
- All franchise portal workflows functional
- Tenant overview works
- KPI dashboard works
- Pricing control works
- Catalog governance works
- Franchisor role access enforced
- Cross-tenant data accessible (franchisor only)

---

### 3. No Backend Changes Required ✅

**Requirements:**
- All APIs exist in Phase 1
- No new endpoints created
- No endpoint modifications
- No schema changes
- No event schema changes

---

## Validation Process

### Step 1: Verify All APIs Exist

**Check that all APIs used by UI exist in Phase 1:**

**Booking Service (Port 4110):**
- ✅ `GET /appointments`
- ✅ `POST /appointments`
- ✅ `POST /appointments/:id/confirm`
- ✅ `POST /appointments/:id/start`
- ✅ `POST /appointments/:id/complete`
- ✅ `POST /appointments/:id/cancel`

**Beauty POS Service (Port 4111):**
- ✅ `GET /visits`
- ✅ `POST /visits`
- ✅ `POST /visits/:id/close`
- ✅ `GET /orders`
- ✅ `POST /orders`
- ✅ `POST /orders/:id/close`

**Payments Service (Port 4112):**
- ✅ `GET /payments`
- ✅ `POST /payments`
- ✅ `GET /payments/:id`

**Customer Service (Port 4114):**
- ✅ `GET /clients`
- ✅ `GET /clients/:id`
- ✅ `POST /clients`

**Staff Service (Port 4117):**
- ✅ `GET /masters`
- ✅ `GET /masters/:id`

**BI Service (Port 4115):**
- ✅ `GET /analytics/daily-sales`
- ✅ `GET /analytics/master-utilization`
- ✅ `GET /analytics/client-ltv`
- ✅ `GET /analytics/appointment-aggregates`

---

### Step 2: Test POS UI Workflows

**Manual Testing:**

1. **Login as Staff:**
   - Navigate to `/login`
   - Enter credentials
   - Verify redirect to `/pos/dashboard`

2. **Booking Workflow:**
   - View appointments calendar
   - Book new appointment
   - Confirm appointment
   - Start appointment
   - Complete appointment
   - Cancel appointment (optional)

3. **Client Registration:**
   - Navigate to `/pos/clients/register`
   - Register new client
   - Verify client appears in client list

4. **Visit Management:**
   - Navigate to `/pos/visits`
   - Start new visit
   - View active visits
   - Close visit

5. **Checkout:**
   - Create order from visit
   - Process payment
   - Close order
   - Verify order appears in order list

6. **Shift Close:**
   - Navigate to `/pos/shift-close`
   - View daily sales summary
   - View master utilization
   - Verify data is tenant-scoped

---

### Step 3: Test Franchise Portal Workflows

**Manual Testing:**

1. **Login as Franchisor:**
   - Navigate to `/login`
   - Enter franchisor credentials
   - Verify redirect to `/franchise/kpis`

2. **Tenant Overview:**
   - Navigate to `/franchise/tenants`
   - View tenant list
   - Search tenants
   - View tenant details

3. **KPI Dashboard:**
   - Navigate to `/franchise/kpis`
   - View daily sales across tenants
   - View master utilization
   - View client LTV
   - Verify cross-tenant data accessible

4. **Pricing Control:**
   - Navigate to `/franchise/pricing`
   - View global pricing templates
   - Set tenant-specific pricing (if API available)

5. **Catalog Governance:**
   - Navigate to `/franchise/catalog`
   - View service catalog
   - View product catalog
   - Manage catalog items (if API available)

---

### Step 4: Verify Tenant Isolation

**Test Cases:**

1. **Staff Access:**
   - Login as staff
   - Verify can only access POS routes
   - Verify cannot access franchise portal routes
   - Verify API calls include tenant_id

2. **Franchisor Access:**
   - Login as franchisor
   - Verify can access franchise portal routes
   - Verify can access cross-tenant data
   - Verify API calls include franchisor context

3. **Cross-Tenant Prevention:**
   - Login as staff for tenant A
   - Try to access tenant B data (should fail)
   - Verify 403 errors handled correctly

---

### Step 5: Verify No Backend Changes

**Check:**
- ✅ All APIs exist in Phase 1 services
- ✅ No new endpoints created
- ✅ No endpoint modifications
- ✅ No schema changes
- ✅ No event schema changes
- ✅ All API contracts match Phase 1

---

## Validation Script

**File:** `scripts/validation/sync_i_validation.js`

**Usage:**
```bash
node scripts/validation/sync_i_validation.js
```

**What it checks:**
- All service health endpoints
- All API endpoints exist and respond
- Tenant context propagation
- Role-based access control
- No backend changes required

---

## Success Criteria

**SYNC I is PASSED when:**

✅ POS usable by salon (all workflows functional)  
✅ Portal usable by franchisor (all workflows functional)  
✅ No backend changes required (all APIs exist in Phase 1)  
✅ Tenant isolation enforced  
✅ Role-based access control working  

**Status:** ⏳ PENDING VALIDATION

---

## Troubleshooting

### Issue: API endpoint not found

**Solution:**
- Check service is running
- Check service port matches configuration
- Check API endpoint path matches Phase 1

---

### Issue: Tenant context not propagated

**Solution:**
- Check JWT token includes tenant_id
- Check API client includes X-Tenant-ID header
- Check tenant context middleware working

---

### Issue: Role-based access not working

**Solution:**
- Check JWT token includes role
- Check ProtectedRoute component working
- Check role-based navigation working

---

## Next Steps

After SYNC I passes:

- ⏳ **P2.6** - Validation & Hardening
  - Tenant leakage tests
  - UX abuse scenarios
  - Event delay scenarios
  - Permission violations

---

**Validation Date:** TBD  
**Status:** ⏳ PENDING VALIDATION


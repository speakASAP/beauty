# P2.6 - Validation & Hardening - Validation Plan

**Status:** ⏳ IN PROGRESS  
**Date:** 2026-01-XX  
**Agent:** Phase 2 Validator Agent

---

## Overview

P2.6 validates and hardens the UI layer against:
- Tenant leakage
- UX abuse scenarios
- Event delay scenarios
- Permission violations

---

## Validation Scope

### 1. Tenant Leakage Tests

**Objective:** Ensure UI cannot access or display cross-tenant data

**Test Cases:**

#### 1.1 Cross-Tenant Data Access Prevention
- **Test:** Attempt to access tenant B data while logged in as tenant A
- **Expected:** 403 Forbidden or empty results
- **Validation:** Verify API returns 403 or empty array

#### 1.2 Tenant Context Validation
- **Test:** Verify tenant_id is included in all API calls
- **Expected:** All API requests include X-Tenant-ID header
- **Validation:** Check request headers

#### 1.3 RLS Enforcement in UI
- **Test:** Attempt to query data without tenant context
- **Expected:** 403 Forbidden
- **Validation:** Verify backend RLS policies enforced

#### 1.4 Tenant Switching Prevention
- **Test:** Attempt to switch tenant without re-authentication
- **Expected:** Tenant context cleared, redirect to login
- **Validation:** Verify tenant context cleared on violation

---

### 2. UX Abuse Scenarios

**Objective:** Ensure UI handles invalid input and edge cases gracefully

**Test Cases:**

#### 2.1 Invalid Input Handling
- **Test:** Submit forms with invalid data (empty fields, invalid formats)
- **Expected:** Validation errors displayed, no API calls made
- **Validation:** Verify client-side validation working

#### 2.2 Permission Violations
- **Test:** Attempt to access routes without required role
- **Expected:** Redirect to unauthorized or login
- **Validation:** Verify ProtectedRoute working

#### 2.3 Race Conditions
- **Test:** Submit multiple requests rapidly (double-click prevention)
- **Expected:** Only one request processed, loading states shown
- **Validation:** Verify request debouncing/throttling

#### 2.4 Concurrent Operations
- **Test:** Perform multiple operations simultaneously
- **Expected:** All operations complete correctly, no data corruption
- **Validation:** Verify state management handles concurrency

---

### 3. Event Delay Scenarios

**Objective:** Ensure UI handles event processing delays gracefully

**Test Cases:**

#### 3.1 Event Processing Delays
- **Test:** Simulate delayed event processing
- **Expected:** UI shows loading states, eventually updates
- **Validation:** Verify polling/retry logic working

#### 3.2 Read Model Staleness
- **Test:** Verify UI handles stale read model data
- **Expected:** UI refreshes when events received
- **Validation:** Verify query invalidation on events

#### 3.3 Optimistic Updates
- **Test:** Verify optimistic updates revert on failure
- **Expected:** UI reverts to previous state if operation fails
- **Validation:** Verify TanStack Query optimistic updates

#### 3.4 WebSocket Disconnection
- **Test:** Simulate WebSocket disconnection
- **Expected:** Fallback to polling, reconnection attempted
- **Validation:** Verify fallback mechanism working

---

### 4. Permission Violations

**Objective:** Ensure role-based access control enforced in UI

**Test Cases:**

#### 4.1 Role-Based Route Access
- **Test:** Attempt to access routes without required role
- **Expected:** Redirect to unauthorized or login
- **Validation:** Verify ProtectedRoute role checking

#### 4.2 Unauthorized Operations
- **Test:** Attempt to perform operations without permission
- **Expected:** 403 Forbidden, error message displayed
- **Validation:** Verify API returns 403, UI handles gracefully

#### 4.3 Tenant Switching Attempts
- **Test:** Attempt to switch tenant without permission
- **Expected:** Tenant context cleared, redirect to login
- **Validation:** Verify tenant switching requires re-authentication

#### 4.4 Franchisor-Only Access
- **Test:** Attempt to access franchise portal as staff
- **Expected:** Redirect to unauthorized
- **Validation:** Verify role-based navigation working

---

## Validation Scripts

### 1. Tenant Leakage Tests

**File:** `scripts/validation/p2_6_tenant_leakage.js`

**Tests:**
- Cross-tenant data access prevention
- Tenant context validation
- RLS enforcement
- Tenant switching prevention

---

### 2. UX Abuse Tests

**File:** `scripts/validation/p2_6_ux_abuse.js`

**Tests:**
- Invalid input handling
- Permission violations
- Race conditions
- Concurrent operations

---

### 3. Event Delay Tests

**File:** `scripts/validation/p2_6_event_delays.js`

**Tests:**
- Event processing delays
- Read model staleness
- Optimistic updates
- WebSocket disconnection

---

### 4. Permission Violation Tests

**File:** `scripts/validation/p2_6_permissions.js`

**Tests:**
- Role-based route access
- Unauthorized operations
- Tenant switching attempts
- Franchisor-only access

---

## Manual Testing Checklist

### Tenant Leakage
- [ ] Login as tenant A, verify cannot see tenant B data
- [ ] Verify all API calls include X-Tenant-ID header
- [ ] Attempt to modify tenant_id in request, verify 403
- [ ] Verify tenant context cleared on violation

### UX Abuse
- [ ] Submit invalid form data, verify validation
- [ ] Attempt to access unauthorized routes, verify redirect
- [ ] Rapidly click buttons, verify no duplicate requests
- [ ] Perform concurrent operations, verify no corruption

### Event Delays
- [ ] Simulate slow API responses, verify loading states
- [ ] Verify UI updates when events received
- [ ] Test optimistic updates revert on failure
- [ ] Test WebSocket fallback to polling

### Permissions
- [ ] Login as staff, verify cannot access franchise portal
- [ ] Login as franchisor, verify can access franchise portal
- [ ] Attempt unauthorized operations, verify 403 handling
- [ ] Verify role-based navigation working

---

## Success Criteria

**P2.6 is COMPLETE when:**

✅ Tenant leakage tests pass  
✅ UX abuse scenarios handled gracefully  
✅ Event delay scenarios handled gracefully  
✅ Permission violations handled correctly  
✅ All validation scripts pass  
✅ Manual testing checklist complete  

**Status:** ⏳ IN PROGRESS

---

## Next Steps

After P2.6 completion:

- ⏳ **SYNC J** - READY FOR SCALE
  - UI works with 10+ tenants
  - No shared UI state
  - Backend untouched
  - Replaceable frontend confirmed

---

**Documentation:** `docs/agents/phase_2_p2_6_validation_plan.md`  
**Status:** ⏳ IN PROGRESS


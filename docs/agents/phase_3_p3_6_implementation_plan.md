# P3.6 - Czech Market Integrations - Implementation Plan

**Status:** ⏳ IN PROGRESS  
**Date:** 2026-01-XX  
**Agent:** Integration Agent

---

## Overview

P3.6 implements Czech market-specific integrations:
- Payment providers (Stripe, GoPay, Comgate)
- Accounting systems (Money S3, Pohoda, ABRA Flexi)
- SMS gateways (BulkGate, GoSMS)

**Strategy:** Enhance existing adapters rather than creating new ones.

---

## Current State

### Existing Adapters ✅

1. **PaymentAdapter** (`packages/adapters/src/payment-adapter.js`)
   - ✅ Integrates with payments-microservice
   - ✅ Supports: card, cash, online, bank_transfer
   - ⏳ Needs: Czech payment provider support (Stripe, GoPay, Comgate)

2. **AccountingAdapter** (`packages/adapters/src/accounting-adapter.js`)
   - ✅ Stub implementations for Money S3, Pohoda, ABRA Flexi
   - ✅ Format mapping methods exist
   - ⏳ Needs: Actual API integration

3. **NotificationAdapter** (`packages/adapters/src/notification-adapter.js`)
   - ✅ Basic SMS/Email support
   - ⏳ Needs: Czech SMS gateway support (BulkGate, GoSMS)

---

## Implementation Tasks

### P3.6.1 - Payment Providers

**Objective:** Enhance PaymentAdapter to support Czech payment providers

**Tasks:**

1. **Stripe Integration** (MVP)
   - Add Stripe payment method support
   - Handle Stripe API responses
   - Map Stripe payment status to domain model
   - Support Stripe webhooks (optional)

2. **GoPay Integration** (Future)
   - Add GoPay payment method support
   - Handle GoPay API responses
   - Map GoPay payment status to domain model

3. **Comgate Integration** (Future)
   - Add Comgate payment method support
   - Handle Comgate API responses
   - Map Comgate payment status to domain model

4. **Payment Method Selection**
   - Allow tenant configuration of available payment methods
   - Support provider-specific configuration per tenant

**Implementation Approach:**
- Enhance `PaymentAdapter` to support provider-specific logic
- Use environment variables for provider configuration
- Maintain backward compatibility with existing payments-microservice

**Files to Update:**
- `packages/adapters/src/payment-adapter.js`

---

### P3.6.2 - Accounting Systems

**Objective:** Enhance AccountingAdapter with actual API integrations

**Tasks:**

1. **Money S3 Integration**
   - Implement Money S3 API client
   - Complete `mapToMoneyS3Format` method
   - Handle Money S3 API responses
   - Error handling and retries

2. **Pohoda Integration**
   - Implement Pohoda API client
   - Complete `mapToPohodaFormat` method
   - Handle Pohoda API responses
   - Error handling and retries

3. **ABRA Flexi Integration**
   - Implement ABRA Flexi API client
   - Complete `mapToAbraFlexiFormat` method
   - Handle ABRA Flexi API responses
   - Error handling and retries

4. **Transaction Export**
   - Batch export support
   - Idempotency handling
   - Export status tracking

**Implementation Approach:**
- Complete stub methods in `AccountingAdapter`
- Use BaseAdapter for HTTP requests
- Support tenant-specific accounting system configuration

**Files to Update:**
- `packages/adapters/src/accounting-adapter.js`

---

### P3.6.3 - SMS Gateways

**Objective:** Enhance NotificationAdapter to support Czech SMS gateways

**Tasks:**

1. **BulkGate Integration**
   - Implement BulkGate SMS API client
   - Handle BulkGate API responses
   - SMS delivery status tracking
   - Error handling

2. **GoSMS Integration**
   - Implement GoSMS API client
   - Handle GoSMS API responses
   - SMS delivery status tracking
   - Error handling

3. **SMS Gateway Selection**
   - Support multiple SMS gateways per tenant
   - Fallback mechanism (if one gateway fails, try another)
   - Gateway health checking

4. **SMS Delivery Tracking**
   - Track SMS delivery status
   - Handle delivery receipts
   - Retry failed SMS

**Implementation Approach:**
- Enhance `NotificationAdapter` with gateway-specific logic
- Support gateway selection via configuration
- Implement fallback mechanism

**Files to Update:**
- `packages/adapters/src/notification-adapter.js`

---

## Implementation Order

### Phase 1: Payment Providers (Week 1)
1. Enhance PaymentAdapter for Stripe
2. Test Stripe integration
3. Document GoPay/Comgate for future implementation

### Phase 2: Accounting Systems (Week 1-2)
1. Complete Money S3 integration
2. Complete Pohoda integration
3. Complete ABRA Flexi integration
4. Test all accounting systems

### Phase 3: SMS Gateways (Week 2)
1. Implement BulkGate integration
2. Implement GoSMS integration
3. Implement fallback mechanism
4. Test SMS delivery

---

## Environment Variables

**New Environment Variables:**

```bash
# Payment Providers
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOPAY_API_KEY=xxx
COMGATE_API_KEY=xxx

# Accounting Systems
MONEY_S3_API_URL=https://api.moneys3.cz
MONEY_S3_API_KEY=xxx
POHODA_API_URL=https://api.pohoda.cz
POHODA_API_KEY=xxx
ABRA_FLEXI_API_URL=https://api.abra.cz
ABRA_FLEXI_API_KEY=xxx

# SMS Gateways
BULKGATE_API_URL=https://api.bulkgate.com
BULKGATE_API_KEY=xxx
GOSMS_API_URL=https://api.gosms.cz
GOSMS_API_KEY=xxx
SMS_GATEWAY_FALLBACK=true
```

---

## Success Criteria

**P3.6 is COMPLETE when:**

✅ PaymentAdapter supports Stripe (MVP)  
✅ PaymentAdapter supports GoPay (future)  
✅ PaymentAdapter supports Comgate (future)  
✅ AccountingAdapter fully implements Money S3  
✅ AccountingAdapter fully implements Pohoda  
✅ AccountingAdapter fully implements ABRA Flexi  
✅ NotificationAdapter supports BulkGate  
✅ NotificationAdapter supports GoSMS  
✅ SMS fallback mechanism works  
✅ All integrations tested  
✅ Documentation updated  

**Status:** ⏳ IN PROGRESS

---

## Next Steps

1. Start with P3.6.1 - Payment Providers (Stripe MVP)
2. Then P3.6.2 - Accounting Systems
3. Finally P3.6.3 - SMS Gateways

---

**Documentation:** `docs/agents/phase_3_p3_6_implementation_plan.md`  
**Status:** ⏳ IN PROGRESS


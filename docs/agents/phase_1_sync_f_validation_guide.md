# SYNC F Validation Guide

## SYNC F — Business Flow Works

This validation ensures that all end-to-end business flows work correctly via events.

---

## Validation Criteria

SYNC F validates the following business flows:

1. **Booking → Visit → Order → Payment → Accounting**
   - Client registration
   - Appointment booking
   - Visit creation from appointment
   - Order creation from visit
   - Automatic payment processing
   - Order closure
   - Accounting export

2. **Inventory Reservation & Deduction**
   - Inventory deduction triggered by `order.created` event
   - Inventory tracking via events

3. **Notifications Sent**
   - SMS notifications triggered by `appointment.booked` event
   - Email notifications triggered by `client.registered` event
   - Manual notification testing

4. **BI Aggregation**
   - Daily sales aggregation from `order.created` and `payment.received` events
   - Client LTV aggregation from `order.closed` events
   - Master utilization aggregation from `appointment.completed` events

5. **Event-Driven Architecture**
   - All services communicate via events only
   - No direct database access between services
   - BI service aggregates from events only (read-only)

---

## Running SYNC F Validation

### Prerequisites

1. All services must be running (via `docker-compose up` or individually)
2. Database must be initialized with all migrations
3. NATS must be running and accessible
4. All services must be healthy (SYNC E should pass first)

### Command

```bash
node scripts/validation/sync_f_validation.js
```

### Environment Variables

```bash
BASE_URL=http://localhost          # Base URL for services
TEST_TENANT_ID=<uuid>              # Test tenant UUID
TEST_USER_ID=<uuid>                # Test user UUID
NATS_URL=nats://localhost:4222     # NATS connection URL
```

### Example

```bash
export BASE_URL=http://localhost
export TEST_TENANT_ID=550e8400-e29b-41d4-a716-446655440001
export TEST_USER_ID=550e8400-e29b-41d4-a716-446655440002
node scripts/validation/sync_f_validation.js
```

---

## Test Flow Details

### Test 1: Booking → Visit → Order → Payment Flow

This test validates the complete client lifecycle:

1. **Register Client** → `client.registered` event
2. **Create Master** → Master available for appointments
3. **Book Appointment** → `appointment.booked` event → SMS notification
4. **Start Visit** → Visit created from appointment
5. **Create Order** → `order.created` event → Automatic payment processing
6. **Check Payment** → Payment status verified
7. **Close Order** → `order.closed` event → Accounting export
8. **Check BI Aggregation** → Daily sales and LTV verified

**Expected Events:**

- `client.registered`
- `appointment.booked`
- `sms.sent` (via integration-hub-service)
- `order.created`
- `payment.initiated`
- `payment.received`
- `payment.confirmed`
- `order.closed`
- `accounting.export_completed` (via integration-hub-service)

### Test 2: Payment → Accounting Export Flow

Validates that `order.closed` events trigger accounting exports via `integration-hub-service`.

**Expected Flow:**

- `order.closed` → `accounting.export_completed`

### Test 3: Inventory Flow

Validates that `order.created` events trigger inventory deductions.

**Expected Flow:**

- `order.created` → `inventory.decreased`

### Test 4: Notifications Flow

Validates that notifications are sent via adapters:

- SMS on `appointment.booked`
- Email on `client.registered`
- Manual SMS testing

**Expected Flow:**

- `appointment.booked` → `sms.sent`
- `client.registered` → `email.sent`

### Test 5: Event-Driven Architecture Validation

Validates that:

- All services have event bus connections
- BI service aggregates from events only
- No direct database access between services

---

## Success Criteria

SYNC F validation **PASSES** if:

✅ All business flows complete end-to-end  
✅ All events are published and consumed correctly  
✅ BI aggregates are populated from events  
✅ Notifications are sent via adapters  
✅ Accounting exports are triggered  
✅ All services are event-driven  

SYNC F validation **FAILS** if:

❌ Any business flow fails to complete  
❌ Events are not published or consumed  
❌ BI aggregates are not populated  
❌ Services communicate directly (not via events)  

---

## Troubleshooting

### Services Not Responding

- Check that all services are running: `docker-compose ps`
- Check service health: `curl http://localhost:4110/health`
- Check service logs: `docker-compose logs <service-name>`

### Events Not Propagating

- Check NATS connection: `docker-compose logs nats`
- Check event bus subscriptions in service logs
- Verify event bus connection in service health checks

### BI Aggregates Not Populated

- Check BI service logs for event processing errors
- Verify events are being published (check service logs)
- Wait a few seconds for event processing (events are async)

### Payment Not Processing Automatically

- Check `payments-service` logs for `order.created` event handling
- Verify `PaymentAdapter` is configured correctly
- Check payment service health endpoint

### Accounting Export Not Working

- Check `integration-hub-service` logs for `order.closed` event handling
- Verify `AccountingAdapter` is configured correctly
- Check integration hub health endpoint

---

## Next Steps

After SYNC F validation passes:

1. **P1.7 — Validation & Hardening**
   - Contract validation
   - Tenant isolation tests
   - Failure scenarios

2. **SYNC G — MVP Ready**
   - New tenant onboarded via config
   - No code changes
   - Events observable
   - BI populated

---

## Related Documentation

- [Event Storming](../architecture/event-storming.md) - Event chains and business flows
- [Event Catalog](../architecture/event-catalog.md) - Event schemas and contracts
- [SYNC E Validation Guide](sync_e_validation_guide.md) - Previous validation step
- [Phase 1 Orchestrator](phase_1_orchestrator_master_prompt.md) - Phase 1 implementation plan

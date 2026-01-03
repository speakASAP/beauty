# SYNC F Validation Guide

## Overview

SYNC F validation ensures that end-to-end business flows work correctly via events. This validation is required after completing P1.4 (Core Domain Services), P1.5 (Adapters Layer), and P1.6 (BI Read Model).

## Validation Criteria

The following business flows must work end-to-end via events:

1. **Booking → Visit → Payment → Accounting**
   - Appointment is booked
   - Appointment is started and completed
   - Visit is created from appointment
   - Order is created from visit
   - Payment is processed for order
   - Accounting export is requested

2. **Inventory Reservation & Deduction**
   - Inventory service processes `inventory.decreased` events
   - Inventory levels are updated when orders are created

3. **Notifications Sent**
   - Integration hub service processes `appointment.booked` events
   - Notifications (SMS/Email) are sent via adapters

## Running the Validation

### Prerequisites

1. All services must be running (via `docker-compose up` or individually)
2. Database must be initialized with all migrations
3. NATS event bus must be running
4. External services (payments-microservice, notifications-microservice) should be available (or mocked)

### Environment Variables

```bash
export BASE_URL="http://localhost"  # Default: http://localhost
export TEST_TENANT_ID="550e8400-e29b-41d4-a716-446655440001"  # Test tenant UUID
export TEST_USER_ID="550e8400-e29b-41d4-a716-446655440002"  # Test user UUID
export TEST_CLIENT_ID="550e8400-e29b-41d4-a716-446655440003"  # Test client UUID
export TEST_MASTER_ID="550e8400-e29b-41d4-a716-446655440004"  # Test master UUID
```

### Execute Validation

```bash
node scripts/validation/sync_f_validation.js
```

## What the Validation Tests

### Test 1: Booking → Visit → Payment → Accounting Flow

1. Creates an appointment via `POST /appointments`
2. Starts the appointment via `POST /appointments/:id/start`
3. Completes the appointment via `POST /appointments/:id/complete`
4. Creates a visit from the appointment via `POST /visits`
5. Creates an order from the visit via `POST /orders`
6. Processes payment for the order via `POST /payments`
7. Verifies accounting export was requested (checks integration-hub-service health)
8. Verifies BI aggregates were updated (queries BI service)

### Test 2: Inventory Reservation & Deduction Flow

1. Verifies inventory service is healthy
2. Verifies inventory service can process `inventory.decreased` events
3. Note: Inventory deduction is triggered by `order.created` events

### Test 3: Notifications Flow

1. Verifies integration hub service is healthy
2. Verifies integration hub service can process `appointment.booked` events
3. Note: Notifications are sent when `appointment.booked` events are received

### Test 4: Event Flow Verification

1. Verifies BI service is connected to event bus
2. Verifies all services are healthy and can process events
3. Checks event bus connectivity for all services

## Expected Results

### Success Criteria

- ✅ All tests pass
- ✅ No failed validations
- ✅ All business flows complete successfully
- ✅ Events are published and consumed correctly
- ✅ BI aggregates are updated
- ✅ Accounting export is requested
- ✅ Notifications are processed

### Warnings

The validation may show warnings for:

- Services in "degraded" state (external services unavailable)
- BI aggregates not yet updated (may need more time for event processing)
- Integration hub service health check failures (external services may be unavailable)

### Failures

The validation will fail if:

- Services are not healthy
- Business flows cannot complete
- Events are not published or consumed
- Required endpoints are missing
- Database errors occur

## Troubleshooting

### Services Not Healthy

1. Check service logs: `docker-compose logs <service-name>`
2. Verify database connection: `docker-compose exec database psql -U beauty_user -d beauty_platform`
3. Verify NATS connection: `docker-compose logs nats`
4. Check environment variables: `docker-compose config`

### Events Not Processing

1. Check NATS connectivity: `docker-compose logs nats`
2. Verify event bus subscriptions: Check service logs for subscription confirmations
3. Check event processing logs: Look for errors in service logs
4. Verify tenant context: Ensure `X-Tenant-ID` header is set correctly

### BI Aggregates Not Updated

1. Check BI service logs: `docker-compose logs bi-service`
2. Verify event processing: Check `bi.event_processing_log` table
3. Wait longer: Event processing may take a few seconds
4. Check event subscriptions: Verify BI service is subscribed to all event types

### Accounting Export Not Triggered

1. Check integration-hub-service logs: `docker-compose logs integration-hub-service`
2. Verify event subscriptions: Check if service is subscribed to `payment.received`
3. Check external service availability: Verify `ACCOUNTING_SERVICE_URL` is configured
4. Review adapter configuration: Check `AccountingAdapter` initialization

## Next Steps

After SYNC F validation passes:

1. ✅ Proceed to **P1.7 — Validation & Hardening**
2. ✅ Run contract validation tests
3. ✅ Run tenant isolation tests
4. ✅ Test failure scenarios
5. ✅ Prepare for **SYNC G — MVP READY**

## Related Documentation

- [Phase 1 Orchestrator Master Prompt](../agents/phase_1_orchestrator_master_prompt.md)
- [Event Storming](../architecture/event-storming.md)
- [SYNC E Validation Guide](./sync_e_validation_guide.md)

# Event Bus Package

Shared event bus library for beauty platform.

## Features

- NATS integration
- Event schema validation (Phase 0 Event Catalog compliance)
- Event serialization/deserialization
- Event publishing and subscribing
- Mandatory field validation (tenant_id, aggregate_id, etc.)

## Usage

```javascript
import { createEventBus } from '@beauty/event-bus';

// Create event bus instance
const eventBus = createEventBus(process.env.NATS_URL);

// Connect
await eventBus.connect();

// Publish event (event_id and occurred_at are auto-generated if not provided)
// Option 1: Manual metadata
await eventBus.publish({
  event_type: 'appointment.booked',
  event_version: 'v1',
  tenant_id: '550e8400-e29b-41d4-a716-446655440001', // MANDATORY
  aggregate_id: appointmentId, // MANDATORY
  occurred_at: new Date().toISOString(), // Optional, defaults to now
  payload: {
    appointment_id: appointmentId,
    client_id: clientId,
    master_id: masterId,
    starts_at: '2024-01-01T14:00:00Z',
    duration_minutes: 60
  },
  metadata: {
    user_id: userId,
    correlation_id: correlationId
  }
});

// Option 2: Automatic correlation_id injection from tenant context
await eventBus.publish({
  event_type: 'appointment.booked',
  event_version: 'v1',
  tenant_id: tenantContext.tenantId,
  aggregate_id: appointmentId,
  payload: { /* ... */ }
}, {}, tenantContext); // Pass tenantContext as 3rd parameter for auto-injection

// Subscribe to events (wildcard pattern)
await eventBus.subscribe('appointment.*', async (event) => {
  console.log('Received event:', event.event_type);
  // Process event
  // Note: Consumer should filter by tenant_id if needed
  if (event.tenant_id !== expectedTenantId) {
    return; // Skip events from other tenants
  }
});

// Subscribe to specific event type
await eventBus.subscribe('appointment.booked', async (event) => {
  console.log('Appointment booked:', event.payload);
  // Process event
});

// Disconnect
await eventBus.disconnect();
```

## Event Schema

All events must follow Phase 0 Event Catalog schema:

- `event_id` (uuid, required)
- `event_type` (string, required)
- `event_version` (string, required)
- `tenant_id` (uuid, required) - MANDATORY
- `aggregate_id` (uuid, required)
- `occurred_at` (ISO 8601 UTC, required)
- `metadata` (object, optional)
- `payload` (object, required)

## Validation

Events are automatically validated before publishing. Invalid events are rejected with detailed error messages.


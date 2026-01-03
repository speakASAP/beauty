# Event Catalog (immutable)

> This document is immutable
---

## Related Documentation

- [Domain Glossary](domain-glossary.md) - Domain terms used in events
- [Event Storming](event-storming.md) - Event chains and business flows
- [Technical Design Document](tdd.md) - Architectural foundation
- [Tenant Model](tenant-model.md) - Tenant isolation rules

---

## Event Schema Standard

All events MUST contain the following mandatory fields:

- `event_id` (uuid, required) - Unique event identifier
- `event_type` (string, required) - Event type name (e.g., "appointment.booked")
- `event_version` (string, required) - Event version (e.g., "v1", "v2")
- `tenant_id` (uuid, required) - Tenant UUID (MANDATORY for all domain events)
- `aggregate_id` (uuid, required) - ID of the aggregate root
- `occurred_at` (ISO 8601 UTC timestamp, required) - When the event occurred
- `metadata` (object, optional) - Additional metadata (user_id, correlation_id, causation_id)
- `payload` (object, required) - Domain-specific event data

### Event Versioning Rules

- Version format: "v1", "v2", etc.
- Breaking changes require new version
- Consumers must handle multiple versions
- Backward compatibility maintained for at least 2 versions
- Version is part of event_type or separate field (we use separate `event_version` field)

### Aggregate Root Mapping

Each event belongs to an aggregate root:

- `appointment.*` → `appointment_id`
- `order.*` → `order_id`
- `payment.*` → `payment_id`
- `inventory.*` → `inventory_item_id` or `movement_id`
- `client.*` → `client_id`
- `visit.*` → `visit_id`
- `slot.*` → `slot_id`
- `notification.*` → `notification_id`
- `master.*` → `master_id`

---

## Core Events

### Client Events

#### client.registered (v1)

**Aggregate Root:** `client_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "client.registered",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440002",
  "occurred_at": "2024-01-01T12:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440004",
    "causation_id": null
  },
  "payload": {
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "first_name": "Jan",
    "last_name": "Novák",
    "phone": "+420123456789",
    "email": "jan.novak@example.com",
    "gdpr_consent": true,
    "gdpr_consent_date": "2024-01-01T12:00:00Z"
  }
}
```

#### client.visit_recorded (v1)

**Aggregate Root:** `client_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440005",
  "event_type": "client.visit_recorded",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440002",
  "occurred_at": "2024-01-01T14:30:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440004",
    "causation_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "payload": {
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "visit_id": "550e8400-e29b-41d4-a716-446655440007",
    "visit_date": "2024-01-01T14:00:00Z",
    "total_amount": 1500,
    "services_count": 2
  }
}
```

---

### Appointment Events

#### appointment.booked (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440008",
  "event_type": "appointment.booked",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T10:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": null
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "master_id": "550e8400-e29b-41d4-a716-446655440011",
    "starts_at": "2024-01-01T14:00:00Z",
    "duration_minutes": 60,
    "service_id": "550e8400-e29b-41d4-a716-446655440012",
    "slot_id": "550e8400-e29b-41d4-a716-446655440013"
  }
}
```

#### appointment.confirmed (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440014",
  "event_type": "appointment.confirmed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T10:05:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440008"
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "confirmed_at": "2024-01-01T10:05:00Z",
    "confirmation_method": "sms"
  }
}
```

#### appointment.started (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440015",
  "event_type": "appointment.started",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T14:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440014"
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "started_at": "2024-01-01T14:00:00Z"
  }
}
```

#### appointment.completed (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440016",
  "event_type": "appointment.completed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T15:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440015"
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "completed_at": "2024-01-01T15:00:00Z",
    "actual_duration_minutes": 60
  }
}
```

#### appointment.cancelled (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440017",
  "event_type": "appointment.cancelled",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T11:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440008"
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "cancelled_at": "2024-01-01T11:00:00Z",
    "cancellation_reason": "client_request",
    "slot_id": "550e8400-e29b-41d4-a716-446655440013"
  }
}
```

#### appointment.no_show (v1)

**Aggregate Root:** `appointment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440018",
  "event_type": "appointment.no_show",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440009",
  "occurred_at": "2024-01-01T14:15:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440014"
  },
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "no_show_at": "2024-01-01T14:15:00Z",
    "scheduled_start": "2024-01-01T14:00:00Z"
  }
}
```

---

### Visit Events

#### visit.started (v1)

**Aggregate Root:** `visit_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440019",
  "event_type": "visit.started",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440020",
  "occurred_at": "2024-01-01T14:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": null
  },
  "payload": {
    "visit_id": "550e8400-e29b-41d4-a716-446655440020",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "master_id": "550e8400-e29b-41d4-a716-446655440011",
    "started_at": "2024-01-01T14:00:00Z",
    "is_walk_in": true,
    "appointment_id": null
  }
}
```

#### visit.closed (v1)

**Aggregate Root:** `visit_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440022",
  "event_type": "visit.closed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440020",
  "occurred_at": "2024-01-01T15:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440016"
  },
  "payload": {
    "visit_id": "550e8400-e29b-41d4-a716-446655440020",
    "closed_at": "2024-01-01T15:00:00Z",
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009"
  }
}
```

---

### Order Events

#### order.created (v1)

**Aggregate Root:** `order_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440023",
  "event_type": "order.created",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440024",
  "occurred_at": "2024-01-01T15:05:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440022"
  },
  "payload": {
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "visit_id": "550e8400-e29b-41d4-a716-446655440020",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "total_amount": 1500,
    "vat_amount": 300,
    "items": [
      {
        "order_item_id": "550e8400-e29b-41d4-a716-446655440025",
        "service_id": "550e8400-e29b-41d4-a716-446655440012",
        "product_id": null,
        "quantity": 1,
        "unit_price": 1000,
        "vat_rate": 21
      },
      {
        "order_item_id": "550e8400-e29b-41d4-a716-446655440026",
        "service_id": null,
        "product_id": "550e8400-e29b-41d4-a716-446655440027",
        "quantity": 1,
        "unit_price": 500,
        "vat_rate": 21
      }
    ]
  }
}
```

#### order.closed (v1)

**Aggregate Root:** `order_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440065",
  "event_type": "order.closed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440024",
  "occurred_at": "2024-01-01T15:20:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440030"
  },
  "payload": {
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "closed_at": "2024-01-01T15:20:00Z",
    "final_total_amount": 1500,
    "final_vat_amount": 300,
    "payment_status": "completed",
    "all_payments_received": true
  }
}
```

---

### Payment Events

#### payment.initiated (v1)

**Aggregate Root:** `payment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440028",
  "event_type": "payment.initiated",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440029",
  "occurred_at": "2024-01-01T15:10:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440023"
  },
  "payload": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440029",
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "amount": 1500,
    "method": "card"
  }
}
```

#### payment.received (v1)

**Aggregate Root:** `payment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440030",
  "event_type": "payment.received",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440029",
  "occurred_at": "2024-01-01T15:11:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440028"
  },
  "payload": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440029",
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "amount": 1500,
    "method": "card",
    "received_at": "2024-01-01T15:11:00Z",
    "transaction_id": "txn_123456789"
  }
}
```

#### payment.confirmed (v1)

**Aggregate Root:** `payment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440031",
  "event_type": "payment.confirmed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440029",
  "occurred_at": "2024-01-01T15:12:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440030"
  },
  "payload": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440029",
    "confirmed_at": "2024-01-01T15:12:00Z"
  }
}
```

#### payment.failed (v1)

**Aggregate Root:** `payment_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440032",
  "event_type": "payment.failed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440029",
  "occurred_at": "2024-01-01T15:11:30Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440028"
  },
  "payload": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440029",
    "failed_at": "2024-01-01T15:11:30Z",
    "failure_reason": "insufficient_funds"
  }
}
```

---

### Inventory Events

#### inventory.decreased (v1)

**Aggregate Root:** `movement_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440033",
  "event_type": "inventory.decreased",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440034",
  "occurred_at": "2024-01-01T15:15:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440022"
  },
  "payload": {
    "movement_id": "550e8400-e29b-41d4-a716-446655440034",
    "item_id": "550e8400-e29b-41d4-a716-446655440035",
    "quantity": 2,
    "reason": "visit_completed",
    "visit_id": "550e8400-e29b-41d4-a716-446655440020",
    "previous_quantity": 10,
    "new_quantity": 8
  }
}
```

#### inventory.increased (v1)

**Aggregate Root:** `movement_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440036",
  "event_type": "inventory.increased",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440037",
  "occurred_at": "2024-01-01T16:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440038",
    "causation_id": "550e8400-e29b-41d4-a716-446655440039"
  },
  "payload": {
    "movement_id": "550e8400-e29b-41d4-a716-446655440037",
    "item_id": "550e8400-e29b-41d4-a716-446655440035",
    "quantity": 5,
    "reason": "purchase",
    "supplier_id": "550e8400-e29b-41d4-a716-446655440040",
    "previous_quantity": 8,
    "new_quantity": 13
  }
}
```

#### inventory.adjusted (v1)

**Aggregate Root:** `movement_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440041",
  "event_type": "inventory.adjusted",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440042",
  "occurred_at": "2024-01-01T17:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440043",
    "causation_id": "550e8400-e29b-41d4-a716-446655440044"
  },
  "payload": {
    "movement_id": "550e8400-e29b-41d4-a716-446655440042",
    "item_id": "550e8400-e29b-41d4-a716-446655440035",
    "quantity_difference": -1,
    "reason": "audit_adjustment",
    "audit_id": "550e8400-e29b-41d4-a716-446655440044",
    "previous_quantity": 13,
    "new_quantity": 12,
    "adjustment_note": "Physical count discrepancy"
  }
}
```

#### inventory.item.received (v1)

**Aggregate Root:** `movement_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440045",
  "event_type": "inventory.item.received",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440046",
  "occurred_at": "2024-01-01T16:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440038",
    "causation_id": null
  },
  "payload": {
    "movement_id": "550e8400-e29b-41d4-a716-446655440046",
    "item_id": "550e8400-e29b-41d4-a716-446655440035",
    "quantity": 5,
    "supplier_id": "550e8400-e29b-41d4-a716-446655440040",
    "received_at": "2024-01-01T16:00:00Z"
  }
}
```

#### inventory.audit.started (v1)

**Aggregate Root:** `audit_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440047",
  "event_type": "inventory.audit.started",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440044",
  "occurred_at": "2024-01-01T17:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440043",
    "causation_id": null
  },
  "payload": {
    "audit_id": "550e8400-e29b-41d4-a716-446655440044",
    "started_at": "2024-01-01T17:00:00Z",
    "auditor_id": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

---

### Slot Events

#### slot.requested (v1)

**Aggregate Root:** `slot_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440048",
  "event_type": "slot.requested",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440013",
  "occurred_at": "2024-01-01T09:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": null
  },
  "payload": {
    "slot_id": "550e8400-e29b-41d4-a716-446655440013",
    "master_id": "550e8400-e29b-41d4-a716-446655440011",
    "requested_start": "2024-01-01T14:00:00Z",
    "requested_duration_minutes": 60,
    "service_id": "550e8400-e29b-41d4-a716-446655440012"
  }
}
```

#### slot.released (v1)

**Aggregate Root:** `slot_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440049",
  "event_type": "slot.released",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440013",
  "occurred_at": "2024-01-01T11:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440017"
  },
  "payload": {
    "slot_id": "550e8400-e29b-41d4-a716-446655440013",
    "released_at": "2024-01-01T11:00:00Z",
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009"
  }
}
```

---

### Master Events

#### master.created (v1)

**Aggregate Root:** `master_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440066",
  "event_type": "master.created",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440011",
  "occurred_at": "2024-01-01T08:00:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440067",
    "causation_id": null
  },
  "payload": {
    "master_id": "550e8400-e29b-41d4-a716-446655440011",
    "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
    "first_name": "Marie",
    "last_name": "Nováková",
    "email": "marie.novakova@salon.example.com",
    "phone": "+420987654321",
    "specializations": ["haircut", "coloring"],
    "created_at": "2024-01-01T08:00:00Z"
  }
}
```

---

### Availability Events

#### availability.checked (v1)

**Aggregate Root:** `slot_id` (or null if no specific slot)

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440050",
  "event_type": "availability.checked",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440013",
  "occurred_at": "2024-01-01T09:05:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440002",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440048"
  },
  "payload": {
    "master_id": "550e8400-e29b-41d4-a716-446655440011",
    "requested_start": "2024-01-01T14:00:00Z",
    "requested_duration_minutes": 60,
    "is_available": true,
    "slot_id": "550e8400-e29b-41d4-a716-446655440013"
  }
}
```

---

### Notification Events

#### notification.sent (v1)

**Aggregate Root:** `notification_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440051",
  "event_type": "notification.sent",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440052",
  "occurred_at": "2024-01-01T10:10:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440008"
  },
  "payload": {
    "notification_id": "550e8400-e29b-41d4-a716-446655440052",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "channel": "sms",
    "message": "Your appointment is confirmed for 2024-01-01 at 14:00",
    "sent_at": "2024-01-01T10:10:00Z",
    "status": "sent"
  }
}
```

#### sms.sent (v1)

**Aggregate Root:** `notification_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440053",
  "event_type": "sms.sent",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440052",
  "occurred_at": "2024-01-01T10:10:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440008"
  },
  "payload": {
    "notification_id": "550e8400-e29b-41d4-a716-446655440052",
    "phone": "+420123456789",
    "message": "Your appointment is confirmed for 2024-01-01 at 14:00",
    "sent_at": "2024-01-01T10:10:00Z",
    "status": "sent"
  }
}
```

---

### Penalty Events (Post-MVP)

#### penalty.applied (v1)

**Aggregate Root:** `penalty_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440054",
  "event_type": "penalty.applied",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440055",
  "occurred_at": "2024-01-01T14:30:00Z",
  "metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440010",
    "causation_id": "550e8400-e29b-41d4-a716-446655440018"
  },
  "payload": {
    "penalty_id": "550e8400-e29b-41d4-a716-446655440055",
    "appointment_id": "550e8400-e29b-41d4-a716-446655440009",
    "client_id": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 500,
    "reason": "no_show",
    "applied_at": "2024-01-01T14:30:00Z"
  }
}
```

---

### Accounting Events

#### accounting.export_requested (v1)

**Aggregate Root:** `export_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440062",
  "event_type": "accounting.export_requested",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440063",
  "occurred_at": "2024-01-01T15:12:00Z",
  "metadata": {
    "user_id": null,
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440030"
  },
  "payload": {
    "export_id": "550e8400-e29b-41d4-a716-446655440063",
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "payment_id": "550e8400-e29b-41d4-a716-446655440029",
    "requested_at": "2024-01-01T15:12:00Z"
  }
}
```

#### accounting.export_completed (v1)

**Aggregate Root:** `export_id`

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440064",
  "event_type": "accounting.export_completed",
  "event_version": "v1",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440063",
  "occurred_at": "2024-01-01T15:13:00Z",
  "metadata": {
    "user_id": null,
    "correlation_id": "550e8400-e29b-41d4-a716-446655440021",
    "causation_id": "550e8400-e29b-41d4-a716-446655440062"
  },
  "payload": {
    "export_id": "550e8400-e29b-41d4-a716-446655440063",
    "order_id": "550e8400-e29b-41d4-a716-446655440024",
    "completed_at": "2024-01-01T15:13:00Z",
    "external_system": "money_s3",
    "external_reference": "invoice_12345"
  }
}
```

---

## Event Validation Rules

1. **Mandatory Fields Check:**
   - All events MUST have: `event_id`, `event_type`, `event_version`, `tenant_id`, `aggregate_id`, `occurred_at`
   - Missing any mandatory field → reject event

2. **Tenant ID Validation:**
   - `tenant_id` MUST be valid UUID (MANDATORY for all domain events)
   - `tenant_id` MUST match tenant context from request

3. **Aggregate ID Validation:**
   - `aggregate_id` MUST be valid UUID
   - `aggregate_id` MUST match the aggregate root for the event type

4. **Timestamp Validation:**
   - `occurred_at` MUST be ISO 8601 UTC timestamp
   - `occurred_at` MUST be in the past (not future)

5. **Version Validation:**
   - `event_version` MUST match supported versions
   - Unknown version → reject event

---

## Event Consumer Rules

1. **Idempotency:**
   - Consumers MUST be idempotent
   - Same `event_id` processed multiple times → same result

2. **Version Handling:**
   - Consumers MUST handle multiple event versions
   - Consumers MUST maintain backward compatibility for at least 2 versions

3. **Error Handling:**
   - Consumer errors MUST NOT block event processing
   - Failed events MUST be logged and retried

4. **Tenant Isolation:**
   - Consumers MUST respect tenant_id
   - Cross-tenant event processing is forbidden

---

## Change Log

### Version 1.0 (Frozen - 2024)

- Initial complete event catalog
- All events from event-storming.md documented
- All mandatory fields defined
- Event versioning rules established
- Aggregate root mapping documented
- Ready for Phase 0 freeze

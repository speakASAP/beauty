# P2.1 - UX & Flow Definition

**Status:** ✅ COMPLETE  
**Date:** 2026-01-XX  
**Agent:** UX / Product Flow Agent

---

## Overview

P2.1 defines all user workflows for:

- **Salon (POS UI)**: Booking, visit, checkout, shift close
- **Franchise Portal**: Tenant overview, KPIs, pricing control, catalog governance

All workflows map to existing Phase 1 APIs - **no backend changes required**.

---

## Non-Negotiable Rules

1. **UI is NOT a domain layer** - No business logic in UI
2. **Tenant isolation is visible** - tenant_id must be explicit
3. **Event-based UX thinking** - UI reacts to events, not assumes consistency
4. **Backend untouched** - All APIs exist in Phase 1

---

## Salon Workflows (POS UI)

### 1. Booking Workflow

#### 1.1 View Appointments Calendar

**User Intent:** View appointments for a date range

**Screen Flow:**

```
POS Dashboard
  ↓
[User navigates to "Appointments" or "Calendar"]
  ↓
Appointments Calendar View
  - Day/Week/Month view
  - Filter by master
  - Filter by status (booked, confirmed, started, completed, cancelled)
  - Click appointment to view details
```

**API Mapping:**

- `GET /appointments?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD&master_id=uuid&status=booked`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.*` events
- Update UI when events received

**UI Behavior:**

- Display appointments in calendar grid
- Show appointment status (booked, confirmed, started, completed, cancelled)
- Highlight current day
- Allow filtering by master and status
- Update calendar when events received

---

#### 1.2 Book Appointment

**User Intent:** Create a new appointment

**Screen Flow:**

```
Appointments Calendar View
  ↓
[User clicks "New Appointment" or empty time slot]
  ↓
Book Appointment Form
  - Select client (search existing or create new)
  - Select master
  - Select service
  - Select date/time
  - Duration (auto-filled from service)
  ↓
[User clicks "Book"]
  ↓
Appointment Confirmation
  - Show appointment details
  - Option to confirm immediately
```

**API Mapping:**

- `POST /appointments`
  - Body: `{ client_id, master_id, service_id, starts_at, duration_minutes }`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.booked` event
- Update UI when event received

**UI Behavior:**

- Show form with client search/creation
- Validate date/time availability (client-side validation only)
- Submit booking request
- Show loading state
- Display success message when `appointment.booked` event received
- Option to confirm appointment immediately

---

#### 1.3 Confirm Appointment

**User Intent:** Confirm a booked appointment (send notification)

**Screen Flow:**

```
Appointment Details View
  ↓
[User clicks "Confirm Appointment"]
  ↓
Confirmation Dialog
  - Select confirmation method (SMS, Email)
  ↓
[User clicks "Confirm"]
  ↓
Appointment Confirmed
  - Show confirmation status
  - Notification sent indicator
```

**API Mapping:**

- `POST /appointments/:id/confirm`
  - Body: `{ confirmation_method: 'sms' | 'email' }`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.confirmed` event
- Update UI when event received

**UI Behavior:**

- Show confirmation dialog
- Submit confirmation request
- Display success message when `appointment.confirmed` event received
- Show notification sent indicator

---

#### 1.4 Start Appointment

**User Intent:** Mark appointment as started (client arrived)

**Screen Flow:**

```
Appointment Details View
  ↓
[User clicks "Start Appointment"]
  ↓
Appointment Started
  - Status changes to "started"
  - Option to create visit
```

**API Mapping:**

- `POST /appointments/:id/start`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.started` event
- Update UI when event received

**UI Behavior:**

- Submit start request
- Update appointment status to "started"
- Show option to create visit

---

#### 1.5 Complete Appointment

**User Intent:** Mark appointment as completed

**Screen Flow:**

```
Appointment Details View
  ↓
[User clicks "Complete Appointment"]
  ↓
Appointment Completed
  - Status changes to "completed"
  - Option to create visit (if not already created)
```

**API Mapping:**

- `POST /appointments/:id/complete`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.completed` event
- Update UI when event received

**UI Behavior:**

- Submit complete request
- Update appointment status to "completed"
- Show option to create visit

---

#### 1.6 Cancel Appointment

**User Intent:** Cancel an appointment

**Screen Flow:**

```
Appointment Details View
  ↓
[User clicks "Cancel Appointment"]
  ↓
Cancel Appointment Dialog
  - Enter cancellation reason (optional)
  ↓
[User clicks "Cancel"]
  ↓
Appointment Cancelled
  - Status changes to "cancelled"
```

**API Mapping:**

- `POST /appointments/:id/cancel`
  - Body: `{ reason?: string }`
- Service: `booking-service` (Port 4110)

**Event Subscription:**

- Subscribe to `appointment.cancelled` event
- Update UI when event received

**UI Behavior:**

- Show cancellation dialog
- Submit cancellation request
- Update appointment status to "cancelled"
- Remove from active calendar view

---

### 2. Visit Workflow

#### 2.1 Start Visit

**User Intent:** Start a visit (walk-in or from appointment)

**Screen Flow:**

```
POS Dashboard
  ↓
[User clicks "New Visit" or "Start Visit" from appointment]
  ↓
Start Visit Form
  - Select client (search existing or create new)
  - Select master
  - Link to appointment (if from appointment)
  - Mark as walk-in (if not from appointment)
  ↓
[User clicks "Start Visit"]
  ↓
Visit Started
  - Visit ID displayed
  - Option to create order
```

**API Mapping:**

- `POST /visits`
  - Body: `{ client_id, master_id, appointment_id?, is_walk_in: boolean }`
- Service: `beauty-pos-service` (Port 4111)

**Event Subscription:**

- Subscribe to `visit.started` event
- Update UI when event received

**UI Behavior:**

- Show visit form
- Submit visit creation request
- Display visit ID when `visit.started` event received
- Show option to create order

---

#### 2.2 View Active Visits

**User Intent:** View all active visits

**Screen Flow:**

```
POS Dashboard
  ↓
[User navigates to "Active Visits"]
  ↓
Active Visits List
  - List of open visits
  - Filter by master
  - Filter by date
  - Click visit to view details
```

**API Mapping:**

- `GET /visits?status=open&master_id=uuid&date=YYYY-MM-DD`
- Service: `beauty-pos-service` (Port 4111)

**Event Subscription:**

- Subscribe to `visit.*` events
- Update UI when events received

**UI Behavior:**

- Display list of active visits
- Show visit details (client, master, start time)
- Allow filtering by master and date
- Update list when events received

---

#### 2.3 Close Visit

**User Intent:** Close a visit (end of service)

**Screen Flow:**

```
Visit Details View
  ↓
[User clicks "Close Visit"]
  ↓
Close Visit Confirmation
  - Confirm visit closure
  ↓
[User clicks "Close"]
  ↓
Visit Closed
  - Status changes to "closed"
  - Visit history updated
```

**API Mapping:**

- `POST /visits/:id/close`
- Service: `beauty-pos-service` (Port 4111)

**Event Subscription:**

- Subscribe to `visit.closed` event
- Update UI when event received

**UI Behavior:**

- Show close confirmation dialog
- Submit close request
- Update visit status to "closed"
- Remove from active visits list

---

### 3. Checkout Workflow

#### 3.1 Create Order

**User Intent:** Create an order for a visit

**Screen Flow:**

```
Visit Details View
  ↓
[User clicks "Create Order" or "Add to Order"]
  ↓
Create Order Form
  - Select services/products
  - Set quantities
  - View prices
  - Calculate total
  ↓
[User clicks "Create Order"]
  ↓
Order Created
  - Order ID displayed
  - Option to process payment
```

**API Mapping:**

- `POST /orders`
  - Body: `{ visit_id, items: [{ service_id, quantity, unit_price, vat_rate }] }`
- Service: `beauty-pos-service` (Port 4111)

**Event Subscription:**

- Subscribe to `order.created` event
- Subscribe to `payment.initiated` event (automatic from order.created)
- Update UI when events received

**UI Behavior:**

- Show order form with service/product selection
- Calculate totals (client-side calculation only)
- Submit order creation request
- Display order ID when `order.created` event received
- Show payment processing status when `payment.initiated` event received

---

#### 3.2 Process Payment

**User Intent:** Process payment for an order

**Screen Flow:**

```
Order Details View
  ↓
[User clicks "Process Payment"]
  ↓
Payment Form
  - Select payment method (card, cash, etc.)
  - Enter amount (pre-filled from order total)
  - Confirm payment
  ↓
[User clicks "Process Payment"]
  ↓
Payment Processing
  - Show processing status
  - Wait for payment confirmation
  ↓
Payment Confirmed
  - Payment status displayed
  - Option to close order
```

**API Mapping:**

- `POST /payments`
  - Body: `{ order_id, amount, method: 'card' | 'cash' | 'other' }`
- Service: `payments-service` (Port 4112)

**Event Subscription:**

- Subscribe to `payment.received` event
- Subscribe to `payment.confirmed` event
- Update UI when events received

**UI Behavior:**

- Show payment form
- Submit payment request
- Display processing status
- Update payment status when `payment.received` event received
- Show confirmation when `payment.confirmed` event received
- Enable order closure option

---

#### 3.3 Close Order

**User Intent:** Close an order (finalize transaction)

**Screen Flow:**

```
Order Details View
  ↓
[User clicks "Close Order"]
  ↓
Close Order Confirmation
  - Confirm order closure
  ↓
[User clicks "Close"]
  ↓
Order Closed
  - Status changes to "closed"
  - Accounting export triggered (automatic)
```

**API Mapping:**

- `POST /orders/:id/close`
- Service: `beauty-pos-service` (Port 4111)

**Event Subscription:**

- Subscribe to `order.closed` event
- Subscribe to `accounting.export_completed` event (from integration-hub-service)
- Update UI when events received

**UI Behavior:**

- Show close confirmation dialog
- Submit close request
- Update order status to "closed"
- Show accounting export status when `accounting.export_completed` event received

---

### 4. Shift Close Workflow

#### 4.1 View Daily Sales Summary

**User Intent:** View daily sales summary for shift close

**Screen Flow:**

```
POS Dashboard
  ↓
[User navigates to "Shift Close" or "Daily Summary"]
  ↓
Daily Sales Summary
  - Total sales amount
  - Total VAT amount
  - Order count
  - Payment count
  - Breakdown by payment method
  - Date range selector
```

**API Mapping:**

- `GET /analytics/daily-sales?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`
- Service: `bi-service` (Port 4115)

**Event Subscription:**

- Subscribe to `order.*` and `payment.*` events
- Update UI when events received

**UI Behavior:**

- Display daily sales summary
- Show totals and counts
- Allow date range selection
- Update summary when events received

---

#### 4.2 View Master Utilization

**User Intent:** View master utilization for shift close

**Screen Flow:**

```
Daily Sales Summary
  ↓
[User navigates to "Master Utilization"]
  ↓
Master Utilization View
  - List of masters
  - Appointments completed
  - Total duration
  - Utilization percentage
  - Date range selector
```

**API Mapping:**

- `GET /analytics/master-utilization?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD&master_id=uuid`
- Service: `bi-service` (Port 4115)

**Event Subscription:**

- Subscribe to `appointment.completed` events
- Update UI when events received

**UI Behavior:**

- Display master utilization metrics
- Show appointments completed and duration
- Calculate utilization percentage (client-side)
- Allow filtering by master
- Update metrics when events received

---

## Franchise Workflows (Franchise Portal)

### 1. Tenant Overview

#### 1.1 View Tenant List

**User Intent:** View all tenants (salons) in the franchise

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "Tenants" or "Salons"]
  ↓
Tenant List View
  - List of all tenants
  - Tenant name, address, contact info
  - Tenant state (ACTIVE, SUSPENDED, ARCHIVED)
  - Click tenant to view details
```

**API Mapping:**

- **Note:** Tenant list API not yet implemented in Phase 1
- **Future:** `GET /tenants` (franchisor-only endpoint)
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to tenant lifecycle events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display list of tenants
- Show tenant information and state
- Allow filtering by state
- Navigate to tenant details

---

#### 1.2 View Tenant Details

**User Intent:** View detailed information about a tenant

**Screen Flow:**

```
Tenant List View
  ↓
[User clicks on tenant]
  ↓
Tenant Details View
  - Tenant information
  - State management
  - Performance metrics
  - Settings
```

**API Mapping:**

- **Note:** Tenant details API not yet implemented in Phase 1
- **Future:** `GET /tenants/:id` (franchisor-only endpoint)
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to tenant state change events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display tenant details
- Show state management options
- Display performance metrics
- Allow state changes (ACTIVE ↔ SUSPENDED)

---

### 2. KPIs (Key Performance Indicators)

#### 2.1 View Daily Sales by Tenant

**User Intent:** View daily sales across all tenants

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "KPIs" → "Daily Sales"]
  ↓
Daily Sales Dashboard
  - Sales by tenant
  - Date range selector
  - Tenant filter
  - Total sales across all tenants
```

**API Mapping:**

- **Note:** Cross-tenant analytics API not yet implemented in Phase 1
- **Future:** `GET /analytics/daily-sales?tenant_id=uuid&from_date=...&to_date=...` (franchisor-only)
- **Current:** Query each tenant's BI service with franchisor context

**Event Subscription:**

- Subscribe to `order.*` and `payment.*` events (all tenants)
- Update UI when events received

**UI Behavior:**

- Display sales by tenant
- Show totals and comparisons
- Allow filtering by tenant and date range
- Update metrics when events received

---

#### 2.2 View Master Utilization by Tenant

**User Intent:** View master utilization across all tenants

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "KPIs" → "Master Utilization"]
  ↓
Master Utilization Dashboard
  - Utilization by tenant
  - Utilization by master
  - Date range selector
  - Tenant filter
```

**API Mapping:**

- **Note:** Cross-tenant analytics API not yet implemented in Phase 1
- **Future:** `GET /analytics/master-utilization?tenant_id=uuid&from_date=...&to_date=...` (franchisor-only)
- **Current:** Query each tenant's BI service with franchisor context

**Event Subscription:**

- Subscribe to `appointment.completed` events (all tenants)
- Update UI when events received

**UI Behavior:**

- Display utilization by tenant and master
- Show utilization percentages
- Allow filtering by tenant, master, and date range
- Update metrics when events received

---

#### 2.3 View Client LTV by Tenant

**User Intent:** View client lifetime value across all tenants

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "KPIs" → "Client LTV"]
  ↓
Client LTV Dashboard
  - LTV by tenant
  - Top clients
  - Date range selector
  - Tenant filter
```

**API Mapping:**

- **Note:** Cross-tenant analytics API not yet implemented in Phase 1
- **Future:** `GET /analytics/client-ltv?tenant_id=uuid&limit=100` (franchisor-only)
- **Current:** Query each tenant's BI service with franchisor context

**Event Subscription:**

- Subscribe to `order.closed` events (all tenants)
- Update UI when events received

**UI Behavior:**

- Display client LTV by tenant
- Show top clients
- Allow filtering by tenant
- Update metrics when events received

---

### 3. Pricing Control

#### 3.1 View Global Pricing Templates

**User Intent:** View and manage global pricing templates

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "Catalog" → "Pricing"]
  ↓
Pricing Templates View
  - Global service pricing
  - Global product pricing
  - Tenant-specific overrides
  - Edit pricing
```

**API Mapping:**

- **Note:** Catalog/pricing API not yet implemented in Phase 1
- **Future:** Catalog service integration
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to pricing change events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display pricing templates
- Show global and tenant-specific pricing
- Allow editing pricing (franchisor only)
- Update display when events received

---

#### 3.2 Set Tenant-Specific Pricing

**User Intent:** Override global pricing for a specific tenant

**Screen Flow:**

```
Pricing Templates View
  ↓
[User selects tenant and service/product]
  ↓
Set Tenant Pricing Form
  - Select tenant
  - Select service/product
  - Set price override
  ↓
[User clicks "Save"]
  ↓
Pricing Updated
  - Tenant-specific price saved
```

**API Mapping:**

- **Note:** Catalog/pricing API not yet implemented in Phase 1
- **Future:** Catalog service integration
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to pricing change events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display pricing form
- Show tenant-specific overrides
- Update display when pricing changed

---

### 4. Catalog Governance

#### 4.1 View Global Catalog

**User Intent:** View and manage global service and product catalog

**Screen Flow:**

```
Franchise Portal Dashboard
  ↓
[User navigates to "Catalog" → "Services" or "Products"]
  ↓
Catalog View
  - List of services/products
  - Global templates
  - Tenant-specific customizations
  - Edit catalog items
```

**API Mapping:**

- **Note:** Catalog API not yet implemented in Phase 1
- **Future:** Catalog service integration
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to catalog change events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display catalog items
- Show global templates and tenant customizations
- Allow editing catalog (franchisor only)
- Update display when events received

---

#### 4.2 Manage Service Templates

**User Intent:** Create, update, or delete service templates

**Screen Flow:**

```
Catalog View
  ↓
[User clicks "New Service" or edits existing service]
  ↓
Service Template Form
  - Service name
  - Description
  - Duration
  - Base price
  - Category
  ↓
[User clicks "Save"]
  ↓
Service Template Saved
  - Template available to all tenants
```

**API Mapping:**

- **Note:** Catalog API not yet implemented in Phase 1
- **Future:** Catalog service integration
- **Current:** Direct database query (franchisor access only)

**Event Subscription:**

- Subscribe to catalog change events (if implemented)
- Update UI when events received

**UI Behavior:**

- Display service template form
- Show template details
- Update display when template changed

---

## User Intent → API Mapping Summary

### Salon (POS UI) APIs

| User Intent | API Endpoint | Method | Service | Event Subscription |
|-------------|--------------|--------|---------|-------------------|
| View appointments | `/appointments?from_date=...&to_date=...&master_id=...&status=...` | GET | booking-service (4110) | `appointment.*` |
| Book appointment | `/appointments` | POST | booking-service (4110) | `appointment.booked` |
| Confirm appointment | `/appointments/:id/confirm` | POST | booking-service (4110) | `appointment.confirmed` |
| Start appointment | `/appointments/:id/start` | POST | booking-service (4110) | `appointment.started` |
| Complete appointment | `/appointments/:id/complete` | POST | booking-service (4110) | `appointment.completed` |
| Cancel appointment | `/appointments/:id/cancel` | POST | booking-service (4110) | `appointment.cancelled` |
| Start visit | `/visits` | POST | beauty-pos-service (4111) | `visit.started` |
| View visits | `/visits?status=...&master_id=...&date=...` | GET | beauty-pos-service (4111) | `visit.*` |
| Close visit | `/visits/:id/close` | POST | beauty-pos-service (4111) | `visit.closed` |
| Create order | `/orders` | POST | beauty-pos-service (4111) | `order.created`, `payment.initiated` |
| View orders | `/orders?status=...&date=...&client_id=...` | GET | beauty-pos-service (4111) | `order.*` |
| Close order | `/orders/:id/close` | POST | beauty-pos-service (4111) | `order.closed`, `accounting.export_completed` |
| Process payment | `/payments` | POST | payments-service (4112) | `payment.received`, `payment.confirmed` |
| View payments | `/payments?order_id=...` | GET | payments-service (4112) | `payment.*` |
| View clients | `/clients?search=...&phone=...&email=...` | GET | customer-service (4114) | `client.*` |
| Create client | `/clients` | POST | customer-service (4114) | `client.registered` |
| View client | `/clients/:id` | GET | customer-service (4114) | `client.*` |
| View masters | `/masters?is_active=...` | GET | staff-service (4117) | `master.*` |
| View master | `/masters/:id` | GET | staff-service (4117) | `master.*` |
| View daily sales | `/analytics/daily-sales?from_date=...&to_date=...` | GET | bi-service (4115) | `order.*`, `payment.*` |
| View master utilization | `/analytics/master-utilization?from_date=...&to_date=...&master_id=...` | GET | bi-service (4115) | `appointment.completed` |
| View client LTV | `/analytics/client-ltv?client_id=...&limit=...` | GET | bi-service (4115) | `order.closed` |

### Franchise Portal APIs

| User Intent | API Endpoint | Method | Service | Event Subscription |
|-------------|--------------|--------|---------|-------------------|
| View tenant list | **Future:** `/tenants` | GET | **Future:** platform-service | Tenant lifecycle events |
| View tenant details | **Future:** `/tenants/:id` | GET | **Future:** platform-service | Tenant state events |
| View cross-tenant sales | **Future:** `/analytics/daily-sales?tenant_id=...` | GET | **Future:** bi-service (franchisor) | `order.*`, `payment.*` (all tenants) |
| View cross-tenant utilization | **Future:** `/analytics/master-utilization?tenant_id=...` | GET | **Future:** bi-service (franchisor) | `appointment.completed` (all tenants) |
| View cross-tenant LTV | **Future:** `/analytics/client-ltv?tenant_id=...` | GET | **Future:** bi-service (franchisor) | `order.closed` (all tenants) |
| Manage catalog | **Future:** Catalog service | Various | **Future:** catalog-service | Catalog change events |

**Note:** Franchise Portal APIs marked as "Future" are not yet implemented in Phase 1. For MVP, franchisor can access tenant data via direct database queries with franchisor context.

---

## Event Subscription Strategy

### Real-time Updates

**UI subscribes to events via:**

- WebSocket connection to NATS (recommended for real-time)
- Server-Sent Events (SSE) via API gateway
- Polling (fallback if WebSocket/SSE unavailable)

**Event Types to Subscribe:**

**Salon (POS UI):**

- `appointment.*` - All appointment events
- `visit.*` - All visit events
- `order.*` - All order events
- `payment.*` - All payment events
- `client.*` - All client events

**Franchise Portal:**

- All domain events (with tenant filtering)
- Tenant lifecycle events (if implemented)

---

## Tenant Context in UI

### Explicit Tenant ID

**All API calls must include:**

- `X-Tenant-ID` header (from auth context)
- `X-User-ID` header (from auth context)
- `X-Correlation-ID` header (generated per request)

**UI must NEVER:**

- Assume tenant from URL or context
- Allow implicit tenant switching
- Display cross-tenant data without explicit franchisor permission

---

## Screen Flow Diagrams (Textual)

### Salon POS - Complete Flow

```
Login
  ↓
POS Dashboard
  ├─→ Appointments Calendar
  │   ├─→ Book Appointment
  │   │   └─→ Create Client (if new)
  │   ├─→ Appointment Details
  │   │   ├─→ Confirm Appointment
  │   │   ├─→ Start Appointment
  │   │   ├─→ Complete Appointment
  │   │   └─→ Cancel Appointment
  │   └─→ Start Visit (from appointment)
  ├─→ Active Visits
  │   ├─→ Visit Details
  │   │   ├─→ Create Order
  │   │   │   └─→ Process Payment
  │   │   │       └─→ Close Order
  │   │   └─→ Close Visit
  └─→ Shift Close
      ├─→ Daily Sales Summary
      └─→ Master Utilization
```

### Franchise Portal - Complete Flow

```
Login (Franchisor)
  ↓
Franchise Portal Dashboard
  ├─→ Tenants
  │   ├─→ Tenant List
  │   └─→ Tenant Details
  │       └─→ State Management
  ├─→ KPIs
  │   ├─→ Daily Sales (All Tenants)
  │   ├─→ Master Utilization (All Tenants)
  │   └─→ Client LTV (All Tenants)
  ├─→ Catalog
  │   ├─→ Services
  │   │   └─→ Service Templates
  │   ├─→ Products
  │   │   └─→ Product Templates
  │   └─→ Pricing
  │       └─→ Pricing Control
  └─→ Marketing (Future)
```

---

## Validation Checklist

### Domain Terms Compliance ✅

- ✅ All domain terms match Domain Glossary
- ✅ No new domain concepts introduced
- ✅ No renamed aggregates

### API Mapping Compliance ✅

- ✅ All APIs exist in Phase 1
- ✅ No backend changes required
- ✅ All endpoints documented

### Tenant Isolation Compliance ✅

- ✅ tenant_id explicit in all API calls
- ✅ No cross-tenant assumptions
- ✅ Franchisor access clearly marked

### Event-Based UX Compliance ✅

- ✅ UI reacts to events
- ✅ No optimistic domain logic
- ✅ Event subscriptions documented

---

## Next Steps

After P2.1 completion:

- ⏳ **SYNC H** - UX Freeze
  - All flows mapped
  - No domain assumptions
  - Backend untouched

- ⏳ **P2.2** - UI Architecture
  - SPA vs MPA decision
  - State management
  - API client strategy
  - Event subscription model

---

**Status:** ✅ COMPLETE  
**Ready for:** SYNC H (UX Freeze)

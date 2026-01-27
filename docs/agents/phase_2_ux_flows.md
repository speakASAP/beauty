# Phase 2 - UX & Flow Definition

**Date:** 2026-01-XX  
**Agent:** UX / Product Flow Agent  
**Status:** ✅ COMPLETE

---

## Overview

This document defines all user workflows for POS UI (Salon-level) and Franchise Portal (Central management). Each workflow maps user intents to backend API calls and event subscriptions.

**Rules:**

- UI sends commands only (no business logic)
- UI reacts to events/projections (no immediate consistency assumptions)
- Tenant context is explicit in all interactions

---

## POS UI - Salon Workflows

### 1. Booking Workflow

**User Intent:** Book an appointment for a client

**Screen Flow:**

1. **Calendar View** → Select date/time
2. **Master Selection** → Choose master
3. **Service Selection** → Choose service
4. **Client Selection** → Select or create client
5. **Confirmation** → Review and confirm booking
6. **Success** → Appointment booked

**API Mapping:**

- `GET /appointments?date=YYYY-MM-DD&master_id=UUID` - Get existing appointments
- `POST /appointments` - Book appointment

  ```json
  {
    "client_id": "uuid",
    "master_id": "uuid",
    "service_id": "uuid",
    "starts_at": "ISO8601",
    "duration_minutes": 60
  }
  ```

- `POST /appointments/:id/confirm` - Confirm appointment (optional)

**Event Subscriptions:**

- `appointment.booked` - Show confirmation
- `appointment.confirmed` - Update UI state
- `appointment.cancelled` - Remove from calendar

**Tenant Context:**

- Extracted from JWT token
- Included in all API calls via `X-Tenant-ID` header

---

### 2. Visit Workflow

**User Intent:** Start a visit (from appointment or walk-in)

**Screen Flow:**

1. **Visit Start** → Select appointment or create walk-in
2. **Service/Product Selection** → Add items to visit
3. **Visit Management** → Add/remove items
4. **Visit Close** → Close visit and create order

**API Mapping:**

- `POST /visits` - Start visit

  ```json
  {
    "appointment_id": "uuid", // optional for walk-in
    "client_id": "uuid",
    "master_id": "uuid"
  }
  ```

- `POST /visits/:id/close` - Close visit
- `GET /visits?status=open` - List open visits

**Event Subscriptions:**

- `visit.started` - Update UI
- `visit.closed` - Navigate to checkout

**Tenant Context:**

- Explicit in all API calls

---

### 3. Checkout Workflow

**User Intent:** Process payment for an order

**Screen Flow:**

1. **Order Review** → Review order items and total
2. **Payment Method Selection** → Choose payment method
3. **Payment Processing** → Process payment
4. **Receipt** → Show receipt and close order

**API Mapping:**

- `POST /orders` - Create order from visit

  ```json
  {
    "visit_id": "uuid",
    "items": [
      {
        "service_id": "uuid",
        "product_id": "uuid",
        "quantity": 1,
        "unit_price": 1000
      }
    ]
  }
  ```

- `POST /orders/:id/close` - Close order
- `POST /payments` - Initiate payment

  ```json
  {
    "order_id": "uuid",
    "amount": 1000,
    "method": "card|cash|online|bank_transfer"
  }
  ```

- `GET /payments/:id` - Check payment status

**Event Subscriptions:**

- `order.created` - Show order details
- `order.closed` - Show receipt
- `payment.initiated` - Show processing state
- `payment.received` - Show success
- `payment.failed` - Show error

**Tenant Context:**

- Explicit in all API calls

---

### 4. Shift Close Workflow

**User Intent:** Close shift and review daily summary

**Screen Flow:**

1. **Daily Summary** → View daily transactions
2. **Review** → Review orders, payments, visits
3. **Close Shift** → Confirm shift close

**API Mapping:**

- `GET /orders?date=YYYY-MM-DD` - Get daily orders
- `GET /payments?date=YYYY-MM-DD` - Get daily payments
- `GET /visits?date=YYYY-MM-DD` - Get daily visits
- `GET /analytics/daily-sales?date=YYYY-MM-DD` - Get BI aggregates

**Event Subscriptions:**

- None (read-only view)

**Tenant Context:**

- Explicit in all API calls

---

## Franchise Portal - Central Workflows

### 1. Tenant Overview Workflow

**User Intent:** View and manage tenants

**Screen Flow:**

1. **Tenant List** → View all tenants
2. **Tenant Details** → View tenant details
3. **Tenant Management** → Update tenant state (if allowed)

**API Mapping:**

- `GET /tenants` - List all tenants (franchisor only)
- `GET /tenants/:id` - Get tenant details
- `PATCH /tenants/:id` - Update tenant state (if allowed)

**Event Subscriptions:**

- `tenant.created` - Add to list
- `tenant.activated` - Update state
- `tenant.suspended` - Update state

**Tenant Context:**

- Franchisor context (can view all tenants)
- Explicit tenant selection for operations

---

### 2. KPIs Dashboard Workflow

**User Intent:** View performance metrics across tenants

**Screen Flow:**

1. **Dashboard View** → Select date range
2. **Metrics Display** → View KPIs
3. **Drill Down** → View tenant-specific metrics

**API Mapping:**

- `GET /analytics/daily-sales?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` - Daily sales
- `GET /analytics/master-utilization?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` - Master utilization
- `GET /analytics/client-ltv?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` - Client LTV
- `GET /analytics/appointment-aggregates?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD` - Appointment metrics

**Event Subscriptions:**

- None (read-only BI aggregates)

**Tenant Context:**

- Franchisor context (aggregates across all tenants)
- Can filter by specific tenant

---

### 3. Pricing Control Workflow

**User Intent:** Manage pricing for services and products

**Screen Flow:**

1. **Catalog View** → View services/products
2. **Pricing Edit** → Edit pricing
3. **Tenant Override** → Set tenant-specific pricing
4. **Save** → Save pricing changes

**API Mapping:**

- `GET /catalog/services` - Get services (via CatalogAdapter)
- `GET /catalog/products` - Get products (via CatalogAdapter)
- `PATCH /catalog/services/:id/pricing` - Update service pricing
- `PATCH /catalog/products/:id/pricing` - Update product pricing
- `POST /catalog/tenant-overrides` - Set tenant-specific pricing

**Event Subscriptions:**

- `service.updated` - Update UI
- `product.updated` - Update UI

**Tenant Context:**

- Franchisor context (global pricing)
- Tenant context (tenant-specific overrides)

---

### 4. Catalog Governance Workflow

**User Intent:** Manage service and product catalog

**Screen Flow:**

1. **Catalog List** → View services/products
2. **Create/Edit** → Create or edit catalog item
3. **Visibility Control** → Control catalog visibility
4. **Save** → Save changes

**API Mapping:**

- `GET /catalog/services` - Get services
- `GET /catalog/products` - Get products
- `POST /catalog/services` - Create service
- `POST /catalog/products` - Create product
- `PATCH /catalog/services/:id` - Update service
- `PATCH /catalog/products/:id` - Update product

**Event Subscriptions:**

- `service.created` - Add to list
- `service.updated` - Update UI
- `product.created` - Add to list
- `product.updated` - Update UI

**Tenant Context:**

- Franchisor context (global catalog)
- Tenant context (tenant-specific items)

---

## Auth & Tenant UX Workflows

### 1. Login Workflow

**User Intent:** Authenticate and access system

**Screen Flow:**

1. **Login Form** → Enter credentials
2. **Authentication** → Authenticate with auth service
3. **Tenant Selection** → Select tenant (if multiple)
4. **Dashboard** → Navigate to appropriate dashboard

**API Mapping:**

- `POST /auth/login` - Authenticate (auth-microservice)

  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- Response includes JWT token with `tenant_id` claim

**Event Subscriptions:**

- None

**Tenant Context:**

- Extracted from JWT token
- Stored in session/localStorage
- Included in all subsequent API calls

---

### 2. Tenant Selection Workflow

**User Intent:** Switch between tenants (if allowed)

**Screen Flow:**

1. **Tenant List** → View available tenants
2. **Tenant Selection** → Select tenant
3. **Context Switch** → Update tenant context
4. **Dashboard Refresh** → Refresh dashboard with new tenant

**API Mapping:**

- `GET /auth/tenants` - Get user's tenants (auth-microservice)
- `POST /auth/switch-tenant` - Switch tenant context (auth-microservice)

**Event Subscriptions:**

- None

**Tenant Context:**

- Explicit tenant selection
- New JWT token issued with new tenant_id
- All subsequent API calls use new tenant context

---

### 3. Role-Based UI Visibility

**User Intent:** View appropriate UI based on role

**Screen Flow:**

1. **Role Detection** → Extract role from JWT
2. **UI Rendering** → Render appropriate UI components
3. **Permission Checks** → Hide/show features based on permissions

**API Mapping:**

- Role extracted from JWT token claims
- No API calls needed (client-side only)

**Event Subscriptions:**

- None

**Tenant Context:**

- Role is tenant-scoped
- Permissions checked per tenant

---

## Event Subscription Strategy

### POS UI Event Subscriptions

**Real-time Updates:**

- `appointment.*` - Calendar updates
- `visit.*` - Visit state changes
- `order.*` - Order state changes
- `payment.*` - Payment status updates

**Subscription Method:**

- Polling (MVP) - Poll every 5-10 seconds
- WebSocket (Future) - Real-time updates

**Implementation:**

- Subscribe to events via event bus client
- Update UI state on event receipt
- Handle event delays gracefully

---

## User Intent → API Mapping Summary

| User Intent | API Endpoint | Method | Payload |
| ---------- | ------------ | ------ | ------- |
| Book appointment | `/appointments` | POST | `{client_id, master_id, service_id, starts_at, duration_minutes}` |
| Confirm appointment | `/appointments/:id/confirm` | POST | `{confirmation_method}` |
| Start appointment | `/appointments/:id/start` | POST | `{}` |
| Complete appointment | `/appointments/:id/complete` | POST | `{}` |
| Cancel appointment | `/appointments/:id/cancel` | POST | `{reason}` |
| Start visit | `/visits` | POST | `{appointment_id?, client_id, master_id}` |
| Close visit | `/visits/:id/close` | POST | `{}` |
| Create order | `/orders` | POST | `{visit_id, items[]}` |
| Close order | `/orders/:id/close` | POST | `{}` |
| Initiate payment | `/payments` | POST | `{order_id, amount, method}` |
| Register client | `/clients` | POST | `{first_name, last_name, phone, email, gdpr_consent}` |
| Get daily sales | `/analytics/daily-sales` | GET | `?date=YYYY-MM-DD` |
| Get master utilization | `/analytics/master-utilization` | GET | `?from_date=...&to_date=...` |
| Get client LTV | `/analytics/client-ltv` | GET | `?from_date=...&to_date=...` |

---

## Non-Negotiable Rules

### 1. No Business Logic in UI

- ❌ No pricing calculations
- ❌ No booking rules
- ❌ No inventory rules
- ✅ Only command sending and projection rendering

### 2. Explicit Tenant Context

- ❌ No implicit tenant switching
- ❌ No cross-tenant data access
- ✅ tenant_id explicit in all API calls
- ✅ Tenant selection visible in UI

### 3. Event-Driven UX

- ❌ No immediate consistency assumptions
- ✅ React to events/projections
- ✅ Handle event delays gracefully
- ✅ Show loading states appropriately

---

## Next Steps

1. ✅ UX flows defined
2. ✅ API mappings documented
3. ✅ Event subscriptions identified
4. ⏳ Proceed to P2.2 - UI Architecture

---

**Document Status:** ✅ COMPLETE  
**Next Phase:** P2.2 - UI Architecture

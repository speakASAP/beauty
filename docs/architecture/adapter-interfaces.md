# Adapter Interfaces (Immutable)

> This document is immutable once approved.  
> Defines all adapter interfaces for integrating with existing microservices.

---

## Related Documentation

- [Existing Services Mapping](existing-services-mapping.md) - Which services need adapters
- [Bounded Contexts](bounded-contexts.md) - Contexts that use these adapters
- [Domain Glossary](domain-glossary.md) - Domain terms used in interfaces
- [Technical Design Document](tdd.md) - Architectural foundation

---

## Adapter Principles

### 1. Translation Only

Adapters translate between external systems and domain models. They contain **NO business logic**.

### 2. No Business Logic

Adapters must not:

- Make business decisions
- Enforce business rules
- Store domain state
- Contain conditional flows based on domain state

### 3. Swappable

Adapters must be swappable. For example:

- `PaymentAdapter` → `StripeAdapter` (future)
- `NotificationAdapter` → `TwilioAdapter` (future)
- `InventoryAdapter` → `CustomInventoryAdapter` (future)

### 4. Idempotent

Adapter operations must be idempotent (safe to retry):

- Same input → same output
- Retries don't cause side effects
- Idempotency keys used where needed

### 5. Stateless

Adapters are stateless (or externally stateful):

- No internal state
- State managed by external service
- Can be instantiated multiple times

---

## Adapter Interface Definitions

---

## CatalogAdapter

**Purpose:** Integrate with existing Catalog Service to access service and product catalogs.

**Location:** `beauty-service/infrastructure/adapters/catalog-adapter`

**External Service:** `catalog-microservice`

### Interface

```typescript
interface CatalogAdapter {
  /**
   * Get service by ID
   * @param serviceId - Service UUID
   * @param tenantId - Tenant UUID (for tenant-specific pricing)
   * @returns Service aggregate or null if not found
   * @throws AdapterError if external service fails
   */
  getService(serviceId: string, tenantId: string): Promise<Service | null>;

  /**
   * List all services for tenant
   * @param tenantId - Tenant UUID
   * @returns Array of Service aggregates
   * @throws AdapterError if external service fails
   */
  listServices(tenantId: string): Promise<Service[]>;

  /**
   * Get service price (with tenant-specific overrides)
   * @param serviceId - Service UUID
   * @param tenantId - Tenant UUID
   * @returns Price in CZK (smallest unit, e.g., 100 = 1.00 CZK)
   * @throws AdapterError if external service fails
   */
  getServicePrice(serviceId: string, tenantId: string): Promise<number>;

  /**
   * Get product by ID
   * @param productId - Product UUID
   * @param tenantId - Tenant UUID
   * @returns Product aggregate or null if not found
   * @throws AdapterError if external service fails
   */
  getProduct(productId: string, tenantId: string): Promise<Product | null>;

  /**
   * List all products for tenant
   * @param tenantId - Tenant UUID
   * @returns Array of Product aggregates
   * @throws AdapterError if external service fails
   */
  listProducts(tenantId: string): Promise<Product[]>;
}
```

### Domain Models

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number; // CZK (smallest unit)
  vatRate: number; // 0.21 for 21% VAT
  category: string;
  requiresInventory: boolean;
  inventoryItems: Array<{
    itemId: string;
    quantity: number;
  }>;
  tenantId: string | null; // null for global templates
}

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number; // CZK (smallest unit)
  vatRate: number;
  category: string;
  tenantId: string | null; // null for global templates
}
```

### Error Handling

- **Service Not Found:** Returns `null` (not an error)
- **External Service Failure:** Throws `AdapterError` with `retryable: true`
- **Invalid Input:** Throws `AdapterError` with `retryable: false`

### Idempotency

- All read operations are idempotent by nature
- No write operations (catalog is read-only from beauty domain)

---

## PaymentAdapter

**Purpose:** Integrate with existing Payments Service to process payments.

**Location:** `beauty-service/infrastructure/adapters/payment-adapter`

**External Service:** `payments-microservice`

### Interface

```typescript
interface PaymentAdapter {
  /**
   * Capture payment for an order
   * @param orderId - Order UUID
   * @param amount - Amount in CZK (smallest unit, e.g., 100 = 1.00 CZK)
   * @param method - Payment method
   * @param tenantId - Tenant UUID
   * @param idempotencyKey - Optional idempotency key for retries
   * @returns Payment aggregate
   * @throws AdapterError if payment fails
   * @idempotent Yes (same orderId + amount + idempotencyKey = same payment)
   */
  capturePayment(
    orderId: string,
    amount: number,
    method: PaymentMethod,
    tenantId: string,
    idempotencyKey?: string
  ): Promise<Payment>;

  /**
   * Refund a payment
   * @param paymentId - Payment UUID
   * @param amount - Amount to refund (partial refunds allowed)
   * @param tenantId - Tenant UUID
   * @param idempotencyKey - Optional idempotency key for retries
   * @returns Refund aggregate
   * @throws AdapterError if refund fails
   * @idempotent Yes
   */
  refundPayment(
    paymentId: string,
    amount: number,
    tenantId: string,
    idempotencyKey?: string
  ): Promise<Refund>;

  /**
   * Get payment status
   * @param paymentId - Payment UUID
   * @param tenantId - Tenant UUID
   * @returns Payment status
   * @throws AdapterError if external service fails
   */
  getPaymentStatus(paymentId: string, tenantId: string): Promise<PaymentStatus>;

  /**
   * Get payment by ID
   * @param paymentId - Payment UUID
   * @param tenantId - Tenant UUID
   * @returns Payment aggregate or null if not found
   * @throws AdapterError if external service fails
   */
  getPayment(paymentId: string, tenantId: string): Promise<Payment | null>;
}
```

### Domain Models

```typescript
type PaymentMethod = 'card' | 'cash' | 'online' | 'bank_transfer';

interface Payment {
  id: string;
  orderId: string;
  amount: number; // CZK (smallest unit)
  method: PaymentMethod;
  status: PaymentStatus;
  capturedAt: Date;
  tenantId: string;
  idempotencyKey?: string;
}

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';

interface Refund {
  id: string;
  paymentId: string;
  amount: number; // CZK (smallest unit)
  refundedAt: Date;
  tenantId: string;
  idempotencyKey?: string;
}
```

### Error Handling

- **Payment Failed:** Throws `AdapterError` with `retryable: false`
- **External Service Failure:** Throws `AdapterError` with `retryable: true`
- **Invalid Input:** Throws `AdapterError` with `retryable: false`
- **Insufficient Funds:** Throws `AdapterError` with `retryable: false`

### Idempotency

- Uses `idempotencyKey` parameter
- Same `orderId + amount + idempotencyKey` = same payment
- Retries are safe

---

## InventoryAdapter

**Purpose:** Integrate with existing Warehouse Service to manage inventory.

**Location:** `beauty-service/infrastructure/adapters/inventory-adapter`

**External Service:** `warehouse-microservice`

### Interface

```typescript
interface InventoryAdapter {
  /**
   * Decrease inventory stock
   * @param itemId - Inventory item UUID
   * @param quantity - Quantity to decrease
   * @param reason - Reason for decrease (e.g., 'visit_completed')
   * @param tenantId - Tenant UUID
   * @param idempotencyKey - Optional idempotency key for retries
   * @returns Inventory movement aggregate
   * @throws AdapterError if stock insufficient or external service fails
   * @idempotent Yes (same itemId + quantity + reason + idempotencyKey = same movement)
   */
  decreaseStock(
    itemId: string,
    quantity: number,
    reason: string,
    tenantId: string,
    idempotencyKey?: string
  ): Promise<InventoryMovement>;

  /**
   * Increase inventory stock
   * @param itemId - Inventory item UUID
   * @param quantity - Quantity to increase
   * @param reason - Reason for increase (e.g., 'purchase', 'return')
   * @param tenantId - Tenant UUID
   * @param idempotencyKey - Optional idempotency key for retries
   * @returns Inventory movement aggregate
   * @throws AdapterError if external service fails
   * @idempotent Yes
   */
  increaseStock(
    itemId: string,
    quantity: number,
    reason: string,
    tenantId: string,
    idempotencyKey?: string
  ): Promise<InventoryMovement>;

  /**
   * Get current stock level
   * @param itemId - Inventory item UUID
   * @param tenantId - Tenant UUID
   * @returns Current stock quantity
   * @throws AdapterError if external service fails
   */
  getStock(itemId: string, tenantId: string): Promise<number>;

  /**
   * List all inventory items for tenant
   * @param tenantId - Tenant UUID
   * @returns Array of InventoryItem aggregates
   * @throws AdapterError if external service fails
   */
  listItems(tenantId: string): Promise<InventoryItem[]>;

  /**
   * Get inventory item by ID
   * @param itemId - Inventory item UUID
   * @param tenantId - Tenant UUID
   * @returns InventoryItem aggregate or null if not found
   * @throws AdapterError if external service fails
   */
  getItem(itemId: string, tenantId: string): Promise<InventoryItem | null>;
}
```

### Domain Models

```typescript
interface InventoryMovement {
  id: string;
  itemId: string;
  quantity: number; // Positive for increase, negative for decrease
  reason: string;
  occurredAt: Date;
  tenantId: string;
  idempotencyKey?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number; // Current stock level
  unit: string; // e.g., 'ml', 'piece', 'kg'
  tenantId: string;
  reorderLevel?: number; // Optional reorder threshold
}
```

### Error Handling

- **Insufficient Stock:** Throws `AdapterError` with `retryable: false`
- **External Service Failure:** Throws `AdapterError` with `retryable: true`
- **Invalid Input:** Throws `AdapterError` with `retryable: false`
- **Item Not Found:** Returns `null` (not an error for getItem)

### Idempotency

- Uses `idempotencyKey` parameter
- Same `itemId + quantity + reason + idempotencyKey` = same movement
- Retries are safe

---

## NotificationAdapter

**Purpose:** Integrate with existing Notifications Service to send SMS and emails.

**Location:** `beauty-service/infrastructure/adapters/notification-adapter`

**External Service:** `notifications-microservice`

### Interface

```typescript
interface NotificationAdapter {
  /**
   * Send SMS to client
   * @param phone - Phone number (Czech format: +420XXXXXXXXX)
   * @param message - SMS message text
   * @param tenantId - Tenant UUID
   * @returns Notification result
   * @throws AdapterError if SMS fails
   * @idempotent No (SMS is sent, but duplicate sends are acceptable)
   */
  sendSms(
    phone: string,
    message: string,
    tenantId: string
  ): Promise<NotificationResult>;

  /**
   * Send email to client
   * @param email - Email address
   * @param subject - Email subject
   * @param body - Email body (HTML or plain text)
   * @param tenantId - Tenant UUID
   * @returns Notification result
   * @throws AdapterError if email fails
   * @idempotent No
   */
  sendEmail(
    email: string,
    subject: string,
    body: string,
    tenantId: string
  ): Promise<NotificationResult>;

  /**
   * Send SMS with template
   * @param phone - Phone number
   * @param templateId - Template ID (e.g., 'appointment_confirmation')
   * @param variables - Template variables
   * @param tenantId - Tenant UUID
   * @returns Notification result
   * @throws AdapterError if SMS fails
   */
  sendSmsTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>,
    tenantId: string
  ): Promise<NotificationResult>;

  /**
   * Send email with template
   * @param email - Email address
   * @param templateId - Template ID (e.g., 'welcome_email')
   * @param variables - Template variables
   * @param tenantId - Tenant UUID
   * @returns Notification result
   * @throws AdapterError if email fails
   */
  sendEmailTemplate(
    email: string,
    templateId: string,
    variables: Record<string, string>,
    tenantId: string
  ): Promise<NotificationResult>;
}
```

### Domain Models

```typescript
interface NotificationResult {
  id: string;
  status: 'sent' | 'failed';
  sentAt: Date;
  tenantId: string;
  channel: 'sms' | 'email';
}
```

### Error Handling

- **Invalid Phone/Email:** Throws `AdapterError` with `retryable: false`
- **External Service Failure:** Throws `AdapterError` with `retryable: true`
- **Template Not Found:** Throws `AdapterError` with `retryable: false`
- **Rate Limit:** Throws `AdapterError` with `retryable: true`

### Idempotency

- **Not idempotent** (SMS/email are sent, duplicates acceptable)
- Retries may send duplicate notifications (acceptable for notifications)

---

## AccountingAdapter (Post-MVP)

**Purpose:** Integrate with Czech accounting systems (Money S3, Pohoda, ABRA).

**Location:** `beauty-service/infrastructure/adapters/accounting-adapter`

**External Service:** Various (Money S3, Pohoda, ABRA Flexi)

**Status:** Interface defined for future implementation (post-MVP)

### Interface

```typescript
interface AccountingAdapter {
  /**
   * Export transaction to accounting system
   * @param transaction - Transaction data
   * @param tenantId - Tenant UUID
   * @param idempotencyKey - Optional idempotency key for retries
   * @returns Export result
   * @throws AdapterError if export fails
   * @idempotent Yes
   */
  exportTransaction(
    transaction: AccountingTransaction,
    tenantId: string,
    idempotencyKey?: string
  ): Promise<ExportResult>;
}
```

### Domain Models

```typescript
interface AccountingTransaction {
  orderId: string;
  amount: number; // CZK (smallest unit)
  vatAmount: number; // CZK (smallest unit)
  items: Array<{
    name: string;
    quantity: number;
    price: number; // CZK (smallest unit)
    vatRate: number; // 0.21 for 21% VAT
  }>;
  occurredAt: Date;
  paymentMethod: string;
}

interface ExportResult {
  id: string;
  status: 'exported' | 'failed';
  exportedAt: Date;
  tenantId: string;
  externalId?: string; // ID in external accounting system
}
```

**Note:** This adapter is post-MVP and will be implemented in future phases.

---

## Adapter Error Handling

### AdapterError

```typescript
class AdapterError extends Error {
  constructor(
    message: string,
    public readonly adapter: string,
    public readonly originalError?: Error,
    public readonly retryable: boolean = false,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AdapterError';
  }
}
```

### Error Codes

```typescript
type AdapterErrorCode =
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'AUTHENTICATION_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_STOCK'
  | 'PAYMENT_FAILED'
  | 'UNKNOWN_ERROR';
```

### Error Handling Rules

1. **Retryable Errors:**
   - Network timeouts
   - Temporary service unavailability (503)
   - Rate limit exceeded (429) - with backoff
   - External service errors (500)

2. **Non-Retryable Errors:**
   - Invalid input (400)
   - Authentication failures (401)
   - Not found (404) - for write operations
   - Business logic errors (e.g., insufficient stock, payment failed)

3. **Idempotency:**
   - Retries must be idempotent
   - Use `idempotencyKey` for write operations
   - Same input + idempotencyKey = same output

4. **Logging:**
   - All errors logged with `tenant_id`
   - Include original error details
   - Include adapter name and operation

---

## Adapter Health Checks

### Health Check Interface

```typescript
interface AdapterHealth {
  adapter: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  latency?: number; // milliseconds
  error?: string;
}

interface Adapter {
  /**
   * Check adapter health
   * @returns Health status
   */
  checkHealth(): Promise<AdapterHealth>;
}
```

### Health Check Implementation

All adapters must implement health check:

- Ping external service
- Measure latency
- Return health status
- Used by service health endpoints

### Health Status

- **healthy:** External service responding normally
- **degraded:** External service responding slowly or with errors
- **unhealthy:** External service unavailable

---

## Adapter Initialization

### Adapter Config

```typescript
interface AdapterConfig {
  endpoint: string;
  apiKey?: string;
  timeout: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

interface Adapter {
  /**
   * Initialize adapter with configuration
   * @param config - Adapter configuration
   */
  initialize(config: AdapterConfig): Promise<void>;

  /**
   * Shutdown adapter (cleanup resources)
   */
  shutdown(): Promise<void>;
}
```

### Initialization Flow

1. Load configuration from environment variables
2. Validate configuration
3. Initialize HTTP client / connection pool
4. Test connection (optional)
5. Ready for use

---

## Adapter Testing

### Mock Adapters

For testing, provide mock implementations:

```typescript
class MockCatalogAdapter implements CatalogAdapter {
  // Mock implementation for testing
}

class MockPaymentAdapter implements PaymentAdapter {
  // Mock implementation for testing
}

class MockInventoryAdapter implements InventoryAdapter {
  // Mock implementation for testing
}

class MockNotificationAdapter implements NotificationAdapter {
  // Mock implementation for testing
}
```

### Testing Strategy

1. **Unit Tests:** Use mock adapters
2. **Integration Tests:** Use real adapters with test external services
3. **Contract Tests:** Verify adapter interfaces match external service APIs

---

## Validation Checklist

- [x] All adapters have complete TypeScript interfaces
- [x] All methods have complete signatures (parameters, return types)
- [x] Error handling contracts defined
- [x] Idempotency requirements explicit
- [x] Health check interface defined
- [x] Mock adapters documented
- [x] Initialization contracts defined
- [x] Domain models defined for each adapter

---

**Status:** IMMUTABLE (Frozen after Phase 0 approval)  
**Version:** 1.0  
**Created:** Phase 0 - T0.8  
**Last Updated:** 2026

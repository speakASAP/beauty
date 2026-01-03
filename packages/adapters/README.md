# Adapters Package

Shared adapters for integrating with existing microservices in the beauty platform.

## Adapters

### PaymentAdapter

Integrates with `payments-microservice` to process payments.

### CatalogAdapter

Integrates with `catalog-microservice` to access service and product catalogs.

### InventoryAdapter

Integrates with `warehouse-microservice` to manage inventory.

### NotificationAdapter

Integrates with `notifications-microservice` to send SMS and emails.

### AccountingAdapter

Integrates with Czech accounting systems (Money S3, Pohoda, ABRA Flexi) to export transactions.

## Usage

```javascript
import { PaymentAdapter, CatalogAdapter, AccountingAdapter, NotificationAdapter } from '@beauty/adapters';

// Initialize adapter
const paymentAdapter = new PaymentAdapter({
  endpoint: process.env.PAYMENTS_MICROSERVICE_URL,
  apiKey: process.env.PAYMENT_API_KEY,
  timeout: 5000,
  retryAttempts: 3
});

// Use PaymentAdapter
const payment = await paymentAdapter.capturePayment(
  orderId,
  amount,
  'card',
  tenantId,
  idempotencyKey
);

// Use AccountingAdapter
const accountingAdapter = new AccountingAdapter({
  endpoint: process.env.ACCOUNTING_SERVICE_URL,
  system: 'money_s3' // or 'pohoda', 'abra_flexi'
});

const exportResult = await accountingAdapter.exportTransaction(
  {
    orderId: '550e8400-e29b-41d4-a716-446655440001',
    amount: 10000, // 100.00 CZK (in smallest unit)
    vatAmount: 2100, // 21.00 CZK
    items: [{
      name: 'Haircut',
      quantity: 1,
      price: 10000,
      vatRate: 0.21
    }],
    occurredAt: new Date(),
    paymentMethod: 'card'
  },
  tenantId,
  idempotencyKey
);

// Use NotificationAdapter
const notificationAdapter = new NotificationAdapter({
  endpoint: process.env.NOTIFICATIONS_MICROSERVICE_URL
});

await notificationAdapter.sendSms('+420123456789', 'Your appointment is confirmed', tenantId);
await notificationAdapter.sendEmail('client@example.com', 'Welcome', 'Welcome to our salon!', tenantId);
```

## Error Handling

All adapters throw `AdapterError` for failures:

```javascript
import { AdapterError, AdapterErrorCodes } from '@beauty/adapters';

try {
  await paymentAdapter.capturePayment(...);
} catch (error) {
  if (error instanceof AdapterError) {
    if (error.retryable) {
      // Retry logic
    }
    if (error.code === AdapterErrorCodes.PAYMENT_FAILED) {
      // Handle payment failure
    }
  }
}
```

## Health Checks

All adapters support health checks:

```javascript
const health = await paymentAdapter.checkHealth();
// Returns: { adapter, status, lastCheck, latency, error? }
```

## Configuration

Adapters are configured via environment variables or constructor:

- `PAYMENT_SERVICE_URL` / `CATALOG_SERVICE_URL` / etc.
- `PAYMENT_API_KEY` / `CATALOG_API_KEY` / etc.

## Principles

1. **Translation Only** - No business logic
2. **Idempotent** - Safe to retry
3. **Stateless** - No internal state
4. **Swappable** - Can be replaced with different implementations

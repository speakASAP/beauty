/**
 * Adapters Package
 * Exports all adapters for integrating with existing microservices
 */

export { PaymentAdapter } from './payment-adapter.js';
export { CatalogAdapter } from './catalog-adapter.js';
export { InventoryAdapter } from './inventory-adapter.js';
export { NotificationAdapter } from './notification-adapter.js';
export { AccountingAdapter } from './accounting-adapter.js';
export { BaseAdapter } from './base-adapter.js';
export { AdapterError, AdapterErrorCodes } from './errors.js';


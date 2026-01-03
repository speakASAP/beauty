/**
 * Adapter Error Classes
 * Standardized error handling for adapters
 */

export class AdapterError extends Error {
  constructor(
    message,
    adapter,
    originalError = null,
    retryable = false,
    code = null
  ) {
    super(message);
    this.name = 'AdapterError';
    this.adapter = adapter;
    this.originalError = originalError;
    this.retryable = retryable;
    this.code = code || 'UNKNOWN_ERROR';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      adapter: this.adapter,
      code: this.code,
      retryable: this.retryable,
      originalError: this.originalError?.message || null
    };
  }
}

export const AdapterErrorCodes = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
};


/**
 * Payment Adapter
 * Integrates with existing payments-microservice
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class PaymentAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('payment', config);
  }

  /**
   * Capture payment for an order
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method ('card' | 'cash' | 'online' | 'bank_transfer')
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Payment aggregate
   */
  async capturePayment(orderId, amount, method, tenantId, idempotencyKey = null) {
    if (!orderId || !amount || !method || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: orderId, amount, method, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    if (amount <= 0) {
      throw new AdapterError(
        'Amount must be greater than 0',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    const validMethods = ['card', 'cash', 'online', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      throw new AdapterError(
        `Invalid payment method: ${method}. Must be one of: ${validMethods.join(', ')}`,
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      const headers = {
        'X-Tenant-ID': tenantId
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const response = await this.request('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          amount,
          method
        }),
        headers
      });

      const data = await this.handleResponse(response);

      // Map external service response to domain model
      return {
        id: data.payment_id || data.id,
        orderId: data.order_id || orderId,
        amount: data.amount || amount,
        method: data.method || method,
        status: data.status || 'completed',
        capturedAt: data.captured_at ? new Date(data.captured_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        idempotencyKey: data.idempotency_key || idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      // Handle payment-specific errors
      if (error.message?.includes('insufficient') || error.message?.includes('funds')) {
        throw new AdapterError(
          'Payment failed: insufficient funds',
          this.adapterName,
          error,
          false,
          AdapterErrorCodes.PAYMENT_FAILED
        );
      }

      throw new AdapterError(
        `Payment capture failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.PAYMENT_FAILED
      );
    }
  }

  /**
   * Get payment status
   * @param {string} paymentId - Payment UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<string>} Payment status
   */
  async getPaymentStatus(paymentId, tenantId) {
    const payment = await this.getPayment(paymentId, tenantId);
    return payment ? payment.status : null;
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object|null>} Payment aggregate or null
   */
  async getPayment(paymentId, tenantId) {
    try {
      const response = await this.request(`/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      if (response.status === 404) {
        return null;
      }

      const data = await this.handleResponse(response);

      return {
        id: data.payment_id || data.id,
        orderId: data.order_id,
        amount: data.amount,
        method: data.method,
        status: data.status,
        capturedAt: data.captured_at ? new Date(data.captured_at) : null,
        tenantId: data.tenant_id || tenantId
      };
    } catch (error) {
      if (error instanceof AdapterError && error.code === AdapterErrorCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentId - Payment UUID
   * @param {number} amount - Amount to refund
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Refund aggregate
   */
  async refundPayment(paymentId, amount, tenantId, idempotencyKey = null) {
    if (!paymentId || !amount || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: paymentId, amount, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    if (amount <= 0) {
      throw new AdapterError(
        'Refund amount must be greater than 0',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      const headers = {
        'X-Tenant-ID': tenantId
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const response = await this.request(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount
        }),
        headers
      });

      const data = await this.handleResponse(response);

      return {
        id: data.refund_id || data.id,
        paymentId: data.payment_id || paymentId,
        amount: data.amount || amount,
        refundedAt: data.refunded_at ? new Date(data.refunded_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        idempotencyKey: data.idempotency_key || idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Refund failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.PAYMENT_FAILED
      );
    }
  }
}


/**
 * Payment Adapter
 * Integrates with existing payments-microservice
 */

import fetch from 'node-fetch';
import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class PaymentAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('payment', config);
    // Supported payment providers
    this.supportedProviders = ['stripe', 'gopay', 'comgate'];
    // Default provider (can be overridden per tenant)
    this.provider = config.provider || process.env.PAYMENT_PROVIDER || 'stripe';
    // Provider-specific API keys
    this.stripeApiKey = config.stripeApiKey || process.env.STRIPE_API_KEY;
    this.gopayApiKey = config.gopayApiKey || process.env.GOPAY_API_KEY;
    this.comgateApiKey = config.comgateApiKey || process.env.COMGATE_API_KEY;
  }

  /**
   * Capture payment for an order
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method ('card' | 'cash' | 'online' | 'bank_transfer' | 'stripe' | 'gopay' | 'comgate')
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @param {string} provider - Optional payment provider override ('stripe' | 'gopay' | 'comgate')
   * @returns {Promise<Object>} Payment aggregate
   */
  async capturePayment(orderId, amount, method, tenantId, idempotencyKey = null, provider = null) {
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

    const validMethods = ['card', 'cash', 'online', 'bank_transfer', 'stripe', 'gopay', 'comgate'];
    if (!validMethods.includes(method)) {
      throw new AdapterError(
        `Invalid payment method: ${method}. Must be one of: ${validMethods.join(', ')}`,
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    // Determine payment provider
    const paymentProvider = provider || this.determineProvider(method);
    
    // For Czech payment providers, use direct API integration if configured
    if (this.supportedProviders.includes(paymentProvider) && this.shouldUseDirectApi(paymentProvider)) {
      return await this.capturePaymentDirect(paymentProvider, orderId, amount, method, tenantId, idempotencyKey);
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

  /**
   * Determine payment provider from method
   * @param {string} method - Payment method
   * @returns {string} Provider name
   * @private
   */
  determineProvider(method) {
    if (method === 'stripe' || method === 'card') {
      return 'stripe';
    }
    if (method === 'gopay') {
      return 'gopay';
    }
    if (method === 'comgate') {
      return 'comgate';
    }
    // Default to configured provider or 'stripe'
    return this.provider || 'stripe';
  }

  /**
   * Check if direct API should be used (instead of payments-microservice)
   * @param {string} provider - Payment provider
   * @returns {boolean} True if direct API should be used
   * @private
   */
  shouldUseDirectApi(provider) {
    // Use direct API if provider-specific API key is configured
    switch (provider) {
      case 'stripe':
        return !!this.stripeApiKey;
      case 'gopay':
        return !!this.gopayApiKey;
      case 'comgate':
        return !!this.comgateApiKey;
      default:
        return false;
    }
  }

  /**
   * Capture payment using direct provider API
   * @param {string} provider - Payment provider ('stripe' | 'gopay' | 'comgate')
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Payment aggregate
   * @private
   */
  async capturePaymentDirect(provider, orderId, amount, method, tenantId, idempotencyKey = null) {
    switch (provider) {
      case 'stripe':
        return await this.captureStripePayment(orderId, amount, method, tenantId, idempotencyKey);
      case 'gopay':
        return await this.captureGoPayPayment(orderId, amount, method, tenantId, idempotencyKey);
      case 'comgate':
        return await this.captureComgatePayment(orderId, amount, method, tenantId, idempotencyKey);
      default:
        throw new AdapterError(
          `Unsupported payment provider: ${provider}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.INVALID_INPUT
        );
    }
  }

  /**
   * Capture payment via Stripe
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Payment aggregate
   * @private
   */
  async captureStripePayment(orderId, amount, method, tenantId, idempotencyKey = null) {
    if (!this.stripeApiKey) {
      throw new AdapterError(
        'Stripe API key not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      // Convert amount from smallest unit (haléře) to CZK
      const amountCzk = amount / 100;

      const stripeUrl = 'https://api.stripe.com/v1/payment_intents';
      const headers = {
        'Authorization': `Bearer ${this.stripeApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      // Create payment intent
      const formData = new URLSearchParams({
        amount: Math.round(amountCzk * 100), // Stripe uses smallest unit (cents for USD, haléře for CZK)
        currency: 'czk',
        metadata: JSON.stringify({
          order_id: orderId,
          tenant_id: tenantId
        })
      });

      const response = await fetch(stripeUrl, {
        method: 'POST',
        headers,
        body: formData.toString()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `Stripe payment failed: ${errorData.error?.message || response.statusText}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.PAYMENT_FAILED
        );
      }

      const data = await response.json();

      return {
        id: data.id,
        orderId: orderId,
        amount: amount,
        method: method,
        status: this.mapStripeStatus(data.status),
        capturedAt: new Date(),
        tenantId: tenantId,
        idempotencyKey: idempotencyKey,
        provider: 'stripe',
        externalId: data.id
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Stripe payment capture failed: ${error.message}`,
        this.adapterName,
        error,
        false,
        AdapterErrorCodes.PAYMENT_FAILED
      );
    }
  }

  /**
   * Map Stripe payment status to domain status
   * @param {string} stripeStatus - Stripe status
   * @returns {string} Domain status
   * @private
   */
  mapStripeStatus(stripeStatus) {
    const statusMap = {
      'succeeded': 'completed',
      'processing': 'processing',
      'requires_payment_method': 'failed',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'canceled': 'cancelled',
      'requires_capture': 'pending'
    };
    return statusMap[stripeStatus] || 'pending';
  }

  /**
   * Capture payment via GoPay (stub for future implementation)
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Payment aggregate
   * @private
   */
  async captureGoPayPayment(orderId, amount, method, tenantId, idempotencyKey = null) {
    // TODO: Implement GoPay API integration
    throw new AdapterError(
      'GoPay integration not yet implemented',
      this.adapterName,
      null,
      false,
      AdapterErrorCodes.NOT_IMPLEMENTED
    );
  }

  /**
   * Capture payment via Comgate (stub for future implementation)
   * @param {string} orderId - Order UUID
   * @param {number} amount - Amount in CZK (smallest unit)
   * @param {string} method - Payment method
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Payment aggregate
   * @private
   */
  async captureComgatePayment(orderId, amount, method, tenantId, idempotencyKey = null) {
    // TODO: Implement Comgate API integration
    throw new AdapterError(
      'Comgate integration not yet implemented',
      this.adapterName,
      null,
      false,
      AdapterErrorCodes.NOT_IMPLEMENTED
    );
  }
}


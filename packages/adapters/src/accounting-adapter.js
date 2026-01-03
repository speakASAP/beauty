/**
 * Accounting Adapter
 * Integrates with Czech accounting systems (Money S3, Pohoda, ABRA Flexi)
 * Supports direct API integration when configured
 */

import fetch from 'node-fetch';
import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class AccountingAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('accounting', config);
    // Supported accounting systems
    this.supportedSystems = ['money_s3', 'pohoda', 'abra_flexi'];
    this.system = config.system || process.env.ACCOUNTING_SYSTEM || 'money_s3';
    // Direct API configuration (if not using accounting-microservice)
    this.moneyS3Url = config.moneyS3Url || process.env.MONEY_S3_API_URL;
    this.moneyS3ApiKey = config.moneyS3ApiKey || process.env.MONEY_S3_API_KEY;
    this.pohodaUrl = config.pohodaUrl || process.env.POHODA_API_URL;
    this.pohodaApiKey = config.pohodaApiKey || process.env.POHODA_API_KEY;
    this.abraFlexiUrl = config.abraFlexiUrl || process.env.ABRA_FLEXI_API_URL;
    this.abraFlexiApiKey = config.abraFlexiApiKey || process.env.ABRA_FLEXI_API_KEY;
  }

  /**
   * Export transaction to accounting system
   * @param {Object} transaction - Transaction data
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Export result
   */
  async exportTransaction(transaction, tenantId, idempotencyKey = null) {
    if (!transaction || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: transaction, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    // Validate transaction structure
    if (!transaction.orderId || !transaction.amount || !transaction.items) {
      throw new AdapterError(
        'Invalid transaction: missing orderId, amount, or items',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    if (transaction.amount <= 0) {
      throw new AdapterError(
        'Transaction amount must be greater than 0',
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

      // Map transaction to accounting system format
      const accountingData = this.mapTransactionToAccountingFormat(transaction, tenantId);

      // Use direct API if configured, otherwise use accounting-microservice
      if (this.shouldUseDirectApi()) {
        return await this.exportTransactionDirect(accountingData, tenantId, idempotencyKey);
      }

      const response = await this.request(`/api/accounting/${this.system}/export`, {
        method: 'POST',
        body: JSON.stringify(accountingData),
        headers
      });

      const data = await this.handleResponse(response);

      return {
        id: data.export_id || data.id,
        status: data.status || 'exported',
        exportedAt: data.exported_at ? new Date(data.exported_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        externalId: data.external_id || null,
        idempotencyKey: data.idempotency_key || idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Transaction export failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || true, // Accounting exports are usually retryable
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Map transaction to accounting system format
   * @param {Object} transaction - Transaction data
   * @param {string} tenantId - Tenant UUID
   * @returns {Object} Accounting system format
   * @private
   */
  mapTransactionToAccountingFormat(transaction, tenantId) {
    // Base format (will be adapted per accounting system)
    const baseFormat = {
      order_id: transaction.orderId,
      amount: transaction.amount, // CZK (smallest unit)
      vat_amount: transaction.vatAmount || 0,
      items: transaction.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price, // CZK (smallest unit)
        vat_rate: item.vatRate || 0.21 // Default 21% VAT
      })),
      occurred_at: transaction.occurredAt ? new Date(transaction.occurredAt).toISOString() : new Date().toISOString(),
      payment_method: transaction.paymentMethod || 'cash',
      tenant_id: tenantId
    };

    // System-specific mapping
    switch (this.system) {
      case 'money_s3':
        return this.mapToMoneyS3Format(baseFormat);
      case 'pohoda':
        return this.mapToPohodaFormat(baseFormat);
      case 'abra_flexi':
        return this.mapToAbraFlexiFormat(baseFormat);
      default:
        return baseFormat;
    }
  }

  /**
   * Map to Money S3 format
   * @param {Object} data - Base format
   * @returns {Object} Money S3 format
   * @private
   */
  mapToMoneyS3Format(data) {
    return {
      doklad: {
        typ: 'PRIJEMKA',
        datum: data.occurred_at,
        castka: data.amount / 100, // Convert to CZK (Money S3 uses decimal)
        dph: data.vat_amount / 100,
        polozky: data.items.map(item => ({
          nazev: item.name,
          mnozstvi: item.quantity,
          cena: item.price / 100,
          dph_sazba: item.vat_rate
        })),
        platba: data.payment_method
      }
    };
  }

  /**
   * Map to Pohoda format
   * @param {Object} data - Base format
   * @returns {Object} Pohoda format
   * @private
   */
  mapToPohodaFormat(data) {
    return {
      invoice: {
        date: data.occurred_at,
        amount: data.amount / 100, // Convert to CZK
        vat: data.vat_amount / 100,
        items: data.items.map(item => ({
          text: item.name,
          quantity: item.quantity,
          unitPrice: item.price / 100,
          vatRate: item.vat_rate
        })),
        paymentType: data.payment_method
      }
    };
  }

  /**
   * Map to ABRA Flexi format
   * @param {Object} data - Base format
   * @returns {Object} ABRA Flexi format
   * @private
   */
  mapToAbraFlexiFormat(data) {
    return {
      document: {
        type: 'RECEIPT',
        date: data.occurred_at,
        total: data.amount / 100, // Convert to CZK
        vatTotal: data.vat_amount / 100,
        lines: data.items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.price / 100,
          vatPercent: item.vat_rate * 100 // ABRA uses percentage
        })),
        paymentMethod: data.payment_method
      }
    };
  }

  /**
   * Get export status
   * @param {string} exportId - Export ID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<string>} Export status
   */
  async getExportStatus(exportId, tenantId) {
    try {
      const response = await this.request(`/api/accounting/${this.system}/export/${exportId}`, {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      if (response.status === 404) {
        return null;
      }

      const data = await this.handleResponse(response);
      return data.status || null;
    } catch (error) {
      if (error instanceof AdapterError && error.code === AdapterErrorCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if direct API should be used
   * @returns {boolean} True if direct API should be used
   * @private
   */
  shouldUseDirectApi() {
    switch (this.system) {
      case 'money_s3':
        return !!this.moneyS3Url && !!this.moneyS3ApiKey;
      case 'pohoda':
        return !!this.pohodaUrl && !!this.pohodaApiKey;
      case 'abra_flexi':
        return !!this.abraFlexiUrl && !!this.abraFlexiApiKey;
      default:
        return false;
    }
  }

  /**
   * Export transaction using direct API
   * @param {Object} accountingData - Accounting system formatted data
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Export result
   * @private
   */
  async exportTransactionDirect(accountingData, tenantId, idempotencyKey = null) {
    switch (this.system) {
      case 'money_s3':
        return await this.exportToMoneyS3(accountingData, tenantId, idempotencyKey);
      case 'pohoda':
        return await this.exportToPohoda(accountingData, tenantId, idempotencyKey);
      case 'abra_flexi':
        return await this.exportToAbraFlexi(accountingData, tenantId, idempotencyKey);
      default:
        throw new AdapterError(
          `Unsupported accounting system: ${this.system}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.CONFIGURATION_ERROR
        );
    }
  }

  /**
   * Export to Money S3 via direct API
   * @param {Object} data - Accounting data
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Export result
   * @private
   */
  async exportToMoneyS3(data, tenantId, idempotencyKey = null) {
    if (!this.moneyS3Url || !this.moneyS3ApiKey) {
      throw new AdapterError(
        'Money S3 API not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.moneyS3ApiKey}`
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const response = await fetch(`${this.moneyS3Url}/api/v1/doklady`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `Money S3 export failed: ${errorData.error || response.statusText}`,
          this.adapterName,
          null,
          true,
          AdapterErrorCodes.UNKNOWN_ERROR
        );
      }

      const result = await response.json();

      return {
        id: result.id || `money_s3_${Date.now()}`,
        status: 'exported',
        exportedAt: new Date(),
        tenantId: tenantId,
        externalId: result.id || result.doklad_id,
        idempotencyKey: idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Money S3 export failed: ${error.message}`,
        this.adapterName,
        error,
        true,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Export to Pohoda via direct API
   * @param {Object} data - Accounting data
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Export result
   * @private
   */
  async exportToPohoda(data, tenantId, idempotencyKey = null) {
    if (!this.pohodaUrl || !this.pohodaApiKey) {
      throw new AdapterError(
        'Pohoda API not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.pohodaApiKey}`
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const response = await fetch(`${this.pohodaUrl}/api/v1/invoices`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `Pohoda export failed: ${errorData.error || response.statusText}`,
          this.adapterName,
          null,
          true,
          AdapterErrorCodes.UNKNOWN_ERROR
        );
      }

      const result = await response.json();

      return {
        id: result.id || `pohoda_${Date.now()}`,
        status: 'exported',
        exportedAt: new Date(),
        tenantId: tenantId,
        externalId: result.id || result.invoice_id,
        idempotencyKey: idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Pohoda export failed: ${error.message}`,
        this.adapterName,
        error,
        true,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Export to ABRA Flexi via direct API
   * @param {Object} data - Accounting data
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Export result
   * @private
   */
  async exportToAbraFlexi(data, tenantId, idempotencyKey = null) {
    if (!this.abraFlexiUrl || !this.abraFlexiApiKey) {
      throw new AdapterError(
        'ABRA Flexi API not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.abraFlexiApiKey}`
      };

      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const response = await fetch(`${this.abraFlexiUrl}/api/v1/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `ABRA Flexi export failed: ${errorData.error || response.statusText}`,
          this.adapterName,
          null,
          true,
          AdapterErrorCodes.UNKNOWN_ERROR
        );
      }

      const result = await response.json();

      return {
        id: result.id || `abra_${Date.now()}`,
        status: 'exported',
        exportedAt: new Date(),
        tenantId: tenantId,
        externalId: result.id || result.document_id,
        idempotencyKey: idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `ABRA Flexi export failed: ${error.message}`,
        this.adapterName,
        error,
        true,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }
}


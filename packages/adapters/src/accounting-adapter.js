/**
 * Accounting Adapter
 * Integrates with Czech accounting systems (Money S3, Pohoda, ABRA Flexi)
 * Post-MVP: Currently a stub implementation
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class AccountingAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('accounting', config);
    // Supported accounting systems
    this.supportedSystems = ['money_s3', 'pohoda', 'abra_flexi'];
    this.system = config.system || process.env.ACCOUNTING_SYSTEM || 'money_s3';
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
}


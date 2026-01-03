/**
 * Inventory Adapter
 * Integrates with existing warehouse-microservice
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class InventoryAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('inventory', config);
  }

  /**
   * Decrease inventory stock
   * @param {string} itemId - Inventory item UUID
   * @param {number} quantity - Quantity to decrease
   * @param {string} reason - Reason for decrease
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Inventory movement aggregate
   */
  async decreaseStock(itemId, quantity, reason, tenantId, idempotencyKey = null) {
    if (!itemId || !quantity || !reason || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: itemId, quantity, reason, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    if (quantity <= 0) {
      throw new AdapterError(
        'Quantity must be greater than 0',
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

      const response = await this.request(`/api/inventory/items/${itemId}/decrease`, {
        method: 'POST',
        body: JSON.stringify({
          quantity,
          reason
        }),
        headers
      });

      const data = await this.handleResponse(response);

      // Check for insufficient stock error
      if (data.error && data.error.includes('insufficient')) {
        throw new AdapterError(
          `Insufficient stock: ${data.error}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.INSUFFICIENT_STOCK
        );
      }

      return {
        id: data.movement_id || data.id,
        itemId: data.item_id || itemId,
        quantity: -(data.quantity || quantity), // Negative for decrease
        reason: data.reason || reason,
        occurredAt: data.occurred_at ? new Date(data.occurred_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        idempotencyKey: data.idempotency_key || idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      // Handle insufficient stock
      if (error.message?.includes('insufficient') || error.message?.includes('stock')) {
        throw new AdapterError(
          'Insufficient stock',
          this.adapterName,
          error,
          false,
          AdapterErrorCodes.INSUFFICIENT_STOCK
        );
      }

      throw new AdapterError(
        `Decrease stock failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Increase inventory stock
   * @param {string} itemId - Inventory item UUID
   * @param {number} quantity - Quantity to increase
   * @param {string} reason - Reason for increase
   * @param {string} tenantId - Tenant UUID
   * @param {string} idempotencyKey - Optional idempotency key
   * @returns {Promise<Object>} Inventory movement aggregate
   */
  async increaseStock(itemId, quantity, reason, tenantId, idempotencyKey = null) {
    if (!itemId || !quantity || !reason || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: itemId, quantity, reason, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    if (quantity <= 0) {
      throw new AdapterError(
        'Quantity must be greater than 0',
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

      const response = await this.request(`/api/inventory/items/${itemId}/increase`, {
        method: 'POST',
        body: JSON.stringify({
          quantity,
          reason
        }),
        headers
      });

      const data = await this.handleResponse(response);

      return {
        id: data.movement_id || data.id,
        itemId: data.item_id || itemId,
        quantity: data.quantity || quantity, // Positive for increase
        reason: data.reason || reason,
        occurredAt: data.occurred_at ? new Date(data.occurred_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        idempotencyKey: data.idempotency_key || idempotencyKey
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Increase stock failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Get current stock level
   * @param {string} itemId - Inventory item UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<number>} Current stock quantity
   */
  async getStock(itemId, tenantId) {
    const item = await this.getItem(itemId, tenantId);
    return item ? item.quantity : 0;
  }

  /**
   * Get inventory item by ID
   * @param {string} itemId - Inventory item UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object|null>} InventoryItem aggregate or null
   */
  async getItem(itemId, tenantId) {
    try {
      const response = await this.request(`/api/inventory/items/${itemId}`, {
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
        id: data.item_id || data.id,
        name: data.name,
        sku: data.sku || '',
        quantity: data.quantity || 0,
        unit: data.unit || 'piece',
        tenantId: data.tenant_id || tenantId,
        reorderLevel: data.reorder_level || data.reorderLevel || null
      };
    } catch (error) {
      if (error instanceof AdapterError && error.code === AdapterErrorCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all inventory items for tenant
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Array>} Array of InventoryItem aggregates
   */
  async listItems(tenantId) {
    try {
      const response = await this.request('/api/inventory/items', {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);
      const items = data.items || data || [];

      return items.map(item => ({
        id: item.item_id || item.id,
        name: item.name,
        sku: item.sku || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'piece',
        tenantId: item.tenant_id || tenantId,
        reorderLevel: item.reorder_level || item.reorderLevel || null
      }));
    } catch (error) {
      throw error;
    }
  }
}


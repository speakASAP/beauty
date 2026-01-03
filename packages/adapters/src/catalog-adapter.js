/**
 * Catalog Adapter
 * Integrates with existing catalog-microservice
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class CatalogAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('catalog', config);
  }

  /**
   * Get service by ID
   * @param {string} serviceId - Service UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object|null>} Service aggregate or null
   */
  async getService(serviceId, tenantId) {
    try {
      const response = await this.request(`/api/services/${serviceId}`, {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      if (response.status === 404) {
        return null;
      }

      const data = await this.handleResponse(response);

      // Map external service response to domain model
      return {
        id: data.service_id || data.id,
        name: data.name,
        description: data.description || '',
        durationMinutes: data.duration_minutes || data.durationMinutes || 0,
        price: data.price || 0,
        vatRate: data.vat_rate || data.vatRate || 0.21,
        category: data.category || '',
        requiresInventory: data.requires_inventory || data.requiresInventory || false,
        inventoryItems: (data.inventory_items || data.inventoryItems || []).map(item => ({
          itemId: item.item_id || item.itemId,
          quantity: item.quantity || 0
        })),
        tenantId: data.tenant_id || data.tenantId || tenantId
      };
    } catch (error) {
      if (error instanceof AdapterError && error.code === AdapterErrorCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all services for tenant
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Array>} Array of Service aggregates
   */
  async listServices(tenantId) {
    try {
      const response = await this.request('/api/services', {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);
      const services = data.services || data || [];

      return services.map(service => ({
        id: service.service_id || service.id,
        name: service.name,
        description: service.description || '',
        durationMinutes: service.duration_minutes || service.durationMinutes || 0,
        price: service.price || 0,
        vatRate: service.vat_rate || service.vatRate || 0.21,
        category: service.category || '',
        requiresInventory: service.requires_inventory || service.requiresInventory || false,
        inventoryItems: (service.inventory_items || service.inventoryItems || []).map(item => ({
          itemId: item.item_id || item.itemId,
          quantity: item.quantity || 0
        })),
        tenantId: service.tenant_id || service.tenantId || tenantId
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service price (with tenant-specific overrides)
   * @param {string} serviceId - Service UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<number>} Price in CZK (smallest unit)
   */
  async getServicePrice(serviceId, tenantId) {
    const service = await this.getService(serviceId, tenantId);
    if (!service) {
      throw new AdapterError(
        `Service not found: ${serviceId}`,
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.NOT_FOUND
      );
    }
    return service.price;
  }

  /**
   * Get product by ID
   * @param {string} productId - Product UUID
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object|null>} Product aggregate or null
   */
  async getProduct(productId, tenantId) {
    try {
      const response = await this.request(`/api/products/${productId}`, {
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
        id: data.product_id || data.id,
        name: data.name,
        description: data.description || '',
        sku: data.sku || '',
        price: data.price || 0,
        vatRate: data.vat_rate || data.vatRate || 0.21,
        category: data.category || '',
        tenantId: data.tenant_id || data.tenantId || tenantId
      };
    } catch (error) {
      if (error instanceof AdapterError && error.code === AdapterErrorCodes.NOT_FOUND) {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all products for tenant
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Array>} Array of Product aggregates
   */
  async listProducts(tenantId) {
    try {
      const response = await this.request('/api/products', {
        method: 'GET',
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);
      const products = data.products || data || [];

      return products.map(product => ({
        id: product.product_id || product.id,
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        price: product.price || 0,
        vatRate: product.vat_rate || product.vatRate || 0.21,
        category: product.category || '',
        tenantId: product.tenant_id || product.tenantId || tenantId
      }));
    } catch (error) {
      throw error;
    }
  }
}


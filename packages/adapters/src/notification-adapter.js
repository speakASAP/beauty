/**
 * Notification Adapter
 * Integrates with existing notifications-microservice
 */

import fetch from 'node-fetch';
import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class NotificationAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('notification', config);
    // Supported SMS gateways
    this.supportedGateways = ['bulkgate', 'gosms'];
    // Default gateway (can be overridden per tenant)
    this.smsGateway = config.smsGateway || process.env.SMS_GATEWAY || 'bulkgate';
    // Gateway-specific API keys
    this.bulkgateApiKey = config.bulkgateApiKey || process.env.BULKGATE_API_KEY;
    this.gosmsApiKey = config.gosmsApiKey || process.env.GOSMS_API_KEY;
    // Gateway URLs
    this.bulkgateUrl = config.bulkgateUrl || process.env.BULKGATE_API_URL || 'https://api.bulkgate.com';
    this.gosmsUrl = config.gosmsUrl || process.env.GOSMS_API_URL || 'https://api.gosms.cz';
    // Fallback enabled
    this.fallbackEnabled = config.fallbackEnabled !== false && process.env.SMS_GATEWAY_FALLBACK !== 'false';
  }

  /**
   * Send SMS to client
   * @param {string} phone - Phone number (Czech format: +420XXXXXXXXX)
   * @param {string} message - SMS message text
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   */
  async sendSms(phone, message, tenantId) {
    if (!phone || !message || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: phone, message, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    // Validate Czech phone format
    if (!/^\+420\d{9}$/.test(phone)) {
      throw new AdapterError(
        `Invalid phone format: ${phone}. Expected format: +420XXXXXXXXX`,
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      // Try direct gateway API if configured, otherwise use notifications-microservice
      if (this.shouldUseDirectSmsGateway()) {
        return await this.sendSmsDirect(phone, message, tenantId);
      }

      // Fallback to notifications-microservice
      const response = await this.request('/api/notifications/sms', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          message
        }),
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);

      return {
        id: data.notification_id || data.id,
        status: data.status || 'sent',
        sentAt: data.sent_at ? new Date(data.sent_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        channel: 'sms'
      };
    } catch (error) {
      // If fallback is enabled and direct gateway failed, try fallback
      if (this.fallbackEnabled && this.shouldUseDirectSmsGateway()) {
        try {
          return await this.sendSmsWithFallback(phone, message, tenantId);
        } catch (fallbackError) {
          // If fallback also fails, throw original error
        }
      }

      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `SMS send failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || true, // SMS failures are usually retryable
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Send email to client
   * @param {string} email - Email address
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML or plain text)
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   */
  async sendEmail(email, subject, body, tenantId) {
    if (!email || !subject || !body || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: email, subject, body, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AdapterError(
        `Invalid email format: ${email}`,
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      const response = await this.request('/api/notifications/email', {
        method: 'POST',
        body: JSON.stringify({
          email,
          subject,
          body
        }),
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);

      return {
        id: data.notification_id || data.id,
        status: data.status || 'sent',
        sentAt: data.sent_at ? new Date(data.sent_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        channel: 'email'
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Email send failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || true, // Email failures are usually retryable
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Send SMS with template
   * @param {string} phone - Phone number
   * @param {string} templateId - Template ID (e.g., 'appointment_confirmation')
   * @param {Object} variables - Template variables
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   */
  async sendSmsTemplate(phone, templateId, variables, tenantId) {
    if (!phone || !templateId || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: phone, templateId, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      const response = await this.request('/api/notifications/sms/template', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          template_id: templateId,
          variables: variables || {}
        }),
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);

      // Check for template not found
      if (data.error && data.error.includes('template')) {
        throw new AdapterError(
          `Template not found: ${templateId}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.NOT_FOUND
        );
      }

      return {
        id: data.notification_id || data.id,
        status: data.status || 'sent',
        sentAt: data.sent_at ? new Date(data.sent_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        channel: 'sms'
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `SMS template send failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Send email with template
   * @param {string} email - Email address
   * @param {string} templateId - Template ID (e.g., 'welcome_email')
   * @param {Object} variables - Template variables
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   */
  async sendEmailTemplate(email, templateId, variables, tenantId) {
    if (!email || !templateId || !tenantId) {
      throw new AdapterError(
        'Missing required parameters: email, templateId, tenantId',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.INVALID_INPUT
      );
    }

    try {
      const response = await this.request('/api/notifications/email/template', {
        method: 'POST',
        body: JSON.stringify({
          email,
          template_id: templateId,
          variables: variables || {}
        }),
        headers: {
          'X-Tenant-ID': tenantId
        }
      });

      const data = await this.handleResponse(response);

      // Check for template not found
      if (data.error && data.error.includes('template')) {
        throw new AdapterError(
          `Template not found: ${templateId}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.NOT_FOUND
        );
      }

      return {
        id: data.notification_id || data.id,
        status: data.status || 'sent',
        sentAt: data.sent_at ? new Date(data.sent_at) : new Date(),
        tenantId: data.tenant_id || tenantId,
        channel: 'email'
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `Email template send failed: ${error.message}`,
        this.adapterName,
        error,
        error.retryable || false,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Check if direct SMS gateway should be used
   * @returns {boolean} True if direct gateway should be used
   * @private
   */
  shouldUseDirectSmsGateway() {
    return (this.smsGateway === 'bulkgate' && !!this.bulkgateApiKey) ||
           (this.smsGateway === 'gosms' && !!this.gosmsApiKey);
  }

  /**
   * Send SMS using direct gateway API
   * @param {string} phone - Phone number
   * @param {string} message - SMS message
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   * @private
   */
  async sendSmsDirect(phone, message, tenantId) {
    switch (this.smsGateway) {
      case 'bulkgate':
        return await this.sendSmsBulkGate(phone, message, tenantId);
      case 'gosms':
        return await this.sendSmsGoSMS(phone, message, tenantId);
      default:
        throw new AdapterError(
          `Unsupported SMS gateway: ${this.smsGateway}`,
          this.adapterName,
          null,
          false,
          AdapterErrorCodes.CONFIGURATION_ERROR
        );
    }
  }

  /**
   * Send SMS with fallback mechanism
   * @param {string} phone - Phone number
   * @param {string} message - SMS message
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   * @private
   */
  async sendSmsWithFallback(phone, message, tenantId) {
    const gateways = this.supportedGateways.filter(g => g !== this.smsGateway);
    
    for (const gateway of gateways) {
      try {
        const originalGateway = this.smsGateway;
        this.smsGateway = gateway;
        const result = await this.sendSmsDirect(phone, message, tenantId);
        this.smsGateway = originalGateway;
        return result;
      } catch (error) {
        // Try next gateway
        continue;
      }
    }

    throw new AdapterError(
      'All SMS gateways failed',
      this.adapterName,
      null,
      false,
      AdapterErrorCodes.UNKNOWN_ERROR
    );
  }

  /**
   * Send SMS via BulkGate
   * @param {string} phone - Phone number
   * @param {string} message - SMS message
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   * @private
   */
  async sendSmsBulkGate(phone, message, tenantId) {
    if (!this.bulkgateApiKey) {
      throw new AdapterError(
        'BulkGate API key not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      const response = await fetch(`${this.bulkgateUrl}/api/v1/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.bulkgateApiKey
        },
        body: JSON.stringify({
          number: phone,
          text: message,
          unicode: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `BulkGate SMS failed: ${errorData.error || response.statusText}`,
          this.adapterName,
          null,
          true, // Retryable
          AdapterErrorCodes.UNKNOWN_ERROR
        );
      }

      const data = await response.json();

      return {
        id: data.id || data.message_id || `bulkgate_${Date.now()}`,
        status: data.status === 'sent' ? 'sent' : 'pending',
        sentAt: new Date(),
        tenantId: tenantId,
        channel: 'sms',
        gateway: 'bulkgate',
        externalId: data.id || data.message_id
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `BulkGate SMS send failed: ${error.message}`,
        this.adapterName,
        error,
        true,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Send SMS via GoSMS
   * @param {string} phone - Phone number
   * @param {string} message - SMS message
   * @param {string} tenantId - Tenant UUID
   * @returns {Promise<Object>} Notification result
   * @private
   */
  async sendSmsGoSMS(phone, message, tenantId) {
    if (!this.gosmsApiKey) {
      throw new AdapterError(
        'GoSMS API key not configured',
        this.adapterName,
        null,
        false,
        AdapterErrorCodes.CONFIGURATION_ERROR
      );
    }

    try {
      const response = await fetch(`${this.gosmsUrl}/api/v1/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gosmsApiKey}`
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AdapterError(
          `GoSMS SMS failed: ${errorData.error || response.statusText}`,
          this.adapterName,
          null,
          true, // Retryable
          AdapterErrorCodes.UNKNOWN_ERROR
        );
      }

      const data = await response.json();

      return {
        id: data.id || data.message_id || `gosms_${Date.now()}`,
        status: data.status === 'sent' ? 'sent' : 'pending',
        sentAt: new Date(),
        tenantId: tenantId,
        channel: 'sms',
        gateway: 'gosms',
        externalId: data.id || data.message_id
      };
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }

      throw new AdapterError(
        `GoSMS SMS send failed: ${error.message}`,
        this.adapterName,
        error,
        true,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }
}


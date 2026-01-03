/**
 * Notification Adapter
 * Integrates with existing notifications-microservice
 */

import { BaseAdapter } from './base-adapter.js';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class NotificationAdapter extends BaseAdapter {
  constructor(config = {}) {
    super('notification', config);
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
}


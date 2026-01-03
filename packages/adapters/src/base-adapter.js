/**
 * Base Adapter Class
 * Common functionality for all adapters
 */

import fetch from 'node-fetch';
import { AdapterError, AdapterErrorCodes } from './errors.js';

export class BaseAdapter {
  constructor(adapterName, config = {}) {
    this.adapterName = adapterName;
    // Support both SERVICE_URL and MICROSERVICE_URL patterns
    const envVarName = `${adapterName.toUpperCase()}_SERVICE_URL`;
    const microserviceEnvVarName = `${adapterName.toUpperCase()}_MICROSERVICE_URL`;
    this.endpoint = config.endpoint || process.env[envVarName] || process.env[microserviceEnvVarName];
    this.apiKey = config.apiKey || process.env[`${adapterName.toUpperCase()}_API_KEY`];
    this.timeout = config.timeout || 5000; // 5 seconds default
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second default
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} path - API path
   * @param {Object} options - Fetch options
   * @param {number} attempt - Current attempt number
   * @returns {Promise<Response>}
   */
  async request(path, options = {}, attempt = 1) {
    const url = `${this.endpoint}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle retryable errors
      if (response.status >= 500 && attempt < this.retryAttempts) {
        await this.delay(this.retryDelay * attempt);
        return this.request(path, options, attempt + 1);
      }

      // Handle rate limiting
      if (response.status === 429 && attempt < this.retryAttempts) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        await this.delay(retryAfter * 1000);
        return this.request(path, options, attempt + 1);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          return this.request(path, options, attempt + 1);
        }
        throw new AdapterError(
          `Service unavailable: ${error.message}`,
          this.adapterName,
          error,
          true,
          AdapterErrorCodes.SERVICE_UNAVAILABLE
        );
      }

      throw new AdapterError(
        `Request failed: ${error.message}`,
        this.adapterName,
        error,
        false,
        AdapterErrorCodes.UNKNOWN_ERROR
      );
    }
  }

  /**
   * Handle HTTP response and convert to domain error if needed
   * @param {Response} response - HTTP response
   * @returns {Promise<Object>} Response data
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      let code = AdapterErrorCodes.UNKNOWN_ERROR;
      let retryable = false;

      switch (response.status) {
        case 400:
          code = AdapterErrorCodes.INVALID_INPUT;
          break;
        case 401:
          code = AdapterErrorCodes.AUTHENTICATION_FAILED;
          break;
        case 404:
          code = AdapterErrorCodes.NOT_FOUND;
          break;
        case 429:
          code = AdapterErrorCodes.RATE_LIMIT_EXCEEDED;
          retryable = true;
          break;
        case 500:
        case 502:
        case 503:
          code = AdapterErrorCodes.SERVICE_UNAVAILABLE;
          retryable = true;
          break;
      }

      throw new AdapterError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        this.adapterName,
        null,
        retryable,
        code
      );
    }

    return response.json();
  }

  /**
   * Delay helper for retries
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check adapter health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    const startTime = Date.now();
    try {
      const response = await this.request('/health', { method: 'GET' });
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return {
          adapter: this.adapterName,
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          latency
        };
      } else {
        return {
          adapter: this.adapterName,
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          latency,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        adapter: this.adapterName,
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
    }
  }
}


/**
 * Logger Library
 * Shared logger implementation for beauty platform
 * Integrates with centralized logging microservice
 */

/**
 * Logger class that sends logs to centralized logging microservice
 */
export class Logger {
  constructor(serviceName, loggingServiceUrl = null) {
    this.serviceName = serviceName;
    this.loggingServiceUrl = loggingServiceUrl || process.env.LOGGING_SERVICE_URL || 'http://logging-microservice:3367';
    this.enabled = !!this.loggingServiceUrl;
  }

  /**
   * Send log to logging microservice
   * @param {string} level - Log level (error, warn, info, debug)
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata (includes tenant context)
   * @returns {Promise<void>}
   */
  async sendLog(level, message, metadata = {}) {
    if (!this.enabled) {
      // Fallback to console if logging service URL not configured
      this._consoleLog(level, message, metadata);
      return;
    }

    try {
      const logPayload = {
        level,
        message,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
        metadata: {
          ...metadata
        }
      };

      // Send to logging microservice
      const response = await fetch(`${this.loggingServiceUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logPayload),
        // Timeout after 2 seconds to avoid blocking
        signal: AbortSignal.timeout(2000)
      });

      if (!response.ok) {
        throw new Error(`Logging service returned ${response.status}`);
      }
    } catch (error) {
      // Fallback to console if logging service unavailable
      this._consoleLog(level, message, metadata);
      // Only log error in development to avoid log loops
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Logger] Failed to send log to logging service:`, error.message);
      }
    }
  }

  /**
   * Console fallback logging
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} metadata - Metadata
   * @private
   */
  _consoleLog(level, message, metadata) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}] ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logEntry, metadata);
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logEntry);
    }
  }

  /**
   * Log error
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async error(message, metadata = {}) {
    await this.sendLog('error', message, metadata);
  }

  /**
   * Log warning
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async warn(message, metadata = {}) {
    await this.sendLog('warn', message, metadata);
  }

  /**
   * Log info
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async info(message, metadata = {}) {
    await this.sendLog('info', message, metadata);
  }

  /**
   * Log debug
   * @param {string} message - Log message
   * @param {Object} metadata - Additional metadata
   */
  async debug(message, metadata = {}) {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      await this.sendLog('debug', message, metadata);
    }
  }

  /**
   * Create child logger with additional context
   * Useful for request-scoped logging with tenant context
   * @param {Object} context - Additional context to include in all logs
   * @returns {Logger} Child logger instance
   */
  child(context = {}) {
    const childLogger = new Logger(this.serviceName, this.loggingServiceUrl);
    // Override sendLog to include child context
    const originalSendLog = childLogger.sendLog.bind(childLogger);
    childLogger.sendLog = async (level, message, metadata = {}) => {
      await originalSendLog(level, message, { ...context, ...metadata });
    };
    return childLogger;
  }
}

/**
 * Create logger instance
 * @param {string} serviceName - Service name
 * @param {string} loggingServiceUrl - Optional logging service URL (defaults to env var)
 * @returns {Logger}
 */
export function createLogger(serviceName, loggingServiceUrl = null) {
  return new Logger(serviceName, loggingServiceUrl);
}

/**
 * Express middleware to attach logger with tenant context to request
 * Must be used after tenantContextMiddleware
 * @param {Logger} logger - Base logger instance
 * @returns {Function} Express middleware function
 */
export function loggingMiddleware(logger) {
  return (req, res, next) => {
    // Create child logger with tenant context
    const tenantContext = req.tenantContext || {};
    const logContext = {
      tenant_id: tenantContext.tenantId || null,
      user_id: tenantContext.userId || null,
      is_franchisor: tenantContext.isFranchisor || false,
      correlation_id: tenantContext.correlationId || req.headers['x-correlation-id'] || null
    };

    // Attach logger to request
    req.logger = logger.child(logContext);

    next();
  };
}

export default {
  Logger,
  createLogger,
  loggingMiddleware
};


/**
 * Error Tracking Package
 * Sentry integration for beauty platform
 * 
 * Features:
 * - Error capture and reporting
 * - Tenant context in errors
 * - Request context in errors
 * - Performance monitoring
 * - Release tracking
 */

import * as Sentry from '@sentry/node';

let initialized = false;

/**
 * Initialize Sentry
 * @param {Object} options - Sentry options
 */
export function initErrorTracking(options = {}) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    release = process.env.APP_VERSION,
    enabled = process.env.SENTRY_ENABLED !== 'false' && !!dsn
  } = options;

  if (!enabled || initialized) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: undefined })
    ]
  });

  initialized = true;
}

/**
 * Express middleware for error tracking
 * Must be added before routes and after other middleware
 * @returns {Function} Express middleware
 */
export function errorTrackingMiddleware() {
  return Sentry.Handlers.requestHandler({
    user: ['id', 'email'],
    ip: true
  });
}

/**
 * Express error handler middleware
 * Must be added after all routes
 * @returns {Function} Express error middleware
 */
export function errorHandlerMiddleware() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Don't track 4xx errors (client errors)
      if (error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return true;
    }
  });
}

/**
 * Set user context for error tracking
 * @param {Object} user - User information
 */
export function setUserContext(user) {
  if (initialized) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      tenant_id: user.tenant_id
    });
  }
}

/**
 * Set tenant context for error tracking
 * @param {Object} tenantContext - Tenant context
 */
export function setTenantContext(tenantContext) {
  if (initialized && tenantContext) {
    Sentry.setContext('tenant', {
      tenant_id: tenantContext.tenantId,
      user_id: tenantContext.userId,
      is_franchisor: tenantContext.isFranchisor,
      correlation_id: tenantContext.correlationId
    });
  }
}

/**
 * Capture exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  if (initialized) {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    });
  }
}

/**
 * Capture message
 * @param {string} message - Message to capture
 * @param {string} level - Log level (error, warning, info)
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (initialized) {
    Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context
      }
    });
  }
}

/**
 * Add breadcrumb
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  if (initialized) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

/**
 * Express middleware to set tenant context
 * Must be used after tenantContextMiddleware
 * @returns {Function} Express middleware
 */
export function tenantContextErrorTrackingMiddleware() {
  return (req, res, next) => {
    if (req.tenantContext) {
      setTenantContext(req.tenantContext);
      setUserContext({
        id: req.tenantContext.userId,
        tenant_id: req.tenantContext.tenantId
      });
    }
    next();
  };
}

export default {
  initErrorTracking,
  errorTrackingMiddleware,
  errorHandlerMiddleware,
  setUserContext,
  setTenantContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  tenantContextErrorTrackingMiddleware
};


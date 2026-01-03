/**
 * Tenant Middleware Library
 * Shared tenant middleware for beauty platform
 * Handles JWT validation, tenant context extraction, and DB session binding
 */

import jwt from 'jsonwebtoken';
import { randomUUID } from 'uuid';

/**
 * Validate UUID format
 * @param {string} uuid - UUID string to validate
 * @returns {boolean}
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Extract tenant context from request
 * Supports multiple sources: JWT, headers, request context
 * @param {Object} req - Express request object
 * @returns {Object|null} Tenant context or null
 */
export function extractTenantContext(req) {
  // Priority 1: From request context (if middleware already attached)
  if (req.tenantContext) {
    return req.tenantContext;
  }

  // Priority 2: From X-Tenant-ID header (preferred - from API Gateway)
  const tenantId = req.headers['x-tenant-id'];
  const userId = req.headers['x-user-id'];
  const userRoles = req.headers['x-user-roles']?.split(',') || [];
  const isFranchisor = req.headers['x-is-franchisor'] === 'true';

  if (tenantId || isFranchisor) {
    return {
      tenantId: tenantId || null,
      userId: userId || null,
      roles: userRoles,
      isFranchisor: isFranchisor,
      correlationId: req.headers['x-correlation-id'] || randomUUID()
    };
  }

  // Priority 3: From JWT token (if Gateway didn't extract)
  // Note: JWT signature verification is expected to be done by API Gateway
  // This middleware only decodes the token as a fallback if headers are not present
  // Gateway should validate signature, expiration, and extract claims before forwarding
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Decode without verification (Gateway should verify signature and expiration)
      const decoded = jwt.decode(token);
      if (decoded) {
        return {
          tenantId: decoded.tenant_id || null,
          userId: decoded.sub || null,
          roles: decoded.roles || [],
          isFranchisor: decoded.is_franchisor === true,
          correlationId: req.headers['x-correlation-id'] || randomUUID()
        };
      }
    } catch (error) {
      // Invalid token, will be handled by validation
    }
  }

  return null;
}

/**
 * Validate tenant context
 * @param {Object} tenantContext - Tenant context object
 * @param {boolean} allowFranchisor - Allow franchisor (tenant_id can be null)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validateTenantContext(tenantContext, allowFranchisor = true) {
  if (!tenantContext) {
    return { valid: false, error: 'Missing tenant context' };
  }

  // Franchisor can have null tenant_id
  if (allowFranchisor && tenantContext.isFranchisor) {
    return { valid: true, error: null };
  }

  // Non-franchisor must have tenant_id
  if (!tenantContext.tenantId) {
    return { valid: false, error: 'Missing tenant_id (required for non-franchisor)' };
  }

  // Validate tenant_id format
  if (!isValidUUID(tenantContext.tenantId)) {
    return { valid: false, error: 'Invalid tenant_id format (must be valid UUID)' };
  }

  return { valid: true, error: null };
}

/**
 * Set tenant context in database session
 * Must be called before ANY database operation
 * 
 * IMPORTANT: This must be called on a database client (not pool) that will be
 * used for all queries in the request. The dbTenantContextMiddleware handles
 * this correctly by acquiring a client and setting the context on it.
 * 
 * @param {Object} client - Database client (pg.Client or client from pool.connect())
 * @param {string|null} tenantId - Tenant ID (null for franchisor)
 * @param {boolean} isFranchisor - Is franchisor
 * @returns {Promise<void>}
 */
export async function setTenantContext(client, tenantId, isFranchisor = false) {
  if (isFranchisor) {
    // Franchisor uses special role (bypasses RLS with audit)
    // Note: In production, this should use a special database role
    await client.query('SET app.is_franchisor = true');
    await client.query('SET app.tenant_id = NULL');
  } else {
    if (!tenantId) {
      throw new Error('Cannot set tenant context: tenant_id is required for non-franchisor');
    }
    if (!isValidUUID(tenantId)) {
      throw new Error('Cannot set tenant context: invalid tenant_id format');
    }
    // Set tenant context for RLS
    await client.query('SET app.tenant_id = $1', [tenantId]);
    await client.query('SET app.is_franchisor = false');
  }
}

/**
 * Express middleware for tenant context extraction and validation
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware function
 */
export function tenantContextMiddleware(options = {}) {
  const { allowFranchisor = true, requireTenant = true } = options;

  return async (req, res, next) => {
    try {
      // Extract tenant context
      const tenantContext = extractTenantContext(req);

      // Validate tenant context
      const validation = validateTenantContext(tenantContext, allowFranchisor);
      if (!validation.valid) {
        return res.status(403).json({
          error: validation.error,
          code: 'TENANT_CONTEXT_INVALID',
          status: 403,
          timestamp: new Date().toISOString(),
          request_id: req.headers['x-correlation-id'] || randomUUID()
        });
      }

      // Attach to request
      req.tenantContext = tenantContext;

      // If tenant is required and not franchisor, ensure tenant_id exists
      if (requireTenant && !tenantContext.isFranchisor && !tenantContext.tenantId) {
        return res.status(403).json({
          error: 'Tenant context required',
          code: 'TENANT_REQUIRED',
          status: 403,
          timestamp: new Date().toISOString(),
          request_id: tenantContext.correlationId
        });
      }

      next();
    } catch (error) {
      console.error('Tenant context middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        code: 'TENANT_MIDDLEWARE_ERROR',
        status: 500,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Express middleware for database tenant context binding
 * Must be used after tenantContextMiddleware
 * 
 * IMPORTANT: With connection pooling, this acquires a client from the pool,
 * sets the tenant context on that client, and attaches it to req.dbClient.
 * All queries in the request should use req.dbClient instead of the pool.
 * The client is released back to the pool after the request completes.
 * 
 * @param {Object} db - Database connection pool (pg.Pool)
 * @returns {Function} Express middleware function
 */
export function dbTenantContextMiddleware(db) {
  return async (req, res, next) => {
    let client = null;
    try {
      const tenantContext = req.tenantContext;
      if (!tenantContext) {
        return res.status(500).json({
          error: 'Tenant context not set. Use tenantContextMiddleware first.',
          code: 'TENANT_CONTEXT_MISSING',
          status: 500,
          timestamp: new Date().toISOString()
        });
      }

      // Get a client from the pool for this request
      client = await db.connect();

      // Set tenant context on this specific client
      await setTenantContext(
        client,
        tenantContext.tenantId,
        tenantContext.isFranchisor
      );

      // Attach client to request so handlers can use it
      req.dbClient = client;

      // Override res.end to release client when response is sent
      const originalEnd = res.end;
      res.end = function(...args) {
        // Clear tenant context before releasing client
        // Note: res.end is synchronous, so we can't await the RESET commands
        // The RESET commands are fire-and-forget cleanup - the next request will set its own context
        if (client) {
          // Fire-and-forget cleanup (next request will set its own context)
          client.query('RESET app.tenant_id').catch(() => {});
          client.query('RESET app.is_franchisor').catch(() => {});
          client.release();
          req.dbClient = null;
        }
        originalEnd.apply(this, args);
      };

      next();
    } catch (error) {
      // Release client on error
      if (client) {
        try {
          await client.query('RESET app.tenant_id').catch(() => {});
          await client.query('RESET app.is_franchisor').catch(() => {});
          client.release();
        } catch (releaseError) {
          console.error('Error releasing database client:', releaseError);
        }
        req.dbClient = null;
      }
      console.error('DB tenant context middleware error:', error);
      return res.status(500).json({
        error: 'Failed to set database tenant context',
        code: 'DB_TENANT_CONTEXT_ERROR',
        status: 500,
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Create logging context with tenant information
 * @param {Object} tenantContext - Tenant context object
 * @param {Object} additionalContext - Additional context to include
 * @returns {Object} Logging context
 */
export function createLoggingContext(tenantContext, additionalContext = {}) {
  return {
    tenant_id: tenantContext?.tenantId || null,
    user_id: tenantContext?.userId || null,
    is_franchisor: tenantContext?.isFranchisor || false,
    correlation_id: tenantContext?.correlationId || randomUUID(),
    ...additionalContext
  };
}

/**
 * Validate tenant state (for write or read operations)
 * 
 * Note: This queries platform.tenants which is a platform-level table (not tenant-scoped),
 * so it doesn't require tenant context to be set. However, it should still be called
 * after tenant context is validated to ensure we're checking the correct tenant.
 * 
 * @param {Object} client - Database connection/pool
 * @param {string} tenantId - Tenant ID
 * @param {boolean} allowReadOnly - If true, allows SUSPENDED tenants for read operations
 * @returns {Promise<Object>} { valid: boolean, state: string|null, error: string|null }
 */
export async function validateTenantState(client, tenantId, allowReadOnly = false) {
  try {
    // Query platform.tenants (platform-level table, not tenant-scoped)
    // This table doesn't have RLS enabled, so we can query it directly
    // Note: client can be a pool or a client - both support .query()
    const result = await client.query(
      'SELECT state FROM platform.tenants WHERE id = $1',
      [tenantId]
    );

    if (result.rows.length === 0) {
      return { valid: false, state: null, error: 'Tenant not found' };
    }

    const state = result.rows[0].state;

    // ACTIVE tenants can perform all operations
    if (state === 'ACTIVE') {
      return { valid: true, state, error: null };
    }

    // SUSPENDED tenants: Read-only access allowed if allowReadOnly is true
    if (state === 'SUSPENDED' && allowReadOnly) {
      return { valid: true, state, error: null };
    }

    // CREATING, SUSPENDED (for writes), ARCHIVED tenants have restrictions
    // CREATING: No data access
    // SUSPENDED (writes): Read-only (blocks writes)
    // ARCHIVED: No access
    return { valid: false, state, error: `Tenant state is ${state}` };
  } catch (error) {
    console.error('Error validating tenant state:', error);
    return { valid: false, state: null, error: 'Failed to validate tenant state' };
  }
}

/**
 * Express middleware for tenant state validation (for write operations)
 * Must be used after tenantContextMiddleware and dbTenantContextMiddleware
 * @param {Object} db - Database connection pool (fallback if req.dbClient not set)
 * @param {Object} options - Middleware options
 * @param {boolean} options.allowReadOnly - If true, allows SUSPENDED tenants (for read operations)
 * @returns {Function} Express middleware function
 */
export function tenantStateValidationMiddleware(db, options = {}) {
  const { allowReadOnly = false } = options;

  return async (req, res, next) => {
    try {
      const tenantContext = req.tenantContext;
      if (!tenantContext) {
        return res.status(500).json({
          error: 'Tenant context not set',
          code: 'TENANT_CONTEXT_MISSING',
          status: 500,
          timestamp: new Date().toISOString()
        });
      }

      // Franchisor bypasses tenant state check
      if (tenantContext.isFranchisor) {
        return next();
      }

      // Use req.dbClient if available (from dbTenantContextMiddleware), otherwise use pool
      const client = req.dbClient || db;

      // Validate tenant state (allowReadOnly=true for read operations, false for writes)
      const validation = await validateTenantState(client, tenantContext.tenantId, allowReadOnly);
      if (!validation.valid) {
        return res.status(403).json({
          error: `Tenant state validation failed: ${validation.error}`,
          code: 'TENANT_STATE_INVALID',
          status: 403,
          tenant_state: validation.state,
          timestamp: new Date().toISOString(),
          request_id: tenantContext.correlationId
        });
      }

      next();
    } catch (error) {
      console.error('Tenant state validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        code: 'TENANT_STATE_VALIDATION_ERROR',
        status: 500,
        timestamp: new Date().toISOString()
      });
    }
  };
}

export default {
  extractTenantContext,
  validateTenantContext,
  setTenantContext,
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  createLoggingContext,
  validateTenantState,
  tenantStateValidationMiddleware
};


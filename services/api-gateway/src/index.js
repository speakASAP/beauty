/**
 * API Gateway Service
 * JWT validation, tenant propagation, request routing
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { createLogger } from '@beauty/logger';

const app = express();
app.use(express.json());

// Logger
const logger = createLogger(process.env.SERVICE_NAME || 'api-gateway');

// Database connection (for public tenant info endpoint)
const db = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL
}) : null;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-User-ID', 'X-Correlation-ID']
};

app.use(cors(corsOptions));

// Request ID middleware (for correlation)
app.use((req, res, next) => {
  req.id = req.headers['x-correlation-id'] || randomUUID();
  res.setHeader('X-Correlation-ID', req.id);
  next();
});

// ============================================================================
// HEALTH CHECK (No Authentication Required)
// ============================================================================

app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

// ============================================================================
// PUBLIC TENANT INFO ENDPOINT (No Authentication Required)
// ============================================================================

/**
 * GET /public/tenants/:tenant_id
 * Get tenant information by tenant_id (public, no auth required)
 * Used by public website to load tenant-specific landing pages
 */
app.get('/public/tenants/:tenant_id', async (req, res) => {
  try {
    const { tenant_id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenant_id)) {
      return res.status(400).json({
        error: 'Invalid tenant ID format',
        code: 'INVALID_TENANT_ID',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    if (!db) {
      return res.status(503).json({
        error: 'Database not configured',
        code: 'DATABASE_NOT_AVAILABLE',
        status: 503,
        timestamp: new Date().toISOString()
      });
    }

    // Query tenant from database (no tenant context needed - public read)
    // Handle both 'design' and 'design_theme' columns for backward compatibility
    const result = await db.query(`
      SELECT 
        id,
        name,
        address,
        phone,
        email,
        state,
        COALESCE(design, design_theme, 'salon1') as design_theme,
        created_at,
        updated_at
      FROM platform.tenants
      WHERE id = $1 AND state = 'ACTIVE'
    `, [tenant_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found or not active',
        code: 'TENANT_NOT_FOUND',
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    const tenant = result.rows[0];

    // Return tenant info (public data only)
    res.json({
      data: {
        id: tenant.id,
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        state: tenant.state,
        design_theme: tenant.design_theme || 'salon1',
        created_at: tenant.created_at.toISOString(),
        updated_at: tenant.updated_at.toISOString()
      },
      status: 200,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await logger.error('Error fetching tenant info', {
      error: error.message,
      tenant_id: req.params.tenant_id,
      correlation_id: req.id
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// JWT VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Validate JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
async function validateJWT(token) {
  try {
    // Get JWT secret from environment (for symmetric signing)
    // Or use JWKS for RS256 (if auth service uses RS256)
    const jwtSecret = process.env.JWT_SECRET;
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-microservice:3367';

    if (!jwtSecret) {
      // If no secret, try to validate via auth service
      try {
        const response = await fetch(`${authServiceUrl}/auth/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return data.data || jwt.decode(token);
        }
      } catch (error) {
        await logger.error('Auth service validation failed', { error: error.message });
      }

      // Fallback: decode without verification (NOT RECOMMENDED for production)
      // In production, JWT_SECRET must be set
      await logger.warn('JWT_SECRET not set, decoding without verification');
      return jwt.decode(token);
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      await logger.warn('JWT token expired', { error: error.message });
      return null;
    }
    if (error.name === 'JsonWebTokenError') {
      await logger.warn('Invalid JWT token', { error: error.message });
      return null;
    }
    await logger.error('JWT validation error', { error: error.message });
    return null;
  }
}

/**
 * JWT validation middleware
 * Validates JWT and extracts tenant context
 */
async function jwtValidationMiddleware(req, res, next) {
  // Skip validation for health check and public endpoints
  if (req.path === '/health' || req.path.startsWith('/public/')) {
    return next();
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
      code: 'UNAUTHORIZED',
      status: 401,
      timestamp: new Date().toISOString(),
      request_id: req.id
    });
  }

  const token = authHeader.substring(7);

  // Validate JWT
  const decoded = await validateJWT(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or expired JWT token',
      code: 'UNAUTHORIZED',
      status: 401,
      timestamp: new Date().toISOString(),
      request_id: req.id
    });
  }

  // Extract tenant context
  const tenantId = decoded.tenant_id || null;
  const userId = decoded.sub || decoded.user_id || null;
  const roles = decoded.roles || [];
  const isFranchisor = decoded.is_franchisor === true;

  // Validate tenant_id (unless franchisor)
  if (!isFranchisor && !tenantId) {
    return res.status(403).json({
      error: 'Missing tenant_id in JWT (required for non-franchisor)',
      code: 'TENANT_MISSING',
      status: 403,
      timestamp: new Date().toISOString(),
      request_id: req.id
    });
  }

  // Validate tenant_id format (if present)
  if (tenantId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return res.status(403).json({
        error: 'Invalid tenant_id format (must be valid UUID)',
        code: 'TENANT_INVALID',
        status: 403,
        timestamp: new Date().toISOString(),
        request_id: req.id
      });
    }
  }

  // Validate roles
  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(403).json({
      error: 'Missing or invalid roles in JWT',
      code: 'ROLES_INVALID',
      status: 403,
      timestamp: new Date().toISOString(),
      request_id: req.id
    });
  }

  // Attach tenant context to request
  req.tenantContext = {
    tenantId: tenantId,
    userId: userId,
    roles: roles,
    isFranchisor: isFranchisor,
    correlationId: req.id
  };

  // Inject headers for downstream services
  if (tenantId) {
    req.headers['x-tenant-id'] = tenantId;
  }
  if (userId) {
    req.headers['x-user-id'] = userId;
  }
  req.headers['x-user-roles'] = roles.join(',');
  req.headers['x-is-franchisor'] = isFranchisor ? 'true' : 'false';
  req.headers['x-correlation-id'] = req.id;

  await logger.info('JWT validated and tenant context extracted', {
    tenant_id: tenantId,
    user_id: userId,
    is_franchisor: isFranchisor,
    correlation_id: req.id
  });

  next();
}

// Apply JWT validation middleware (skip for public endpoints)
app.use((req, res, next) => {
  // Skip JWT validation for public endpoints and health check
  if (req.path === '/health' || req.path.startsWith('/public/')) {
    return next();
  }
  return jwtValidationMiddleware(req, res, next);
});

// ============================================================================
// RATE LIMITING
// ============================================================================

// Per-tenant rate limiting (if tenant context available)
const tenantRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    // Higher limit for franchisor
    if (req.tenantContext?.isFranchisor) {
      return 1000; // 1000 requests per 15 minutes for franchisor
    }
    return 500; // 500 requests per 15 minutes per tenant
  },
  keyGenerator: (req) => {
    // Rate limit by tenant_id (or IP if no tenant)
    return req.tenantContext?.tenantId || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this tenant',
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429
  }
});

// Per-IP rate limiting for public endpoints
const ipRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP',
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429
  }
});

// Slow down for DDoS protection
const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Start delaying after 50 requests
  delayMs: 500 // Add 500ms delay per request after delayAfter
});

// Apply rate limiting
app.use((req, res, next) => {
  if (req.path.startsWith('/public/')) {
    return ipRateLimit(req, res, next);
  }
  if (req.tenantContext) {
    return tenantRateLimit(req, res, next);
  }
  return ipRateLimit(req, res, next);
});

app.use(slowDownMiddleware);

// ============================================================================
// REQUEST ROUTING
// ============================================================================

// Service routing configuration
const serviceRoutes = {
  // Public endpoints (no auth required, tenant from URL/header)
  '/public': {
    target: process.env.BOOKING_SERVICE_URL || 'http://booking-service:4110',
    pathRewrite: { '^/public': '/public' }
  },
  '/api/booking': {
    target: process.env.BOOKING_SERVICE_URL || 'http://booking-service:4110',
    pathRewrite: { '^/api/booking': '' }
  },
  '/api/pos': {
    target: process.env.POS_SERVICE_URL || 'http://beauty-pos-service:4111',
    pathRewrite: { '^/api/pos': '' }
  },
  '/api/payments': {
    target: process.env.PAYMENTS_SERVICE_URL || 'http://payments-service:4112',
    pathRewrite: { '^/api/payments': '' }
  },
  '/api/inventory': {
    target: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:4113',
    pathRewrite: { '^/api/inventory': '' }
  },
  '/api/customer': {
    target: process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:4114',
    pathRewrite: { '^/api/customer': '' }
  },
  '/api/analytics': {
    target: process.env.BI_SERVICE_URL || 'http://bi-service:4115',
    pathRewrite: { '^/api/analytics': '' }
  },
  '/api/integration': {
    target: process.env.INTEGRATION_HUB_SERVICE_URL || 'http://integration-hub-service:4116',
    pathRewrite: { '^/api/integration': '' }
  },
  '/api/staff': {
    target: process.env.STAFF_SERVICE_URL || 'http://staff-service:4117',
    pathRewrite: { '^/api/staff': '' }
  }
};

// Create proxy middleware for each route
Object.entries(serviceRoutes).forEach(([path, config]) => {
  app.use(
    path,
    createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathRewrite: config.pathRewrite,
      onProxyReq: (proxyReq, req) => {
        // For public endpoints, forward tenant_id from query param or header
        if (req.path.startsWith('/public')) {
          const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
          if (tenantId) {
            proxyReq.setHeader('X-Tenant-ID', tenantId);
          }
        }
        
        // Ensure tenant context headers are forwarded (for authenticated requests)
        if (req.tenantContext) {
          if (req.tenantContext.tenantId) {
            proxyReq.setHeader('X-Tenant-ID', req.tenantContext.tenantId);
          }
          if (req.tenantContext.userId) {
            proxyReq.setHeader('X-User-ID', req.tenantContext.userId);
          }
          proxyReq.setHeader('X-User-Roles', req.tenantContext.roles.join(','));
          proxyReq.setHeader('X-Is-Franchisor', req.tenantContext.isFranchisor ? 'true' : 'false');
        }
        proxyReq.setHeader('X-Correlation-ID', req.id);

        // Log asynchronously (fire and forget)
        logger.info('Proxying request', {
          path: req.path,
          target: config.target,
          tenant_id: req.tenantContext?.tenantId,
          correlation_id: req.id
        }).catch(() => {});
      },
      onProxyRes: (proxyRes, req) => {
        // Log asynchronously (fire and forget)
        logger.info('Proxy response', {
          path: req.path,
          status: proxyRes.statusCode,
          tenant_id: req.tenantContext?.tenantId,
          correlation_id: req.id
        }).catch(() => {});
      },
      onError: (err, req, res) => {
        // Log asynchronously (fire and forget)
        logger.error('Proxy error', {
          error: err.message,
          path: req.path,
          tenant_id: req.tenantContext?.tenantId,
          correlation_id: req.id
        }).catch(() => {});

        res.status(502).json({
          error: 'Bad Gateway',
          code: 'PROXY_ERROR',
          status: 502,
          timestamp: new Date().toISOString(),
          request_id: req.id
        });
      }
    })
  );
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  // Log asynchronously (fire and forget)
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    tenant_id: req.tenantContext?.tenantId,
    correlation_id: req.id
  }).catch(() => {});

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    status: 500,
    timestamp: new Date().toISOString(),
    request_id: req.id
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    status: 404,
    timestamp: new Date().toISOString(),
    request_id: req.id
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 4100;

app.listen(PORT, async () => {
  await logger.info('API Gateway started', {
    port: PORT,
    service: 'api-gateway',
    routes: Object.keys(serviceRoutes)
  });
});


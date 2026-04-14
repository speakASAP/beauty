/**
 * Booking Service
 * Time & resource scheduling, appointment management
 */

import express from 'express';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { randomFillSync } from 'crypto';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import {
  tenantContextMiddleware,
  dbTenantContextMiddleware,
  tenantStateValidationMiddleware,
  createLoggingContext
} from '@beauty/tenant-middleware';
import { createEventBus } from '@beauty/event-bus';
import { createLogger, loggingMiddleware } from '@beauty/logger';
import { NotificationAdapter } from '@beauty/adapters';

const app = express();
app.use(express.json());

// CORS configuration for public endpoints
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Tenant-ID', 'X-Correlation-ID']
}));

// Rate limiting for public endpoints
const publicRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour per IP
  message: 'Too many booking attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Event bus
const eventBus = createEventBus(process.env.NATS_URL || 'nats://nats:4222');

// Logger
const logger = createLogger(process.env.SERVICE_NAME || 'booking-service');

// Notification adapter
const notificationAdapter = new NotificationAdapter({
  endpoint: process.env.NOTIFICATION_SERVICE_URL || 'http://notifications-microservice:3368'
});

// Initialize event bus connection
let eventBusConnected = false;
(async () => {
  try {
    await eventBus.connect();
    eventBusConnected = true;
    await logger.info('Event bus connected');
  } catch (error) {
    await logger.error('Failed to connect to event bus', { error: error.message });
  }
})();

// Health check endpoint (before tenant middleware - no auth required)
app.get('/health', async (req, res) => {
  try {
    // Check database connection (use pool directly for health check)
    await db.query('SELECT 1');
    const dbHealthy = true;

    // Check event bus connection
    const eventBusHealthy = eventBusConnected && eventBus.isConnected();

    const health = {
      status: dbHealthy && eventBusHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        eventBus: eventBusHealthy ? 'healthy' : 'unhealthy'
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    // Use base logger for health check (no tenant context)
    await logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ============================================================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================================================
// These endpoints extract tenant_id from URL parameter or X-Tenant-ID header
// They bypass JWT authentication but still enforce tenant isolation

/**
 * Extract tenant context from public request (URL param or header)
 * @param {Object} req - Express request object
 * @returns {Object|null} Tenant context or null
 */
function extractPublicTenantContext(req) {
  // Priority 1: From URL parameter
  const tenantIdFromQuery = req.query.tenant_id;
  
  // Priority 2: From X-Tenant-ID header
  const tenantIdFromHeader = req.headers['x-tenant-id'];
  
  const tenantId = tenantIdFromQuery || tenantIdFromHeader;
  
  if (!tenantId) {
    return null;
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    return null;
  }

  return {
    tenantId,
    userId: null, // Public bookings have no user
    roles: [],
    isFranchisor: false,
    correlationId: req.headers['x-correlation-id'] || randomUUID()
  };
}

/**
 * Middleware for public endpoints - sets tenant context from URL/header
 */
async function publicTenantMiddleware(req, res, next) {
  const tenantContext = extractPublicTenantContext(req);
  
  if (!tenantContext) {
    return res.status(400).json({
      error: 'Tenant ID is required',
      code: 'TENANT_ID_REQUIRED',
      status: 400,
      timestamp: new Date().toISOString()
    });
  }

  // Attach tenant context to request
  req.tenantContext = tenantContext;

  // Acquire DB client and set tenant context
  const client = await db.connect();
  req.dbClient = client;
  
  try {
    await client.query('SET app.tenant_id = $1', [tenantContext.tenantId]);
    await client.query('SET app.is_franchisor = false');
    
    // Create logger with tenant context
    req.logger = createLoggingContext(logger, tenantContext);
    
    next();
  } catch (error) {
    client.release();
    await logger.error('Public tenant middleware error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      code: 'TENANT_MIDDLEWARE_ERROR',
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Release DB client after request (for public endpoints)
 */
function releaseDbClient(req, res, next) {
  res.on('finish', () => {
    if (req.dbClient) {
      req.dbClient.release();
    }
  });
  next();
}

/**
 * Helper to call customer service
 */
async function registerClientViaCustomerService(tenantId, clientData) {
  const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://customer-service:4114';
  
  // Use built-in fetch (Node 18+)
  const response = await fetch(`${customerServiceUrl}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      'X-Correlation-ID': randomUUID()
    },
    body: JSON.stringify(clientData)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Customer service error: ${response.status}`);
  }

  const result = await response.json();
  return result.client || result.data;
}

/**
 * Generate secure booking token
 */
function generateBookingToken() {
  // Generate a secure random token (32 characters, URL-safe base64)
  const bytes = Buffer.alloc(24);
  randomFillSync(bytes);
  return bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 32);
}

// GET /public/services - Get services catalog (public, no auth)
app.get('/public/services', publicRateLimiter, publicTenantMiddleware, releaseDbClient, async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { tenant_id } = req.query;

    // For MVP, we'll return services from catalog adapter or booking service
    // Since catalog service might not be available, we'll return empty array
    // In production, this would call catalog service via adapter
    
    await logger.info('Public services requested', { tenant_id: tenantContext.tenantId });
    
    res.json({
      data: [],
      message: 'Services catalog integration pending. Use catalog service via adapter.'
    });
  } catch (error) {
    await logger.error('Error getting public services', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /public/tenant/:id - Get tenant information (public, no auth)
// API Contract: GET /public/tenant/:id
app.get('/public/tenant/:id', publicRateLimiter, async (req, res) => {
  try {
    const { logger } = req;
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'Invalid tenant ID format. Must be a valid UUID.',
        code: 'INVALID_TENANT_ID'
      });
    }

    // Query tenant from database (no tenant context needed - public endpoint)
    const result = await db.query(`
      SELECT 
        id,
        name,
        address,
        phone,
        email,
        state,
        design,
        created_at,
        updated_at
      FROM platform.tenants
      WHERE id = $1 AND state = 'ACTIVE'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found or not active',
        code: 'TENANT_NOT_FOUND'
      });
    }

    const tenant = result.rows[0];

    await logger.info('Public tenant info requested', { tenant_id: id });

    res.json({
      data: {
        id: tenant.id,
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        state: tenant.state,
        design: tenant.design,
        created_at: tenant.created_at.toISOString(),
        updated_at: tenant.updated_at.toISOString()
      }
    });
  } catch (error) {
    await logger.error('Error getting public tenant info', {
      error: error.message,
      stack: error.stack,
      tenant_id: req.params.id
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /public/availability - Check availability (public, no auth)
// API Contract: GET /public/availability?master_id&date
app.get('/public/availability', publicRateLimiter, publicTenantMiddleware, releaseDbClient, async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { master_id, date } = req.query;

    if (!date) {
      return res.status(400).json({
        error: 'Missing required parameter: date',
        required: ['date']
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Expected: YYYY-MM-DD'
      });
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query available time slots grouped by master
    let query = `
      SELECT 
        ts.id as slot_id,
        ts.starts_at,
        ts.ends_at,
        ts.master_id,
        m.first_name || ' ' || m.last_name as master_name,
        ts.status,
        ts.service_id
      FROM booking.time_slots ts
      JOIN staff.masters m ON ts.master_id = m.id
      WHERE ts.tenant_id = current_setting('app.tenant_id')::uuid
        AND ts.starts_at >= $1
        AND ts.starts_at <= $2
        AND ts.status = 'available'
    `;
    const params = [startOfDay.toISOString(), endOfDay.toISOString()];
    let paramCount = 2;

    if (master_id) {
      paramCount++;
      query += ` AND ts.master_id = $${paramCount}`;
      params.push(master_id);
    }

    query += ' ORDER BY ts.master_id, ts.starts_at LIMIT 100';

    const result = await dbClient.query(query, params);

    // Group slots by master
    const slotsByMaster = {};
    result.rows.forEach(row => {
      if (!slotsByMaster[row.master_id]) {
        slotsByMaster[row.master_id] = {
          master_id: row.master_id,
          master_name: row.master_name,
          available_slots: []
        };
      }
      slotsByMaster[row.master_id].available_slots.push({
        start_time: row.starts_at.toTimeString().substring(0, 5), // HH:MM
        end_time: row.ends_at.toTimeString().substring(0, 5), // HH:MM
        service_id: row.service_id
      });
    });

    const slots = Object.values(slotsByMaster);

    res.json({
      date: date,
      slots: slots
    });
  } catch (error) {
    await logger.error('Error checking availability', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /public/book - Create public booking (no auth required)
// API Contract: POST /public/book
app.post('/public/book', bookingRateLimiter, publicTenantMiddleware, releaseDbClient, async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const {
      tenant_id,
      client,
      master_id,
      service_id,
      starts_at,
      duration_minutes
    } = req.body;

    // Support both new API contract (client object) and old format (for backward compatibility)
    const client_first_name = client?.first_name || req.body.client_first_name;
    const client_last_name = client?.last_name || req.body.client_last_name;
    const client_phone = client?.phone || req.body.client_phone;
    const client_email = client?.email || req.body.client_email;
    const gdpr_consent = client?.gdpr_consent !== undefined ? client.gdpr_consent : req.body.gdpr_consent;

    // Validate required fields
    if (!client_first_name || !client_last_name || !client_phone || !master_id || !service_id || !starts_at || !duration_minutes) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['client.first_name', 'client.last_name', 'client.phone', 'master_id', 'service_id', 'starts_at', 'duration_minutes']
      });
    }

    if (gdpr_consent !== true) {
      return res.status(400).json({
        error: 'GDPR consent is required'
      });
    }

    // Use tenant_id from body or context
    const effectiveTenantId = tenant_id || tenantContext.tenantId;
    if (effectiveTenantId !== tenantContext.tenantId) {
      return res.status(403).json({
        error: 'Tenant ID mismatch'
      });
    }

    // Step 1: Register client via customer service
    let clientId;
    try {
      const clientData = {
        first_name: client_first_name,
        last_name: client_last_name,
        phone: client_phone,
        email: client_email || null,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString()
      };

      const client = await registerClientViaCustomerService(effectiveTenantId, clientData);
      clientId = client.id;
      
      await logger.info('Client registered via customer service', { client_id: clientId });
    } catch (error) {
      await logger.error('Failed to register client', { error: error.message });
      return res.status(500).json({
        error: 'Failed to register client',
        message: error.message
      });
    }

    // Step 2: Create appointment
    const startsAt = new Date(starts_at);
    const endsAt = new Date(startsAt.getTime() + duration_minutes * 60000);

    // Check if slot is available
    const slotCheck = await dbClient.query(`
      SELECT id, status FROM booking.time_slots
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND master_id = $1
        AND starts_at = $2
        AND ends_at = $3
        AND status = 'available'
      LIMIT 1
    `, [master_id, startsAt.toISOString(), endsAt.toISOString()]);

    if (slotCheck.rows.length === 0) {
      return res.status(409).json({
        error: 'Time slot is not available'
      });
    }

    const slotId = slotCheck.rows[0].id;

    // Create appointment
    const appointmentResult = await dbClient.query(`
      INSERT INTO booking.appointments (
        tenant_id, client_id, master_id, slot_id, service_id,
        starts_at, duration_minutes, status
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, $5, $6, 'booked'
      ) RETURNING *
    `, [clientId, master_id, slotId, service_id, startsAt.toISOString(), duration_minutes]);

    const appointment = appointmentResult.rows[0];

    // Update slot status
    await dbClient.query(`
      UPDATE booking.time_slots
      SET status = 'booked', appointment_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [appointment.id, slotId]);

    // Step 3: Generate and store confirmation token
    const confirmationToken = generateBookingToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Token expires in 30 days

    await dbClient.query(`
      INSERT INTO booking.booking_tokens (
        tenant_id, appointment_id, client_id, token, expires_at
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4
      )
    `, [appointment.id, clientId, confirmationToken, expiresAt.toISOString()]);

    // Step 4: Publish appointment.booked event
    await publishEvent(
      'appointment.booked',
      'v1',
      appointment.id,
      {
        appointment_id: appointment.id,
        client_id: clientId,
        master_id: master_id,
        service_id: service_id,
        slot_id: slotId,
        starts_at: startsAt.toISOString(),
        duration_minutes: duration_minutes,
        booked_via: 'public_website'
      },
      tenantContext
    );

    // Step 5: Send SMS confirmation
    let smsSent = false;
    let smsError = null;
    try {
      const smsMessage = `Vaše rezervace byla potvrzena. Kód: ${confirmationToken.substring(0, 6)}. Datum: ${startsAt.toLocaleDateString('cs-CZ')} ${startsAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}.`;
      await notificationAdapter.sendSms(client_phone, smsMessage, effectiveTenantId);
      smsSent = true;
      await logger.info('SMS confirmation sent', {
        appointment_id: appointment.id,
        client_phone: client_phone.substring(0, 7) + '...'
      });
    } catch (error) {
      smsError = error.message;
      await logger.error('Failed to send SMS confirmation', {
        appointment_id: appointment.id,
        error: error.message
      });
      // Don't fail the booking if SMS fails - it's not critical
    }

    await logger.info('Public booking created', {
      appointment_id: appointment.id,
      client_id: clientId,
      token: confirmationToken.substring(0, 8) + '...',
      sms_sent: smsSent
    });

    // Generate confirmation code (first 6 chars of token)
    const confirmationCode = confirmationToken.substring(0, 6).toUpperCase();

    res.status(201).json({
      data: {
        appointment_id: appointment.id,
        confirmation_code: confirmationCode,
        confirmation_token: confirmationToken,
        sms_sent: smsSent,
        sms_error: smsError || undefined
      }
    });
  } catch (error) {
    await logger.error('Error creating public booking', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /public/bookings/:token - Get booking by token (public, no auth)
app.get('/public/bookings/:token', publicRateLimiter, publicTenantMiddleware, releaseDbClient, async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { token } = req.params;

    // Get booking token
    const tokenResult = await dbClient.query(`
      SELECT bt.*, a.starts_at, a.duration_minutes, a.status as appointment_status
      FROM booking.booking_tokens bt
      JOIN booking.appointments a ON bt.appointment_id = a.id
      WHERE bt.token = $1
        AND bt.tenant_id = current_setting('app.tenant_id')::uuid
        AND (bt.expires_at IS NULL OR bt.expires_at > NOW())
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found or token expired'
      });
    }

    const bookingToken = tokenResult.rows[0];

    // Get client details
    const clientResult = await dbClient.query(`
      SELECT first_name, last_name, phone, email
      FROM customer.clients
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [bookingToken.client_id]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    const client = clientResult.rows[0];

    // Get service name (would come from catalog service, placeholder for now)
    const serviceName = 'Service'; // TODO: Get from catalog service

    res.json({
      data: {
        id: bookingToken.appointment_id,
        appointment_id: bookingToken.appointment_id,
        confirmation_token: token,
        client_name: `${client.first_name} ${client.last_name}`,
        service_name: serviceName,
        starts_at: bookingToken.starts_at.toISOString(),
        status: bookingToken.appointment_status
      }
    });
  } catch (error) {
    await logger.error('Error getting booking by token', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /public/bookings/:token/cancel - Cancel booking by token (public, no auth)
app.post('/public/bookings/:token/cancel', bookingRateLimiter, publicTenantMiddleware, releaseDbClient, async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { token } = req.params;
    const { reason } = req.body;

    // Get booking token
    const tokenResult = await dbClient.query(`
      SELECT bt.*, a.id as appointment_id, a.status, a.slot_id
      FROM booking.booking_tokens bt
      JOIN booking.appointments a ON bt.appointment_id = a.id
      WHERE bt.token = $1
        AND bt.tenant_id = current_setting('app.tenant_id')::uuid
        AND (bt.expires_at IS NULL OR bt.expires_at > NOW())
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found or token expired'
      });
    }

    const bookingToken = tokenResult.rows[0];
    const appointmentId = bookingToken.appointment_id;

    if (['completed', 'cancelled', 'no_show'].includes(bookingToken.status)) {
      return res.status(400).json({
        error: 'Appointment cannot be cancelled',
        current_status: bookingToken.status
      });
    }

    // Update appointment
    await dbClient.query(`
      UPDATE booking.appointments
      SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1, updated_at = NOW()
      WHERE id = $2
    `, [reason || 'client_request', appointmentId]);

    // Release slot
    await dbClient.query(`
      UPDATE booking.time_slots
      SET status = 'available', appointment_id = NULL, updated_at = NOW()
      WHERE id = $1
    `, [bookingToken.slot_id]);

    // Mark token as used
    await dbClient.query(`
      UPDATE booking.booking_tokens
      SET used_at = NOW(), updated_at = NOW()
      WHERE token = $1
    `, [token]);

    // Publish appointment.cancelled event
    await publishEvent(
      'appointment.cancelled',
      'v1',
      appointmentId,
      {
        appointment_id: appointmentId,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'client_request',
        slot_id: bookingToken.slot_id
      },
      tenantContext
    );

    // Publish slot.released event
    await publishEvent(
      'slot.released',
      'v1',
      bookingToken.slot_id,
      {
        slot_id: bookingToken.slot_id,
        released_at: new Date().toISOString(),
        appointment_id: appointmentId
      },
      tenantContext
    );

    await logger.info('Public booking cancelled', {
      appointment_id: appointmentId,
      token: token.substring(0, 8) + '...'
    });

    res.json({
      data: {
        appointment_id: appointmentId,
        status: 'cancelled'
      }
    });
  } catch (error) {
    await logger.error('Error cancelling booking by token', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// ============================================================================
// PROTECTED ENDPOINTS (Require Authentication)
// ============================================================================

// Tenant context middleware (extract and validate)
app.use(tenantContextMiddleware());

// Database tenant context middleware (set app.tenant_id for RLS)
app.use(dbTenantContextMiddleware(db));

// Tenant state validation middleware (for write operations)
app.use(tenantStateValidationMiddleware(db, { allowReadOnly: false }));

// Logging middleware (attaches req.logger with tenant context)
app.use(loggingMiddleware(logger));

// Helper function to publish event
async function publishEvent(eventType, eventVersion, aggregateId, payload, tenantContext, causationId = null) {
  if (!eventBusConnected) {
    throw new Error('Event bus not connected');
  }
  if (!tenantContext.tenantId) {
    throw new Error('Cannot publish domain event: tenant_id is required');
  }

  await eventBus.publish({
    event_type: eventType,
    event_version: eventVersion,
    tenant_id: tenantContext.tenantId,
    aggregate_id: aggregateId,
    occurred_at: new Date().toISOString(),
    payload,
    metadata: {
      user_id: tenantContext.userId,
      correlation_id: tenantContext.correlationId,
      causation_id: causationId
    }
  }, {}, tenantContext);
}

// POST /appointments - Book an appointment
app.post('/appointments', async (req, res) => {
  try {
    const { tenantContext, dbClient, logger } = req;
    const { client_id, master_id, service_id, starts_at, duration_minutes } = req.body;

    if (!client_id || !master_id || !service_id || !starts_at || !duration_minutes) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['client_id', 'master_id', 'service_id', 'starts_at', 'duration_minutes']
      });
    }

    const startsAt = new Date(starts_at);
    const endsAt = new Date(startsAt.getTime() + duration_minutes * 60000);

    // Check if slot is available
    const slotCheck = await dbClient.query(`
      SELECT id, status FROM booking.time_slots
      WHERE tenant_id = current_setting('app.tenant_id')::uuid
        AND master_id = $1
        AND starts_at = $2
        AND status = 'available'
      LIMIT 1
    `, [master_id, startsAt]);

    if (slotCheck.rows.length === 0) {
      return res.status(409).json({
        error: 'Time slot not available',
        master_id,
        starts_at: startsAt.toISOString()
      });
    }

    const slotId = slotCheck.rows[0].id;

    // Create appointment
    const result = await dbClient.query(`
      INSERT INTO booking.appointments (
        tenant_id, client_id, master_id, slot_id, service_id,
        starts_at, duration_minutes, status
      ) VALUES (
        current_setting('app.tenant_id')::uuid,
        $1, $2, $3, $4, $5, $6, 'booked'
      ) RETURNING *
    `, [client_id, master_id, slotId, service_id, startsAt, duration_minutes]);

    const appointment = result.rows[0];

    // Update slot status
    await dbClient.query(`
      UPDATE booking.time_slots
      SET status = 'booked', appointment_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [appointment.id, slotId]);

    // Publish appointment.booked event
    await publishEvent(
      'appointment.booked',
      'v1',
      appointment.id,
      {
        appointment_id: appointment.id,
        client_id: appointment.client_id,
        master_id: appointment.master_id,
        starts_at: appointment.starts_at.toISOString(),
        duration_minutes: appointment.duration_minutes,
        service_id: appointment.service_id,
        slot_id: appointment.slot_id
      },
      tenantContext
    );

    await logger.info('Appointment booked', {
      appointment_id: appointment.id,
      client_id: appointment.client_id,
      master_id: appointment.master_id,
      service_id: appointment.service_id
    });

    res.status(201).json({
      appointment: {
        id: appointment.id,
        client_id: appointment.client_id,
        master_id: appointment.master_id,
        service_id: appointment.service_id,
        starts_at: appointment.starts_at.toISOString(),
        duration_minutes: appointment.duration_minutes,
        status: appointment.status
      }
    });
  } catch (error) {
    await logger.error('Error booking appointment', {
      error: error.message,
      stack: error.stack,
      client_id,
      master_id,
      service_id
    });
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /appointments/:id/confirm - Confirm an appointment
app.post('/appointments/:id/confirm', async (req, res) => {
  try {
    const { tenantContext, dbClient } = req;
    const { id } = req.params;
    const { confirmation_method = 'sms' } = req.body;

    // Get appointment
    const result = await dbClient.query(`
      SELECT * FROM booking.appointments
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (appointment.status !== 'booked') {
      return res.status(400).json({
        error: 'Appointment cannot be confirmed',
        current_status: appointment.status
      });
    }

    // Get client phone from appointment.booked event data or query client
    // Note: We need client_id from appointment to get phone
    // Since appointment.booked already has client_id, we can get it from appointment
    // But to avoid cross-context access, we'll include client_id in appointment.confirmed
    // Integration hub can use appointment.booked event which already has client_id
    // For now, we'll include client_id in appointment.confirmed event
    const clientId = appointment.client_id;

    // Update appointment
    await dbClient.query(`
      UPDATE booking.appointments
      SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Publish appointment.confirmed event with client_id (integration hub will get phone from client.registered event)
    await publishEvent(
      'appointment.confirmed',
      'v1',
      id,
      {
        appointment_id: id,
        client_id: clientId,
        confirmed_at: new Date().toISOString(),
        confirmation_method
      },
      tenantContext
    );

    res.json({ success: true, appointment_id: id, status: 'confirmed' });
  } catch (error) {
    await logger.error('Error confirming appointment', {
      error: error.message,
      stack: error.stack,
      appointment_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /appointments/:id/start - Start an appointment
app.post('/appointments/:id/start', async (req, res) => {
  try {
    const { tenantContext, dbClient } = req;
    const { id } = req.params;

    // Get appointment
    const result = await dbClient.query(`
      SELECT * FROM booking.appointments
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (!['booked', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        error: 'Appointment cannot be started',
        current_status: appointment.status
      });
    }

    // Update appointment
    await dbClient.query(`
      UPDATE booking.appointments
      SET status = 'started', started_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Publish appointment.started event
    await publishEvent(
      'appointment.started',
      'v1',
      id,
      {
        appointment_id: id,
        started_at: new Date().toISOString()
      },
      tenantContext
    );

    res.json({ success: true, appointment_id: id, status: 'started' });
  } catch (error) {
    await logger.error('Error starting appointment', {
      error: error.message,
      stack: error.stack,
      appointment_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /appointments/:id/complete - Complete an appointment
app.post('/appointments/:id/complete', async (req, res) => {
  try {
    const { tenantContext, dbClient } = req;
    const { id } = req.params;
    const { actual_duration_minutes } = req.body;

    // Get appointment
    const result = await dbClient.query(`
      SELECT * FROM booking.appointments
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (appointment.status !== 'started') {
      return res.status(400).json({
        error: 'Appointment must be started before completion',
        current_status: appointment.status
      });
    }

    const actualDuration = actual_duration_minutes || appointment.duration_minutes;

    // Update appointment
    await dbClient.query(`
      UPDATE booking.appointments
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [id]);

    // Publish appointment.completed event
    await publishEvent(
      'appointment.completed',
      'v1',
      id,
      {
        appointment_id: id,
        completed_at: new Date().toISOString(),
        actual_duration_minutes: actualDuration
      },
      tenantContext
    );

    res.json({ success: true, appointment_id: id, status: 'completed' });
  } catch (error) {
    await logger.error('Error completing appointment', {
      error: error.message,
      stack: error.stack,
      appointment_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /appointments/:id/cancel - Cancel an appointment
app.post('/appointments/:id/cancel', async (req, res) => {
  try {
    const { tenantContext, dbClient } = req;
    const { id } = req.params;
    const { cancellation_reason = 'client_request' } = req.body;

    // Get appointment
    const result = await dbClient.query(`
      SELECT * FROM booking.appointments
      WHERE id = $1 AND tenant_id = current_setting('app.tenant_id')::uuid
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
      return res.status(400).json({
        error: 'Appointment cannot be cancelled',
        current_status: appointment.status
      });
    }

    // Update appointment
    await dbClient.query(`
      UPDATE booking.appointments
      SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $1, updated_at = NOW()
      WHERE id = $2
    `, [cancellation_reason, id]);

    // Release slot
    await dbClient.query(`
      UPDATE booking.time_slots
      SET status = 'available', appointment_id = NULL, updated_at = NOW()
      WHERE id = $1
    `, [appointment.slot_id]);

    // Publish appointment.cancelled event
    await publishEvent(
      'appointment.cancelled',
      'v1',
      id,
      {
        appointment_id: id,
        cancelled_at: new Date().toISOString(),
        cancellation_reason,
        slot_id: appointment.slot_id
      },
      tenantContext
    );

    // Publish slot.released event
    await publishEvent(
      'slot.released',
      'v1',
      appointment.slot_id,
      {
        slot_id: appointment.slot_id,
        released_at: new Date().toISOString(),
        appointment_id: id
      },
      tenantContext
    );

    res.json({ success: true, appointment_id: id, status: 'cancelled' });
  } catch (error) {
    await logger.error('Error cancelling appointment', {
      error: error.message,
      stack: error.stack,
      appointment_id: id
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /appointments - List appointments
app.get('/appointments', async (req, res) => {
  try {
    const { dbClient } = req;
    const { status, client_id, master_id, from_date, to_date } = req.query;

    let query = 'SELECT * FROM booking.appointments WHERE tenant_id = current_setting(\'app.tenant_id\')::uuid';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (client_id) {
      paramCount++;
      query += ` AND client_id = $${paramCount}`;
      params.push(client_id);
    }

    if (master_id) {
      paramCount++;
      query += ` AND master_id = $${paramCount}`;
      params.push(master_id);
    }

    if (from_date) {
      paramCount++;
      query += ` AND starts_at >= $${paramCount}`;
      params.push(new Date(from_date));
    }

    if (to_date) {
      paramCount++;
      query += ` AND starts_at <= $${paramCount}`;
      params.push(new Date(to_date));
    }

    query += ' ORDER BY starts_at DESC LIMIT 100';

    const result = await dbClient.query(query, params);

    res.json({
      appointments: result.rows.map(row => ({
        id: row.id,
        client_id: row.client_id,
        master_id: row.master_id,
        service_id: row.service_id,
        starts_at: row.starts_at.toISOString(),
        duration_minutes: row.duration_minutes,
        status: row.status
      }))
    });
  } catch (error) {
    await logger.error('Error listing appointments', {
      error: error.message,
      stack: error.stack,
      query_params: req.query
    });
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Error handler middleware

// Custom error handling middleware (fallback)
app.use(async (err, req, res, next) => {
  const requestLogger = req.logger || logger;
  await requestLogger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 4110;
app.listen(PORT, async () => {
  await logger.info(`Booking service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.info('SIGTERM received, shutting down gracefully');
  await db.end();
  await eventBus.disconnect();
  process.exit(0);
});


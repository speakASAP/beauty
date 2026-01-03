/**
 * Metrics Collection Package
 * Basic metrics for beauty platform (no Prometheus dependency)
 * 
 * Features:
 * - HTTP request metrics
 * - Database query metrics
 * - Event processing metrics
 * - Business metrics
 * - Tenant-scoped metrics
 * 
 * Metrics are stored in-memory and can be exposed via API endpoint
 * or sent to logging service.
 */

/**
 * In-memory metrics storage
 */
const metrics = {
  http: {
    requests: [],
    errors: [],
    total: 0
  },
  db: {
    queries: [],
    errors: [],
    total: 0
  },
  events: {
    published: [],
    consumed: [],
    errors: [],
    total: 0
  },
  business: {
    orders: 0,
    revenue: 0,
    appointments: 0,
    clients: 0
  }
};

// Keep last 1000 entries per metric type
const MAX_METRICS = 1000;

/**
 * Record HTTP request metric
 * @param {Object} data - Request data
 */
function recordHttpRequest(data) {
  metrics.http.total++;
  metrics.http.requests.push({
    ...data,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last MAX_METRICS entries
  if (metrics.http.requests.length > MAX_METRICS) {
    metrics.http.requests.shift();
  }
  
  if (data.status >= 400) {
    metrics.http.errors.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    if (metrics.http.errors.length > MAX_METRICS) {
      metrics.http.errors.shift();
    }
  }
}

/**
 * Record database query metric
 * @param {Object} data - Query data
 */
function recordDbQuery(data) {
  metrics.db.total++;
  metrics.db.queries.push({
    ...data,
    timestamp: new Date().toISOString()
  });
  
  if (metrics.db.queries.length > MAX_METRICS) {
    metrics.db.queries.shift();
  }
  
  if (data.error) {
    metrics.db.errors.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    if (metrics.db.errors.length > MAX_METRICS) {
      metrics.db.errors.shift();
    }
  }
}

/**
 * Record event metric
 * @param {string} type - Event type (published, consumed, error)
 * @param {Object} data - Event data
 */
function recordEvent(type, data) {
  metrics.events.total++;
  
  if (type === 'published') {
    metrics.events.published.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    if (metrics.events.published.length > MAX_METRICS) {
      metrics.events.published.shift();
    }
  } else if (type === 'consumed') {
    metrics.events.consumed.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    if (metrics.events.consumed.length > MAX_METRICS) {
      metrics.events.consumed.shift();
    }
  } else if (type === 'error') {
    metrics.events.errors.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    if (metrics.events.errors.length > MAX_METRICS) {
      metrics.events.errors.shift();
    }
  }
}

/**
 * Business metrics storage
 */
const businessMetrics = {
  orders: {},
  revenue: {},
  appointments: {},
  clients: {}
};

/**
 * Service health storage
 */
const serviceHealth = {};

/**
 * Get metrics in JSON format
 * @returns {Object} Metrics data
 */
export function getMetrics() {
  return {
    http: {
      total: metrics.http.total,
      recent_requests: metrics.http.requests.slice(-100), // Last 100
      recent_errors: metrics.http.errors.slice(-100),
      error_count: metrics.http.errors.length
    },
    db: {
      total: metrics.db.total,
      recent_queries: metrics.db.queries.slice(-100),
      recent_errors: metrics.db.errors.slice(-100),
      error_count: metrics.db.errors.length
    },
    events: {
      total: metrics.events.total,
      published_count: metrics.events.published.length,
      consumed_count: metrics.events.consumed.length,
      error_count: metrics.events.errors.length,
      recent_published: metrics.events.published.slice(-50),
      recent_consumed: metrics.events.consumed.slice(-50),
      recent_errors: metrics.events.errors.slice(-50)
    },
    business: {
      orders: metrics.business.orders,
      revenue: metrics.business.revenue,
      appointments: metrics.business.appointments,
      clients: metrics.business.clients
    },
    service_health: serviceHealth
  };
}

/**
 * Express middleware for HTTP metrics
 * @param {string} serviceName - Service name
 * @returns {Function} Express middleware
 */
export function metricsMiddleware(serviceName) {
  return (req, res, next) => {
    const startTime = Date.now();
    const tenantId = req.tenantContext?.tenantId || 'unknown';
    const route = req.route?.path || req.path || 'unknown';

    // Track request start
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const labels = {
        method: req.method,
        route: route,
        status: res.statusCode,
        service: serviceName,
        tenant_id: tenantId
      };

      // Record metrics
      recordHttpRequest({
        method: req.method,
        route: route,
        status: res.statusCode,
        service: serviceName,
        tenant_id: tenantId,
        duration: duration
      });
    });

    next();
  };
}

/**
 * Track database query
 * @param {string} serviceName - Service name
 * @param {string} queryType - Query type (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Table name
 * @param {string} tenantId - Tenant ID
 * @param {Function} queryFn - Query function
 * @returns {Promise<any>} Query result
 */
export async function trackDatabaseQuery(serviceName, queryType, table, tenantId, queryFn) {
  const startTime = Date.now();
  const tenant = tenantId || 'unknown';

  try {
    const result = await queryFn();
    const duration = (Date.now() - startTime) / 1000;
    
    recordDbQuery({
      query_type: queryType,
      table: table,
      service: serviceName,
      tenant_id: tenant,
      duration: duration
    });
    
    return result;
  } catch (error) {
    recordDbQuery({
      query_type: queryType,
      table: table,
      service: serviceName,
      tenant_id: tenant,
      duration: (Date.now() - startTime) / 1000,
      error: error.message
    });
    throw error;
  }
}

/**
 * Track event publishing
 * @param {string} serviceName - Service name
 * @param {string} eventType - Event type
 * @param {string} tenantId - Tenant ID
 */
export function trackEventPublished(serviceName, eventType, tenantId) {
  recordEvent('published', {
    event_type: eventType,
    service: serviceName,
    tenant_id: tenantId || 'unknown'
  });
}

/**
 * Track event consumption
 * @param {string} serviceName - Service name
 * @param {string} eventType - Event type
 * @param {string} tenantId - Tenant ID
 * @param {Function} handlerFn - Event handler function
 * @returns {Promise<any>} Handler result
 */
export async function trackEventConsumed(serviceName, eventType, tenantId, handlerFn) {
  const startTime = Date.now();
  const tenant = tenantId || 'unknown';

  try {
    const result = await handlerFn();
    const duration = (Date.now() - startTime) / 1000;
    
    recordEvent('consumed', {
      event_type: eventType,
      service: serviceName,
      tenant_id: tenant,
      duration: duration
    });
    
    return result;
  } catch (error) {
    recordEvent('error', {
      event_type: eventType,
      service: serviceName,
      tenant_id: tenant,
      duration: (Date.now() - startTime) / 1000,
      error: error.message
    });
    throw error;
  }
}

/**
 * Track business metric - Order
 * @param {string} tenantId - Tenant ID
 * @param {string} status - Order status
 * @param {number} revenue - Order revenue (optional)
 */
export function trackOrder(tenantId, status, revenue = null) {
  const tenant = tenantId || 'unknown';
  metrics.business.orders++;
  
  if (revenue !== null) {
    metrics.business.revenue += revenue;
  }
}

/**
 * Track business metric - Appointment
 * @param {string} tenantId - Tenant ID
 * @param {string} status - Appointment status
 */
export function trackAppointment(tenantId, status) {
  metrics.business.appointments++;
}

/**
 * Track business metric - Client
 * @param {string} tenantId - Tenant ID
 */
export function trackClient(tenantId) {
  metrics.business.clients++;
}

/**
 * Update service health metric
 * @param {string} serviceName - Service name
 * @param {boolean} isHealthy - Health status
 */
export function updateServiceHealth(serviceName, isHealthy) {
  serviceHealth[serviceName] = {
    healthy: isHealthy,
    timestamp: new Date().toISOString()
  };
}

export default {
  getMetrics,
  metricsMiddleware,
  trackDatabaseQuery,
  trackEventPublished,
  trackEventConsumed,
  trackOrder,
  trackAppointment,
  trackClient,
  updateServiceHealth
};


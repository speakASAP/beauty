/**
 * Distributed Tracing Package
 * OpenTelemetry integration for beauty platform
 * 
 * Features:
 * - Request tracing
 * - Database query tracing
 * - Event tracing
 * - Tenant context in traces
 * - Correlation ID mapping
 */

import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

let sdk = null;
let tracer = null;

/**
 * Initialize tracing
 * @param {Object} options - Tracing options
 */
export function initTracing(options = {}) {
  const {
    serviceName = 'beauty-platform',
    jaegerEndpoint = process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    enabled = process.env.TRACING_ENABLED !== 'false'
  } = options;

  if (!enabled) {
    return;
  }

  const exporter = new JaegerExporter({
    endpoint: jaegerEndpoint
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    }),
    traceExporter: exporter,
    instrumentations: [
      new HttpInstrumentation(),
      new PgInstrumentation()
    ]
  });

  sdk.start();
  tracer = trace.getTracer(serviceName);
}

/**
 * Get tracer instance
 * @returns {Tracer} Tracer instance
 */
export function getTracer() {
  if (!tracer) {
    tracer = trace.getTracer('beauty-platform');
  }
  return tracer;
}

/**
 * Create a span
 * @param {string} name - Span name
 * @param {Object} attributes - Span attributes
 * @param {Function} fn - Function to execute in span
 * @returns {Promise<any>} Function result
 */
export async function withSpan(name, attributes = {}, fn) {
  const currentTracer = getTracer();
  return await currentTracer.startActiveSpan(name, {
    attributes
  }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Add attributes to current span
 * @param {Object} attributes - Attributes to add
 */
export function addSpanAttributes(attributes) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Express middleware for request tracing
 * @param {string} serviceName - Service name
 * @returns {Function} Express middleware
 */
export function tracingMiddleware(serviceName) {
  return (req, res, next) => {
    const currentTracer = getTracer();
    const correlationId = req.headers['x-correlation-id'] || req.tenantContext?.correlationId;
    const tenantId = req.tenantContext?.tenantId;

    currentTracer.startActiveSpan(`${req.method} ${req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.route': req.route?.path || req.path,
        'http.url': req.url,
        'service.name': serviceName,
        'tenant.id': tenantId || 'unknown',
        'correlation.id': correlationId || 'unknown'
      }
    }, (span) => {
      res.on('finish', () => {
        span.setAttributes({
          'http.status_code': res.statusCode,
          'http.status_text': res.statusMessage
        });

        if (res.statusCode >= 400) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: `HTTP ${res.statusCode}`
          });
        } else {
          span.setStatus({ code: SpanStatusCode.OK });
        }

        span.end();
      });

      // Store span in request context
      req.span = span;
      next();
    });
  };
}

/**
 * Track database query in span
 * @param {string} query - SQL query
 * @param {Object} params - Query parameters
 * @param {Function} queryFn - Query function
 * @returns {Promise<any>} Query result
 */
export async function trackDatabaseQuery(query, params, queryFn) {
  return await withSpan('db.query', {
    'db.statement': query.substring(0, 500), // Truncate long queries
    'db.operation': query.trim().split(' ')[0].toUpperCase()
  }, async (span) => {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      span.setAttributes({
        'db.duration_ms': duration,
        'db.rows': result?.rows?.length || 0
      });
      return result;
    } catch (error) {
      span.setAttributes({
        'db.error': error.message
      });
      throw error;
    }
  });
}

/**
 * Track event in span
 * @param {string} eventType - Event type
 * @param {string} tenantId - Tenant ID
 * @param {Function} handlerFn - Event handler function
 * @returns {Promise<any>} Handler result
 */
export async function trackEvent(eventType, tenantId, handlerFn) {
  return await withSpan('event.process', {
    'event.type': eventType,
    'tenant.id': tenantId || 'unknown'
  }, handlerFn);
}

/**
 * Shutdown tracing
 */
export async function shutdownTracing() {
  if (sdk) {
    await sdk.shutdown();
  }
}

export default {
  initTracing,
  getTracer,
  withSpan,
  addSpanAttributes,
  tracingMiddleware,
  trackDatabaseQuery,
  trackEvent,
  shutdownTracing
};


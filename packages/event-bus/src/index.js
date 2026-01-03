/**
 * Event Bus Library
 * Shared event bus implementation for beauty platform
 * Handles event serialization, validation, and NATS integration
 */

import { connect, StringCodec } from 'nats';
import { randomUUID } from 'uuid';

const sc = StringCodec();

/**
 * Event schema validation
 * Validates event structure against Phase 0 Event Catalog requirements
 */
export class EventValidator {
  /**
   * Validate event structure
   * @param {Object} event - Event object to validate
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validate(event) {
    const errors = [];

    // Mandatory fields check
    if (!event.event_id || typeof event.event_id !== 'string') {
      errors.push('Missing or invalid event_id (must be UUID string)');
    }

    if (!event.event_type || typeof event.event_type !== 'string') {
      errors.push('Missing or invalid event_type (must be string)');
    }

    if (!event.event_version || typeof event.event_version !== 'string') {
      errors.push('Missing or invalid event_version (must be string like "v1")');
    }

    // tenant_id is MANDATORY for all domain events (never null)
    if (event.tenant_id === null || event.tenant_id === undefined) {
      errors.push('Missing tenant_id (MANDATORY for all domain events, cannot be null)');
    } else if (typeof event.tenant_id !== 'string') {
      errors.push('Invalid tenant_id (must be UUID string)');
    } else if (event.tenant_id.trim() === '') {
      errors.push('Invalid tenant_id (cannot be empty string)');
    }

    if (!event.aggregate_id || typeof event.aggregate_id !== 'string') {
      errors.push('Missing or invalid aggregate_id (must be UUID string)');
    }

    if (!event.occurred_at) {
      errors.push('Missing occurred_at (must be ISO 8601 UTC timestamp)');
    } else {
      const date = new Date(event.occurred_at);
      if (isNaN(date.getTime())) {
        errors.push('Invalid occurred_at (must be valid ISO 8601 UTC timestamp)');
      }
      // Check if in the future (allow current time and past)
      // Allow small clock skew (5 seconds) for distributed systems
      const now = new Date();
      const clockSkew = 5000; // 5 seconds
      if (date.getTime() > now.getTime() + clockSkew) {
        errors.push('Invalid occurred_at (must not be in the future, allowing 5s clock skew)');
      }
    }

    if (!event.payload || typeof event.payload !== 'object') {
      errors.push('Missing or invalid payload (must be object)');
    }

    // Validate UUID format for IDs
    // Note: tenant_id is already validated as non-null/undefined and non-empty string above
    // This check ensures it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (event.event_id && !uuidRegex.test(event.event_id)) {
      errors.push('Invalid event_id format (must be valid UUID)');
    }
    // tenant_id is guaranteed to be a non-empty string at this point (validated above)
    if (event.tenant_id && !uuidRegex.test(event.tenant_id)) {
      errors.push('Invalid tenant_id format (must be valid UUID)');
    }
    if (event.aggregate_id && !uuidRegex.test(event.aggregate_id)) {
      errors.push('Invalid aggregate_id format (must be valid UUID)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Event Bus Client
 * Handles connection to NATS and event publishing/consuming
 */
export class EventBus {
  constructor(natsUrl = 'nats://localhost:4222') {
    this.natsUrl = natsUrl;
    this.connection = null;
    this.subscriptions = new Map();
  }

  /**
   * Connect to NATS server
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.connection = await connect({ servers: this.natsUrl });
      console.log('Connected to NATS event bus');

      // Set up connection error handlers
      this.connection.closed().then(() => {
        console.warn('NATS connection closed');
        this.connection = null;
      }).catch((error) => {
        console.error('NATS connection error:', error);
        this.connection = null;
      });
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  /**
   * Disconnect from NATS server
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log('Disconnected from NATS event bus');
    }
  }

  /**
   * Publish event to NATS
   * @param {Object} eventData - Event data (will be validated and enriched)
   * @param {Object} options - Publishing options
   * @param {Object} tenantContext - Optional tenant context for automatic correlation_id injection
   * @returns {Promise<string>} Event ID
   */
  async publish(eventData, options = {}, tenantContext = null) {
    if (!this.connection) {
      throw new Error('EventBus not connected. Call connect() first.');
    }

    if (!this.isConnected()) {
      throw new Error('EventBus connection is closed. Reconnect before publishing.');
    }

    // Enrich event with mandatory fields
    const event = {
      event_id: eventData.event_id || randomUUID(),
      event_type: eventData.event_type,
      event_version: eventData.event_version || 'v1',
      tenant_id: eventData.tenant_id,
      aggregate_id: eventData.aggregate_id,
      occurred_at: eventData.occurred_at || new Date().toISOString(),
      metadata: {
        user_id: eventData.metadata?.user_id || tenantContext?.userId || null,
        correlation_id: eventData.metadata?.correlation_id || tenantContext?.correlationId || null,
        causation_id: eventData.metadata?.causation_id || null,
        ...eventData.metadata
      },
      payload: eventData.payload
    };

    // Validate event
    const validation = EventValidator.validate(event);
    if (!validation.valid) {
      const error = new Error(`Event validation failed: ${validation.errors.join(', ')}`);
      error.validationErrors = validation.errors;
      error.event = event;
      console.error('Event validation failed:', validation.errors, event);
      throw error;
    }

    // Serialize event to JSON
    const eventJson = JSON.stringify(event);

    // Publish to NATS
    const subject = options.subject || `events.${event.event_type}`;
    try {
      // Check connection state before publishing
      if (!this.isConnected()) {
        throw new Error('EventBus connection is closed. Reconnect before publishing.');
      }

      // NATS publish is fire-and-forget, but we check connection state
      this.connection.publish(subject, sc.encode(eventJson));
      console.log(`Published event: ${event.event_type} (${event.event_id}) to ${subject}`);
      return event.event_id;
    } catch (error) {
      console.error(`Failed to publish event ${event.event_type}:`, error);
      // If connection is lost, mark it as closed
      if (this.connection && this.connection.isClosed()) {
        this.connection = null;
      }
      throw error;
    }
  }

  /**
   * Subscribe to events
   * @param {string} eventType - Event type pattern (e.g., 'appointment.*' or 'appointment.booked')
   * @param {Function} handler - Event handler function
   * @param {Object} options - Subscription options
   * @returns {Promise<string>} Subscription ID
   */
  async subscribe(eventType, handler, options = {}) {
    if (!this.connection) {
      throw new Error('EventBus not connected. Call connect() first.');
    }

    // Convert wildcard patterns to NATS wildcards
    // appointment.* -> events.appointment.> (match all appointment events)
    // appointment.booked -> events.appointment.booked (exact match)
    let subject = options.subject;
    if (!subject) {
      if (eventType.endsWith('.*')) {
        // Replace .* with .> for NATS wildcard (match all tokens)
        const baseType = eventType.slice(0, -2);
        subject = `events.${baseType}.>`;
      } else {
        subject = `events.${eventType}`;
      }
    }
    const queue = options.queue || null;

    try {
      const subscription = this.connection.subscribe(subject, { queue });

      // Process messages
      (async () => {
        for await (const msg of subscription) {
          try {
            // Deserialize event
            const eventJson = sc.decode(msg.data);
            const event = JSON.parse(eventJson);

            // Validate event
            const validation = EventValidator.validate(event);
            if (!validation.valid) {
              console.error(`Invalid event received: ${event.event_type}`, validation.errors);
              continue;
            }

            // Call handler
            // Note: Handler must be idempotent - same event_id processed multiple times
            // should produce the same result (per Phase 0 Event Catalog requirements)
            await handler(event);
          } catch (error) {
            console.error(`Error processing event message:`, error);
            // Note: Event processing errors are logged but not retried automatically
            // Consumers should implement their own retry logic if needed
          }
        }
      })();

      const subscriptionId = randomUUID();
      this.subscriptions.set(subscriptionId, subscription);
      console.log(`Subscribed to events: ${eventType} (${subject})`);
      return subscriptionId;
    } catch (error) {
      console.error(`Failed to subscribe to ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from events
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<void>}
   */
  async unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log(`Unsubscribed from events: ${subscriptionId}`);
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connection !== null && !this.connection.isClosed();
  }
}

/**
 * Create event bus instance
 * @param {string} natsUrl - NATS server URL
 * @returns {EventBus}
 */
export function createEventBus(natsUrl) {
  return new EventBus(natsUrl);
}

export default {
  EventBus,
  EventValidator,
  createEventBus
};


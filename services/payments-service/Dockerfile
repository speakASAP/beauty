FROM node:18-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files (service and packages)
COPY services/payments-service/package*.json ./
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/tenant-middleware/package.json ./packages/tenant-middleware/
COPY packages/logger/package.json ./packages/logger/
COPY packages/adapters/package.json ./packages/adapters/

# Copy package source code
COPY packages/event-bus/src ./packages/event-bus/src
COPY packages/tenant-middleware/src ./packages/tenant-middleware/src
COPY packages/logger/src ./packages/logger/src
COPY packages/adapters/src ./packages/adapters/src

# Install dependencies (including local packages)
RUN npm ci --only=production

# Copy application code
COPY services/payments-service/src ./src

# Expose port
EXPOSE 4112

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4112/health || exit 1

# Start service
CMD ["node", "src/index.js"]


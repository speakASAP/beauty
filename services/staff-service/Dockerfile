FROM node:24-slim

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files (service and packages)
COPY services/staff-service/package*.json ./
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/tenant-middleware/package.json ./packages/tenant-middleware/
COPY packages/logger/package.json ./packages/logger/

# Copy package source code
COPY packages/event-bus/src ./packages/event-bus/src
COPY packages/tenant-middleware/src ./packages/tenant-middleware/src
COPY packages/logger/src ./packages/logger/src

# Install dependencies (including local packages)
RUN npm ci --only=production

# Copy application code
COPY services/staff-service/src ./src

# Expose port
EXPOSE 4117

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4117/health || exit 1

# Start service
CMD ["node", "src/index.js"]


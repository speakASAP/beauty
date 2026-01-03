FROM node:18-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files (service and packages)
COPY services/api-gateway/package*.json ./
COPY packages/logger/package.json ./packages/logger/

# Copy package source code
COPY packages/logger/src ./packages/logger/src

# Install dependencies (including local packages)
RUN npm ci --only=production

# Copy application code
COPY services/api-gateway/src ./src

# Expose port
EXPOSE 4100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4100/health || exit 1

# Start service
CMD ["node", "src/index.js"]


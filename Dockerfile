FROM node:24-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy all packages and services
COPY packages ./packages
COPY services ./services

# Copy service-specific package files
COPY services/api-gateway/package*.json ./
COPY packages/logger/package.json ./packages/logger/
COPY packages/logger/src ./packages/logger/src

# Install service-specific dependencies
RUN npm install --prefer-offline --no-audit || npm ci

# Install logger package dependencies and symlink as @beauty/logger
RUN cd packages/logger && npm install --prefer-offline --no-audit 2>/dev/null || true
RUN mkdir -p /app/node_modules/@beauty && ln -sf /app/packages/logger /app/node_modules/@beauty/logger

# Copy application source (Express.js, no build step needed)
COPY services/api-gateway/src ./src

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["node"]
CMD ["src/index.js"]

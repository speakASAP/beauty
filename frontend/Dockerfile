# Simplified single-stage Dockerfile for faster builds
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
# Copy lock file if it exists (optional)
COPY package-lock.json* ./

# Install dependencies and curl (for health checks)
# Use npm install (works with or without lock file)
# npm ci requires lock file, npm install works either way
# Install curl for health checks (preferred by deployment script, handles localhost correctly)
RUN apk add --no-cache curl && npm install

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Expose port (Vite preview uses 4173 by default)
EXPOSE 4173

# Use Vite preview server (faster than nginx for testing)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]

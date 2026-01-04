# Next.js Public Website Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies and curl (for health checks)
RUN apk add --no-cache curl && npm install

# Copy source files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port (beauty application uses 41xx range)
EXPOSE 4102

# Set PORT environment variable
ENV PORT=4102

# Start the Next.js production server
CMD ["node", ".next/standalone/server.js"]

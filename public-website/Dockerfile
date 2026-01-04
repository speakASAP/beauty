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

# Expose port (Next.js default is 3000)
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]

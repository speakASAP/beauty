# Multi-Server Multi-Domain Deployment Guide

This guide explains how to deploy the beauty platform across multiple servers and domains.

## Architecture Principles

1. **Environment Variables as Single Source of Truth**
   - All configuration via environment variables
   - No hardcoded domain names or server addresses
   - `.env` files per environment

2. **Scalable Database Setup**
   - Each microservice can have its own database
   - Shared database server with multiple databases
   - Database names configurable per deployment

3. **Domain-Agnostic Configuration**
   - Nginx configs use environment variables
   - Service URLs configurable per domain
   - SSL certificates managed per domain

## Deployment Checklist

### 1. Server Preparation

```bash
# On new server
ssh user@new-server

# Clone repositories
git clone <beauty-repo-url> ~/beauty
git clone <nginx-microservice-repo-url> ~/nginx-microservice
git clone <database-server-repo-url> ~/database-server
git clone <auth-microservice-repo-url> ~/auth-microservice
# ... clone other microservices
```

### 2. Environment Configuration

Create `.env` files for each service with domain-specific values:

#### Database Server (.env)
```bash
cd ~/database-server
cat > .env << EOF
DB_SERVER_ADMIN_USER=dbadmin
DB_SERVER_ADMIN_PASSWORD=<secure-password>
DB_SERVER_PORT=5432
NGINX_NETWORK_NAME=nginx-network
EOF
```

#### Nginx Microservice (.env)
```bash
cd ~/nginx-microservice
cat > .env << EOF
DEFAULT_DOMAIN_SUFFIX=yourdomain.com
CERTBOT_EMAIL=admin@yourdomain.com
CERTBOT_STAGING=false
NETWORK_NAME=nginx-network
DOCKER_VOLUMES_BASE_PATH=/srv/storagebox/yourdomain/docker-volumes/nginx-microservice
PRODUCTION_BASE_PATH=/home/user
DATABASE_SERVER_PATH=/home/user/database-server
EOF
```

#### Auth Microservice (.env)
```bash
cd ~/auth-microservice
cat > .env << EOF
NODE_ENV=production
DOMAIN=auth.yourdomain.com
SERVICE_NAME=auth-microservice
PORT=3370
CORS_ORIGIN=*

FRONTEND_URL=https://auth.yourdomain.com

# Database Configuration
DB_HOST=db-server-postgres
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=<from-database-server-env>
DB_NAME=auth
DB_SYNC=false

# JWT Configuration
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Logging
LOG_LEVEL=info
LOGGING_SERVICE_URL=https://logging.yourdomain.com

# Notifications
NOTIFICATIONS_SERVICE_URL=https://notifications.yourdomain.com
EOF
```

### 3. Database Setup

```bash
# Create databases for all microservices
cd ~/beauty

# Auth database
DB_CONTAINER=db-server-postgres \
DB_SERVER_ADMIN_USER=dbadmin \
./scripts/database/create-database.sh auth

# Logging database (if needed)
./scripts/database/create-database.sh logging

# Or use the generic script for any database
./scripts/database/create-database.sh <database-name> [db_user] [db_password]
```

### 4. Docker Network Setup

```bash
# Create shared network (if not exists)
docker network create nginx-network
```

### 5. Start Infrastructure

```bash
# Start database server
cd ~/database-server
./scripts/start.sh

# Start nginx microservice
cd ~/nginx-microservice
./scripts/start-nginx.sh
```

### 6. Deploy Microservices

```bash
# Deploy auth microservice
cd ~/nginx-microservice
./scripts/blue-green/deploy-smart.sh auth-microservice

# Deploy logging microservice
./scripts/blue-green/deploy-smart.sh logging-microservice

# Deploy other microservices...
```

### 7. Verify Deployment

```bash
cd ~/nginx-microservice
./scripts/start-all-services.sh
```

## Environment Variables Reference

### Database Server
- `DB_SERVER_ADMIN_USER` - PostgreSQL admin user
- `DB_SERVER_ADMIN_PASSWORD` - PostgreSQL admin password
- `DB_SERVER_PORT` - PostgreSQL port (default: 5432)
- `NGINX_NETWORK_NAME` - Docker network name

### Nginx Microservice
- `DEFAULT_DOMAIN_SUFFIX` - Default domain suffix (e.g., `yourdomain.com`)
- `CERTBOT_EMAIL` - Email for Let's Encrypt certificates
- `NETWORK_NAME` - Docker network name
- `DOCKER_VOLUMES_BASE_PATH` - Base path for Docker volumes

### Microservices (Auth, Logging, etc.)
- `DOMAIN` - Service domain (e.g., `auth.yourdomain.com`)
- `DB_HOST` - Database container name
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `LOGGING_SERVICE_URL` - Logging service URL
- `NOTIFICATIONS_SERVICE_URL` - Notifications service URL

## Multi-Domain Configuration

### Different Domains on Same Server

Use different domain suffixes in nginx-microservice `.env`:
```bash
DEFAULT_DOMAIN_SUFFIX=domain1.com
# Deploy services for domain1.com
```

Then change for domain2:
```bash
DEFAULT_DOMAIN_SUFFIX=domain2.com
# Deploy services for domain2.com
```

### Different Domains on Different Servers

1. Set up each server independently
2. Use server-specific environment variables
3. Each server manages its own domains

## Database Naming Conventions

For multi-server deployments, consider:
- `auth` - Auth microservice database
- `logging` - Logging microservice database
- `{service-name}` - Generic pattern for any service

## Troubleshooting

### Database Connection Issues
```bash
# Check database container
docker ps | grep db-server-postgres

# Check network connectivity
docker network inspect nginx-network

# Test database connection
docker exec db-server-postgres psql -U dbadmin -d postgres -c "SELECT 1;"
```

### Nginx Configuration Issues
```bash
# Test nginx config
docker exec nginx-microservice nginx -t

# Check nginx logs
docker logs nginx-microservice

# Reload nginx
docker exec nginx-microservice nginx -s reload
```

### Service Health Checks
```bash
# Check all services
cd ~/nginx-microservice
./scripts/start-all-services.sh

# Check specific service
docker ps | grep <service-name>
docker logs <service-container>
```

## Best Practices

1. **Never hardcode domain names** - Always use environment variables
2. **Use separate databases per service** - Better isolation and scaling
3. **Version control all .env.example files** - Document required variables
4. **Use secrets management** - Don't commit passwords to git
5. **Test on staging first** - Use CERTBOT_STAGING=true for testing
6. **Monitor health checks** - Set up monitoring for all services
7. **Backup databases regularly** - Use database-server backup scripts

## Scaling Considerations

- **Horizontal Scaling**: Deploy same services on multiple servers
- **Database Scaling**: Use read replicas for read-heavy workloads
- **Load Balancing**: Nginx handles load balancing automatically
- **Service Discovery**: Services discover each other via Docker network names

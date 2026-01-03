# Environment Variables Reference

Complete reference of all environment variables used across the beauty platform.

## Database Server

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_SERVER_ADMIN_USER` | PostgreSQL admin username | `dbadmin` | No |
| `DB_SERVER_ADMIN_PASSWORD` | PostgreSQL admin password | - | Yes |
| `DB_SERVER_PORT` | PostgreSQL port | `5432` | No |
| `NGINX_NETWORK_NAME` | Docker network name | `nginx-network` | No |
| `REDIS_SERVER_PORT` | Redis port | `6379` | No |

## Nginx Microservice

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEFAULT_DOMAIN_SUFFIX` | Default domain suffix | - | Yes |
| `CERTBOT_EMAIL` | Email for Let's Encrypt | - | Yes |
| `CERTBOT_STAGING` | Use Let's Encrypt staging | `false` | No |
| `NETWORK_NAME` | Docker network name | `nginx-network` | No |
| `DOCKER_VOLUMES_BASE_PATH` | Base path for volumes | - | Yes |
| `PRODUCTION_BASE_PATH` | Base path for services | `$HOME` | No |
| `DATABASE_SERVER_PATH` | Path to database-server | `$HOME/database-server` | No |

## Auth Microservice

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Node environment | `production` | No |
| `DOMAIN` | Service domain | - | Yes |
| `SERVICE_NAME` | Service name | `auth-microservice` | No |
| `PORT` | Service port | `3370` | No |
| `CORS_ORIGIN` | CORS origin | `*` | No |
| `FRONTEND_URL` | Frontend URL | - | Yes |
| `DB_HOST` | Database host | `db-server-postgres` | No |
| `DB_PORT` | Database port | `5432` | No |
| `DB_USER` | Database user | `dbadmin` | No |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `auth` | No |
| `DB_SYNC` | Auto-sync database | `false` | No |
| `JWT_SECRET` | JWT secret key | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `30d` | No |
| `LOG_LEVEL` | Log level | `info` | No |
| `LOGGING_SERVICE_URL` | Logging service URL | - | Yes |
| `NOTIFICATIONS_SERVICE_URL` | Notifications service URL | - | Yes |

## Database Creation Scripts

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_CONTAINER` | Database container name | `db-server-postgres` | No |
| `DB_SERVER_ADMIN_USER` | Admin user | `dbadmin` | No |
| `DOCKER_NETWORK` | Docker network | `nginx-network` | No |
| `DB_NAME` | Database name | - | Yes (as argument) |
| `DB_USER` | Database user | - | No |
| `DB_PASSWORD` | Database password | - | Yes (if DB_USER set) |

## Docker Compose Services

All services use environment variables with defaults. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Main database name | `beauty_platform` |
| `POSTGRES_USER` | Database user | `beauty_user` |
| `POSTGRES_PASSWORD` | Database password | `beauty_password` |
| `DATABASE_PORT` | Database port | `4101` |
| `NATS_PORT` | NATS port | `4102` |
| `NATS_HTTP_PORT` | NATS HTTP port | `4103` |
| `NODE_ENV` | Node environment | `development` |
| `CORS_ORIGIN` | CORS origin | `*` |

## Service URLs

All service URLs are configurable via environment variables:

- `AUTH_SERVICE_URL` - Auth service URL
- `LOGGING_SERVICE_URL` - Logging service URL
- `NOTIFICATIONS_SERVICE_URL` - Notifications service URL
- `BOOKING_SERVICE_URL` - Booking service URL
- `POS_SERVICE_URL` - POS service URL
- `PAYMENTS_SERVICE_URL` - Payments service URL
- `INVENTORY_SERVICE_URL` - Inventory service URL
- `CUSTOMER_SERVICE_URL` - Customer service URL
- `BI_SERVICE_URL` - BI service URL
- `INTEGRATION_HUB_SERVICE_URL` - Integration hub URL
- `STAFF_SERVICE_URL` - Staff service URL

## Best Practices

1. **Never commit .env files** - Use .env.example as template
2. **Use different values per environment** - Dev, staging, production
3. **Rotate secrets regularly** - Especially JWT secrets and passwords
4. **Use secrets management** - For production deployments
5. **Document all variables** - Keep this file updated

## Example .env Files

See `docs/deployment/multi-server-deployment.md` for complete examples.

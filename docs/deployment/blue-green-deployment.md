# Blue/Green Deployment Guide for Beauty Application

This guide explains how to deploy the beauty application using blue/green deployment via nginx-microservice.

## Files Created

1. **docker-compose.blue.yml** - Blue environment configuration
2. **docker-compose.green.yml** - Green environment configuration
3. **scripts/deploy.sh** - Deployment script that calls nginx-microservice deployment

## Container Naming Convention

All application services follow the blue/green naming pattern:

- **Blue containers**: `{service-name}-blue` (e.g., `beauty-api-gateway-blue`)
- **Green containers**: `{service-name}-green` (e.g., `beauty-api-gateway-green`)
- **Shared services**: Database and NATS are shared (no color suffix)

## Service Ports

All services use consistent container ports (4110-4117 range):

- API Gateway: `4100` (main entry point exposed via nginx)
- Booking Service: `4110`
- POS Service: `4111`
- Payments Service: `4112`
- Inventory Service: `4113`
- Customer Service: `4114`
- BI Service: `4115`
- Integration Hub Service: `4116`
- Staff Service: `4117`

**Note**: These are container ports. Nginx-microservice connects via Docker DNS using container names, not host ports.

## Environment Variables Update

Update your `.env` file to ensure consistency with docker-compose files:

### Port Configuration

```bash
# Update these ports to match docker-compose (4110-4117 range)
API_GATEWAY_PORT=4100
BOOKING_SERVICE_PORT=4110
POS_SERVICE_PORT=4111
PAYMENTS_SERVICE_PORT=4112
INVENTORY_SERVICE_PORT=4113
CUSTOMER_SERVICE_PORT=4114
BI_SERVICE_PORT=4115
INTEGRATION_HUB_SERVICE_PORT=4116
STAFF_SERVICE_PORT=4117
```

### Service URLs

The docker-compose files automatically override service URLs with color-specific container names. The `.env` file should have default URLs:

```bash
BOOKING_SERVICE_URL=http://beauty-booking-service:4110
POS_SERVICE_URL=http://beauty-pos-service:4111
PAYMENTS_SERVICE_URL=http://beauty-payments-service:4112
INVENTORY_SERVICE_URL=http://beauty-inventory-service:4113
CUSTOMER_SERVICE_URL=http://beauty-customer-service:4114
BI_SERVICE_URL=http://beauty-bi-service:4115
INTEGRATION_HUB_SERVICE_URL=http://beauty-integration-hub-service:4116
STAFF_SERVICE_URL=http://beauty-staff-service:4117
```

**Note**: The docker-compose.blue.yml and docker-compose.green.yml files override these with color-specific names (e.g., `beauty-booking-service-blue` or `beauty-booking-service-green`).

## Deployment Process

### 1. Ensure nginx-microservice is Running

```bash
cd /home/alfares/nginx-microservice
./scripts/start-nginx.sh
```

### 2. Deploy Beauty Application

```bash
cd /home/alfares/beauty
./scripts/deploy.sh
```

This script:

- Detects nginx-microservice location
- Calls `nginx-microservice/scripts/blue-green/deploy-smart.sh beauty`
- Performs full blue/green deployment cycle

### 3. Verify Deployment

```bash
# Check service status
cd /home/alfares/nginx-microservice
./scripts/status-all-services.sh

# Check beauty service specifically
docker ps | grep beauty

# Test health endpoint
curl https://beauty.alfares.cz/health
```

## Service Registry

The nginx-microservice deployment script automatically creates/updates the service registry file at:

```
nginx-microservice/service-registry/beauty.json
```

**⚠️ Important**: Do NOT manually create or edit this file. It is automatically managed by the deployment script.

The service registry will contain:

```json
{
  "service_name": "beauty",
  "production_path": "/home/alfares/beauty",
  "domain": "beauty.alfares.cz",
  "docker_compose_file": "docker-compose.blue.yml",
  "docker_project_base": "beauty",
  "services": {
    "api-gateway": {
      "container_name_base": "beauty-api-gateway",
      "container_port": 4100,
      "health_endpoint": "/health",
      "health_timeout": 5,
      "health_retries": 3,
      "startup_time": 5
    }
  },
  "shared_services": ["postgres", "nats"],
  "network": "nginx-network"
}
```

## Blue/Green Switching

The deployment script automatically:

1. **Prepares green environment**: Builds and starts green containers
2. **Health checks**: Verifies green environment is healthy
3. **Switches traffic**: Updates nginx symlinks to point to green
4. **Monitors**: Continues health checks after switch
5. **Rollback**: Automatically rolls back if health checks fail

### Manual Rollback

If needed, manually rollback:

```bash
cd /home/alfares/nginx-microservice
./scripts/blue-green/rollback.sh beauty
```

## Troubleshooting

### Containers Not Starting

1. Check docker-compose files exist:

   ```bash
   ls -la docker-compose.blue.yml docker-compose.green.yml
   ```

2. Check service registry:

   ```bash
   cat /home/alfares/nginx-microservice/service-registry/beauty.json
   ```

3. Check container logs:

   ```bash
   docker logs beauty-api-gateway-blue
   docker logs beauty-api-gateway-green
   ```

### Nginx Config Not Generated

1. Check service registry exists and is valid JSON
2. Check for rejected configs:

   ```bash
   ls -la /home/alfares/nginx-microservice/nginx/conf.d/rejected/
   ```

3. Check nginx logs:

   ```bash
   docker logs nginx-microservice
   ```

### Port Conflicts

All services use container ports (not host ports) for nginx routing:

- Container ports: 4100, 4110-4117 (used by nginx via Docker DNS)
- Host ports: Can be different, not used by nginx

If you see port conflicts, check:

```bash
docker ps --format "{{.Names}}\t{{.Ports}}"
```

## Best Practices

1. **Always test green before switching**: The deployment script does this automatically
2. **Monitor after deployment**: Check logs and health endpoints
3. **Keep blue running**: Don't stop blue until green is confirmed stable
4. **Use health checks**: Never deploy without passing health checks
5. **Validate configs**: All nginx configs are validated before application

## Related Documentation

- [Nginx Microservice Blue/Green Deployment](../../../nginx-microservice/docs/BLUE_GREEN_DEPLOYMENT.md)
- [Adding Microservices Guide](../../../nginx-microservice/docs/ADDING_MICROSERVICES.md)
- [Multi-Server Deployment Guide](./multi-server-deployment.md)

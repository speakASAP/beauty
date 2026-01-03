# ROLE

You are **API Gateway Agent**.

You are responsible for building the API Gateway with tenant propagation.

---

## PRIMARY OBJECTIVE

Build a production-ready API Gateway that:
- Validates JWT tokens
- Extracts tenant_id from JWT
- Propagates tenant context to services
- Routes requests to backend services
- Implements rate limiting

---

## NON-NEGOTIABLE RULES

1. **Use Existing nginx-microservice**
   - Do not create new gateway
   - Configure existing nginx
   - Use blue/green deployment scripts

2. **Tenant Propagation**
   - Extract tenant_id from JWT
   - Inject X-Tenant-ID header
   - Validate tenant context

3. **No Business Logic**
   - Only routing and propagation
   - No data transformation
   - No caching (services handle caching)

---

## IMPLEMENTATION TASKS

### Task 1: Configure nginx-microservice

**Location:** Use existing nginx-microservice at `/home/alfares/nginx-microservice`

**Configuration:**
- JWT validation middleware
- Tenant extraction from JWT claims
- X-Tenant-ID header injection
- Request routing to backend services

**Routes:**
- `/api/booking/*` → `booking-service:4110`
- `/api/pos/*` → `beauty-pos-service:4111`
- `/api/payments/*` → `payments-service:4112`
- `/api/inventory/*` → `inventory-service:4113`
- `/api/customer/*` → `customer-service:4114`
- `/api/analytics/*` → `bi-service:4115`
- `/api/staff/*` → `staff-service:4117`
- `/api/integration/*` → `integration-hub-service:4116`

---

### Task 2: JWT Validation

**Implementation:**
- Validate JWT signature
- Check token expiration
- Extract claims (tenant_id, user_id, role)
- Handle token refresh

**Error Handling:**
- 401 Unauthorized for invalid tokens
- 403 Forbidden for expired tokens
- Redirect to login for missing tokens

---

### Task 3: Tenant Context Propagation

**Implementation:**
- Extract `tenant_id` from JWT claim
- Inject `X-Tenant-ID` header
- Inject `X-User-ID` header
- Inject `X-Correlation-ID` header
- Pass through to backend services

---

### Task 4: Request Routing

**Implementation:**
- Route based on path prefix
- Load balancing (if multiple instances)
- Health check routing
- Error handling

---

### Task 5: Rate Limiting

**Implementation:**
- Per-tenant rate limiting
- Per-IP rate limiting (public endpoints)
- DDoS protection
- Configurable limits

---

## CONFIGURATION EXAMPLE

```nginx
# JWT validation
location /api/ {
    # Validate JWT
    auth_request /validate-jwt;
    
    # Extract tenant_id from JWT
    set $tenant_id $jwt_claim_tenant_id;
    
    # Inject headers
    proxy_set_header X-Tenant-ID $tenant_id;
    proxy_set_header X-User-ID $jwt_claim_user_id;
    proxy_set_header X-Correlation-ID $request_id;
    
    # Route to backend
    proxy_pass http://backend-service;
}
```

---

## OUTPUT

- nginx-microservice configured
- JWT validation working
- Tenant propagation working
- Request routing configured
- Rate limiting enabled

---

Execute P3.2.


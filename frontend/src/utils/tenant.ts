/**
 * Tenant Utilities
 * 
 * Helper functions for tenant context management.
 */

/**
 * Get tenant ID from localStorage
 */
export function getTenantId(): string | null {
  return localStorage.getItem('tenant_id');
}

/**
 * Get JWT token from localStorage
 */
export function getJwtToken(): string | null {
  return localStorage.getItem('jwt_token');
}

/**
 * JWT Payload interface
 */
interface JWTPayload {
  user_id?: string;
  sub?: string;
  tenant_id?: string;
  role?: string;
  is_franchisor?: boolean;
  [key: string]: unknown;
}

/**
 * Parse JWT token to extract payload
 */
export function parseJWT(token: string): JWTPayload {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    throw new Error('Invalid JWT token');
  }
}

/**
 * Validate tenant context
 */
export function validateTenantContext(): boolean {
  const tenantId = getTenantId();
  const jwtToken = getJwtToken();
  
  if (!tenantId || !jwtToken) {
    return false;
  }

  try {
    const payload = parseJWT(jwtToken);
    // Validate tenant_id matches
    return payload.tenant_id === tenantId;
  } catch {
    return false;
  }
}

/**
 * Clear tenant context
 */
export function clearTenantContext(): void {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('tenant_id');
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
}


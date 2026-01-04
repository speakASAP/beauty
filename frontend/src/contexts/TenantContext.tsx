import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { TenantContext as TenantContextType, TenantId, UserId, Role } from '../types/domain';
import { authApi } from '../api/auth';

interface TenantContextValue extends TenantContextType {
  switchTenant: (tenantId: TenantId) => Promise<void>;
  clearContext: () => void;
  isAuthenticated: boolean;
  isFranchisor: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * Tenant Context Provider
 * 
 * Manages tenant context state and provides tenant switching functionality.
 * 
 * Rules:
 * - tenant_id explicit in all operations
 * - Context cleared on tenant switch
 * - No shared state between tenants
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const [tenantId, setTenantId] = useState<TenantId | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<UserId | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isFranchisor, setIsFranchisor] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Load tenant context from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedTenantId = localStorage.getItem('tenant_id');
    const storedUserId = localStorage.getItem('user_id');
    const storedRole = localStorage.getItem('role') as Role | null;

    if (token) {
      // Parse JWT to extract tenant context
      try {
        const payload = parseJWT(token);
        setJwtToken(token);
        // Franchisor has tenant_id: null, is_franchisor: true
        const franchisor = payload.is_franchisor === true || payload.role === 'franchisor';
        setIsFranchisor(franchisor);
        if (franchisor) {
          setTenantId(null); // Franchisor has no tenant_id
        } else {
          setTenantId(payload.tenant_id || storedTenantId);
        }
        setUserId(payload.user_id || storedUserId);
        setRole(payload.role || storedRole);
      } catch {
        // Invalid token, clear context
        clearContext();
      }
    }
  }, [clearContext]);

  const switchTenant = async (newTenantId: TenantId) => {
    // Clear all queries for old tenant
    queryClient.clear();

    try {
      // Get new JWT for new tenant from auth service
      const response = await authApi.switchTenant(newTenantId);

      // Update JWT token
      localStorage.setItem('jwt_token', response.token);
      if (response.tenant_id) {
        localStorage.setItem('tenant_id', response.tenant_id);
      }

      // Parse new token to extract context
      const payload = parseJWT(response.token);
      const franchisor = payload.is_franchisor === true || payload.role === 'franchisor';
      setIsFranchisor(franchisor);

      // Update context
      setTenantId(newTenantId);
      setUserId(payload.user_id || payload.sub);
      setRole(payload.role || response.user.role);
    } catch {
      // If API call fails, still update local state (fallback)
      setTenantId(newTenantId);
      localStorage.setItem('tenant_id', newTenantId);
    }

    // Invalidate all queries to refetch with new tenant
    queryClient.invalidateQueries();
  };

  const clearContext = useCallback(() => {
    setTenantId(null);
    setJwtToken(null);
    setUserId(null);
    setRole(null);
    setIsFranchisor(false);
    queryClient.clear();
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('is_franchisor');
  }, [queryClient]);

  const isAuthenticated = !!jwtToken && (!!tenantId || isFranchisor);

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        userId,
        role,
        jwtToken,
        switchTenant,
        clearContext,
        isAuthenticated,
        isFranchisor,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}

/**
 * JWT Payload interface
 */
interface JWTPayload {
  user_id?: string;
  sub?: string;
  tenant_id?: string;
  role?: Role;
  is_franchisor?: boolean;
  [key: string]: unknown;
}

/**
 * Parse JWT token to extract payload
 */
function parseJWT(token: string): JWTPayload {
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


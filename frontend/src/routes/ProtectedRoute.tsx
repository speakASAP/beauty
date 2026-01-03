import { Navigate } from 'react-router-dom';
import { useTenantContext } from '../contexts/TenantContext';
import type { Role } from '../types/domain';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

/**
 * Protected Route Component
 * 
 * Guards routes that require authentication and optionally specific roles.
 * 
 * Rules:
 * - Requires tenant context (JWT token + tenant_id)
 * - Can require specific role
 * - Redirects to login if not authenticated
 * - Redirects to unauthorized if role doesn't match
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, tenantId, isFranchisor } = useTenantContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Franchisor can have tenantId: null, regular users must have tenantId
  if (!isFranchisor && !tenantId) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}


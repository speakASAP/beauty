import { Navigate } from 'react-router-dom';
import { useTenantContext } from '../../contexts/TenantContext';
import type { Role } from '../../types/domain';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

/**
 * Role-Based Route Component
 * 
 * Guards routes based on user role.
 * 
 * Rules:
 * - Checks role from tenant context
 * - Backend is source of truth (no client-side role guessing)
 * - Redirects if role doesn't match
 */
export function RoleBasedRoute({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
}: RoleBasedRouteProps) {
  const { role, isAuthenticated } = useTenantContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}


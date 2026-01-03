import { ReactNode } from 'react';
import { useTenantContext } from '../../contexts/TenantContext';
import type { Role } from '../../types/domain';

interface RoleBasedVisibilityProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

/**
 * Role-Based Visibility Component
 * 
 * Shows/hides UI elements based on user role.
 * 
 * Rules:
 * - Backend is source of truth (no client-side role guessing)
 * - Only hides UI, doesn't prevent API access (backend enforces)
 */
export function RoleBasedVisibility({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedVisibilityProps) {
  const { role } = useTenantContext();

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}


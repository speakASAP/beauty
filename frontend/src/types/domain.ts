// Domain Types (from Domain Glossary)

export type TenantId = string;
export type UserId = string;
export type Role = 'franchisor' | 'owner' | 'staff' | 'client';

export interface TenantContext {
  tenantId: TenantId | null;
  userId: UserId | null;
  role: Role | null;
  jwtToken: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  state: 'CREATING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  created_at: string;
}


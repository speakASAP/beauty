-- Staff / Masters Context Schema
-- Creates tables for masters (staff members) who provide services

-- Masters table (aggregate root)
CREATE TABLE IF NOT EXISTS staff.masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  specializations TEXT[], -- Array of specialization names (e.g., ['haircut', 'coloring'])
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_masters_tenant_id ON staff.masters(tenant_id);
CREATE INDEX idx_masters_email ON staff.masters(email);
CREATE INDEX idx_masters_phone ON staff.masters(phone);
CREATE INDEX idx_masters_is_active ON staff.masters(is_active);
CREATE INDEX idx_masters_name ON staff.masters(last_name, first_name);

-- Enable Row-Level Security
ALTER TABLE staff.masters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for masters
CREATE POLICY masters_tenant_select ON staff.masters
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY masters_tenant_insert ON staff.masters
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY masters_tenant_update ON staff.masters
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY masters_tenant_delete ON staff.masters
  FOR DELETE
  USING (tenant_id = current_setting('app.tenant_id')::uuid);


-- Migration: Add design field to tenants table
-- This allows each tenant to have a unique design/theme

-- Add design column to tenants table
ALTER TABLE platform.tenants
ADD COLUMN IF NOT EXISTS design VARCHAR(50) DEFAULT 'salon1';

-- Add constraint to ensure design is one of the valid options
ALTER TABLE platform.tenants
DROP CONSTRAINT IF EXISTS tenants_design_check;
ALTER TABLE platform.tenants
ADD CONSTRAINT tenants_design_check CHECK (design IN ('salon1', 'salon2', 'salon3', 'yaraspace'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_design ON platform.tenants(design);

-- Add comment
COMMENT ON COLUMN platform.tenants.design IS 'Design theme identifier (salon1, salon2, salon3)';

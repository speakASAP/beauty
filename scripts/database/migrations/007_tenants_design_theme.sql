-- Migration: Add design_theme to tenants table
-- This allows each tenant to have a unique design theme for their landing page

-- Add design_theme column to tenants table
ALTER TABLE platform.tenants
ADD COLUMN IF NOT EXISTS design_theme VARCHAR(50) DEFAULT 'salon1';

-- Add constraint to ensure valid design theme values
ALTER TABLE platform.tenants
ADD CONSTRAINT tenants_design_theme_check 
CHECK (design_theme IN ('salon1', 'salon2', 'salon3'));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_design_theme ON platform.tenants(design_theme);

-- Add comment
COMMENT ON COLUMN platform.tenants.design_theme IS 'Design theme for tenant landing page (salon1, salon2, or salon3)';

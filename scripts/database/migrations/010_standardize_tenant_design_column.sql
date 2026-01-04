-- Migration: Standardize tenant design column
-- Consolidates 'design' and 'design_theme' columns into a single 'design_theme' column
-- This fixes the inconsistency where some tenants use 'design' and others use 'design_theme'
--
-- Usage: Run this migration on the beauty_platform database
--   psql -U beauty_user -d beauty_platform -f scripts/database/migrations/010_standardize_tenant_design_column.sql

-- Step 1: Ensure design_theme column exists
ALTER TABLE platform.tenants
ADD COLUMN IF NOT EXISTS design_theme VARCHAR(50);

-- Step 2: Copy data from 'design' to 'design_theme' where design_theme is NULL
UPDATE platform.tenants
SET design_theme = COALESCE(design, design_theme, 'salon1')
WHERE design_theme IS NULL OR (design IS NOT NULL AND design_theme = 'salon1' AND design != 'salon1');

-- Step 3: Set default value for design_theme
ALTER TABLE platform.tenants
ALTER COLUMN design_theme SET DEFAULT 'salon1';

-- Step 4: Update any NULL values to default
UPDATE platform.tenants
SET design_theme = 'salon1'
WHERE design_theme IS NULL;

-- Step 5: Make design_theme NOT NULL
ALTER TABLE platform.tenants
ALTER COLUMN design_theme SET NOT NULL;

-- Step 6: Update constraint to include all valid design themes
ALTER TABLE platform.tenants
DROP CONSTRAINT IF EXISTS tenants_design_theme_check;
ALTER TABLE platform.tenants
ADD CONSTRAINT tenants_design_theme_check
CHECK (design_theme IN ('salon1', 'salon2', 'salon3', 'yaraspace'));

-- Step 7: Create/update index on design_theme
DROP INDEX IF EXISTS platform.idx_tenants_design_theme;
CREATE INDEX IF NOT EXISTS idx_tenants_design_theme ON platform.tenants(design_theme);

-- Step 8: Drop the old 'design' column if it exists
-- Note: This will fail if the column doesn't exist, which is fine
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'platform'
    AND table_name = 'tenants'
    AND column_name = 'design'
  ) THEN
    ALTER TABLE platform.tenants DROP COLUMN design;
    DROP INDEX IF EXISTS platform.idx_tenants_design;
  END IF;
END $$;

-- Step 9: Update comment
COMMENT ON COLUMN platform.tenants.design_theme IS 'Design theme for tenant landing page (salon1, salon2, salon3, or yaraspace)';

-- Step 10: Display summary
SELECT
  'Migration completed successfully' as status,
  COUNT(*) as total_tenants,
  COUNT(CASE WHEN design_theme = 'salon1' THEN 1 END) as salon1_count,
  COUNT(CASE WHEN design_theme = 'salon2' THEN 1 END) as salon2_count,
  COUNT(CASE WHEN design_theme = 'salon3' THEN 1 END) as salon3_count,
  COUNT(CASE WHEN design_theme = 'yaraspace' THEN 1 END) as yaraspace_count
FROM platform.tenants;

-- Migration: Add YaraSpace tenant
-- Creates YaraSpace tenant with yaraspace design
-- Supports both 'design' and 'design_theme' columns for backward compatibility

-- Insert YaraSpace tenant
-- Use design_theme if it exists, otherwise use design
INSERT INTO platform.tenants (
  id,
  name,
  address,
  phone,
  email,
  state,
  design_theme,
  created_at,
  updated_at
) 
SELECT
  gen_random_uuid(),
  'Yara Space & Hair Spa',
  'Kroměříž, Czech Republic',
  '+420 776 886 466',
  'info@yaraspace.cz',
  'ACTIVE',
  'yaraspace',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM platform.tenants 
  WHERE name = 'Yara Space & Hair Spa' 
  OR COALESCE(design_theme, design) = 'yaraspace'
);

-- If design_theme column doesn't exist, try with design column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'platform' 
    AND table_name = 'tenants' 
    AND column_name = 'design_theme'
  ) THEN
    INSERT INTO platform.tenants (
      id,
      name,
      address,
      phone,
      email,
      state,
      design,
      created_at,
      updated_at
    )
    SELECT
      gen_random_uuid(),
      'Yara Space & Hair Spa',
      'Kroměříž, Czech Republic',
      '+420 776 886 466',
      'info@yaraspace.cz',
      'ACTIVE',
      'yaraspace',
      NOW(),
      NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM platform.tenants 
      WHERE name = 'Yara Space & Hair Spa' 
      OR design = 'yaraspace'
    );
  END IF;
END $$;

-- Display created tenant with ID
SELECT 
  id,
  name,
  COALESCE(design_theme, design) as design_theme,
  phone,
  email,
  state
FROM platform.tenants
WHERE COALESCE(design_theme, design) = 'yaraspace'
ORDER BY created_at DESC
LIMIT 1;

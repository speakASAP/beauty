-- Query all tenants with their details and landing page information
-- This script helps identify all tenants in the system and their configurations

SELECT
  id,
  name,
  address,
  phone,
  email,
  state,
  -- Check which design column exists (design or design_theme)
  COALESCE(design, design_theme) as design_theme,
  url_slug,
  theme_config,
  created_at,
  updated_at
FROM platform.tenants
ORDER BY created_at DESC;

-- Summary: Count tenants by state
SELECT
  state,
  COUNT(*) as count
FROM platform.tenants
GROUP BY state
ORDER BY state;

-- Summary: Count tenants by design theme
SELECT
  COALESCE(design, design_theme) as design_theme,
  COUNT(*) as count
FROM platform.tenants
WHERE state = 'ACTIVE'
GROUP BY COALESCE(design, design_theme)
ORDER BY design_theme;

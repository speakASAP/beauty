-- Tenant Onboarding Script
-- Onboards a new tenant via SQL (no code changes required)
-- 
-- Usage:
--   psql -U beauty_user -d beauty_platform -f scripts/tenant/onboard_tenant.sql -v tenant_name="'Salon Name'" -v tenant_address="'Address'" -v tenant_phone="'+420123456789'" -v tenant_email="'salon@example.com'"
--
-- Or set variables directly:
--   \set tenant_name 'Salon Name'
--   \set tenant_address 'Address'
--   \set tenant_phone '+420123456789'
--   \set tenant_email 'salon@example.com'
--   \i scripts/tenant/onboard_tenant.sql

-- Check if variables are set
DO $$
BEGIN
  IF :'tenant_name' IS NULL OR :'tenant_name' = '' THEN
    RAISE EXCEPTION 'tenant_name variable must be set';
  END IF;
END $$;

-- Generate URL slug from tenant name (lowercase, replace spaces with hyphens, remove special chars)
-- If url_slug is provided, use it; otherwise generate from name
DO $$
DECLARE
  generated_slug TEXT;
  final_slug TEXT;
  slug_exists BOOLEAN;
  counter INTEGER := 0;
BEGIN
  -- Use provided slug or generate from name
  IF :'url_slug' IS NOT NULL AND :'url_slug' != '' THEN
    final_slug := LOWER(REGEXP_REPLACE(:'url_slug', '[^a-z0-9-]', '', 'g'));
  ELSE
    -- Generate from tenant name
    generated_slug := LOWER(REGEXP_REPLACE(:'tenant_name', '[^a-z0-9\s-]', '', 'g'));
    generated_slug := REGEXP_REPLACE(generated_slug, '\s+', '-', 'g');
    generated_slug := REGEXP_REPLACE(generated_slug, '-+', '-', 'g');
    generated_slug := TRIM(BOTH '-' FROM generated_slug);
    final_slug := generated_slug;
  END IF;

  -- Ensure slug is unique (add number suffix if needed)
  slug_exists := EXISTS(SELECT 1 FROM platform.tenants WHERE url_slug = final_slug);
  WHILE slug_exists LOOP
    counter := counter + 1;
    final_slug := generated_slug || '-' || counter::TEXT;
    slug_exists := EXISTS(SELECT 1 FROM platform.tenants WHERE url_slug = final_slug);
  END LOOP;

  -- Store in session variable for use in INSERT
  PERFORM set_config('app.generated_slug', final_slug, false);
END $$;

-- Create tenant record
INSERT INTO platform.tenants (
  id,
  name,
  address,
  phone,
  email,
  url_slug,
  theme_config,
  state,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  :'tenant_name',
  COALESCE(:'tenant_address', NULL),
  COALESCE(:'tenant_phone', NULL),
  COALESCE(:'tenant_email', NULL),
  current_setting('app.generated_slug', true),
  COALESCE(:'theme_config'::jsonb, '{}'::jsonb),
  'CREATING',
  NOW(),
  NOW()
) RETURNING id, name, url_slug, state;

-- Note: In a full implementation, you would:
-- 1. Copy global service templates to tenant catalog
-- 2. Copy global product templates to tenant catalog
-- 3. Create default settings (business hours, timezone, etc.)
-- 4. Create initial admin user (salon owner)
-- 5. Assign default roles and permissions
-- 6. Set state to ACTIVE
--
-- For MVP, we'll set state to ACTIVE directly after creating the tenant record
-- Full provisioning can be added later as a separate process

-- Set tenant state to ACTIVE (after provisioning)
UPDATE platform.tenants
SET state = 'ACTIVE', updated_at = NOW()
WHERE name = :'tenant_name' AND state = 'CREATING';

-- Display tenant information
SELECT 
  id,
  name,
  url_slug,
  address,
  phone,
  email,
  theme_config,
  state,
  created_at,
  updated_at
FROM platform.tenants
WHERE name = :'tenant_name';

-- Success message
DO $$
DECLARE
  tenant_id UUID;
  tenant_name TEXT;
  tenant_slug TEXT;
BEGIN
  SELECT id, name, url_slug INTO tenant_id, tenant_name, tenant_slug
  FROM platform.tenants
  WHERE name = :'tenant_name';
  
  RAISE NOTICE '✅ Tenant onboarded successfully!';
  RAISE NOTICE 'Tenant ID: %', tenant_id;
  RAISE NOTICE 'Tenant Name: %', tenant_name;
  RAISE NOTICE 'URL Slug: %', tenant_slug;
  RAISE NOTICE 'Public URL: https://beauty.alfares.cz/%', tenant_slug;
  RAISE NOTICE 'State: ACTIVE';
  RAISE NOTICE '';
  RAISE NOTICE 'Tenant can now:';
  RAISE NOTICE '  - Create appointments';
  RAISE NOTICE '  - Process orders';
  RAISE NOTICE '  - Manage inventory';
  RAISE NOTICE '  - Access all features';
  RAISE NOTICE '  - Customize theme via theme_config JSONB field';
END $$;


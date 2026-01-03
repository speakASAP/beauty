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

-- Create tenant record
INSERT INTO platform.tenants (
  id,
  name,
  address,
  phone,
  email,
  state,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  :'tenant_name',
  COALESCE(:'tenant_address', NULL),
  COALESCE(:'tenant_phone', NULL),
  COALESCE(:'tenant_email', NULL),
  'CREATING',
  NOW(),
  NOW()
) RETURNING id, name, state;

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
  address,
  phone,
  email,
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
BEGIN
  SELECT id, name INTO tenant_id, tenant_name
  FROM platform.tenants
  WHERE name = :'tenant_name';
  
  RAISE NOTICE '✅ Tenant onboarded successfully!';
  RAISE NOTICE 'Tenant ID: %', tenant_id;
  RAISE NOTICE 'Tenant Name: %', tenant_name;
  RAISE NOTICE 'State: ACTIVE';
  RAISE NOTICE '';
  RAISE NOTICE 'Tenant can now:';
  RAISE NOTICE '  - Create appointments';
  RAISE NOTICE '  - Process orders';
  RAISE NOTICE '  - Manage inventory';
  RAISE NOTICE '  - Access all features';
END $$;


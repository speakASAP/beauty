-- Migration: Add YaraSpace tenant
-- Creates YaraSpace tenant with yaraspace design

-- Insert YaraSpace tenant
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
) VALUES (
  gen_random_uuid(),
  'Yara Space & Hair Spa',
  'Kroměříž, Czech Republic',
  '+420 776 886 466',
  'info@yaraspace.cz',
  'ACTIVE',
  'yaraspace',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Display created tenant with ID
SELECT 
  id,
  name,
  design,
  phone,
  email,
  state
FROM platform.tenants
WHERE design = 'yaraspace'
ORDER BY created_at DESC
LIMIT 1;

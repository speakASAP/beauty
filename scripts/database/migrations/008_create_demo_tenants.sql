-- Migration: Create demo tenants with unique designs
-- These are example tenants for the franchise presentation

-- Insert Luna Beauty & Spa (salon1 design)
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
  'Luna Beauty & Spa',
  'Havířská 123, Kroměříž, 767 01',
  '+420 776 886 466',
  'info@lunabeauty.cz',
  'ACTIVE',
  'salon1',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Insert Aurora Hair Studio (salon2 design)
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
  'Aurora Hair Studio',
  'Masarykovo náměstí 45, Kroměříž, 767 01',
  '+420 776 886 467',
  'info@aurorastudio.cz',
  'ACTIVE',
  'salon2',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Insert Serenity Beauty Lounge (salon3 design)
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
  'Serenity Beauty Lounge',
  'Velké náměstí 12, Kroměříž, 767 01',
  '+420 776 886 468',
  'info@serenitylounge.cz',
  'ACTIVE',
  'salon3',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Display created tenants with their IDs
SELECT 
  id,
  name,
  design,
  phone,
  email,
  state
FROM platform.tenants
WHERE design IN ('salon1', 'salon2', 'salon3')
ORDER BY design;

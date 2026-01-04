-- Migration: Add URL slug and theme configuration to tenants table
-- This enables unique URLs and custom designs per tenant
-- 
-- Usage: Run this migration on the beauty_platform database
--   psql -U beauty_user -d beauty_platform -f scripts/database/migrations/008_add_tenant_url_slug_and_theme.sql

-- Add url_slug column (unique, for URL routing)
ALTER TABLE platform.tenants
ADD COLUMN IF NOT EXISTS url_slug VARCHAR(100) UNIQUE;

-- Add theme_config JSONB column (for custom design settings)
ALTER TABLE platform.tenants
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;

-- Create index on url_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenants_url_slug ON platform.tenants(url_slug) WHERE url_slug IS NOT NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN platform.tenants.url_slug IS 'Unique URL slug for tenant (e.g., "yaraspace", "salon-1"). Used in routing: /{url_slug}';
COMMENT ON COLUMN platform.tenants.theme_config IS 'JSONB object storing tenant-specific theme settings (colors, fonts, images, etc.)';

-- Example theme_config structure:
-- {
--   "primaryColor": "#d4a574",
--   "secondaryColor": "#f5c6cb",
--   "backgroundImage": "https://example.com/image.jpg",
--   "logo": "https://example.com/logo.png",
--   "fontFamily": "Arial, sans-serif"
-- }

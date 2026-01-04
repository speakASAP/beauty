# Tenant Landing Pages Refactoring

## Overview

This document describes the refactoring of the tenant system to consolidate all beauty salons into a single, unified system with a main landing page that displays all active salons.

## Problem Statement

The system had multiple beauty salons created using different APIs and technologies, resulting in:
- Inconsistent database columns (`design` vs `design_theme`)
- No unified way to view all salons
- Main landing page didn't show existing salons
- Different approaches for accessing salon pages

## Solution

### 1. Main Landing Page Enhancement

The main landing page at `https://beauty.alfares.cz` now:
- Displays all active salons in a dedicated "Our Salons" section
- Shows salon name, address, and phone for each salon
- Provides clickable links to each salon's individual landing page
- Maintains the franchise information and call-to-action sections

### 2. Unified API Endpoints

Created new API endpoints:
- **GET `/api/tenants`** - Returns all active tenants (used by main landing page)
- **GET `/api/tenant?tenant_id=uuid`** - Returns single tenant info (updated to handle both column names)

### 3. Database Standardization

Created migration `010_standardize_tenant_design_column.sql` that:
- Consolidates `design` and `design_theme` columns into a single `design_theme` column
- Preserves all existing data
- Removes the redundant `design` column
- Updates all constraints and indexes

### 4. Code Updates

Updated all code to use `design_theme` consistently:
- `public-website/app/api/tenant/route.ts` - Handles both columns for backward compatibility
- `public-website/app/api/tenants/route.ts` - New endpoint for listing all tenants
- `public-website/app/page.tsx` - Displays all salons on main landing page
- `public-website/app/salon/page.tsx` - Uses local API route for consistency
- `services/api-gateway/src/index.js` - Updated to handle both columns

## How to Query All Tenants

### Using SQL Script

Run the provided SQL script to see all tenants:

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/query_all_tenants.sql
```

This will show:
- All tenants with their IDs, names, addresses, contact info
- Design theme for each tenant
- State (ACTIVE, CREATING, SUSPENDED, ARCHIVED)
- Summary counts by state and design theme

### Using API Endpoint

Call the API endpoint to get all active tenants:

```bash
curl http://localhost:3000/api/tenants
```

Or in the browser:
```
http://localhost:3000/api/tenants
```

Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Salon Name",
      "address": "Address",
      "phone": "+420 123 456 789",
      "email": "info@salon.cz",
      "design_theme": "salon1",
      "url_slug": null,
      "state": "ACTIVE"
    }
  ],
  "count": 10
}
```

## URL Structure

### Main Landing Page
- **URL**: `https://beauty.alfares.cz/`
- **Purpose**: Franchise landing page with all salons listed

### Individual Salon Pages
- **URL**: `https://beauty.alfares.cz/salon?tenant_id=<tenant-uuid>`
- **Purpose**: Individual salon landing page with booking functionality

## Running the Standardization Migration

To standardize the database schema:

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/migrations/010_standardize_tenant_design_column.sql
```

This migration is safe to run multiple times and will:
1. Preserve all existing data
2. Consolidate columns
3. Show a summary of tenants by design theme

## Design Themes

Currently supported design themes:
- `salon1` - Soft curves, pastel colors (pink, lavender)
- `salon2` - Elegant flowing lines, warm tones (coral, beige)
- `salon3` - Organic shapes, sophisticated neutrals
- `yaraspace` - Custom design for Yara Space & Hair Spa

## Next Steps

1. **Run the standardization migration** on production database
2. **Test the main landing page** to ensure all salons are displayed
3. **Verify salon links** work correctly
4. **Add salon photos** if desired (can be stored in `theme_config` JSONB column)
5. **Consider adding URL slugs** for cleaner URLs (e.g., `/luna-beauty` instead of `/salon?tenant_id=...`)

## Files Changed

### New Files
- `public-website/app/api/tenants/route.ts` - API endpoint for listing all tenants
- `scripts/database/query_all_tenants.sql` - SQL script to query all tenants
- `scripts/database/migrations/010_standardize_tenant_design_column.sql` - Migration to standardize columns
- `docs/refactoring/tenant-landing-pages-refactoring.md` - This document

### Modified Files
- `public-website/app/page.tsx` - Added "Our Salons" section
- `public-website/app/franchise.css` - Added styles for salon cards
- `public-website/app/api/tenant/route.ts` - Updated to handle both column names
- `public-website/app/salon/page.tsx` - Updated to use local API route
- `services/api-gateway/src/index.js` - Updated to handle both column names

## Testing Checklist

- [ ] Main landing page displays all active salons
- [ ] Salon cards are clickable and navigate to salon pages
- [ ] Individual salon pages load correctly with tenant_id
- [ ] API endpoint `/api/tenants` returns all active tenants
- [ ] API endpoint `/api/tenant?tenant_id=...` returns correct tenant
- [ ] Database migration runs successfully
- [ ] All existing salon pages still work after migration

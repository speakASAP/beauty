# Tenant-Based Salon System

## Overview

The public website supports tenant-based salon pages with unique designs. Each tenant in the database can have a unique design theme (salon1, salon2, salon3, or yaraspace).

The main landing page at `https://beauty.alfares.cz` displays all active salons, allowing visitors to browse and click through to individual salon pages.

## URL Structure

### Main Landing Page
- **URL**: `https://beauty.alfares.cz/`
- **Purpose**: Franchise landing page that displays all active salons with links to their individual pages

### Individual Salon Pages
Each salon is accessible via:
```
https://beauty.alfares.cz/salon?tenant_id=<tenant-uuid>
```

Example:
```
https://beauty.alfares.cz/salon?tenant_id=af8ad504-0077-4da0-b3c0-7b903f15d944
```

## Database Setup

### 1. Run Migration to Add Design Field

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/migrations/007_add_tenant_design.sql
```

### 2. Create Demo Tenants

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/migrations/008_create_demo_tenants.sql
```

This will create 3 tenants:
- **Luna Beauty & Spa** (design: salon1)
- **Aurora Hair Studio** (design: salon2)
- **Serenity Beauty Lounge** (design: salon3)

### 3. Standardize Design Column (Recommended)

Run the standardization migration to consolidate `design` and `design_theme` columns:

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/migrations/010_standardize_tenant_design_column.sql
```

### 4. Get Tenant IDs

Query the database to get all tenant IDs:

```sql
SELECT id, name, design_theme, phone, email, state
FROM platform.tenants
WHERE state = 'ACTIVE'
ORDER BY name;
```

Or use the provided SQL script:

```bash
psql -U beauty_user -d beauty_platform -f scripts/database/query_all_tenants.sql
```

## Available Designs

- **salon1**: Soft curves, pastel colors (pink, lavender)
- **salon2**: Elegant flowing lines, warm tones (coral, beige)
- **salon3**: Organic shapes, sophisticated neutrals
- **yaraspace**: Custom design for Yara Space & Hair Spa

## API Endpoints

### GET /api/tenants

Returns all active tenants. Used by the main landing page to display all salons.

**Response:**
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

### GET /api/tenant?tenant_id=uuid

Returns tenant information for a specific tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Salon Name",
    "address": "Address",
    "phone": "+420 123 456 789",
    "email": "info@salon.cz",
    "design_theme": "salon1",
    "state": "ACTIVE"
  }
}
```

## Environment Variables

The API route requires database connection:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
# OR
POSTGRES_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=false  # Set to 'true' if using SSL
```

## Creating New Tenants

To create a new tenant with a specific design:

```sql
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
) VALUES (
  gen_random_uuid(),
  'Your Salon Name',
  'Your Address',
  '+420 123 456 789',
  'info@yoursalon.cz',
  'ACTIVE',
  'salon1',  -- or 'salon2', 'salon3', or 'yaraspace'
  NOW(),
  NOW()
) RETURNING id, name, design_theme;
```

## Testing

1. Start the Next.js dev server:
   ```bash
   cd public-website
   npm install
   npm run dev
   ```

2. Access a salon page:
   ```
   http://localhost:3000/salon?tenant_id=<tenant-uuid>
   ```

3. The page will automatically load the appropriate design based on the tenant's `design_theme` field.

4. Visit the main landing page to see all salons:
   ```
   http://localhost:3000/
   ```

## Architecture

### Main Landing Page
- **`/app/page.tsx`**: Main landing page that displays all active salons in an "Our Salons" section
- Fetches all tenants from `/api/tenants` endpoint
- Shows salon cards with name, address, phone, and link to individual salon page

### Individual Salon Pages
- **`/app/salon/page.tsx`**: Dynamic page that fetches tenant info and renders the appropriate design
- **`/app/api/tenant/route.ts`**: API endpoint to fetch single tenant information from database
- **`/app/api/tenants/route.ts`**: API endpoint to fetch all active tenants

### Design Components
- **`/app/components/Salon1Design.tsx`**: Reusable component for salon1 design
- **`/app/components/Salon2Design.tsx`**: Reusable component for salon2 design
- **`/app/components/Salon3Design.tsx`**: Reusable component for salon3 design

Each design component receives tenant data as props and displays tenant-specific information (name, address, phone, email).

## Database Schema

The `platform.tenants` table uses `design_theme` column (standardized from previous `design` column). The migration `010_standardize_tenant_design_column.sql` consolidates both columns.

For more details, see: `docs/refactoring/tenant-landing-pages-refactoring.md`

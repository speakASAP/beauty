# Tenant-Based Salon System

## Overview

The public website now supports tenant-based salon pages with unique designs. Each tenant in the database can have a unique design theme (salon1, salon2, or salon3).

## URL Structure

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

### 3. Get Tenant IDs

After running the migration, query the database to get tenant IDs:

```sql
SELECT id, name, design, phone, email
FROM platform.tenants
WHERE design IN ('salon1', 'salon2', 'salon3')
ORDER BY design;
```

## Available Designs

- **salon1**: Luna Beauty & Spa - Soft curves, pastel colors (pink, lavender)
- **salon2**: Aurora Hair Studio - Elegant flowing lines, warm tones (coral, beige)
- **salon3**: Serenity Beauty Lounge - Organic shapes, sophisticated neutrals

## API Endpoint

### GET /api/tenant?tenant_id=uuid

Returns tenant information including design theme.

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
    "design": "salon1",
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
  design,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Your Salon Name',
  'Your Address',
  '+420 123 456 789',
  'info@yoursalon.cz',
  'ACTIVE',
  'salon1',  -- or 'salon2' or 'salon3'
  NOW(),
  NOW()
) RETURNING id, name, design;
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

3. The page will automatically load the appropriate design based on the tenant's `design` field.

## Architecture

- **`/app/salon/page.tsx`**: Dynamic page that fetches tenant info and renders the appropriate design
- **`/app/api/tenant/route.ts`**: API endpoint to fetch tenant information from database
- **`/app/components/Salon1Design.tsx`**: Reusable component for salon1 design
- **`/app/components/Salon2Design.tsx`**: Reusable component for salon2 design
- **`/app/components/Salon3Design.tsx`**: Reusable component for salon3 design

Each design component receives tenant data as props and displays tenant-specific information (name, address, phone, email).

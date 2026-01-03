# Public Booking Website

SEO-optimized Multi-Page Application (MPA) for online booking.

## Features

- Server-side rendering (SSR) for SEO
- Online booking interface
- Slot availability display
- Client self-registration
- SMS confirmation
- SEO-optimized pages

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Environment Variables

- `BOOKING_API_URL` - Booking service API URL (default: http://localhost:4110)
- `NEXT_PUBLIC_TENANT_ID` - Default tenant ID (optional, can be from subdomain)

## Tenant Identification

The website supports multiple tenant identification methods:
1. Subdomain (recommended): `salon1.beauty-platform.cz`
2. Query parameter: `?tenant_id=uuid`
3. Environment variable: `NEXT_PUBLIC_TENANT_ID`


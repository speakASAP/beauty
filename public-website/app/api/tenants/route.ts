import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Force dynamic rendering for API route
export const dynamic = 'force-dynamic';

// Database connection pool
const db = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/tenants
 * Public endpoint to get all active tenants
 * Used by main landing page to display all salons
 */
export async function GET(request: NextRequest) {
  try {
    // Query all active tenants from database
    // Handle both 'design' and 'design_theme' columns for backward compatibility
    const result = await db.query(
      `SELECT 
        id,
        name,
        address,
        phone,
        email,
        state,
        COALESCE(design, design_theme, 'salon1') as design_theme,
        url_slug,
        created_at,
        updated_at
      FROM platform.tenants
      WHERE state = 'ACTIVE'
      ORDER BY name ASC`
    );

    const tenants = result.rows.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      design_theme: tenant.design_theme || 'salon1',
      url_slug: tenant.url_slug,
      state: tenant.state,
    }));

    return NextResponse.json({
      success: true,
      data: tenants,
      count: tenants.length,
    });
  } catch (error: any) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

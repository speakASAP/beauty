import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection pool
const db = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

/**
 * GET /api/tenant?tenant_id=uuid
 * Public endpoint to get tenant information by tenant_id
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id parameter is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return NextResponse.json(
        { error: 'Invalid tenant_id format' },
        { status: 400 }
      );
    }

    // Query tenant from database
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
        created_at,
        updated_at
      FROM platform.tenants
      WHERE id = $1 AND state = 'ACTIVE'`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Tenant not found or not active' },
        { status: 404 }
      );
    }

    const tenant = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        design_theme: tenant.design_theme || 'salon1',
        state: tenant.state,
      }
    });
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

import axios from 'axios';

const BOOKING_API_URL = process.env.BOOKING_API_URL || process.env.NEXT_PUBLIC_BOOKING_API_URL || 'http://localhost:4110';

// Get tenant ID from subdomain or query parameter
export function getTenantId(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: extract from subdomain or use env var
    return process.env.NEXT_PUBLIC_TENANT_ID || null;
  }

  // Client-side: extract from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tenantId = urlParams.get('tenant_id');
  if (tenantId) {
    return tenantId;
  }

  // Extract from subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
    // In production, you'd map subdomain to tenant_id
    // For MVP, we'll use query parameter
    return null;
  }

  return process.env.NEXT_PUBLIC_TENANT_ID || null;
}

// Create API client with tenant context
function createApiClient() {
  const tenantId = getTenantId();
  
  const client = axios.create({
    baseURL: BOOKING_API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(tenantId && { 'X-Tenant-ID': tenantId }),
    },
  });

  return client;
}

// Public API functions
export async function getAvailability(masterId?: string, date?: string) {
  const client = createApiClient();
  const tenantId = getTenantId();
  
  const params: any = {};
  if (date) params.date = date;
  if (masterId) params.master_id = masterId;
  if (tenantId) params.tenant_id = tenantId;

  const response = await client.get('/public/availability', { params });
  return response.data;
}

export async function createBooking(bookingData: {
  tenant_id?: string;
  client: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    gdpr_consent: boolean;
  };
  master_id: string;
  service_id: string;
  starts_at: string;
  duration_minutes: number;
}) {
  const client = createApiClient();
  const tenantId = getTenantId();
  
  const payload = {
    ...bookingData,
    tenant_id: bookingData.tenant_id || tenantId,
  };

  const response = await client.post('/public/book', payload);
  return response.data;
}

export async function getBookingByToken(token: string) {
  const client = createApiClient();
  const tenantId = getTenantId();
  
  const params: any = {};
  if (tenantId) params.tenant_id = tenantId;

  const response = await client.get(`/public/bookings/${token}`, { params });
  return response.data;
}

// Get tenant information by tenant_id (public endpoint)
export async function getTenantInfo(tenantId: string) {
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4100';
  
  const client = axios.create({
    baseURL: API_GATEWAY_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  try {
    const response = await client.get(`/public/tenant/${tenantId}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

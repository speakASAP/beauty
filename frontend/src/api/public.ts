import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api';

/**
 * Public API Client
 * 
 * For public-facing endpoints (no authentication required).
 * Tenant context comes from URL parameter or subdomain.
 * 
 * Endpoints:
 * - GET /public/services - Get services catalog (public)
 * - GET /public/availability - Check availability (public)
 * - POST /public/bookings - Create booking (public)
 * - GET /public/bookings/:token - Get booking by token (public)
 * - POST /public/bookings/:token/cancel - Cancel booking (public)
 */

// Public API base URL - use API Gateway if available, otherwise direct to booking service
const PUBLIC_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4100';

class PublicApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - inject tenant context from URL or localStorage
    this.client.interceptors.request.use(
      (config) => {
        // Get tenant_id from URL parameter or localStorage (set during tenant selection)
        const urlParams = new URLSearchParams(window.location.search);
        const tenantId = urlParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
        
        if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        // Generate correlation ID for tracking
        const correlationId = `public_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Correlation-ID'] = correlationId;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }
}

// Create public API client instance
const publicApiClient = new PublicApiClient(PUBLIC_API_BASE_URL);

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  vat_rate: number;
}

export interface AvailabilitySlot {
  starts_at: string;
  ends_at: string;
  master_id: string;
  master_name: string;
  available: boolean;
}

export interface PublicBookingRequest {
  tenant_id: string;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email?: string;
  master_id: string;
  service_id: string;
  starts_at: string;
  duration_minutes: number;
  gdpr_consent: boolean;
}

export interface PublicBooking {
  id: string;
  appointment_id: string;
  confirmation_token: string;
  client_name: string;
  service_name: string;
  starts_at: string;
  status: string;
}

export interface SalonInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  state?: string;
}

export const publicApi = {
  /**
   * Get salon/tenant information (public, no auth)
   * Note: For MVP, this might need a public endpoint or tenant_id from URL
   */
  getSalonInfo: async (tenantId: string): Promise<SalonInfo | null> => {
    // Store tenant_id for subsequent requests
    localStorage.setItem('public_tenant_id', tenantId);
    
    // For MVP, this is a placeholder - actual implementation depends on platform service
    // This would fetch from /public/tenants/:id or similar endpoint
    try {
      // TODO: Replace with actual API call when tenant info endpoint is ready
      // const response = await publicApiClient.get<ApiResponse<SalonInfo>>(
      //   `/public/tenants/${tenantId}`
      // );
      // return response.data.data;
      
      // For now, return null to use mock data in component
      return null;
    } catch (error) {
      console.error('Failed to fetch salon info:', error);
      return null;
    }
  },

  /**
   * Get services catalog (public, no auth)
   * Note: For MVP, uses regular booking service with tenant_id from URL
   */
  getServices: async (tenantId: string): Promise<PublicService[]> => {
    // Store tenant_id for subsequent requests
    localStorage.setItem('public_tenant_id', tenantId);
    
    // For MVP, we'll need to get services from catalog service or booking service
    // This is a placeholder - actual implementation depends on catalog service
    // For now, return empty array (services would come from catalog service)
    return [];
  },

  /**
   * Check availability (public, no auth)
   * Note: For MVP, this might need a public endpoint or tenant_id from URL
   */
  checkAvailability: async (
    tenantId: string,
    _params: {
      service_id: string;
      master_id?: string;
      date: string;
    }
  ): Promise<AvailabilitySlot[]> => {
    // Store tenant_id for subsequent requests
    localStorage.setItem('public_tenant_id', tenantId);
    
    // For MVP, availability checking might need a public endpoint
    // This is a placeholder - actual implementation depends on booking service
    return [];
  },

  /**
   * Create public booking (no auth required)
   * Creates both client and appointment
   */
  createBooking: async (
    tenantId: string,
    data: PublicBookingRequest
  ): Promise<PublicBooking> => {
    // Store tenant_id for subsequent requests
    localStorage.setItem('public_tenant_id', tenantId);
    
    // For MVP, we'll create client first, then appointment
    // This would be handled by a public booking endpoint or two separate calls
    // Placeholder implementation
    const response = await publicApiClient.post<ApiResponse<PublicBooking>>(
      '/public/bookings',
      { ...data, tenant_id: tenantId }
    );
    return response.data.data;
  },

  /**
   * Get booking by token (public, no auth)
   */
  getBookingByToken: async (token: string): Promise<PublicBooking> => {
    const response = await publicApiClient.get<ApiResponse<PublicBooking>>(
      `/public/bookings/${token}`
    );
    return response.data.data;
  },

  /**
   * Cancel booking by token (public, no auth)
   */
  cancelBookingByToken: async (token: string, reason?: string): Promise<void> => {
    await publicApiClient.post(`/public/bookings/${token}/cancel`, { reason });
  },
};


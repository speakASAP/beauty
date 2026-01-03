import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * API Client with automatic tenant context injection
 * 
 * Rules:
 * - tenant_id explicit in all API calls
 * - JWT token included in Authorization header
 * - Correlation ID generated for each request
 * - 403 errors trigger tenant context violation handling
 */
class ApiClient {
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
    // Request interceptor - inject tenant context
    this.client.interceptors.request.use(
      (config) => {
        const tenantId = this.getTenantId();
        const isFranchisor = this.getIsFranchisor();
        const jwtToken = this.getJwtToken();
        const correlationId = this.generateCorrelationId();

        // Franchisor has tenant_id: null, but we still need to set headers
        if (isFranchisor) {
          // For franchisor, backend expects tenant_id: null or no header
          // Some backends may require explicit null or special header
          config.headers['X-Is-Franchisor'] = 'true';
        } else if (tenantId) {
          config.headers['X-Tenant-ID'] = tenantId;
        }

        if (jwtToken) {
          config.headers['Authorization'] = `Bearer ${jwtToken}`;
        }

        config.headers['X-Correlation-ID'] = correlationId;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 403) {
          // Tenant context violation
          this.handleTenantViolation();
        }
        return Promise.reject(error);
      }
    );
  }

  private getTenantId(): string | null {
    // Get from localStorage (set by TenantContext)
    // Franchisor has tenant_id: null, is_franchisor: true
    const isFranchisor = localStorage.getItem('is_franchisor') === 'true';
    if (isFranchisor) {
      return null; // Franchisor has no tenant_id
    }
    return localStorage.getItem('tenant_id');
  }

  private getIsFranchisor(): boolean {
    return localStorage.getItem('is_franchisor') === 'true';
  }

  private getJwtToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleTenantViolation(): void {
    // Clear context and redirect to login
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    
    // Redirect to login (will be handled by router)
    window.location.href = '/login';
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

// Service base URLs (from docker-compose.yml and P2.1 UX flows)
const SERVICE_URLS = {
  booking: import.meta.env.VITE_BOOKING_SERVICE_URL || 'http://localhost:4110',
  pos: import.meta.env.VITE_POS_SERVICE_URL || 'http://localhost:4111',
  payments: import.meta.env.VITE_PAYMENTS_SERVICE_URL || 'http://localhost:4112',
  customer: import.meta.env.VITE_CUSTOMER_SERVICE_URL || 'http://localhost:4114',
  bi: import.meta.env.VITE_BI_SERVICE_URL || 'http://localhost:4115',
  staff: import.meta.env.VITE_STAFF_SERVICE_URL || 'http://localhost:4117',
};

// Create API client instances for each service
export const bookingApiClient = new ApiClient(SERVICE_URLS.booking);
export const posApiClient = new ApiClient(SERVICE_URLS.pos);
export const paymentsApiClient = new ApiClient(SERVICE_URLS.payments);
export const customerApiClient = new ApiClient(SERVICE_URLS.customer);
export const biApiClient = new ApiClient(SERVICE_URLS.bi);
export const staffApiClient = new ApiClient(SERVICE_URLS.staff);

// Default API client (for backward compatibility)
export const apiClient = bookingApiClient;


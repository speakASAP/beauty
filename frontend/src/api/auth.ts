import axios, { AxiosInstance } from 'axios';
import type { ApiResponse } from '../types/api';

/**
 * Auth API Client
 * 
 * Endpoints:
 * - POST /auth/login - Authenticate user
 * - POST /auth/logout - Logout user
 * - GET /auth/me - Get current user info
 * - GET /auth/tenants - Get user's available tenants
 * 
 * Note: Auth service endpoint from environment variable
 */
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:4100';

const authClient: AxiosInstance = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role: string;
  };
  tenant_id?: string | null;
  is_franchisor?: boolean;
  available_tenants?: Array<{
    id: string;
    name: string;
  }>;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  role: string;
  tenant_id?: string | null;
  is_franchisor?: boolean;
}

export const authApi = {
  /**
   * Login user
   * Returns JWT token with tenant context
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  /**
   * Logout user
   * Invalidates JWT token
   */
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      await authClient.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  },

  /**
   * Get current user info
   * Validates JWT token and returns user context
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token available');
    }

    const response = await authClient.get<ApiResponse<UserInfo>>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  /**
   * Get user's available tenants
   * Returns list of tenants user can access
   */
  getAvailableTenants: async (): Promise<Array<{ id: string; name: string }>> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token available');
    }

    const response = await authClient.get<ApiResponse<Array<{ id: string; name: string }>>>(
      '/auth/tenants',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Switch tenant
   * Gets new JWT token for selected tenant
   */
  switchTenant: async (tenantId: string): Promise<LoginResponse> => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token available');
    }

    const response = await authClient.post<ApiResponse<LoginResponse>>(
      '/auth/switch-tenant',
      { tenant_id: tenantId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },
};


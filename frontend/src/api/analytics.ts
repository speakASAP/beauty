import { biApiClient } from './client';
import type {
  DailySales,
  MasterUtilization,
  ClientLTV,
  ApiResponse,
} from '../types/api';

/**
 * Analytics API Client (BI Read Model)
 * 
 * Endpoints:
 * - GET /analytics/daily-sales - Get daily sales
 * - GET /analytics/master-utilization - Get master utilization
 * - GET /analytics/client-ltv - Get client LTV
 * - GET /analytics/appointment-aggregates - Get appointment aggregates
 * - GET /analytics/inventory-usage - Get inventory usage
 */
export const analyticsApi = {
  getDailySales: async (params?: {
    date?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<DailySales[]> => {
    const response = await biApiClient.get<ApiResponse<DailySales[]>>(
      '/analytics/daily-sales',
      { params }
    );
    return response.data.data;
  },

  getMasterUtilization: async (params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<MasterUtilization[]> => {
    const response = await biApiClient.get<ApiResponse<MasterUtilization[]>>(
      '/analytics/master-utilization',
      { params }
    );
    return response.data.data;
  },

  getClientLTV: async (params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<ClientLTV[]> => {
    const response = await biApiClient.get<ApiResponse<ClientLTV[]>>(
      '/analytics/client-ltv',
      { params }
    );
    return response.data.data;
  },
};


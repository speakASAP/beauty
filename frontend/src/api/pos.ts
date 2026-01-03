import { posApiClient } from './client';
import type {
  Visit,
  Order,
  CreateOrderRequest,
  ApiResponse,
} from '../types/api';

/**
 * POS API Client
 * 
 * Endpoints:
 * - POST /visits - Start visit
 * - POST /visits/:id/close - Close visit
 * - GET /visits - List visits
 * - POST /orders - Create order
 * - POST /orders/:id/close - Close order
 * - GET /orders - List orders
 */
export const posApi = {
  getVisits: async (params?: {
    status?: string;
    date?: string;
  }): Promise<Visit[]> => {
    const response = await posApiClient.get<ApiResponse<Visit[]>>('/visits', {
      params,
    });
    return response.data.data;
  },

  startVisit: async (data: {
    appointment_id?: string;
    client_id: string;
    master_id: string;
  }): Promise<Visit> => {
    const response = await posApiClient.post<ApiResponse<Visit>>('/visits', data);
    return response.data.data;
  },

  closeVisit: async (id: string): Promise<Visit> => {
    const response = await posApiClient.post<ApiResponse<Visit>>(
      `/visits/${id}/close`
    );
    return response.data.data;
  },

  getOrders: async (params?: {
    status?: string;
    date?: string;
    client_id?: string;
  }): Promise<Order[]> => {
    const response = await posApiClient.get<ApiResponse<Order[]>>('/orders', {
      params,
    });
    return response.data.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await posApiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  closeOrder: async (id: string): Promise<Order> => {
    const response = await posApiClient.post<ApiResponse<Order>>(
      `/orders/${id}/close`
    );
    return response.data.data;
  },
};


import { paymentsApiClient } from './client';
import type {
  Payment,
  InitiatePaymentRequest,
  ApiResponse,
} from '../types/api';

/**
 * Payments API Client
 * 
 * Endpoints:
 * - POST /payments - Initiate payment
 * - GET /payments/:id - Get payment status
 * - GET /payments - List payments
 */
export const paymentsApi = {
  getPayments: async (params?: {
    order_id?: string;
    status?: string;
    date?: string;
  }): Promise<Payment[]> => {
    const response = await paymentsApiClient.get<ApiResponse<Payment[]>>('/payments', {
      params,
    });
    return response.data.data;
  },

  getPayment: async (id: string): Promise<Payment> => {
    const response = await paymentsApiClient.get<ApiResponse<Payment>>(
      `/payments/${id}`
    );
    return response.data.data;
  },

  initiatePayment: async (
    data: InitiatePaymentRequest
  ): Promise<Payment> => {
    const response = await paymentsApiClient.post<ApiResponse<Payment>>(
      '/payments',
      data
    );
    return response.data.data;
  },
};


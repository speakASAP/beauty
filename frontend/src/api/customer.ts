import { customerApiClient } from './client';
import type {
  Client,
  RegisterClientRequest,
  ApiResponse,
} from '../types/api';

/**
 * Customer API Client
 * 
 * Endpoints:
 * - POST /clients - Register client
 * - GET /clients/:id - Get client
 * - GET /clients - List clients
 */
export const customerApi = {
  getClients: async (params?: {
    search?: string;
  }): Promise<Client[]> => {
    const response = await customerApiClient.get<ApiResponse<Client[]>>('/clients', {
      params,
    });
    return response.data.data;
  },

  getClient: async (id: string): Promise<Client> => {
    const response = await customerApiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  registerClient: async (data: RegisterClientRequest): Promise<Client> => {
    const response = await customerApiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data.data;
  },
};


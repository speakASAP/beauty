import { bookingApiClient } from './client';
import type {
  Appointment,
  BookAppointmentRequest,
  ApiResponse,
} from '../types/api';

/**
 * Booking API Client
 * 
 * Endpoints:
 * - GET /appointments - List appointments
 * - POST /appointments - Book appointment
 * - POST /appointments/:id/confirm - Confirm appointment
 * - POST /appointments/:id/start - Start appointment
 * - POST /appointments/:id/complete - Complete appointment
 * - POST /appointments/:id/cancel - Cancel appointment
 */
export const bookingApi = {
  getAppointments: async (params?: {
    date?: string;
    master_id?: string;
    status?: string;
  }): Promise<Appointment[]> => {
    const response = await bookingApiClient.get<ApiResponse<Appointment[]>>(
      '/appointments',
      { params }
    );
    return response.data.data;
  },

  bookAppointment: async (
    data: BookAppointmentRequest
  ): Promise<Appointment> => {
    const response = await bookingApiClient.post<ApiResponse<Appointment>>(
      '/appointments',
      data
    );
    return response.data.data;
  },

  confirmAppointment: async (
    id: string,
    confirmation_method?: string
  ): Promise<Appointment> => {
    const response = await bookingApiClient.post<ApiResponse<Appointment>>(
      `/appointments/${id}/confirm`,
      { confirmation_method }
    );
    return response.data.data;
  },

  startAppointment: async (id: string): Promise<Appointment> => {
    const response = await bookingApiClient.post<ApiResponse<Appointment>>(
      `/appointments/${id}/start`
    );
    return response.data.data;
  },

  completeAppointment: async (id: string): Promise<Appointment> => {
    const response = await bookingApiClient.post<ApiResponse<Appointment>>(
      `/appointments/${id}/complete`
    );
    return response.data.data;
  },

  cancelAppointment: async (id: string, reason?: string): Promise<Appointment> => {
    const response = await bookingApiClient.post<ApiResponse<Appointment>>(
      `/appointments/${id}/cancel`,
      { reason }
    );
    return response.data.data;
  },
};


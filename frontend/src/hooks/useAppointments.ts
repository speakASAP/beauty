import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api/booking';
import { useTenantContext } from '../contexts/TenantContext';
import type { Appointment, BookAppointmentRequest } from '../types/api';

/**
 * Hook for fetching appointments
 * 
 * Polls every 5 seconds for real-time updates (event-driven UX)
 */
export function useAppointments(params?: {
  date?: string;
  master_id?: string;
  status?: string;
}) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['appointments', tenantId, params],
    queryFn: () => bookingApi.getAppointments(params),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId, // Only fetch if tenant context exists
  });
}

/**
 * Hook for booking an appointment
 */
export function useBookAppointment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (data: BookAppointmentRequest) => bookingApi.bookAppointment(data),
    onSuccess: () => {
      // Invalidate appointments query to refetch (event will update backend)
      queryClient.invalidateQueries(['appointments', tenantId]);
    },
  });
}

/**
 * Hook for confirming an appointment
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: ({ id, confirmation_method }: { id: string; confirmation_method?: string }) =>
      bookingApi.confirmAppointment(id, confirmation_method),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments', tenantId]);
    },
  });
}

/**
 * Hook for starting an appointment
 */
export function useStartAppointment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (id: string) => bookingApi.startAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments', tenantId]);
    },
  });
}

/**
 * Hook for completing an appointment
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (id: string) => bookingApi.completeAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments', tenantId]);
    },
  });
}

/**
 * Hook for cancelling an appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingApi.cancelAppointment(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments', tenantId]);
    },
  });
}


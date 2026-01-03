import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments';
import { useTenantContext } from '../contexts/TenantContext';
import type { Payment, InitiatePaymentRequest } from '../types/api';

/**
 * Hook for fetching payments
 */
export function usePayments(params?: { order_id?: string; status?: string; date?: string }) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['payments', tenantId, params],
    queryFn: () => paymentsApi.getPayments(params),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId,
  });
}

/**
 * Hook for fetching a single payment
 */
export function usePayment(id: string) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['payment', tenantId, id],
    queryFn: () => paymentsApi.getPayment(id),
    refetchInterval: 2000, // Poll every 2 seconds for payment status
    enabled: !!tenantId && !!id,
  });
}

/**
 * Hook for initiating a payment
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (data: InitiatePaymentRequest) => paymentsApi.initiatePayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries(['payments', tenantId]);
      queryClient.invalidateQueries(['payment', tenantId, payment.id]);
    },
  });
}


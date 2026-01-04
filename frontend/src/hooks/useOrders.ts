import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi } from '../api/pos';
import { useTenantContext } from '../contexts/TenantContext';
import type { CreateOrderRequest } from '../types/api';

/**
 * Hook for fetching orders
 */
export function useOrders(params?: { status?: string; date?: string; client_id?: string }) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['orders', tenantId, params],
    queryFn: () => posApi.getOrders(params),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId,
  });
}

/**
 * Hook for creating an order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => posApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', tenantId] });
    },
  });
}

/**
 * Hook for closing an order
 */
export function useCloseOrder() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (id: string) => posApi.closeOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', tenantId] });
    },
  });
}


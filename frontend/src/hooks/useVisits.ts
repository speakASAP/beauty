import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi } from '../api/pos';
import { useTenantContext } from '../contexts/TenantContext';

/**
 * Hook for fetching visits
 */
export function useVisits(params?: { status?: string; date?: string }) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['visits', tenantId, params],
    queryFn: () => posApi.getVisits(params),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId,
  });
}

/**
 * Hook for starting a visit
 */
export function useStartVisit() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (data: { appointment_id?: string; client_id: string; master_id: string }) =>
      posApi.startVisit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', tenantId] });
    },
  });
}

/**
 * Hook for closing a visit
 */
export function useCloseVisit() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (id: string) => posApi.closeVisit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', tenantId] });
    },
  });
}


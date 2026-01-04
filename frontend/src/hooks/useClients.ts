import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customer';
import { useTenantContext } from '../contexts/TenantContext';
import type { RegisterClientRequest } from '../types/api';

/**
 * Hook for fetching clients
 */
export function useClients(params?: { search?: string }) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['clients', tenantId, params],
    queryFn: () => customerApi.getClients(params),
    enabled: !!tenantId,
  });
}

/**
 * Hook for fetching a single client
 */
export function useClient(id: string) {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['client', tenantId, id],
    queryFn: () => customerApi.getClient(id),
    enabled: !!tenantId && !!id,
  });
}

/**
 * Hook for registering a client
 */
export function useRegisterClient() {
  const queryClient = useQueryClient();
  const { tenantId } = useTenantContext();

  return useMutation({
    mutationFn: (data: RegisterClientRequest) => customerApi.registerClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', tenantId] });
    },
  });
}


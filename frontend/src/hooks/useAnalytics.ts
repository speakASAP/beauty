import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { useTenantContext } from '../contexts/TenantContext';
import type { DailySales, MasterUtilization, ClientLTV } from '../types/api';

/**
 * Hook for fetching daily sales
 */
export function useDailySales(params?: {
  date?: string;
  from_date?: string;
  to_date?: string;
}) {
  const { tenantId, isFranchisor } = useTenantContext();

  return useQuery({
    queryKey: ['daily-sales', tenantId, isFranchisor, params],
    queryFn: () => analyticsApi.getDailySales(params),
    enabled: !!tenantId || isFranchisor, // Franchisor can query without tenantId
  });
}

/**
 * Hook for fetching master utilization
 */
export function useMasterUtilization(params?: {
  from_date?: string;
  to_date?: string;
}) {
  const { tenantId, isFranchisor } = useTenantContext();

  return useQuery({
    queryKey: ['master-utilization', tenantId, isFranchisor, params],
    queryFn: () => analyticsApi.getMasterUtilization(params),
    enabled: !!tenantId || isFranchisor, // Franchisor can query without tenantId
  });
}

/**
 * Hook for fetching client LTV
 */
export function useClientLTV(params?: {
  from_date?: string;
  to_date?: string;
}) {
  const { tenantId, isFranchisor } = useTenantContext();

  return useQuery({
    queryKey: ['client-ltv', tenantId, isFranchisor, params],
    queryFn: () => analyticsApi.getClientLTV(params),
    enabled: !!tenantId || isFranchisor, // Franchisor can query without tenantId
  });
}


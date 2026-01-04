import { useState, useEffect } from 'react';
import { useTenantContext } from '../../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Tenant Selection Component
 * 
 * Allows user to select tenant if they have access to multiple tenants.
 * 
 * Rules:
 * - Explicit tenant selection (no implicit switching)
 * - Tenant context updated on selection
 * - All queries invalidated on switch
 * - Auth service is source of truth for available tenants
 */
interface Tenant {
  id: string;
  name: string;
}

export function TenantSelection() {
  const { switchTenant, role } = useTenantContext();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Load available tenants from auth service or localStorage
  useEffect(() => {
    const loadTenants = async () => {
      try {
        // Try to get from auth service first
        try {
          const availableTenants = await authApi.getAvailableTenants();
          setTenants(availableTenants);
        } catch {
          // Fallback to localStorage (set during login)
          const stored = localStorage.getItem('available_tenants');
          if (stored) {
            setTenants(JSON.parse(stored));
          } else {
            setError('No tenants available');
          }
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load tenants');
      } finally {
        setIsLoading(false);
      }
    };

    loadTenants();
  }, []);

  const handleSelectTenant = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setIsSwitching(true);
    setError(null);

    try {
      // Get new JWT token for selected tenant
      const response = await authApi.switchTenant(tenantId);

      // Update tenant context
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('tenant_id', tenantId);
      localStorage.setItem('is_franchisor', 'false');

      // Update context
      await switchTenant(tenantId);

      // Navigate to appropriate dashboard based on role
      if (role === 'franchisor') {
        navigate('/franchise/kpis');
      } else {
        navigate('/pos/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to switch tenant');
      setIsSwitching(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-section-mobile md:py-section-desktop">
      <div className="container max-w-md">
        <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight">
          <h1 className="text-center mb-2">Select Tenant</h1>
          <p className="text-center text-soft mb-8">
            You have access to multiple tenants. Please select one to continue.
          </p>

          {error && <ErrorAlert message={error} />}

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => handleSelectTenant(tenant.id)}
                  disabled={isSwitching}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedTenantId === tenant.id
                      ? 'border-accent bg-accent/10'
                      : 'border-borderLight hover:border-accent hover:bg-light'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-dark">{tenant.name}</div>
                      <div className="text-sm text-soft">ID: {tenant.id.substring(0, 8)}...</div>
                    </div>
                    {isSwitching && selectedTenantId === tenant.id && (
                      <span className="border-2 border-accent border-t-transparent rounded-full w-5 h-5 animate-spin" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && tenants.length === 0 && (
            <p className="text-center text-soft py-8">No tenants available</p>
          )}
        </div>
      </div>
    </div>
  );
}


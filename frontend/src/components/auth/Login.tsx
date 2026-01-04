import { useState, useEffect } from 'react';
import { useTenantContext } from '../../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

/**
 * Login Component
 * 
 * Handles user authentication.
 * 
 * Rules:
 * - Auth service is source of truth
 * - JWT token includes tenant_id
 * - Tenant context set after login
 */
export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { clearContext, switchTenant } = useTenantContext();
  const navigate = useNavigate();

  // Clear any existing context on mount
  useEffect(() => {
    clearContext();
  }, [clearContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call auth service to authenticate
      const response = await authApi.login({ username, password });

      // Store JWT token
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('user_id', response.user.id);
      localStorage.setItem('role', response.user.role);

      // Handle franchisor (tenant_id: null)
      if (response.is_franchisor) {
        localStorage.setItem('is_franchisor', 'true');
        localStorage.removeItem('tenant_id');
        // Navigate to franchise portal
        navigate('/franchise/kpis');
        return;
      }

      // Handle regular user with tenant
      if (response.tenant_id) {
        localStorage.setItem('tenant_id', response.tenant_id);
        localStorage.setItem('is_franchisor', 'false');
      }

      // Check if user has multiple tenants
      const hasMultipleTenants =
        response.available_tenants && response.available_tenants.length > 1;

      if (hasMultipleTenants) {
        // Store available tenants for selection
        localStorage.setItem(
          'available_tenants',
          JSON.stringify(response.available_tenants)
        );
        navigate('/select-tenant');
      } else {
        // Single tenant or tenant already selected
        if (response.tenant_id) {
          await switchTenant(response.tenant_id);
        }

        // Navigate to appropriate dashboard based on role
        if (response.user.role === 'franchisor') {
          navigate('/franchise/kpis');
        } else {
          navigate('/pos/dashboard');
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light py-section-mobile md:py-section-desktop">
      <div className="container max-w-md">
        <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight">
          <h1 className="text-center mb-2">Beauty Franchise Platform</h1>
          <p className="text-center text-soft mb-8">Login to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block mb-2 font-semibold text-dark">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 font-semibold text-dark">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-large w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="border-2 border-base border-t-transparent rounded-full w-6 h-6 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


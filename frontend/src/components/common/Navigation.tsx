import { Link, useLocation } from 'react-router-dom';
import { useTenantContext } from '../../contexts/TenantContext';
import { authApi } from '../../api/auth';

/**
 * Navigation Component
 * 
 * Main navigation bar with tenant context display.
 * 
 * Rules:
 * - Shows tenant context explicitly
 * - Role-based menu items
 * - Logout clears tenant context
 */
export function Navigation() {
  const location = useLocation();
  const { tenantId, role, isFranchisor, clearContext } = useTenantContext();

  const handleLogout = async () => {
    try {
      // Call auth service to logout
      await authApi.logout();
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', err);
    } finally {
      clearContext();
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-dark text-base sticky top-0 z-50 shadow-md">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-heading font-semibold">Beauty Franchise Platform</h1>

          {(tenantId || isFranchisor) && (
            <div className="flex gap-4 items-center flex-wrap">
              {isFranchisor ? (
                <span className="px-3 py-1 bg-accent text-base rounded-button text-sm font-semibold">
                  Franchisor
                </span>
              ) : tenantId ? (
                <span className="text-sm min-w-[100px]">
                  Tenant: {tenantId.substring(0, 8)}...
                </span>
              ) : null}

              {role && (
                <span className="px-3 py-1 border-2 border-accent text-base rounded-button text-sm font-semibold">
                  {role}
                </span>
              )}

              {/* POS Menu (for non-franchisor or franchisor with tenant context) */}
              {!isFranchisor && (
                <>
                  <Link
                    to="/pos/dashboard"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/pos/dashboard')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Calendar
                  </Link>

                  <Link
                    to="/pos/visits"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/pos/visits')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Visits
                  </Link>

                  <Link
                    to="/pos/shift-close"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/pos/shift-close')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Shift Close
                  </Link>
                </>
              )}

              {/* Franchise Portal Menu (franchisor only) */}
              {isFranchisor && (
                <>
                  <Link
                    to="/franchise/tenants"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/franchise/tenants')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Tenants
                  </Link>
                  <Link
                    to="/franchise/kpis"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/franchise/kpis')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    KPIs
                  </Link>
                  <Link
                    to="/franchise/pricing"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/franchise/pricing')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/franchise/catalog"
                    className={`px-4 py-2 rounded-button transition-colors ${
                      isActive('/franchise/catalog')
                        ? 'bg-accent text-base'
                        : 'text-base hover:bg-accent/20'
                    }`}
                  >
                    Catalog
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-button text-base hover:bg-accent/20 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


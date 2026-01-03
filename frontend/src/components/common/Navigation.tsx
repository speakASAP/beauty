import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
} from '@mui/material';
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

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Beauty Franchise Platform
          </Typography>

          {(tenantId || isFranchisor) && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {isFranchisor ? (
                <Chip label="Franchisor" color="primary" size="small" />
              ) : tenantId ? (
                <Typography variant="body2" sx={{ minWidth: 100 }}>
                  Tenant: {tenantId.substring(0, 8)}...
                </Typography>
              ) : null}

              {role && (
                <Chip label={role} size="small" variant="outlined" />
              )}

              {/* POS Menu (for non-franchisor or franchisor with tenant context) */}
              {!isFranchisor && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/pos/dashboard"
                    variant={location.pathname === '/pos/dashboard' ? 'outlined' : 'text'}
                  >
                    Calendar
                  </Button>

                  <Button
                    color="inherit"
                    component={Link}
                    to="/pos/visits"
                    variant={location.pathname === '/pos/visits' ? 'outlined' : 'text'}
                  >
                    Visits
                  </Button>

                  <Button
                    color="inherit"
                    component={Link}
                    to="/pos/shift-close"
                    variant={location.pathname === '/pos/shift-close' ? 'outlined' : 'text'}
                  >
                    Shift Close
                  </Button>
                </>
              )}

              {/* Franchise Portal Menu (franchisor only) */}
              {isFranchisor && (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/franchise/tenants"
                    variant={location.pathname.startsWith('/franchise/tenants') ? 'outlined' : 'text'}
                  >
                    Tenants
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/franchise/kpis"
                    variant={location.pathname.startsWith('/franchise/kpis') ? 'outlined' : 'text'}
                  >
                    KPIs
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/franchise/pricing"
                    variant={location.pathname.startsWith('/franchise/pricing') ? 'outlined' : 'text'}
                  >
                    Pricing
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/franchise/catalog"
                    variant={location.pathname.startsWith('/franchise/catalog') ? 'outlined' : 'text'}
                  >
                    Catalog
                  </Button>
                </>
              )}

              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}


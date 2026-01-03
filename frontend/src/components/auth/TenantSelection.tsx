import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useTenantContext } from '../../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { LoadingSpinner } from '../common/LoadingSpinner';

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
        } catch (err) {
          // Fallback to localStorage (set during login)
          const stored = localStorage.getItem('available_tenants');
          if (stored) {
            setTenants(JSON.parse(stored));
          } else {
            setError('No tenants available');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tenants');
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
    } catch (err: any) {
      setError(err.message || 'Failed to switch tenant');
      setIsSwitching(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" gutterBottom align="center">
            Select Tenant
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={3}>
            You have access to multiple tenants. Please select one to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <List>
              {tenants.map((tenant) => (
                <ListItem key={tenant.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectTenant(tenant.id)}
                    selected={selectedTenantId === tenant.id}
                    disabled={isSwitching}
                  >
                    <ListItemText
                      primary={tenant.name}
                      secondary={`ID: ${tenant.id.substring(0, 8)}...`}
                    />
                    {isSwitching && selectedTenantId === tenant.id && (
                      <CircularProgress size={20} sx={{ ml: 2 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          {!isLoading && tenants.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center" py={4}>
              No tenants available
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}


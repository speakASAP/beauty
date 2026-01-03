import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
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
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
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
            Beauty Franchise Platform
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={3}>
            Login to continue
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}


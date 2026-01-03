import { Container, Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTenantContext } from '../../contexts/TenantContext';

/**
 * Unauthorized Component
 * 
 * Displays unauthorized access message when user tries to access
 * a route they don't have permission for.
 * 
 * Rules:
 * - Shows role-based error message
 * - Provides navigation back to allowed routes
 */
export function Unauthorized() {
  const navigate = useNavigate();
  const { role, isFranchisor } = useTenantContext();

  const handleGoBack = () => {
    if (isFranchisor) {
      navigate('/franchise/kpis');
    } else {
      navigate('/pos/dashboard');
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
        <Paper sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="error">
            Unauthorized Access
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have permission to access this resource.
          </Typography>
          {role && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your role: <strong>{role}</strong>
            </Typography>
          )}
          <Button variant="contained" onClick={handleGoBack}>
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Public Landing Page Component
 * 
 * First page visitors see. Allows tenant (salon) selection.
 * 
 * Rules:
 * - No authentication required
 * - Tenant selection explicit
 * - Navigate to booking after tenant selection
 */
export function LandingPage() {
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStartBooking = () => {
    if (!tenantId || !tenantId.trim()) {
      setError('Please enter a salon ID');
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId.trim())) {
      setError('Invalid salon ID format');
      return;
    }

    // Store tenant_id for public booking flow
    localStorage.setItem('public_tenant_id', tenantId.trim());

    // Navigate to booking page with tenant_id
    navigate(`/booking?tenant_id=${tenantId.trim()}`);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Beauty Franchise Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom align="center" sx={{ mb: 4 }}>
          Book your appointment online
        </Typography>

        <Card sx={{ maxWidth: 600, width: '100%', p: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Your Salon
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your salon ID to continue with online booking
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Salon ID"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  setError('');
                }}
                placeholder="Enter salon UUID"
                error={!!error}
                helperText={error || 'Enter the unique identifier for your salon'}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleStartBooking}
              disabled={!tenantId.trim()}
            >
              Start Booking
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact your salon directly.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}


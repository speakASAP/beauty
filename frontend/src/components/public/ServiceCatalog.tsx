import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '../../api/public';
import type { PublicService } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Service Catalog Component (Public View)
 * 
 * Displays available services for booking.
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - User selects service to proceed to booking
 */
export function ServiceCatalog() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const [services, setServices] = useState<PublicService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setError('Salon ID is required');
      setIsLoading(false);
      return;
    }

    const loadServices = async () => {
      try {
        const servicesData = await publicApi.getServices(tenantId);
        setServices(servicesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [tenantId]);

  const handleSelectService = (serviceId: string) => {
    // Navigate to availability checker with service selected
    window.location.href = `/booking/availability?tenant_id=${tenantId}&service_id=${serviceId}`;
  };

  if (!tenantId) {
    return (
      <Alert severity="error">
        Salon ID is required. Please go back to the landing page.
      </Alert>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Select a Service
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the service you'd like to book
      </Typography>

      {services.length === 0 ? (
        <Alert severity="info">
          No services available. Please contact the salon directly.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>
                  {service.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {service.description}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Duration: {service.duration_minutes} minutes
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {(service.price / 100).toFixed(2)} CZK
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleSelectService(service.id)}
                  >
                    Book This Service
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}


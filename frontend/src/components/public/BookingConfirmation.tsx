import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBooking } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { CheckCircle } from '@mui/icons-material';

/**
 * Booking Confirmation Component
 * 
 * Shows booking confirmation after successful booking.
 * 
 * Rules:
 * - No authentication required
 * - Accessible via confirmation token
 * - Shows booking details and management options
 */
export function BookingConfirmation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Confirmation token is required');
      setIsLoading(false);
      return;
    }

    const loadBooking = async () => {
      try {
        const bookingData = await publicApi.getBookingByToken(token);
        setBooking(bookingData);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [token]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !booking) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">
            {error || 'Booking not found'}
          </Alert>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your appointment has been successfully booked
          </Typography>

          <Card sx={{ mb: 3, textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Client Name
                  </Typography>
                  <Typography variant="body1">{booking.client_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Service
                  </Typography>
                  <Typography variant="body1">{booking.service_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(booking.starts_at), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">{booking.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Confirmation Token
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {booking.confirmation_token}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Alert severity="success" sx={{ mb: 3 }}>
            A confirmation SMS/Email has been sent to your contact information.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/booking/manage/${booking.confirmation_token}`)}
            >
              Manage Booking
            </Button>
            <Button variant="contained" onClick={() => navigate('/')}>
              Book Another Appointment
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}


import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBooking } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Booking Management Component
 * 
 * Allows clients to view, cancel, or reschedule bookings via token.
 * 
 * Rules:
 * - No authentication required
 * - Accessible via confirmation token
 * - Can cancel booking
 * - Can view booking details
 */
export function BookingManagement() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadBooking = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const bookingData = await publicApi.getBookingByToken(token);
      setBooking(bookingData);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Confirmation token is required');
      setIsLoading(false);
      return;
    }

    loadBooking();
  }, [token, loadBooking]);

  const handleCancel = async () => {
    if (!token) return;

    setIsCancelling(true);
    try {
      await publicApi.cancelBookingByToken(token, cancelReason || undefined);
      setCancelDialogOpen(false);
      // Reload booking to show updated status
      await loadBooking();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

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

  const isCancelled = booking.status === 'cancelled';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Manage Your Booking
          </Typography>

          <Card sx={{ mb: 3, mt: 3 }}>
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
              </Grid>
            </CardContent>
          </Card>

          {isCancelled ? (
            <Alert severity="warning">
              This booking has been cancelled.
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Booking
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Book Another Appointment
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking?
          </Typography>
          <TextField
            fullWidth
            label="Cancellation Reason (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Booking</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}


import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBookingRequest } from '../../api/public';

/**
 * Public Booking Form Component
 * 
 * Allows clients to book appointments online (no authentication).
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - Creates client and appointment
 * - GDPR consent required
 */
export function BookingForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const serviceId = searchParams.get('service_id') || '';
  const masterId = searchParams.get('master_id') || '';
  const startsAt = searchParams.get('starts_at') || '';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    gdpr_consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      setError('First name, last name, and phone are required');
      return;
    }

    if (!formData.gdpr_consent) {
      setError('GDPR consent is required');
      return;
    }

    if (!tenantId || !serviceId || !masterId || !startsAt) {
      setError('Missing booking information. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse duration from service (would come from service data)
      // For MVP, assume 60 minutes default
      const durationMinutes = 60;

      const bookingRequest: PublicBookingRequest = {
        tenant_id: tenantId,
        client_first_name: formData.first_name,
        client_last_name: formData.last_name,
        client_phone: formData.phone,
        client_email: formData.email || undefined,
        master_id: masterId,
        service_id: serviceId,
        starts_at: startsAt,
        duration_minutes: durationMinutes,
        gdpr_consent: formData.gdpr_consent,
      };

      const booking = await publicApi.createBooking(tenantId, bookingRequest);

      // Navigate to confirmation page
      navigate(`/booking/confirm/${booking.confirmation_token}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tenantId || !serviceId || !masterId || !startsAt) {
    return (
      <Alert severity="error">
        Missing required booking information. Please go back and select a time slot.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Complete Your Booking
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please provide your contact information
      </Typography>

      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Appointment Details:</strong>
        </Typography>
        <Typography variant="body2">
          Date & Time: {format(new Date(startsAt), 'PPpp')}
        </Typography>
        <Typography variant="body2">
          Master ID: {masterId.substring(0, 8)}...
        </Typography>
        <Typography variant="body2">
          Service ID: {serviceId.substring(0, 8)}...
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              type="tel"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email (Optional)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.gdpr_consent}
                  onChange={(e) => setFormData({ ...formData, gdpr_consent: e.target.checked })}
                  required
                />
              }
              label="I consent to the processing of my personal data (GDPR)"
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Confirm Booking'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}


import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { useBookAppointment } from '../../hooks/useAppointments';
import { useClients } from '../../hooks/useClients';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

/**
 * Book Appointment Form Component
 * 
 * Books a new appointment.
 * 
 * Rules:
 * - Only sends command (no business logic)
 * - Client selection from existing clients
 * - Tenant context implicit
 */
export function BookAppointmentForm() {
  const [clientId, setClientId] = useState('');
  const [masterId, setMasterId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState('');

  const { data: clients, isLoading: clientsLoading } = useClients();
  const bookAppointment = useBookAppointment();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId || !masterId || !serviceId || !startsAt) {
      setError('All fields are required');
      return;
    }

    try {
      await bookAppointment.mutateAsync({
        client_id: clientId,
        master_id: masterId,
        service_id: serviceId,
        starts_at: startsAt,
        duration_minutes: durationMinutes,
      });

      // Navigate to calendar
      navigate('/pos/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to book appointment');
    }
  };

  if (clientsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Book Appointment
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              {clients?.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                  {client.phone && ` - ${client.phone}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Master ID"
              value={masterId}
              onChange={(e) => setMasterId(e.target.value)}
              required
              placeholder="Enter master UUID"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service ID"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              required
              placeholder="Enter service UUID"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              inputProps={{ min: 15, max: 480, step: 15 }}
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
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={bookAppointment.isPending}
              >
                {bookAppointment.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}


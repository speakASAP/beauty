import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useAppointments, useBookAppointment } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import type { Appointment } from '../../types/api';

/**
 * Appointment Calendar Component
 * 
 * Displays appointments in a calendar view.
 * 
 * Rules:
 * - Only displays appointments for current tenant
 * - Polls every 5 seconds for updates (event-driven)
 * - No business logic (just renders data)
 */
export function AppointmentCalendar() {
  const [selectedDate] = useState(new Date());
  const { data: appointments, isLoading, error } = useAppointments({
    date: format(selectedDate, 'yyyy-MM-dd'),
  });
  useBookAppointment(); // Placeholder for future booking functionality

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load appointments" />;
  }

  const handleBookAppointment = () => {
    window.location.href = '/pos/book-appointment';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Appointments</Typography>
        <Button variant="contained" onClick={handleBookAppointment}>
          Book Appointment
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" mb={2}>
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </Typography>

      <Grid container spacing={2}>
        {appointments?.map((appointment: Appointment) => (
          <Grid item xs={12} sm={6} md={4} key={appointment.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {format(new Date(appointment.starts_at), 'HH:mm')} -{' '}
                  {format(new Date(appointment.ends_at), 'HH:mm')}
                </Typography>
                <Chip
                  label={appointment.status}
                  color={
                    appointment.status === 'completed'
                      ? 'success'
                      : appointment.status === 'cancelled'
                      ? 'error'
                      : 'primary'
                  }
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Client ID: {appointment.client_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Master ID: {appointment.master_id}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {appointments?.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No appointments for this date
        </Typography>
      )}
    </Paper>
  );
}


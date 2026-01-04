import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { AvailabilitySlot } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Availability Checker Component
 * 
 * Shows available time slots for selected service.
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - User selects time slot to proceed to booking form
 */
export function AvailabilityChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const serviceId = searchParams.get('service_id') || '';
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [masterId, setMasterId] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || !serviceId) {
      setError('Salon ID and Service ID are required');
      return;
    }

    loadAvailability();
  }, [tenantId, serviceId, selectedDate, masterId]);

  const loadAvailability = async () => {
    if (!tenantId || !serviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const availability = await publicApi.checkAvailability(tenantId, {
        service_id: serviceId,
        master_id: masterId || undefined,
        date: selectedDate,
      });
      setSlots(availability);
    } catch (err: any) {
      setError(err.message || 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    if (!slot.available) return;

    // Navigate to booking form with selected slot
    navigate(
      `/booking/form?tenant_id=${tenantId}&service_id=${serviceId}&master_id=${slot.master_id}&starts_at=${slot.starts_at}`
    );
  };

  if (!tenantId || !serviceId) {
    return (
      <Alert severity="error">
        Missing required information. Please go back and select a service.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Select Date & Time
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose when you'd like your appointment
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Select Master (Optional)"
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
          >
            <MenuItem value="">Any Master</MenuItem>
            {/* Masters would come from API - placeholder for now */}
          </TextField>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={2}>
          {slots.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info">
                No available slots for this date. Please try another date.
              </Alert>
            </Grid>
          ) : (
            slots.map((slot, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card
                  sx={{
                    cursor: slot.available ? 'pointer' : 'not-allowed',
                    opacity: slot.available ? 1 : 0.5,
                  }}
                  onClick={() => handleSelectSlot(slot)}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {format(new Date(slot.starts_at), 'HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {slot.master_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Chip
                        label={slot.available ? 'Available' : 'Unavailable'}
                        color={slot.available ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}


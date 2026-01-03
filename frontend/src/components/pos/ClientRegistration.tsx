import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Alert,
} from '@mui/material';
import { useRegisterClient } from '../../hooks/useClients';
import { useNavigate } from 'react-router-dom';

/**
 * Client Registration Component
 * 
 * Registers a new client.
 * 
 * Rules:
 * - Only sends command (no business logic)
 * - GDPR consent required
 * - Tenant context implicit
 */
export function ClientRegistration() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState('');

  const registerClient = useRegisterClient();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gdprConsent) {
      setError('GDPR consent is required');
      return;
    }

    try {
      await registerClient.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        email: email || undefined,
        gdpr_consent: gdprConsent,
      });

      // Navigate back or show success
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to register client');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Register New Client
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  required
                />
              }
              label="I consent to the processing of personal data (GDPR)"
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
                disabled={registerClient.isPending}
              >
                {registerClient.isPending ? 'Registering...' : 'Register Client'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}


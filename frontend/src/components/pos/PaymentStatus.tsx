import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import { usePayment } from '../../hooks/usePayments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Payment Status Component
 * 
 * Displays payment status and polls for updates.
 * 
 * Rules:
 * - Polls every 2 seconds for payment status
 * - Only displays payment for current tenant
 * - Event-driven (reacts to payment events)
 */
export function PaymentStatus() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { data: payment, isLoading, error } = usePayment(paymentId || '');
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !payment) {
    return <ErrorAlert message="Payment not found" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Payment Status</Typography>
        <Chip
          label={payment.status}
          color={getStatusColor(payment.status) as any}
        />
      </Box>

      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          Payment ID
        </Typography>
        <Typography variant="body1" gutterBottom>
          {payment.id}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Order ID
        </Typography>
        <Typography variant="body1" gutterBottom>
          {payment.order_id}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Amount
        </Typography>
        <Typography variant="h6" gutterBottom>
          {(payment.amount / 100).toFixed(2)} CZK
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Payment Method
        </Typography>
        <Typography variant="body1" gutterBottom>
          {payment.method}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Created At
        </Typography>
        <Typography variant="body1" gutterBottom>
          {format(new Date(payment.created_at), 'PPpp')}
        </Typography>

        {payment.captured_at && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Captured At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(payment.captured_at), 'PPpp')}
            </Typography>
          </>
        )}
      </Box>

      {payment.status === 'pending' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Payment is being processed. This page will update automatically.
        </Alert>
      )}

      {payment.status === 'completed' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment completed successfully!
        </Alert>
      )}

      {payment.status === 'failed' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Payment failed. Please try again.
        </Alert>
      )}

      <Box display="flex" gap={2}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        {payment.status === 'completed' && (
          <Button
            variant="contained"
            onClick={() => navigate('/pos/orders/' + payment.order_id)}
          >
            View Order
          </Button>
        )}
      </Box>
    </Paper>
  );
}


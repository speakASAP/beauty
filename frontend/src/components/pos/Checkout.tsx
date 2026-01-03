import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import { useOrders, useCloseOrder } from '../../hooks/useOrders';
import { useInitiatePayment } from '../../hooks/usePayments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import type { Order } from '../../types/api';

/**
 * Checkout Component
 * 
 * Handles order checkout and payment processing.
 * 
 * Rules:
 * - Only processes orders for current tenant
 * - No payment logic (just sends commands)
 * - Reacts to payment events (polling)
 */
export function Checkout({ orderId: orderIdProp }: { orderId?: string }) {
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const orderId = orderIdProp || orderIdParam || '';
  const { data: orders } = useOrders();
  const order = orders?.find((o: Order) => o.id === orderId);
  const closeOrder = useCloseOrder();
  const initiatePayment = useInitiatePayment();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'online' | 'bank_transfer'>('card');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return <ErrorAlert message="Order not found" />;
  }

  const handleProcessPayment = () => {
    if (!order) return;

    // Initiate payment
    initiatePayment.mutate(
      {
        order_id: order.id,
        amount: order.total_amount,
        method: paymentMethod,
      },
      {
        onSuccess: (payment) => {
          // Navigate to payment status page
          navigate(`/pos/payments/${payment.id}`);
        },
      }
    );
  };

  const handleCloseOrder = () => {
    if (!order) return;
    closeOrder.mutate(order.id);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Checkout
      </Typography>

      <Box mb={3}>
        <Typography variant="body1" gutterBottom>
          Order ID: {order.id.substring(0, 8)}...
        </Typography>
        <Typography variant="body1" gutterBottom>
          Total Amount: {order.total_amount / 100} CZK
        </Typography>
        <Typography variant="body1" gutterBottom>
          VAT: {order.vat_amount / 100} CZK
        </Typography>
        <Typography variant="body1" gutterBottom>
          Status: {order.status}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box mb={3}>
        <TextField
          select
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value as 'card' | 'cash' | 'online' | 'bank_transfer'
            )
          }
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="card">Card</MenuItem>
          <MenuItem value="cash">Cash</MenuItem>
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleProcessPayment}
            disabled={initiatePayment.isPending || order.status === 'closed'}
          >
            {initiatePayment.isPending ? 'Processing...' : 'Process Payment'}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleCloseOrder}
            disabled={closeOrder.isPending || order.status === 'closed'}
          >
            {closeOrder.isPending ? 'Closing...' : 'Close Order'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}


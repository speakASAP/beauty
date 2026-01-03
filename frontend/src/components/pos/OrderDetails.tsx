import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { useOrders } from '../../hooks/useOrders';
import { useCloseOrder } from '../../hooks/useOrders';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Order Details Component
 * 
 * Displays order details and allows closing order.
 * 
 * Rules:
 * - Only displays order for current tenant
 * - Sends command to close order (no business logic)
 */
export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: orders, isLoading } = useOrders();
  const closeOrder = useCloseOrder();
  const navigate = useNavigate();

  const order = orders?.find((o) => o.id === orderId);

  const handleCloseOrder = () => {
    if (!order) return;
    closeOrder.mutate(order.id, {
      onSuccess: () => {
        navigate('/pos/orders');
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return <ErrorAlert message="Order not found" />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Order Details</Typography>
        <Chip
          label={order.status}
          color={order.status === 'closed' ? 'success' : 'primary'}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="body2" color="text.secondary">
            Order ID
          </Typography>
          <Typography variant="body1" gutterBottom>
            {order.id}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Client ID
          </Typography>
          <Typography variant="body1" gutterBottom>
            {order.client_id}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Created At
          </Typography>
          <Typography variant="body1" gutterBottom>
            {format(new Date(order.created_at), 'PPpp')}
          </Typography>

          {order.closed_at && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Closed At
              </Typography>
              <Typography variant="body1" gutterBottom>
                {format(new Date(order.closed_at), 'PPpp')}
              </Typography>
            </>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">
                {((order.total_amount - order.vat_amount) / 100).toFixed(2)} CZK
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">VAT:</Typography>
              <Typography variant="body2">
                {(order.vat_amount / 100).toFixed(2)} CZK
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">
                {(order.total_amount / 100).toFixed(2)} CZK
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleCloseOrder}
          disabled={closeOrder.isPending || order.status === 'closed'}
        >
          {closeOrder.isPending ? 'Closing...' : 'Close Order'}
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={() => navigate('/pos/checkout/' + order.id)}
        >
          Go to Checkout
        </Button>
      </Box>
    </Paper>
  );
}


import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useOrders } from '../../hooks/useOrders';
import { usePayments } from '../../hooks/usePayments';
import { useDailySales } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { format } from 'date-fns';

/**
 * Shift Close Dashboard Component
 * 
 * Displays daily summary for shift close.
 * 
 * Rules:
 * - Only shows data for current tenant
 * - Read-only view (no commands)
 * - Uses BI read model for aggregates
 */
export function ShiftCloseDashboard() {
  const [selectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: orders, isLoading: ordersLoading } = useOrders({
    date: dateStr,
  });
  const { data: payments, isLoading: paymentsLoading } = usePayments({
    date: dateStr,
  });
  const { data: dailySales, isLoading: salesLoading } = useDailySales({
    date: dateStr,
  });

  const isLoading = ordersLoading || paymentsLoading || salesLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalOrders = orders?.length || 0;
  const totalPayments = payments?.length || 0;
  const totalAmount = dailySales?.[0]?.total_amount || 0;
  const totalVat = dailySales?.[0]?.vat_amount || 0;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Shift Close - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
                <Typography variant="h4">{totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Payments
                </Typography>
                <Typography variant="h4">{totalPayments}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {(totalAmount / 100).toFixed(2)} CZK
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total VAT
                </Typography>
                <Typography variant="h4">
                  {(totalVat / 100).toFixed(2)} CZK
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders?.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {(order.total_amount / 100).toFixed(2)} CZK
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Payments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments?.slice(0, 10).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {(payment.amount / 100).toFixed(2)} CZK
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" size="large">
          Close Shift
        </Button>
      </Box>
    </Box>
  );
}


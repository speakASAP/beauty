import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useDailySales } from '../../hooks/useAnalytics';
import { useMasterUtilization } from '../../hooks/useAnalytics';
import { useClientLTV } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format, subDays } from 'date-fns';

/**
 * KPI Dashboard Component
 * 
 * Displays performance metrics across tenants.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Uses BI read model only
 * - No direct tenant data access
 */
export function KPIDashboard() {
  const [dateRange, setDateRange] = useState({
    from_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: dailySales, isLoading: salesLoading } = useDailySales({
    from_date: dateRange.from_date,
    to_date: dateRange.to_date,
  });
  const { data: masterUtilization, isLoading: utilizationLoading } =
    useMasterUtilization({
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
    });
  const { data: clientLTV, isLoading: ltvLoading } = useClientLTV({
    from_date: dateRange.from_date,
    to_date: dateRange.to_date,
  });

  const isLoading = salesLoading || utilizationLoading || ltvLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalRevenue =
    dailySales?.reduce((sum, day) => sum + day.total_amount, 0) || 0;
  const totalOrders = dailySales?.reduce((sum, day) => sum + day.order_count, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">KPI Dashboard</Typography>
          <Box display="flex" gap={2}>
            <TextField
              type="date"
              label="From Date"
              value={dateRange.from_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, from_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="To Date"
              value={dateRange.to_date}
              onChange={(e) =>
                setDateRange({ ...dateRange, to_date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {(totalRevenue / 100).toFixed(2)} CZK
                </Typography>
              </CardContent>
            </Card>
          </Grid>

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
                  Avg Order Value
                </Typography>
                <Typography variant="h4">
                  {(avgOrderValue / 100).toFixed(2)} CZK
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Active Tenants
                </Typography>
                <Typography variant="h4">
                  {new Set(dailySales?.map((d) => d.tenant_id)).size || 0}
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
              Master Utilization
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Master</TableCell>
                    <TableCell align="right">Booked Hours</TableCell>
                    <TableCell align="right">Total Hours</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {masterUtilization?.slice(0, 10).map((master) => (
                    <TableRow key={master.master_id}>
                      <TableCell>{master.master_name}</TableCell>
                      <TableCell align="right">{master.booked_hours}</TableCell>
                      <TableCell align="right">{master.total_hours}</TableCell>
                      <TableCell align="right">
                        {(master.utilization_rate * 100).toFixed(1)}%
                      </TableCell>
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
              Top Clients (LTV)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell align="right">Visits</TableCell>
                    <TableCell align="right">Avg Visit Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientLTV?.slice(0, 10).map((client) => (
                    <TableRow key={client.client_id}>
                      <TableCell>{client.client_name}</TableCell>
                      <TableCell align="right">
                        {(client.total_spent / 100).toFixed(2)} CZK
                      </TableCell>
                      <TableCell align="right">{client.visit_count}</TableCell>
                      <TableCell align="right">
                        {(client.average_visit_value / 100).toFixed(2)} CZK
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}


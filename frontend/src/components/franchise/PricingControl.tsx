import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Pricing Control Component
 * 
 * Manages pricing for services and products.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Global pricing and tenant-specific overrides
 * - No business logic (just sends commands)
 */
interface Service {
  id: string;
  name: string;
  base_price: number;
  vat_rate: number;
}

export function PricingControl() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const isLoading = false;
  const error = null;

  const handleEditPrice = (service: Service) => {
    setSelectedService(service);
    setPrice(service.base_price);
    setEditDialogOpen(true);
  };

  const handleSavePrice = () => {
    if (!selectedService) return;
    // In real implementation, would call API to update pricing
    setEditDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load pricing" />;
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Pricing Control</Typography>
          <Button variant="contained">Add Service</Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service Name</TableCell>
                <TableCell align="right">Base Price</TableCell>
                <TableCell align="right">VAT Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell align="right">
                    {(service.base_price / 100).toFixed(2)} CZK
                  </TableCell>
                  <TableCell align="right">
                    {(service.vat_rate * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditPrice(service)}
                    >
                      Edit Price
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {services.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No services available
          </Typography>
        )}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Price</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                value={selectedService?.name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price (CZK)"
                type="number"
                value={price / 100}
                onChange={(e) => setPrice(Number(e.target.value) * 100)}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrice}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


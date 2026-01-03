import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Catalog Governance Component
 * 
 * Manages service and product catalog.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Global catalog management
 * - No business logic (just sends commands)
 */
interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  vat_rate: number;
  created_at: string;
}

export function CatalogGovernance() {
  const [tabValue, setTabValue] = useState(0);
  const [services, setServices] = useState<CatalogItem[]>([]);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    vat_rate: 0.21,
  });
  const isLoading = false;
  const error = null;

  const handleAddItem = () => {
    setFormData({ name: '', price: 0, vat_rate: 0.21 });
    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    // In real implementation, would call API to create item
    setDialogOpen(false);
  };

  const currentItems = tabValue === 0 ? services : products;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load catalog" />;
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Catalog Governance</Typography>
          <Button variant="contained" onClick={handleAddItem}>
            Add {tabValue === 0 ? 'Service' : 'Product'}
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Services" />
          <Tab label="Products" />
        </Tabs>

        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">VAT Rate</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">
                    {(item.price / 100).toFixed(2)} CZK
                  </TableCell>
                  <TableCell align="right">
                    {(item.vat_rate * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {currentItems.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No {tabValue === 0 ? 'services' : 'products'} available
          </Typography>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          Add {tabValue === 0 ? 'Service' : 'Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (CZK)"
                type="number"
                value={formData.price / 100}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) * 100 })
                }
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="VAT Rate (%)"
                type="number"
                value={formData.vat_rate * 100}
                onChange={(e) =>
                  setFormData({ ...formData, vat_rate: Number(e.target.value) / 100 })
                }
                inputProps={{ min: 0, max: 100, step: 1 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveItem}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


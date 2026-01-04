import { useState } from 'react';
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
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';

/**
 * Tenant Overview Component
 * 
 * Displays all tenants for franchisor view.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Read-only view (except allowed commands)
 * - Tenant context explicit
 * 
 * Note: Tenant list API not yet implemented in Phase 1.
 * This component is ready for API integration when platform-service is available.
 * For MVP, franchisor can access tenant data via direct database queries with franchisor context.
 */
interface Tenant {
  id: string;
  name: string;
  state: 'CREATING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  created_at: string;
}

export function TenantOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  // In real implementation, would fetch from API
  const [tenants] = useState<Tenant[]>([]);
  const isLoading = false;
  const error = null;

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'warning';
      case 'ARCHIVED':
        return 'default';
      case 'CREATING':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load tenants" />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Tenant Overview</Typography>
        <Button variant="contained">Add Tenant</Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search tenants..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.id.substring(0, 8)}...</TableCell>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>
                  <Chip
                    label={tenant.state}
                    color={getStateColor(tenant.state) as 'success' | 'warning' | 'default' | 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(tenant.created_at), 'PP')}
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTenants.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {searchTerm ? 'No tenants found' : 'No tenants available'}
        </Typography>
      )}
    </Paper>
  );
}


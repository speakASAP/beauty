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
  Chip,
} from '@mui/material';
import { useVisits, useStartVisit, useCloseVisit } from '../../hooks/useVisits';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import type { Visit } from '../../types/api';

/**
 * Visit Management Component
 * 
 * Displays and manages visits (open and closed).
 * 
 * Rules:
 * - Only displays visits for current tenant
 * - Polls every 5 seconds for updates
 * - No business logic (just sends commands)
 */
export function VisitManagement() {
  const { data: visits, isLoading, error } = useVisits({ status: 'open' });
  useStartVisit(); // Placeholder for future functionality
  const closeVisit = useCloseVisit();

  const handleStartVisit = () => {
    window.location.href = '/pos/clients/register';
  };

  const handleCloseVisit = (visitId: string) => {
    closeVisit.mutate(visitId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load visits" />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Open Visits</Typography>
        <Button variant="contained" onClick={handleStartVisit}>
          Start Visit
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client ID</TableCell>
              <TableCell>Master ID</TableCell>
              <TableCell>Started At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits?.map((visit: Visit) => (
              <TableRow key={visit.id}>
                <TableCell>{visit.id.substring(0, 8)}...</TableCell>
                <TableCell>{visit.client_id.substring(0, 8)}...</TableCell>
                <TableCell>{visit.master_id.substring(0, 8)}...</TableCell>
                <TableCell>
                  {format(new Date(visit.started_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={visit.status}
                    color={visit.status === 'open' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCloseVisit(visit.id)}
                    disabled={closeVisit.isPending}
                  >
                    Close
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {visits?.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          No open visits
        </Typography>
      )}
    </Paper>
  );
}


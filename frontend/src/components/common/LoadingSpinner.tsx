import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
}

/**
 * Loading Spinner Component
 * 
 * Simple loading indicator for async operations.
 */
export function LoadingSpinner({ size = 40 }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} />
    </Box>
  );
}


import { Alert, AlertTitle } from '@mui/material';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

/**
 * Error Alert Component
 * 
 * Displays error messages to users.
 */
export function ErrorAlert({ title, message, onClose }: ErrorAlertProps) {
  return (
    <Alert severity="error" onClose={onClose}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
}


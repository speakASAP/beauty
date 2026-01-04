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
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          {title && <h3 className="font-semibold text-red-800 mb-2">{title}</h3>}
          <p className="text-red-700">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 ml-4"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}


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
    <div className="flex justify-center items-center min-h-[200px]">
      <div
        className="border-4 border-borderLight border-t-accent rounded-full animate-spin"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}


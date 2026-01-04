import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBooking } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Booking Management Component
 * 
 * Allows clients to view, cancel, or reschedule bookings via token.
 * 
 * Rules:
 * - No authentication required
 * - Accessible via confirmation token
 * - Can cancel booking
 * - Can view booking details
 */
export function BookingManagement() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const loadBooking = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const bookingData = await publicApi.getBookingByToken(token);
      setBooking(bookingData);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError('Confirmation token is required');
      setIsLoading(false);
      return;
    }

    loadBooking();
  }, [token, loadBooking]);

  const handleCancel = async () => {
    if (!token) return;

    setIsCancelling(true);
    try {
      await publicApi.cancelBookingByToken(token, cancelReason || undefined);
      setCancelDialogOpen(false);
      // Reload booking to show updated status
      await loadBooking();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !booking) {
    return (
      <div className="container max-w-md mt-20">
        <ErrorAlert message={error || 'Booking not found'} />
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary mt-4"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="container max-w-2xl mt-20 mb-8">
      <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight">
        <h1 className="mb-6 text-h1-mobile md:text-h1-desktop font-heading font-bold text-dark">Manage Your Booking</h1>

        <div className="bg-light p-6 rounded-xl border border-borderLight mb-6">
          <h3 className="mb-4 text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark">Appointment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-soft mb-1 text-body-mobile md:text-body-desktop font-body">Client Name</p>
              <p className="text-dark text-body-mobile md:text-body-desktop font-body font-semibold">{booking.client_name}</p>
            </div>
            <div>
              <p className="text-soft mb-1 text-body-mobile md:text-body-desktop font-body">Service</p>
              <p className="text-dark text-body-mobile md:text-body-desktop font-body font-semibold">{booking.service_name}</p>
            </div>
            <div>
              <p className="text-soft mb-1 text-body-mobile md:text-body-desktop font-body">Date & Time</p>
              <p className="text-dark text-body-mobile md:text-body-desktop font-body font-semibold">{format(new Date(booking.starts_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-soft mb-1 text-body-mobile md:text-body-desktop font-body">Status</p>
              <p className="text-dark text-body-mobile md:text-body-desktop font-body font-semibold">{booking.status}</p>
            </div>
          </div>
        </div>

        {isCancelled ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700">This booking has been cancelled.</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setCancelDialogOpen(true)}
              className="btn btn-secondary border-red-500 text-red-600 hover:bg-red-50"
            >
              Cancel Booking
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Book Another Appointment
            </button>
          </div>
        )}
      </div>

      {cancelDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight max-w-md w-full">
            <h2 className="mb-4 text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">Cancel Booking</h2>
            <p className="text-soft mb-4 text-body-mobile md:text-body-desktop font-body">Are you sure you want to cancel this booking?</p>
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block mb-2 font-semibold text-dark text-body-mobile md:text-body-desktop font-body">
                Cancellation Reason (Optional)
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all resize-y text-body-mobile md:text-body-desktop font-body text-dark"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCancelDialogOpen(false)}
                className="btn btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="btn btn-primary bg-red-600 hover:bg-red-700"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


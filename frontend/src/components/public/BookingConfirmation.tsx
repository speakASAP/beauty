import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBooking } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Booking Confirmation Component
 * 
 * Shows booking confirmation after successful booking.
 * 
 * Rules:
 * - No authentication required
 * - Accessible via confirmation token
 * - Shows booking details and management options
 */
export function BookingConfirmation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Confirmation token is required');
      setIsLoading(false);
      return;
    }

    const loadBooking = async () => {
      try {
        const bookingData = await publicApi.getBookingByToken(token);
        setBooking(bookingData);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [token]);

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

  return (
    <div className="container max-w-2xl mt-20 mb-8">
      <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight text-center">
        <div className="text-6xl text-green-600 mb-4">✓</div>
        <h1 className="mb-4">Booking Confirmed!</h1>
        <p className="text-soft mb-8">Your appointment has been successfully booked</p>

        <div className="bg-light p-6 rounded-xl border border-borderLight mb-6 text-left">
          <h3 className="mb-4">Appointment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-soft mb-1">Client Name</p>
              <p className="text-dark">{booking.client_name}</p>
            </div>
            <div>
              <p className="text-soft mb-1">Service</p>
              <p className="text-dark">{booking.service_name}</p>
            </div>
            <div>
              <p className="text-soft mb-1">Date & Time</p>
              <p className="text-dark">{format(new Date(booking.starts_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-soft mb-1">Status</p>
              <p className="text-dark">{booking.status}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-soft mb-1">Confirmation Token</p>
              <p className="text-dark font-mono text-sm">{booking.confirmation_token}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">A confirmation SMS/Email has been sent to your contact information.</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/booking/manage/${booking.confirmation_token}`)}
            className="btn btn-secondary"
          >
            Manage Booking
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Book Another Appointment
          </button>
        </div>
      </div>
    </div>
  );
}


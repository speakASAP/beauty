import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { PublicBookingRequest } from '../../api/public';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Public Booking Form Component
 * 
 * Allows clients to book appointments online (no authentication).
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - Creates client and appointment
 * - GDPR consent required
 */
export function BookingForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const serviceId = searchParams.get('service_id') || '';
  const masterId = searchParams.get('master_id') || '';
  const startsAt = searchParams.get('starts_at') || '';

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    gdpr_consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      setError('First name, last name, and phone are required');
      return;
    }

    if (!formData.gdpr_consent) {
      setError('GDPR consent is required');
      return;
    }

    if (!tenantId || !serviceId || !masterId || !startsAt) {
      setError('Missing booking information. Please go back and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse duration from service (would come from service data)
      // For MVP, assume 60 minutes default
      const durationMinutes = 60;

      const bookingRequest: PublicBookingRequest = {
        tenant_id: tenantId,
        client_first_name: formData.first_name,
        client_last_name: formData.last_name,
        client_phone: formData.phone,
        client_email: formData.email || undefined,
        master_id: masterId,
        service_id: serviceId,
        starts_at: startsAt,
        duration_minutes: durationMinutes,
        gdpr_consent: formData.gdpr_consent,
      };

      const booking = await publicApi.createBooking(tenantId, bookingRequest);

      // Navigate to confirmation page
      navigate(`/booking/confirm/${booking.confirmation_token}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tenantId || !serviceId || !masterId || !startsAt) {
    return (
      <ErrorAlert message="Missing required booking information. Please go back and select a time slot." />
    );
  }

  return (
    <div className="bg-base p-8 rounded-2xl shadow-lg border border-borderLight max-w-2xl mx-auto">
      <h1 className="mb-2">Complete Your Booking</h1>
      <p className="text-soft mb-6">Please provide your contact information</p>

      <div className="mb-6 p-4 bg-light rounded-xl">
        <p className="text-soft mb-2">
          <strong className="text-dark">Appointment Details:</strong>
        </p>
        <p className="text-dark">Date & Time: {format(new Date(startsAt), 'PPpp')}</p>
        <p className="text-dark">Master ID: {masterId.substring(0, 8)}...</p>
        <p className="text-dark">Service ID: {serviceId.substring(0, 8)}...</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block mb-2 font-semibold text-dark">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2 font-semibold text-dark">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block mb-2 font-semibold text-dark">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 font-semibold text-dark">
            Email (Optional)
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.gdpr_consent}
              onChange={(e) => setFormData({ ...formData, gdpr_consent: e.target.checked })}
              required
              className="mt-1 w-5 h-5 border-2 border-borderLight rounded focus:ring-2 focus:ring-accent"
            />
            <span className="text-dark">I consent to the processing of my personal data (GDPR)</span>
          </label>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="border-2 border-base border-t-transparent rounded-full w-6 h-6 animate-spin mr-2" />
                Submitting...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


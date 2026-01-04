import { useState } from 'react';
import { useBookAppointment } from '../../hooks/useAppointments';
import { useClients } from '../../hooks/useClients';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { useNavigate } from 'react-router-dom';

/**
 * Book Appointment Form Component
 * 
 * Books a new appointment.
 * 
 * Rules:
 * - Only sends command (no business logic)
 * - Client selection from existing clients
 * - Tenant context implicit
 */
export function BookAppointmentForm() {
  const [clientId, setClientId] = useState('');
  const [masterId, setMasterId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [error, setError] = useState('');

  const { data: clients, isLoading: clientsLoading } = useClients();
  const bookAppointment = useBookAppointment();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId || !masterId || !serviceId || !startsAt) {
      setError('All fields are required');
      return;
    }

    try {
      await bookAppointment.mutateAsync({
        client_id: clientId,
        master_id: masterId,
        service_id: serviceId,
        starts_at: startsAt,
        duration_minutes: durationMinutes,
      });

      // Navigate to calendar
      navigate('/pos/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to book appointment');
    }
  };

  if (clientsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight max-w-2xl mx-auto">
      <h2 className="mb-4">Book Appointment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="client" className="block mb-2 font-semibold text-dark">
            Client
          </label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          >
            <option value="">Select a client</option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.first_name} {client.last_name}
                {client.phone && ` - ${client.phone}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="masterId" className="block mb-2 font-semibold text-dark">
            Master ID
          </label>
          <input
            id="masterId"
            type="text"
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            required
            placeholder="Enter master UUID"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>

        <div>
          <label htmlFor="serviceId" className="block mb-2 font-semibold text-dark">
            Service ID
          </label>
          <input
            id="serviceId"
            type="text"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            placeholder="Enter service UUID"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="block mb-2 font-semibold text-dark">
              Start Time
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block mb-2 font-semibold text-dark">
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              min={15}
              max={480}
              step={15}
              className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
            />
          </div>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={bookAppointment.isPending}
            className="btn btn-primary"
          >
            {bookAppointment.isPending ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}


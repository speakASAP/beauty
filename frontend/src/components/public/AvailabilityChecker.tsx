import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { publicApi } from '../../api/public';
import type { AvailabilitySlot } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Availability Checker Component
 * 
 * Shows available time slots for selected service.
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - User selects time slot to proceed to booking form
 */
export function AvailabilityChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const serviceId = searchParams.get('service_id') || '';
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [masterId, setMasterId] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = useCallback(async (): Promise<void> => {
    if (!tenantId || !serviceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const availability = await publicApi.checkAvailability(tenantId, {
        service_id: serviceId,
        master_id: masterId || undefined,
        date: selectedDate,
      });
      setSlots(availability);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, serviceId, selectedDate, masterId]);

  useEffect(() => {
    if (!tenantId || !serviceId) {
      setError('Salon ID and Service ID are required');
      return;
    }

    loadAvailability();
  }, [tenantId, serviceId, selectedDate, masterId, loadAvailability]);

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    if (!slot.available) return;

    // Navigate to booking form with selected slot
    navigate(
      `/booking/form?tenant_id=${tenantId}&service_id=${serviceId}&master_id=${slot.master_id}&starts_at=${slot.starts_at}`
    );
  };

  if (!tenantId || !serviceId) {
    return (
      <ErrorAlert message="Missing required information. Please go back and select a service." />
    );
  }

  return (
    <div>
      <h1 className="mb-2">Select Date & Time</h1>
      <p className="text-soft mb-6">Choose when you'd like your appointment</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="date" className="block mb-2 font-semibold text-dark">
            Select Date
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
        <div>
          <label htmlFor="master" className="block mb-2 font-semibold text-dark">
            Select Master (Optional)
          </label>
          <select
            id="master"
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          >
            <option value="">Any Master</option>
            {/* Masters would come from API - placeholder for now */}
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {slots.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-700">No available slots for this date. Please try another date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSlot(slot)}
                  className={`bg-base p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    slot.available
                      ? 'border-borderLight hover:border-accent hover:shadow-lg'
                      : 'border-borderLight opacity-50 cursor-not-allowed'
                  }`}
                >
                  <p className="text-center text-xl font-semibold text-dark mb-2">
                    {format(new Date(slot.starts_at), 'HH:mm')}
                  </p>
                  <p className="text-center text-soft mb-3">{slot.master_name}</p>
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 rounded-button text-xs font-semibold ${
                      slot.available
                        ? 'bg-green-100 text-green-800 border-green-500'
                        : 'bg-gray-100 text-gray-800 border-gray-500'
                    } border`}>
                      {slot.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


import { useState } from 'react';
import { useAppointments, useBookAppointment } from '../../hooks/useAppointments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import type { Appointment } from '../../types/api';

/**
 * Appointment Calendar Component
 *
 * Displays appointments in a calendar view.
 *
 * Rules:
 * - Only displays appointments for current tenant
 * - Polls every 5 seconds for updates (event-driven)
 * - No business logic (just renders data)
 */
export function AppointmentCalendar() {
  const [selectedDate] = useState(new Date());
  const { data: appointments, isLoading, error } = useAppointments({
    date: format(selectedDate, 'yyyy-MM-dd'),
  });
  useBookAppointment(); // Placeholder for future booking functionality

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load appointments" />;
  }

  const handleBookAppointment = () => {
    window.location.href = '/pos/book-appointment';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-base border border-borderLight rounded-button p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
          Appointments
        </h2>
        <button onClick={handleBookAppointment} className="btn btn-primary">
          Book Appointment
        </button>
      </div>

      <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-6">
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {appointments?.map((appointment: Appointment) => (
          <div
            key={appointment.id}
            className="bg-light border border-borderLight rounded-button p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-3">
              {format(new Date(appointment.starts_at), 'HH:mm')} -{' '}
              {format(new Date(appointment.ends_at), 'HH:mm')}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-3 ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
            <div className="space-y-2 mt-4">
              <p className="text-body-mobile md:text-body-desktop font-body text-soft">
                Client ID: {appointment.client_id}
              </p>
              <p className="text-body-mobile md:text-body-desktop font-body text-soft">
                Master ID: {appointment.master_id}
              </p>
            </div>
          </div>
        ))}
      </div>

      {appointments?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body-mobile md:text-body-desktop font-body text-soft">
            No appointments for this date
          </p>
        </div>
      )}
    </div>
  );
}

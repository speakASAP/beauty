import { useVisits, useStartVisit, useCloseVisit } from '../../hooks/useVisits';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import type { Visit } from '../../types/api';

/**
 * Visit Management Component
 * 
 * Displays and manages visits (open and closed).
 * 
 * Rules:
 * - Only displays visits for current tenant
 * - Polls every 5 seconds for updates
 * - No business logic (just sends commands)
 */
export function VisitManagement() {
  const { data: visits, isLoading, error } = useVisits({ status: 'open' });
  useStartVisit(); // Placeholder for future functionality
  const closeVisit = useCloseVisit();

  const handleStartVisit = () => {
    window.location.href = '/pos/clients/register';
  };

  const handleCloseVisit = (visitId: string) => {
    closeVisit.mutate(visitId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load visits" />;
  }

  return (
    <div className="bg-base border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
          Open Visits
        </h2>
        <button onClick={handleStartVisit} className="btn btn-primary">
          Start Visit
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-borderLight bg-light">
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                ID
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Client ID
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Master ID
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Started At
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Status
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visits?.map((visit: Visit) => (
              <tr key={visit.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                  {visit.id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                  {visit.client_id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                  {visit.master_id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                  {format(new Date(visit.started_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-button border-2 text-sm font-semibold ${
                    visit.status === 'open'
                      ? 'bg-accent/20 text-accent border-accent'
                      : 'bg-gray-100 text-gray-800 border-gray-500'
                  }`}>
                    {visit.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleCloseVisit(visit.id)}
                    disabled={closeVisit.isPending}
                    className="btn btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visits?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body-mobile md:text-body-desktop font-body text-soft">
            No open visits
          </p>
        </div>
      )}
    </div>
  );
}


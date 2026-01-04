import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '../../api/public';
import type { PublicService } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Service Catalog Component (Public View)
 * 
 * Displays available services for booking.
 * 
 * Rules:
 * - No authentication required
 * - Tenant context from URL parameter
 * - User selects service to proceed to booking
 */
export function ServiceCatalog() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant_id') || localStorage.getItem('public_tenant_id');
  const [services, setServices] = useState<PublicService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setError('Salon ID is required');
      setIsLoading(false);
      return;
    }

    const loadServices = async () => {
      try {
        const servicesData = await publicApi.getServices(tenantId);
        setServices(servicesData);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [tenantId]);

  const handleSelectService = (serviceId: string) => {
    // Navigate to availability checker with service selected
    window.location.href = `/booking/availability?tenant_id=${tenantId}&service_id=${serviceId}`;
  };

  if (!tenantId) {
    return (
      <ErrorAlert message="Salon ID is required. Please go back to the landing page." />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div>
      <h1 className="mb-2">Select a Service</h1>
      <p className="text-soft mb-6">Choose the service you'd like to book</p>

      {services.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-blue-700">No services available. Please contact the salon directly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-base rounded-xl border border-borderLight shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="mb-3">{service.name}</h3>
                {service.description && (
                  <p className="text-soft mb-4">{service.description}</p>
                )}
                <p className="text-dark mb-2">Duration: {service.duration_minutes} minutes</p>
                <p className="text-xl font-semibold text-accent mt-3">
                  {(service.price / 100).toFixed(2)} CZK
                </p>
              </div>
              <div className="p-4 border-t border-borderLight">
                <button
                  onClick={() => handleSelectService(service.id)}
                  className="btn btn-primary w-full"
                >
                  Book This Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


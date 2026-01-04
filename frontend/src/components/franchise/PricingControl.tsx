import { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Pricing Control Component
 *
 * Manages pricing for services and products.
 *
 * Rules:
 * - Only accessible to franchisor role
 * - Global pricing and tenant-specific overrides
 * - No business logic (just sends commands)
 */
interface Service {
  id: string;
  name: string;
  base_price: number;
  vat_rate: number;
}

export function PricingControl() {
  const [services] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const isLoading = false;
  const error = null;

  const handleEditPrice = (service: Service) => {
    setSelectedService(service);
    setPrice(service.base_price);
    setEditDialogOpen(true);
  };

  const handleSavePrice = () => {
    if (!selectedService) return;
    // In real implementation, would call API to update pricing
    setEditDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load pricing" />;
  }

  return (
    <div>
      <div className="bg-base border border-borderLight rounded-button p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
            Pricing Control
          </h2>
          <button className="btn btn-primary">
            Add Service
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-borderLight">
                <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Service Name
                </th>
                <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Base Price
                </th>
                <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  VAT Rate
                </th>
                <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                  <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                    {service.name}
                  </td>
                  <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                    {(service.base_price / 100).toFixed(2)} CZK
                  </td>
                  <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                    {(service.vat_rate * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEditPrice(service)}
                      className="btn btn-secondary text-sm py-2 px-4"
                    >
                      Edit Price
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft">
              No services available
            </p>
          </div>
        )}
      </div>

      {/* Dialog/Modal */}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-borderLight">
              <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark">
                Edit Price
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={selectedService?.name || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-button border border-borderLight bg-light text-soft text-body-mobile md:text-body-desktop font-body cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                  Price (CZK)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price / 100}
                  onChange={(e) => setPrice(Number(e.target.value) * 100)}
                  className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-borderLight flex justify-end gap-4">
              <button
                onClick={() => setEditDialogOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSavePrice} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

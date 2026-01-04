import { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

/**
 * Catalog Governance Component
 * 
 * Manages service and product catalog.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Global catalog management
 * - No business logic (just sends commands)
 */
interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  vat_rate: number;
  created_at: string;
}

export function CatalogGovernance() {
  const [tabValue, setTabValue] = useState(0);
  const [services] = useState<CatalogItem[]>([]);
  const [products] = useState<CatalogItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    vat_rate: 0.21,
  });
  const isLoading = false;
  const error = null;

  const handleAddItem = () => {
    setFormData({ name: '', price: 0, vat_rate: 0.21 });
    setDialogOpen(true);
  };

  const handleSaveItem = () => {
    // In real implementation, would call API to create item
    setDialogOpen(false);
  };

  const currentItems = tabValue === 0 ? services : products;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load catalog" />;
  }

  return (
    <div>
      <div className="bg-base border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
            Catalog Governance
          </h2>
          <button onClick={handleAddItem} className="btn btn-primary">
            Add {tabValue === 0 ? 'Service' : 'Product'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-borderLight mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setTabValue(0)}
              className={`px-4 py-3 text-body-mobile md:text-body-desktop font-body font-semibold border-b-2 transition-colors ${
                tabValue === 0
                  ? 'border-accent text-accent'
                  : 'border-transparent text-soft hover:text-dark'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setTabValue(1)}
              className={`px-4 py-3 text-body-mobile md:text-body-desktop font-body font-semibold border-b-2 transition-colors ${
                tabValue === 1
                  ? 'border-accent text-accent'
                  : 'border-transparent text-soft hover:text-dark'
              }`}
            >
              Products
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-borderLight bg-light">
                <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  VAT Rate
                </th>
                <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Created At
                </th>
                <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                  <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                    {(item.price / 100).toFixed(2)} CZK
                  </td>
                  <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                    {(item.vat_rate * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn btn-secondary text-sm py-2 px-4">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft">
              No {tabValue === 0 ? 'services' : 'products'} available
            </p>
          </div>
        )}
      </div>

      {/* Dialog/Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-borderLight">
              <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark">
                Add {tabValue === 0 ? 'Service' : 'Product'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                    Price (CZK) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price / 100}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) * 100 })
                    }
                    required
                    className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                    VAT Rate (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.vat_rate * 100}
                    onChange={(e) =>
                      setFormData({ ...formData, vat_rate: Number(e.target.value) / 100 })
                    }
                    required
                    className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-borderLight flex justify-end gap-4">
              <button
                onClick={() => setDialogOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSaveItem} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


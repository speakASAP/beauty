import { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';

// Simple SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

/**
 * Tenant Overview Component
 *
 * Displays all tenants for franchisor view.
 *
 * Rules:
 * - Only accessible to franchisor role
 * - Read-only view (except allowed commands)
 * - Tenant context explicit
 *
 * Note: Tenant list API not yet implemented in Phase 1.
 * This component is ready for API integration when platform-service is available.
 * For MVP, franchisor can access tenant data via direct database queries with franchisor context.
 */
interface Tenant {
  id: string;
  name: string;
  state: 'CREATING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  created_at: string;
}

export function TenantOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  // In real implementation, would fetch from API
  const [tenants] = useState<Tenant[]>([]);
  const isLoading = false;
  const error = null;

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CREATING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message="Failed to load tenants" />;
  }

  return (
    <div className="bg-base border border-borderLight rounded-button p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
          Tenant Overview
        </h2>
        <button className="btn btn-primary">
          Add Tenant
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-soft">
          <SearchIcon />
        </div>
        <input
          type="text"
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-borderLight">
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Tenant ID
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                Name
              </th>
              <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                State
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
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-soft">
                  {tenant.id.substring(0, 8)}...
                </td>
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                  {tenant.name}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStateColor(tenant.state)}`}>
                    {tenant.state}
                  </span>
                </td>
                <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-soft">
                  {format(new Date(tenant.created_at), 'PP')}
                </td>
                <td className="px-4 py-3">
                  <button className="btn btn-secondary text-sm py-2 px-4">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body-mobile md:text-body-desktop font-body text-soft">
            {searchTerm ? 'No tenants found' : 'No tenants available'}
          </p>
        </div>
      )}
    </div>
  );
}

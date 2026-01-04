import { useState } from 'react';
import { useDailySales } from '../../hooks/useAnalytics';
import { useMasterUtilization } from '../../hooks/useAnalytics';
import { useClientLTV } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { format, subDays } from 'date-fns';

/**
 * KPI Dashboard Component
 * 
 * Displays performance metrics across tenants.
 * 
 * Rules:
 * - Only accessible to franchisor role
 * - Uses BI read model only
 * - No direct tenant data access
 */
export function KPIDashboard() {
  const [dateRange, setDateRange] = useState({
    from_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: dailySales, isLoading: salesLoading } = useDailySales({
    from_date: dateRange.from_date,
    to_date: dateRange.to_date,
  });
  const { data: masterUtilization, isLoading: utilizationLoading } =
    useMasterUtilization({
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
    });
  const { data: clientLTV, isLoading: ltvLoading } = useClientLTV({
    from_date: dateRange.from_date,
    to_date: dateRange.to_date,
  });

  const isLoading = salesLoading || utilizationLoading || ltvLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalRevenue =
    dailySales?.reduce((sum, day) => sum + day.total_amount, 0) || 0;
  const totalOrders = dailySales?.reduce((sum, day) => sum + day.order_count, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <div className="bg-base border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">
            KPI Dashboard
          </h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from_date}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from_date: e.target.value })
                }
                className="px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to_date}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to_date: e.target.value })
                }
                className="px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-light border border-borderLight rounded-2xl p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total Revenue
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {(totalRevenue / 100).toFixed(2)} CZK
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-2xl p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total Orders
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {totalOrders}
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-2xl p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Avg Order Value
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {(avgOrderValue / 100).toFixed(2)} CZK
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-2xl p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Active Tenants
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {new Set(dailySales?.map((d) => d.tenant_id)).size || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-6">
            Master Utilization
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-light">
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Master
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Booked Hours
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Total Hours
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody>
                {masterUtilization?.slice(0, 10).map((master) => (
                  <tr key={master.master_id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                      {master.master_name}
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {master.booked_hours}
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {master.total_hours}
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {(master.utilization_rate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-base border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-6">
            Top Clients (LTV)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-borderLight bg-light">
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Client
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Visits
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Avg Visit Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientLTV?.slice(0, 10).map((client) => (
                  <tr key={client.client_id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                      {client.client_name}
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {(client.total_spent / 100).toFixed(2)} CZK
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {client.visit_count}
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {(client.average_visit_value / 100).toFixed(2)} CZK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


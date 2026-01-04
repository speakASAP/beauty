import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { usePayments } from '../../hooks/usePayments';
import { useDailySales } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { format } from 'date-fns';

/**
 * Shift Close Dashboard Component
 *
 * Displays daily summary for shift close.
 *
 * Rules:
 * - Only shows data for current tenant
 * - Read-only view (no commands)
 * - Uses BI read model for aggregates
 */
export function ShiftCloseDashboard() {
  const [selectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data: orders, isLoading: ordersLoading } = useOrders({
    date: dateStr,
  });
  const { data: payments, isLoading: paymentsLoading } = usePayments({
    date: dateStr,
  });
  const { data: dailySales, isLoading: salesLoading } = useDailySales({
    date: dateStr,
  });

  const isLoading = ordersLoading || paymentsLoading || salesLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalOrders = orders?.length || 0;
  const totalPayments = payments?.length || 0;
  const totalAmount = dailySales?.[0]?.total_amount || 0;
  const totalVat = dailySales?.[0]?.vat_amount || 0;

  return (
    <div>
      <div className="bg-base border border-borderLight rounded-button p-6 md:p-8 mb-6">
        <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark mb-6">
          Shift Close - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-light border border-borderLight rounded-button p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total Orders
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {totalOrders}
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-button p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total Payments
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {totalPayments}
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-button p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total Revenue
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {(totalAmount / 100).toFixed(2)} CZK
            </p>
          </div>

          <div className="bg-light border border-borderLight rounded-button p-6">
            <p className="text-body-mobile md:text-body-desktop font-body text-soft mb-2">
              Total VAT
            </p>
            <p className="text-h2-mobile md:text-h2-desktop font-heading font-bold text-dark">
              {(totalVat / 100).toFixed(2)} CZK
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-base border border-borderLight rounded-button p-6 md:p-8">
          <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-6">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-borderLight">
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders?.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-soft">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {(order.total_amount / 100).toFixed(2)} CZK
                    </td>
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                      {order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-base border border-borderLight rounded-button p-6 md:p-8">
          <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-6">
            Recent Payments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-borderLight">
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Payment ID
                  </th>
                  <th className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments?.slice(0, 10).map((payment) => (
                  <tr key={payment.id} className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-soft">
                      {payment.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-right text-body-mobile md:text-body-desktop font-body text-dark">
                      {(payment.amount / 100).toFixed(2)} CZK
                    </td>
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                      {payment.method}
                    </td>
                    <td className="px-4 py-3 text-body-mobile md:text-body-desktop font-body text-dark">
                      {payment.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button className="btn btn-primary btn-large">
          Close Shift
        </button>
      </div>
    </div>
  );
}

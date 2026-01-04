import { useParams } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useCloseOrder } from '../../hooks/useOrders';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Order Details Component
 * 
 * Displays order details and allows closing order.
 * 
 * Rules:
 * - Only displays order for current tenant
 * - Sends command to close order (no business logic)
 */
export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: orders, isLoading } = useOrders();
  const closeOrder = useCloseOrder();
  const navigate = useNavigate();

  const order = orders?.find((o) => o.id === orderId);

  const handleCloseOrder = () => {
    if (!order) return;
    closeOrder.mutate(order.id, {
      onSuccess: () => {
        navigate('/pos/orders');
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return <ErrorAlert message="Order not found" />;
  }

  return (
    <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight">
      <div className="flex justify-between items-center mb-6">
        <h2>Order Details</h2>
        <span className={`px-3 py-1 rounded-button border-2 text-sm font-semibold ${
          order.status === 'closed' 
            ? 'bg-green-100 text-green-800 border-green-500' 
            : 'bg-accent/20 text-accent border-accent'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <p className="text-soft mb-1">Order ID</p>
            <p className="text-dark">{order.id}</p>
          </div>

          <div>
            <p className="text-soft mb-1">Client ID</p>
            <p className="text-dark">{order.client_id}</p>
          </div>

          <div>
            <p className="text-soft mb-1">Created At</p>
            <p className="text-dark">{format(new Date(order.created_at), 'PPpp')}</p>
          </div>

          {order.closed_at && (
            <div>
              <p className="text-soft mb-1">Closed At</p>
              <p className="text-dark">{format(new Date(order.closed_at), 'PPpp')}</p>
            </div>
          )}
        </div>

        <div className="bg-light p-4 rounded-xl border border-borderLight">
          <h3 className="mb-4">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-soft">Subtotal:</p>
              <p className="text-dark">{((order.total_amount - order.vat_amount) / 100).toFixed(2)} CZK</p>
            </div>
            <div className="flex justify-between">
              <p className="text-soft">VAT:</p>
              <p className="text-dark">{(order.vat_amount / 100).toFixed(2)} CZK</p>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-borderLight">
              <p className="text-xl font-semibold text-dark">Total:</p>
              <p className="text-xl font-semibold text-dark">{(order.total_amount / 100).toFixed(2)} CZK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCloseOrder}
          disabled={closeOrder.isPending || order.status === 'closed'}
          className="btn btn-primary"
        >
          {closeOrder.isPending ? 'Closing...' : 'Close Order'}
        </button>
        <button
          onClick={() => navigate('/pos/checkout/' + order.id)}
          className="btn btn-secondary"
        >
          Go to Checkout
        </button>
      </div>
    </div>
  );
}


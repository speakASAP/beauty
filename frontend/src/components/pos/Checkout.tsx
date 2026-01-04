import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders, useCloseOrder } from '../../hooks/useOrders';
import { useInitiatePayment } from '../../hooks/usePayments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import type { Order } from '../../types/api';

/**
 * Checkout Component
 * 
 * Handles order checkout and payment processing.
 * 
 * Rules:
 * - Only processes orders for current tenant
 * - No payment logic (just sends commands)
 * - Reacts to payment events (polling)
 */
export function Checkout({ orderId: orderIdProp }: { orderId?: string }) {
  const { orderId: orderIdParam } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const orderId = orderIdProp || orderIdParam || '';
  const { data: orders, isLoading } = useOrders();
  const order = orders?.find((o: Order) => o.id === orderId);
  const closeOrder = useCloseOrder();
  const initiatePayment = useInitiatePayment();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'online' | 'bank_transfer'>('card');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return <ErrorAlert message="Order not found" />;
  }

  const handleProcessPayment = () => {
    if (!order) return;

    // Initiate payment
    initiatePayment.mutate(
      {
        order_id: order.id,
        amount: order.total_amount,
        method: paymentMethod,
      },
      {
        onSuccess: (payment) => {
          // Navigate to payment status page
          navigate(`/pos/payments/${payment.id}`);
        },
      }
    );
  };

  const handleCloseOrder = () => {
    if (!order) return;
    closeOrder.mutate(order.id);
  };

  return (
    <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight">
      <h2 className="mb-6">Checkout</h2>

      <div className="mb-6 space-y-2">
        <p className="text-dark">Order ID: {order.id.substring(0, 8)}...</p>
        <p className="text-dark">Total Amount: {order.total_amount / 100} CZK</p>
        <p className="text-dark">VAT: {order.vat_amount / 100} CZK</p>
        <p className="text-dark">Status: {order.status}</p>
      </div>

      <div className="border-t border-borderLight my-6"></div>

      <div className="mb-6">
        <label htmlFor="paymentMethod" className="block mb-2 font-semibold text-dark">
          Payment Method
        </label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value as 'card' | 'cash' | 'online' | 'bank_transfer'
            )
          }
          className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
        >
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleProcessPayment}
          disabled={initiatePayment.isPending || order.status === 'closed'}
          className="btn btn-primary"
        >
          {initiatePayment.isPending ? 'Processing...' : 'Process Payment'}
        </button>
        <button
          onClick={handleCloseOrder}
          disabled={closeOrder.isPending || order.status === 'closed'}
          className="btn btn-secondary"
        >
          {closeOrder.isPending ? 'Closing...' : 'Close Order'}
        </button>
      </div>
    </div>
  );
}


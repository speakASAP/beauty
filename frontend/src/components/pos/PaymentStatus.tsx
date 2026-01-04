import { useParams } from 'react-router-dom';
import { usePayment } from '../../hooks/usePayments';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Payment Status Component
 * 
 * Displays payment status and polls for updates.
 * 
 * Rules:
 * - Polls every 2 seconds for payment status
 * - Only displays payment for current tenant
 * - Event-driven (reacts to payment events)
 */
export function PaymentStatus() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { data: payment, isLoading, error } = usePayment(paymentId || '');
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !payment) {
    return <ErrorAlert message="Payment not found" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  return (
    <div className="bg-base p-6 rounded-2xl shadow-lg border border-borderLight">
      <div className="flex justify-between items-center mb-6">
        <h2>Payment Status</h2>
        <span className={`px-3 py-1 rounded-button border-2 text-sm font-semibold ${getStatusColor(payment.status)}`}>
          {payment.status}
        </span>
      </div>

      <div className="mb-6 space-y-4">
        <div>
          <p className="text-soft mb-1">Payment ID</p>
          <p className="text-dark">{payment.id}</p>
        </div>

        <div>
          <p className="text-soft mb-1">Order ID</p>
          <p className="text-dark">{payment.order_id}</p>
        </div>

        <div>
          <p className="text-soft mb-1">Amount</p>
          <p className="text-xl font-semibold text-dark">{(payment.amount / 100).toFixed(2)} CZK</p>
        </div>

        <div>
          <p className="text-soft mb-1">Payment Method</p>
          <p className="text-dark">{payment.method}</p>
        </div>

        <div>
          <p className="text-soft mb-1">Created At</p>
          <p className="text-dark">{format(new Date(payment.created_at), 'PPpp')}</p>
        </div>

        {payment.captured_at && (
          <div>
            <p className="text-soft mb-1">Captured At</p>
            <p className="text-dark">{format(new Date(payment.captured_at), 'PPpp')}</p>
          </div>
        )}
      </div>

      {payment.status === 'pending' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-700">Payment is being processed. This page will update automatically.</p>
        </div>
      )}

      {payment.status === 'completed' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">Payment completed successfully!</p>
        </div>
      )}

      {payment.status === 'failed' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">Payment failed. Please try again.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Back
        </button>
        {payment.status === 'completed' && (
          <button
            onClick={() => navigate('/pos/orders/' + payment.order_id)}
            className="btn btn-primary"
          >
            View Order
          </button>
        )}
      </div>
    </div>
  );
}


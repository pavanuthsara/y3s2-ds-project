import React, { useState, useEffect } from 'react';
import { paymentService } from '../services';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentLoader from './PaymentLoader';

/**
 * Payment Confirmation component
 * Displays successful payment confirmation with transaction details
 */
export const PaymentConfirmation = ({
  transactionId,
  appointmentId,
  amount,
  currency = 'LKR',
  onClose,
  onDownloadReceipt,
}) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await paymentService.getTransaction(transactionId);
        setTransaction(data);
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  if (loading) {
    return <PaymentLoader message="Loading confirmation..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  const displayTransaction = transaction || { transactionId, appointmentId, amount, currency };
  const paidAt = displayTransaction.paidAt ? new Date(displayTransaction.paidAt) : new Date();

  return (
    <div className="p-6 bg-white">
      {/* Success Icon */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Your payment has been processed successfully.</p>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Transaction ID:</span>
          <span className="font-mono text-sm font-semibold text-gray-800">
            {displayTransaction.transactionId?.substring(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <PaymentStatusBadge status="SUCCESS" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-lg font-semibold text-gray-800">
            {currency} {displayTransaction.amount?.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Date & Time:</span>
          <span className="text-sm text-gray-800">
            {paidAt.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>

        {displayTransaction.appointmentId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Appointment ID:</span>
            <span className="font-mono text-sm text-gray-800">
              {displayTransaction.appointmentId?.substring(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onDownloadReceipt && (
          <button
            onClick={onDownloadReceipt}
            className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
          >
            📥 Download Receipt
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {/* Footer Message */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmation;

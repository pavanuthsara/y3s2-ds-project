import React from 'react';
import PaymentStatusBadge from './PaymentStatusBadge';

/**
 * Transaction Card Component
 * Displays individual transaction details
 */
export const TransactionCard = ({
  transaction,
  onRefund,
  onViewDetails,
  showActions = true,
}) => {
  if (!transaction) {
    return null;
  }

  const {
    id,
    transactionId,
    appointmentId,
    amount,
    currency = 'LKR',
    status,
    paymentGateway,
    paidAt,
    refundedAt,
    createdAt,
    failureReason,
  } = transaction;

  const displayId = transactionId || id;
  const transactionDate = paidAt ? new Date(paidAt) : new Date(createdAt);
  const canRefund = status?.toUpperCase() === 'SUCCESS';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            Payment Receipt
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {transactionDate.toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <PaymentStatusBadge status={status} />
      </div>

      {/* Details Grid */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-800">
            {currency} {amount?.toFixed(2) || '0.00'}
          </span>
        </div>



        <div className="flex justify-between">
          <span className="text-gray-600">Payment Gateway:</span>
          <span className="text-gray-800 capitalize">{paymentGateway?.toLowerCase() || 'N/A'}</span>
        </div>

        {refundedAt && (
          <div className="flex justify-between">
            <span className="text-gray-600">Refunded:</span>
            <span className="text-gray-800">
              {new Date(refundedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {failureReason && status?.toUpperCase() === 'FAILED' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Reason:</span>
            <span className="text-red-600 text-xs">{failureReason}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-2 pt-4 border-t">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(transaction)}
              className="flex-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
            >
              View Details
            </button>
          )}

          {canRefund && onRefund && (
            <button
              onClick={() => onRefund(transaction)}
              className="flex-1 px-2 py-1 text-orange-600 hover:bg-orange-50 rounded text-sm font-medium transition-colors"
            >
              Refund
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionCard;

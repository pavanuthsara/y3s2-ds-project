import React, { useState } from 'react';
import { TransactionHistory } from '../components';

/**
 * Payment Page Component
 * Standalone page for viewing payment history
 */
export const PaymentPage = ({ patientId }) => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState('');

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleRefund = (transaction) => {
    setSelectedTransaction(transaction);
    setShowRefundConfirm(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedTransaction) return;

    setRefundLoading(true);
    setRefundError('');

    try {
      // Refund logic would go here
      // await paymentService.refundTransaction(selectedTransaction.transactionId);
      setShowRefundConfirm(false);
      setSelectedTransaction(null);
    } catch (err) {
      setRefundError(err.message || 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">Manage your appointment payments and view transaction history</p>
      </div>

      {/* Transaction History */}
      <TransactionHistory
        patientId={patientId}
        showActions={true}
        onRefund={handleRefund}
        onViewDetails={handleViewDetails}
      />

      {/* Detail Modal */}
      {selectedTransaction && !showRefundConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Transaction ID</p>
                <p className="font-mono text-gray-800 font-semibold">
                  {selectedTransaction.transactionId || selectedTransaction.id}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Appointment ID</p>
                <p className="font-mono text-gray-800 font-semibold">
                  {selectedTransaction.appointmentId || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  LKR {selectedTransaction.amount?.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-gray-800 font-semibold capitalize">
                  {selectedTransaction.status?.toLowerCase()}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Created</p>
                <p className="text-gray-800">
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedTransaction.paidAt && (
                <div>
                  <p className="text-gray-600 text-sm">Paid</p>
                  <p className="text-gray-800">
                    {new Date(selectedTransaction.paidAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex gap-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundConfirm && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b p-4">
              <h2 className="text-lg font-bold text-gray-800">Confirm Refund</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to refund{' '}
                <strong>LKR {selectedTransaction.amount?.toFixed(2)}</strong>?
              </p>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ This action cannot be undone. The amount will be refunded to your original payment method.
                </p>
              </div>

              {refundError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{refundError}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex gap-2">
              <button
                onClick={() => {
                  setShowRefundConfirm(false);
                  setSelectedTransaction(null);
                }}
                disabled={refundLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                disabled={refundLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {refundLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>💳 Refund</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;

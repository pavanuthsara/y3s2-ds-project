import React, { useState, useEffect } from 'react';
import { paymentService } from '../services';
import TransactionCard from './TransactionCard';
import PaymentLoader from './PaymentLoader';

/**
 * Transaction History Component
 * Displays patient's payment history with filtering and sorting
 */
export const TransactionHistory = ({
  patientId,
  showActions = true,
  onRefund,
  onViewDetails,
  title = 'Payment History',
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await paymentService.getPatientHistory(patientId);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err.message || 'Failed to load payment history');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [patientId]);

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (filterStatus === 'ALL') {
      return true;
    }
    return txn.status?.toUpperCase() === filterStatus.toUpperCase();
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.paidAt || a.createdAt || 0);
    const dateB = new Date(b.paidAt || b.createdAt || 0);

    if (sortBy === 'date-desc') {
      return dateB - dateA;
    } else if (sortBy === 'date-asc') {
      return dateA - dateB;
    } else if (sortBy === 'amount-desc') {
      return (b.amount || 0) - (a.amount || 0);
    } else if (sortBy === 'amount-asc') {
      return (a.amount || 0) - (b.amount || 0);
    }

    return 0;
  });

  // Calculate summary
  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);
  const successfulAmount = filteredTransactions
    .filter((txn) => txn.status?.toUpperCase() === 'SUCCESS')
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  if (loading) {
    return <PaymentLoader message="Loading payment history..." />;
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {sortedTransactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-600 text-sm font-semibold">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-900">{filteredTransactions.length}</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-600 text-sm font-semibold">Successful Payments</p>
            <p className="text-2xl font-bold text-green-900">LKR {successfulAmount.toFixed(2)}</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-purple-600 text-sm font-semibold">Total Amount</p>
            <p className="text-2xl font-bold text-purple-900">LKR {totalAmount.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {sortedTransactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          {sortedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.transactionId || transaction.id}
              transaction={transaction}
              showActions={showActions}
              onRefund={onRefund}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg font-semibold">No transactions found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filterStatus !== 'ALL'
              ? `No ${filterStatus.toLowerCase()} transactions`
              : 'Start by making a payment for an appointment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

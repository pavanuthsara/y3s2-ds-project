import React from 'react';

/**
 * Status badge component showing payment transaction status
 */
export const PaymentStatusBadge = ({ status, className = '' }) => {
  const getStatusStyles = () => {
    const baseStyles = 'px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-2';

    switch (status?.toUpperCase()) {
      case 'PENDING':
        return `${baseStyles} bg-yellow-100 text-yellow-800`;
      case 'SUCCESS':
      case 'COMPLETED':
        return `${baseStyles} bg-green-100 text-green-800`;
      case 'FAILED':
        return `${baseStyles} bg-red-100 text-red-800`;
      case 'REFUNDED':
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case 'CANCELLED':
        return `${baseStyles} bg-gray-100 text-gray-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusIcon = () => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '⏳';
      case 'SUCCESS':
      case 'COMPLETED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'REFUNDED':
        return '🔄';
      case 'CANCELLED':
        return '⏹️';
      default:
        return '•';
    }
  };

  return (
    <span className={`${getStatusStyles()} ${className}`}>
      <span>{getStatusIcon()}</span>
      <span>{status}</span>
    </span>
  );
};

export default PaymentStatusBadge;

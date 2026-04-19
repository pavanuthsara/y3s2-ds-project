import { useState } from 'react';
import '../styles/StatusBadge.css';

const StatusBadge = ({ status, paymentStatus }) => {
  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-success',
      COMPLETED: 'badge-info',
      CANCELLED: 'badge-danger',
    };
    return statusMap[status] || 'badge-secondary';
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const paymentMap = {
      PENDING: 'badge-warning',
      PAID: 'badge-success',
      REFUNDED: 'badge-info',
    };
    return paymentMap[paymentStatus] || 'badge-secondary';
  };

  return (
    <div className="status-badge-container">
      {status && (
        <span className={`badge ${getStatusColor(status)}`}>
          {status}
        </span>
      )}
      {paymentStatus && (
        <span className={`badge ${getPaymentStatusColor(paymentStatus)}`}>
          {paymentStatus === 'PENDING' ? 'Payment pending' : paymentStatus}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;

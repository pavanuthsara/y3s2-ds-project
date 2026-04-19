import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PaymentForm from './PaymentForm';

/**
 * Payment Modal Component
 * Modal wrapper for payment form
 */
export const PaymentModal = ({
  isOpen,
  appointmentId,
  patientId,
  amount,
  currency = 'LKR',
  onClose,
  onSuccess,
  title = 'Payment',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSuccess = (result) => {
    onSuccess?.(result);
    onClose?.();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <PaymentForm
            appointmentId={appointmentId}
            patientId={patientId}
            amount={amount}
            currency={currency}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentModal;

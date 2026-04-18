import React from 'react';

/**
 * Loading spinner component for payment operations
 */
export const PaymentLoader = ({ message = 'Processing payment...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="mb-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default PaymentLoader;

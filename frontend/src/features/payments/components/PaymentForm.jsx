import React, { useState, useEffect } from 'react';
import { usePaymentForm, useStripeElements } from '../hooks';
import StripePaymentElement from './StripePaymentElement';
import PaymentConfirmation from './PaymentConfirmation';
import PaymentLoader from './PaymentLoader';
import { getStripe } from '../services/stripeService';

/**
 * Payment Form Component
 * Handles payment initiation and confirmation workflow
 */
export const PaymentForm = ({
  appointmentId,
  patientId,
  amount,
  currency = 'LKR',
  onSuccess,
  onCancel,
  onPaymentInitiated,
}) => {
  const { 
    formData, 
    loading: formLoading,
    error: formError,
    success,
    transactionId,
    clientSecret,
    initiatePayment,
  } = usePaymentForm(appointmentId, patientId, amount, currency);

  const {
    stripe,
    createPaymentElement,
    mountPaymentElement,
    cleanup,
    loading: stripeLoading,
    error: stripeError,
    confirmPayment,
  } = useStripeElements(clientSecret);

  const [step, setStep] = useState('initiate'); // initiate, payment, confirmation
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Handle payment initiation
  const handleInitiatePayment = async (e) => {
    e?.preventDefault?.();

    const result = await initiatePayment();
    if (result) {
      setStep('payment');
      onPaymentInitiated?.(result);
    }
  };

  // Handle payment confirmation
  const handleConfirmPayment = async (e) => {
    e?.preventDefault?.();

    if (!stripe || !clientSecret) {
      setPaymentError('Payment form not ready. Please try again.');
      return;
    }

    setPaymentError('');
    setPaymentLoading(true);

    try {
      const confirmParams = {};
      if (selectedPaymentMethod) {
        confirmParams.payment_method = selectedPaymentMethod;
      }

      const result = await confirmPayment(clientSecret, {
        ...confirmParams,
      });

      if (result.error) {
        // Handle errors
        setPaymentError(result.error.message || 'Payment confirmation failed');
      } else if (result.paymentIntent) {
        // Success
        if (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'requires_action') {
          setStep('confirmation');
          onSuccess?.({
            transactionId,
            paymentIntent: result.paymentIntent,
          });
        }
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setPaymentError(err.message || 'Failed to confirm payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle closing confirmation
  const handleCloseConfirmation = () => {
    onSuccess?.({
      transactionId,
      completed: true,
    });
  };

  // Show loading while Stripe is initializing
  if (stripeLoading) {
    return <PaymentLoader message="Initializing payment form..." />;
  }

  // Show error if Stripe failed
  if (stripeError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Payment Service Error</h3>
        <p className="text-red-700 text-sm">{stripeError}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Confirmation step
  if (step === 'confirmation' && transactionId) {
    return (
      <PaymentConfirmation
        transactionId={transactionId}
        appointmentId={appointmentId}
        amount={amount}
        currency={currency}
        onClose={handleCloseConfirmation}
      />
    );
  }

  // Payment step - Stripe form
  if (step === 'payment' && clientSecret) {
    return (
      <form onSubmit={handleConfirmPayment} className="space-y-4">
        {/* Stripe Payment Element */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">Payment Method</label>
          <StripePaymentElement
            clientSecret={clientSecret}
            createPaymentElement={createPaymentElement}
            mountPaymentElement={mountPaymentElement}
            cleanup={cleanup}
            loading={stripeLoading}
            error={stripeError}
            containerId="payment-element"
            disabled={paymentLoading}
            onError={(error) => setPaymentError(error)}
            onReady={() => setPaymentError('')}
          />
        </div>

        {/* Error Message */}
        {(paymentError || formError) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{paymentError || formError}</p>
          </div>
        )}

        {/* Amount Display */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">Amount to Pay:</span>
            <span className="text-xl font-bold text-blue-600">
              {currency} {amount?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={paymentLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={paymentLoading || stripeLoading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {paymentLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>💳 Complete Payment</>
            )}
          </button>
        </div>
      </form>
    );
  }

  // Initiation step - Confirm amount and initiate
  return (
    <form onSubmit={handleInitiatePayment} className="space-y-4">
      {/* Amount Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700 font-semibold">Appointment ID:</span>
          <span className="font-mono text-sm text-gray-800">{appointmentId?.substring(0, 8)}...</span>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <span className="text-gray-700 font-semibold">Amount to Pay:</span>
          <span className="text-2xl font-bold text-blue-600">
            {currency} {amount?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{formError}</p>
        </div>
      )}

      {/* Info Message */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm">
          💡 Click "Proceed to Payment" to securely pay for your appointment with Stripe.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={formLoading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {formLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Initializing...
            </>
          ) : (
            <>💳 Proceed to Payment</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;

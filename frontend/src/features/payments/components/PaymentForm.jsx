import React, { useState, useEffect } from 'react';
import { usePaymentForm, useStripeElements } from '../hooks';
import StripePaymentElement from './StripePaymentElement';
import PaymentConfirmation from './PaymentConfirmation';
import PaymentLoader from './PaymentLoader';
import { getStripe } from '../services/stripeService';
import { confirmPayment as confirmPaymentOnBackend } from '../services/paymentService';

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
  appointmentDetails,
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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!toast.show) {
      return;
    }

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  // Handle payment initiation
  const handleInitiatePayment = async (e) => {
    e?.preventDefault?.();

    const result = await initiatePayment();
    if (result) {
      setStep('payment');
      showToast('Payment session initialized successfully.', 'success');
      onPaymentInitiated?.(result);
    } else {
      showToast('Failed to initialize payment session.', 'error');
    }
  };

  // Handle payment confirmation
  const handleConfirmPayment = async (e) => {
    e?.preventDefault?.();

    if (!stripe || !clientSecret) {
      setPaymentError('Payment form not ready. Please try again.');
      showToast('Payment form is not ready yet.', 'error');
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
        showToast(result.error.message || 'Payment confirmation failed.', 'error');
      } else if (result.paymentIntent) {
        // Success
        if (result.paymentIntent.status === 'succeeded' || result.paymentIntent.status === 'requires_action') {
          // Sync the backend so transaction row flips from PENDING → SUCCESS.
          // Pass null for paymentMethodId — Stripe already confirmed the intent,
          // so the backend just needs to retrieve status and update the DB row.
          try {
            await confirmPaymentOnBackend(transactionId, null, appointmentDetails);
          } catch (syncErr) {
            console.warn('Backend confirm sync failed (payment still succeeded at Stripe):', syncErr);
          }
          showToast('Payment completed successfully.', 'success');
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
      showToast(err.message || 'Failed to confirm payment.', 'error');
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
    return (
      <div className="space-y-3">
        {toast.show && (
          <div className={`p-3 rounded-lg text-sm font-semibold ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {toast.message}
          </div>
        )}
        <PaymentLoader message="Initializing payment form..." />
      </div>
    );
  }

  // Show error if Stripe failed
  if (stripeError) {
    return (
      <div className="space-y-3">
        {toast.show && (
          <div className={`p-3 rounded-lg text-sm font-semibold ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {toast.message}
          </div>
        )}
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
        appointmentDetails={appointmentDetails}
        onClose={handleCloseConfirmation}
      />
    );
  }

  // Payment step - Stripe form
  if (step === 'payment' && clientSecret) {
    return (
      <form onSubmit={handleConfirmPayment} className="space-y-4">
        {toast.show && (
          <div className={`p-3 rounded-lg text-sm font-semibold ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            {toast.message}
          </div>
        )}

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
      {toast.show && (
        <div className={`p-3 rounded-lg text-sm font-semibold ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {toast.message}
        </div>
      )}

      {/* Amount Display */}
      <div className="p-4 bg-gray-50 rounded-lg">

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

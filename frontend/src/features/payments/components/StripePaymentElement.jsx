import React, { useEffect, useRef } from 'react';
import PaymentLoader from './PaymentLoader';

/**
 * Stripe Payment Element component
 * Renders Stripe payment form in the DOM
 */
export const StripePaymentElement = ({
  clientSecret,
  createPaymentElement,
  mountPaymentElement,
  cleanup,
  loading = false,
  error = '',
  containerId = 'payment-element',
  disabled = false,
  onError = () => {},
  onReady = () => {},
}) => {
  const elementCreated = useRef(false);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onError, onReady]);

  useEffect(() => {
    const setupPaymentElement = async () => {
      if (!clientSecret || !containerId || !createPaymentElement || !mountPaymentElement) {
        return;
      }

      try {
        // Create payment element
        const element = await createPaymentElement();
        if (element) {
          elementCreated.current = true;
          
          // Mount to DOM
          const mounted = mountPaymentElement(containerId, element);
          if (mounted) {
            onReadyRef.current?.();
          }
        }
      } catch (err) {
        console.error('Payment element setup error:', err);
        onErrorRef.current?.(err.message);
      }
    };

    setupPaymentElement();

    // Cleanup on unmount
    return () => {
      cleanup();
      elementCreated.current = false;
    };
  }, [clientSecret, containerId, createPaymentElement, mountPaymentElement, cleanup]);

  return (
    <div className={`stripe-payment-wrapper ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {loading && <PaymentLoader message="Loading payment form..." />}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-3">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}
      <div id={containerId} className="stripe-payment-element"></div>
    </div>
  );
};

export default StripePaymentElement;

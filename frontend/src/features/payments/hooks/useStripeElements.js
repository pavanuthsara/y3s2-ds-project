import { useState, useCallback, useEffect, useRef } from 'react';
import { getStripe, initializeStripeElements } from '../services/stripeService';

/**
 * Custom hook for managing Stripe Elements
 */
export const useStripeElements = (clientSecret) => {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentElement, setPaymentElement] = useState(null);
  const paymentElementRef = useRef(null);

  /**
   * Initialize Stripe and Elements
   */
  useEffect(() => {
    const initializeStripe = async () => {
      if (!clientSecret) {
        if (paymentElementRef.current) {
          try {
            paymentElementRef.current.unmount();
          } catch (e) {
            // Ignore double-unmount/destroyed element errors.
          }
          paymentElementRef.current = null;
          setPaymentElement(null);
        }
        setElements(null);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const stripeInstance = await getStripe();
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }

        const elementsInstance = await initializeStripeElements(stripeInstance, clientSecret);
        if (!elementsInstance) {
          throw new Error('Failed to initialize Elements');
        }

        setStripe(stripeInstance);
        setElements(elementsInstance);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError(err.message || 'Failed to initialize payment form');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, [clientSecret]);

  /**
   * Create payment element
   */
  const createPaymentElement = useCallback(
    async (options = {}) => {
      if (!elements) {
        return null;
      }

      if (paymentElementRef.current) {
        return paymentElementRef.current;
      }

      try {
        const paymentElementInstance = elements.create('payment', {
          ...options,
        });

        paymentElementRef.current = paymentElementInstance;
        setPaymentElement(paymentElementInstance);
        return paymentElementInstance;
      } catch (err) {
        console.error('Error creating payment element:', err);
        throw new Error('Failed to create payment element');
      }
    },
    [elements]
  );

  /**
   * Mount payment element to DOM
   */
  const mountPaymentElement = useCallback(
    (elementId, elementToMount = paymentElementRef.current) => {
      if (!elementToMount) {
        return false;
      }

      try {
        const container = document.getElementById(elementId);
        if (!container) {
          throw new Error(`Container with id '${elementId}' not found`);
        }

        if (!container.hasChildNodes()) {
          elementToMount.mount(`#${elementId}`);
        }
        return true;
      } catch (err) {
        console.error('Error mounting payment element:', err);
        return false;
      }
    },
    []
  );

  /**
   * Confirm payment with Stripe
   */
  const confirmPayment = useCallback(
    async (clientSecret, data = {}) => {
      if (!stripe || !elements) {
        throw new Error('Stripe not initialized');
      }

      try {
        // Stripe requires submit() before confirmPayment() for deferred flows.
        const submitResult = await elements.submit();
        if (submitResult?.error) {
          throw new Error(submitResult.error.message || 'Payment form validation failed');
        }

        const result = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/patient/payments`,
            ...data,
          },
          redirect: 'if_required',
        });

        return result;
      } catch (err) {
        console.error('Payment confirmation error:', err);
        throw new Error(err.message || 'Payment failed');
      }
    },
    [stripe, elements]
  );

  /**
   * Get payment element status
   */
  const getPaymentElementStatus = useCallback(async () => {
    if (!elements) {
      return null;
    }

    try {
      return await elements.submit();
    } catch (err) {
      console.error('Error getting payment element status:', err);
      return null;
    }
  }, [elements]);

  /**
   * Unmount and cleanup
   */
  const cleanup = useCallback(() => {
    if (paymentElementRef.current) {
      try {
        paymentElementRef.current.unmount();
      } catch (e) {
        // Ignore already-destroyed or already-unmounted errors.
      }
      paymentElementRef.current = null;
      setPaymentElement(null);
    }
  }, []);

  return {
    stripe,
    elements,
    paymentElement,
    loading,
    error,
    createPaymentElement,
    mountPaymentElement,
    confirmPayment,
    getPaymentElementStatus,
    cleanup,
  };
};

export default useStripeElements;

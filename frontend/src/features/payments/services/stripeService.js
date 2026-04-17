import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

/**
 * Get or create Stripe instance
 * Uses publishable key from environment variable
 */
export const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found in environment variables');
      throw new Error('Stripe configuration error: Missing VITE_STRIPE_PUBLISHABLE_KEY');
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Initialize Stripe Elements with clientSecret
 */
export const initializeStripeElements = async (stripe, clientSecret) => {
  if (!stripe) {
    throw new Error('Stripe instance is required');
  }

  if (!clientSecret) {
    throw new Error('clientSecret is required to initialize payment elements');
  }

  try {
    return stripe.elements({
      clientSecret: clientSecret,
    });
  } catch (error) {
    console.error('Error initializing Stripe Elements:', error);
    throw new Error('Failed to initialize payment form');
  }
};

export default {
  getStripe,
  initializeStripeElements,
};

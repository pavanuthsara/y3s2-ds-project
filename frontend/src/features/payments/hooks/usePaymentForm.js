import { useState, useCallback } from 'react';
import * as paymentService from '../services/paymentService';

/**
 * Custom hook for managing payment form state and logic
 */
export const usePaymentForm = (appointmentId, patientId, amount, currency = 'LKR') => {
  const [formData, setFormData] = useState({
    amount,
    currency,
    appointmentId,
    patientId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  /**
   * Validate form data
   */
  const validateForm = useCallback(() => {
    const errors = [];

    if (!formData.appointmentId) {
      errors.push('Appointment ID is required');
    }

    if (!formData.patientId) {
      errors.push('Patient ID is required');
    }

    if (!formData.amount || formData.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!formData.currency) {
      errors.push('Currency is required');
    }

    return errors;
  }, [formData]);

  /**
   * Initiate payment
   */
  const initiatePayment = useCallback(async () => {
    setError('');
    setSuccess(false);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return null;
    }

    setLoading(true);

    try {
      const response = await paymentService.initiatePayment(
        formData.appointmentId,
        formData.patientId,
        formData.amount,
        formData.currency
      );

      setTransactionId(response.transactionId);
      setClientSecret(response.clientSecret);
      setSuccess(true);

      return {
        transactionId: response.transactionId,
        clientSecret: response.clientSecret,
        amount: response.amount,
        currency: response.currency,
      };
    } catch (err) {
      const errorMessage = err.message || 'Failed to initiate payment';
      setError(errorMessage);
      console.error('Payment initiation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  /**
   * Update form field
   */
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({
      amount,
      currency,
      appointmentId,
      patientId,
    });
    setLoading(false);
    setError('');
    setSuccess(false);
    setTransactionId(null);
    setClientSecret(null);
  }, [amount, currency, appointmentId, patientId]);

  return {
    formData,
    loading,
    error,
    success,
    transactionId,
    clientSecret,
    updateField,
    initiatePayment,
    resetForm,
    validateForm,
  };
};

export default usePaymentForm;

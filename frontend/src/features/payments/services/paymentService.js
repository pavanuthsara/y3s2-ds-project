import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8086';
const PAYMENT_API = `${PAYMENT_SERVICE_URL}/api/payments`;

/**
 * Create axios instance with auth headers
 */
const createPaymentAPI = () => {
  return axios.create({
    baseURL: PAYMENT_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Add auth headers from localStorage
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(userId && { 'X-User-Id': userId }),
    ...(userRole && { 'X-User-Role': userRole }),
  };
};

/**
 * Initiate a new payment for an appointment
 * POST /api/payments/initiate
 */
export const initiatePayment = async (appointmentId, patientId, amount, currency = 'LKR') => {
  try {
    const patientEmail =
      localStorage.getItem('email') ||
      JSON.parse(localStorage.getItem('patientSession') || '{}').email ||
      null;

    const response = await axios.post(
      `${PAYMENT_API}/initiate`,
      {
        appointmentId,
        patientId,
        patientEmail,
        amount,
        currency,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw {
      message: error.response?.data?.error || 'Failed to initiate payment',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Confirm payment after customer completes payment gateway
 * POST /api/payments/confirm
 */
export const confirmPayment = async (transactionId, paymentMethodId) => {
  try {
    const response = await axios.post(
      `${PAYMENT_API}/confirm`,
      {
        transactionId,
        paymentMethodId,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw {
      message: error.response?.data?.error || 'Failed to confirm payment',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Get transaction details
 * GET /api/payments/transaction/{id}
 */
export const getTransaction = async (transactionId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_API}/transaction/${transactionId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw {
      message: error.response?.data?.error || 'Failed to fetch transaction',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Get patient transaction history
 * GET /api/payments/patient/{patientId}/history
 */
export const getPatientHistory = async (patientId) => {
  try {
    const response = await axios.get(
      `${PAYMENT_API}/patient/${patientId}/history`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('Error fetching patient transaction history:', error);
    throw {
      message: error.response?.data?.error || 'Failed to fetch transaction history',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Refund a transaction
 * POST /api/payments/refund/{transactionId}
 */
export const refundTransaction = async (transactionId) => {
  try {
    const response = await axios.post(
      `${PAYMENT_API}/refund/${transactionId}`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw {
      message: error.response?.data?.error || 'Failed to process refund',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Get all transactions (Admin endpoint)
 * GET /api/payments/admin/all
 */
export const getAllTransactions = async () => {
  try {
    const response = await axios.get(
      `${PAYMENT_API}/admin/all`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw {
      message: error.response?.data?.error || 'Failed to fetch transactions',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Get transaction by appointment ID
 * GET /api/payments/transaction/{appointmentId}
 */
export const getTransactionByAppointment = async (appointmentId) => {
  try {
    // Check existing transactions for this appointment
    // Note: This would need a backend endpoint or we fetch from history
    const response = await axios.get(
      `${PAYMENT_API}/appointment/${appointmentId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    // If endpoint doesn't exist, return null
    if (error.response?.status === 404) {
      return null;
    }

    console.error('Error fetching transaction by appointment:', error);
    throw {
      message: error.response?.data?.error || 'Failed to fetch transaction',
      status: error.response?.status,
      details: error.response?.data,
    };
  }
};

/**
 * Check payment service health
 * GET /api/payments/health
 */
export const checkPaymentServiceHealth = async () => {
  try {
    const response = await axios.get(`${PAYMENT_API}/health`);
    return response.data;
  } catch (error) {
    console.error('Payment service health check failed:', error);
    return { status: 'unavailable' };
  }
};

export default {
  initiatePayment,
  confirmPayment,
  getTransaction,
  getPatientHistory,
  refundTransaction,
  getAllTransactions,
  getTransactionByAppointment,
  checkPaymentServiceHealth,
};

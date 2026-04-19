import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/appointments';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Create axios instance with auth headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const appointmentService = {
  // Book a new appointment
  createAppointment: async (appointmentData) => {
    try {
      const response = await apiClient.post('', appointmentData);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data || {};
      throw {
        status,
        message: data.message || 'Failed to book appointment',
        timestamp: data.timestamp,
      };
    }
  },

  // Get single appointment by ID
  getAppointmentById: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch appointment' };
    }
  },

  // Get all appointments for a patient
  getPatientAppointments: async (patientId) => {
    try {
      const response = await apiClient.get(`/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch appointments' };
    }
  },

  // Get all appointments for a doctor
  getDoctorAppointments: async (doctorUsername) => {
    try {
      const response = await apiClient.get(`/doctor/${doctorUsername}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch appointments' };
    }
  },

  // Get all appointments (admin)
  getAllAppointments: async () => {
    try {
      const response = await apiClient.get('');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch appointments' };
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      const response = await apiClient.put(`/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update appointment status' };
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    try {
      await apiClient.delete(`/${appointmentId}`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel appointment' };
    }
  },
};

export default appointmentService;

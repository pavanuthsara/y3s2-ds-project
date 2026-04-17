import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/doctors';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const normalizeDoctor = (doctor = {}) => ({
  ...doctor,
  specialization: doctor.specialization || doctor.specialty || 'General',
  phone: doctor.phone || doctor.phoneNumber || '',
  email: doctor.email || '',
  yearsOfExperience: doctor.yearsOfExperience || 0,
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get all doctors with their profiles
 * @returns {Promise<Array>} Array of doctor profiles
 */
export const getAllDoctors = async () => {
  try {
    const response = await apiClient.get('');
    return (response.data || []).map(normalizeDoctor);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
  }
};

/**
 * Get specific doctor profile
 * @param {string} doctorUsername - Username of the doctor
 * @returns {Promise<Object>} Doctor profile object
 */
export const getDoctorProfile = async (doctorUsername) => {
  try {
    const response = await apiClient.get(`/${doctorUsername}/profile`);
    return normalizeDoctor(response.data);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch doctor profile');
  }
};

/**
 * Get doctors by specialization
 * @param {string} specialization - Specialization filter
 * @returns {Promise<Array>} Filtered doctors
 */
export const getDoctorsBySpecialization = async (specialization) => {
  try {
    const allDoctors = await getAllDoctors();
    return allDoctors.filter(
      (doctor) =>
        doctor.specialization &&
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  } catch (error) {
    console.error('Error filtering doctors:', error);
    throw error;
  }
};

export default {
  getAllDoctors,
  getDoctorProfile,
  getDoctorsBySpecialization,
};

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/doctors/availability';

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

const normalizeSlot = (slot = {}) => ({
  ...slot,
  slotId: slot.slotId || slot.id || '',
  isActive: slot.isActive ?? slot.active ?? true,
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
 * Get all available doctor slots
 * @returns {Promise<Array>} Array of availability slots
 */
export const getAllSlots = async () => {
  try {
    const response = await apiClient.get('/all');
    return (response.data || []).map(normalizeSlot);
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch availability slots');
  }
};

/**
 * Group slots by doctor username
 * @param {Array} slots - Array of slot objects
 * @returns {Object} Slots grouped by doctorUsername
 */
export const groupSlotsByDoctor = (slots) => {
  return slots.reduce((grouped, slot) => {
    const doctor = slot.doctorUsername;
    if (!grouped[doctor]) {
      grouped[doctor] = [];
    }
    grouped[doctor].push(slot);
    return grouped;
  }, {});
};

/**
 * Group slots by day of week within a doctor's slots
 * @param {Array} slots - Array of slot objects for a specific doctor
 * @returns {Object} Slots grouped by dayOfWeek
 */
export const groupSlotsByDay = (slots) => {
  return slots.reduce((grouped, slot) => {
    const day = slot.dayOfWeek;
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(slot);
    return grouped;
  }, {});
};

/**
 * Filter active slots only
 * @param {Array} slots - Array of slot objects
 * @returns {Array} Filtered active slots
 */
export const filterActiveSlots = (slots) => {
  return slots.filter((slot) => slot.isActive === true);
};

/**
 * Get slots for a specific doctor
 * @param {string} doctorUsername - Username of the doctor
 * @param {Array} allSlots - All available slots
 * @returns {Object} Slots grouped by day for the doctor
 */
export const getSlotsByDoctorAndDay = (doctorUsername, allSlots) => {
  const doctorSlots = allSlots.filter((slot) => slot.doctorUsername === doctorUsername);
  const activeSlots = filterActiveSlots(doctorSlots);
  return groupSlotsByDay(activeSlots);
};

/**
 * Format time string (e.g., "09:00" -> "9:00 AM")
 * @param {string} time - Time in HH:mm format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Get day display name
 * @param {string} dayOfWeek - Day name (e.g., "MONDAY")
 * @returns {string} Formatted day name
 */
export const getDayDisplayName = (dayOfWeek) => {
  if (!dayOfWeek) return '';
  return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();
};

/**
 * Sort slots by start time
 * @param {Array} slots - Array of slot objects
 * @returns {Array} Sorted slots
 */
export const sortSlotsByTime = (slots) => {
  return [...slots].sort((a, b) => {
    const timeA = a.startTime.split(':').join('');
    const timeB = b.startTime.split(':').join('');
    return parseInt(timeA, 10) - parseInt(timeB, 10);
  });
};

export default {
  getAllSlots,
  groupSlotsByDoctor,
  groupSlotsByDay,
  filterActiveSlots,
  getSlotsByDoctorAndDay,
  formatTime,
  getDayDisplayName,
  sortSlotsByTime,
};

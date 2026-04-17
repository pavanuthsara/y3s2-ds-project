const API_BASE_URL = 'http://localhost:8082/api';

// Storage for auth token
const TOKEN_KEY = 'authToken';
const LEGACY_TOKEN_KEY = 'patientToken';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};
const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

// Auth headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// **AUTH ENDPOINTS**
export const authAPI = {
  register: async (username, email, password, firstName, lastName) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName,
        role: 'PATIENT',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    return data;
  },

  login: async (username, password) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    setToken(data.token);
    return data;
  },

  logout: () => {
    clearToken();
  },
};

// **PATIENT PROFILE ENDPOINTS**
export const patientAPI = {
  getMyProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/patients/me`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return response.json();
  },

  createProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create profile');
    }
    
    return response.json();
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/patients/me`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    return response.json();
  },
};

// **MEDICAL REPORTS ENDPOINTS**
export const reportsAPI = {
  uploadReport: async (patientId, file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }
    
    return response.json();
  },

  getReports: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch reports');
    }
    
    return response.json();
  },

  getReport: async (patientId, reportId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports/${reportId}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch report');
    }
    
    return response.json();
  },

  deleteReport: async (patientId, reportId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/reports/${reportId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete report');
    }
    
    return { success: true };
  },
};

export const prescriptionsAPI = {
  getPrescriptions: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${encodeURIComponent(patientId)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch prescriptions');
    }

    return response.json();
  },
};

export const isLoggedIn = () => !!getToken();

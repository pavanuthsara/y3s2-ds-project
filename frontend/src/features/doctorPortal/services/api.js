const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';
const TOKEN_KEY = 'authToken';
const DOCTOR_SESSION_KEY = 'doctorSession';

function parseErrorPayload(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload);
      return parsed?.message || fallbackMessage;
    } catch {
      return payload;
    }
  }

  return payload.message || fallbackMessage;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      try {
        payload = await response.text();
      } catch {
        payload = null;
      }
    }

    const error = new Error(parseErrorPayload(payload, `Request failed with status ${response.status}`));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function setDoctorSession(session) {
  localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(session));
}

function clearDoctorSession() {
  localStorage.removeItem(DOCTOR_SESSION_KEY);
}

function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function normalizeDoctorProfile(profile = {}) {
  return {
    bio: profile.bio || '',
    consultationFee: profile.consultationFee ?? '',
    createdAt: profile.createdAt || '',
    doctorUsername: profile.doctorUsername || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phoneNumber || '',
    profilePhoto: profile.profilePhoto || '',
    qualifications: profile.qualifications || '',
    rating: profile.rating ?? 0,
    specialty: profile.specialty || '',
    updatedAt: profile.updatedAt || '',
    verified: Boolean(profile.verified),
  };
}

function persistDoctorAuth(data) {
  if (data.role !== 'DOCTOR') {
    clearToken();
    clearDoctorSession();
    throw new Error('This account is not a doctor account.');
  }

  setToken(data.token);
  const session = {
    email: data.email,
    role: data.role,
    username: data.username,
  };
  setDoctorSession(session);
  return session;
}

export const doctorAuthAPI = {
  async register(form) {
    const data = await request('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({
        ...form,
        role: 'DOCTOR',
      }),
    });

    return persistDoctorAuth(data);
  },

  async login(form) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(form),
    });

    return persistDoctorAuth(data);
  },

  logout() {
    clearToken();
    clearDoctorSession();
  },
};

export const doctorProfileAPI = {
  async getOwnProfile() {
    try {
      const data = await request('/api/doctors/profile', {
        method: 'GET',
        headers: getHeaders(true),
      });
      return normalizeDoctorProfile(data);
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async upsertOwnProfile(profile) {
    const payload = {
      ...profile,
      consultationFee: profile.consultationFee === '' ? null : Number(profile.consultationFee),
    };

    const data = await request('/api/doctors/profile', {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    return normalizeDoctorProfile(data);
  },
};

export const doctorPrescriptionAPI = {
  async createPrescription(prescription) {
    return request('/api/prescriptions', {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(prescription),
    });
  },

  async getPrescriptionsByPatientId(patientId) {
    return request(`/api/prescriptions/patient/${encodeURIComponent(patientId)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
  },
};

export const doctorAppointmentsAPI = {
  async getDoctorAppointments(doctorUsername) {
    return request(`/api/appointments/doctor/${encodeURIComponent(doctorUsername)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
  },
};

export function getStoredDoctorSession() {
  const rawSession = localStorage.getItem(DOCTOR_SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);
    if (session?.role !== 'DOCTOR' || !getToken()) {
      clearDoctorSession();
      return null;
    }
    return session;
  } catch {
    clearDoctorSession();
    return null;
  }
}

export function isDoctorLoggedIn() {
  return Boolean(getStoredDoctorSession());
}

export function getDoctorAuthHeader() {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
}

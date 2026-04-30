const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";
const TELEMEDICINE_BASE_URL = `${API_BASE_URL}/api/telemedicine`;

function getAuthToken() {
  return localStorage.getItem("authToken");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${TELEMEDICINE_BASE_URL}${path}`, {
    ...options,
    headers,
  });

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

    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const telemedicineAPI = {
  async getSessionByAppointment(appointmentId) {
    try {
      return await request(
        `/session/appointment/${encodeURIComponent(appointmentId)}`,
        {
          method: "GET",
        },
      );
    } catch (error) {
      if (
        error.status === 404 ||
        (error.status === 400 &&
          String(error.message || "").includes("No telemedicine session found"))
      ) {
        return null;
      }
      throw error;
    }
  },

  async createSession(appointmentId, tokenTtlSeconds = null) {
    return request("/session/create", {
      method: "POST",
      body: JSON.stringify({
        appointmentId,
        ...(tokenTtlSeconds ? { tokenTtlSeconds } : {}),
      }),
    });
  },

  async ensureSession(appointmentId) {
    const existingSession = await this.getSessionByAppointment(appointmentId);
    if (existingSession) {
      return existingSession;
    }

    return this.createSession(appointmentId);
  },

  async getSessionToken(sessionId) {
    return request(`/session/${sessionId}/token`, {
      method: "GET",
    });
  },

  async startSession(sessionId) {
    return request(`/session/${sessionId}/start`, {
      method: "PUT",
    });
  },

  async endSession(sessionId) {
    return request(`/session/${sessionId}/end`, {
      method: "PUT",
    });
  },
};

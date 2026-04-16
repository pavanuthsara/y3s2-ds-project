const API_BASE_URL = "http://localhost:8080";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function registerPatientAccount(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: {
      ...payload,
      role: "PATIENT",
    },
  });
}

export function loginPatientAccount(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getMyPatientProfile(token) {
  return request("/api/patients/me", { token });
}

export function createMyPatientProfile(token, payload) {
  return request("/api/patients", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateMyPatientProfile(token, payload) {
  return request("/api/patients/me", {
    method: "PUT",
    token,
    body: payload,
  });
}

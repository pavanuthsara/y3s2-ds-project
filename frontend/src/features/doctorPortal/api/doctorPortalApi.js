const DOCTOR_BASE_URL =
  import.meta.env.VITE_DOCTOR_SERVICE_URL?.replace(/\/$/, "") || "/doctor-service";
const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL?.replace(/\/$/, "") || "/api/auth";

import { getDoctorSession } from "../auth/doctorSession";

function buildHeaders(userContext, hasBody = false) {
  const session = getDoctorSession();

  const headers = {
    "X-User-Id": userContext?.userId || session?.userId || "",
    "X-User-Role": userContext?.userRole || session?.userRole || "",
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = await response.json();
      if (errorPayload?.message) {
        message = errorPayload.message;
      }
    } catch {
      // Keep fallback message when parsing fails.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function loginDoctor(credentials) {
  return request(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function registerDoctor(payload) {
  return request(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function upsertDoctorProfile(userContext, doctorUsername, payload) {
  return request(`${DOCTOR_BASE_URL}/api/doctors/${doctorUsername}/profile`, {
    method: "PUT",
    headers: buildHeaders(userContext, true),
    body: JSON.stringify(payload),
  });
}

export function getDoctorAppointments(userContext, doctorUsername) {
  return request(`${DOCTOR_BASE_URL}/api/doctors/${doctorUsername}/appointments`, {
    method: "GET",
    headers: buildHeaders(userContext),
  });
}

export function acceptDoctorAppointment(userContext, appointmentId) {
  return request(`${DOCTOR_BASE_URL}/api/appointments/${appointmentId}/accept`, {
    method: "PUT",
    headers: buildHeaders(userContext),
  });
}

export function rejectDoctorAppointment(userContext, appointmentId) {
  return request(`${DOCTOR_BASE_URL}/api/appointments/${appointmentId}/reject`, {
    method: "PUT",
    headers: buildHeaders(userContext),
  });
}

export function createDoctorPrescription(userContext, payload) {
  return request(`${DOCTOR_BASE_URL}/api/prescriptions`, {
    method: "POST",
    headers: buildHeaders(userContext, true),
    body: JSON.stringify(payload),
  });
}

export function getPatientReports(userContext, doctorUsername, patientId) {
  return request(`${DOCTOR_BASE_URL}/api/doctors/${doctorUsername}/patients/${patientId}/reports`, {
    method: "GET",
    headers: buildHeaders(userContext),
  });
}

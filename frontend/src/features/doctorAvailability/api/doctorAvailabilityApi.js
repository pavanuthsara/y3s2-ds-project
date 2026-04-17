const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';

function buildHeaders(hasBody = false) {
  const headers = {};
  const token = localStorage.getItem('authToken');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = await response.json();
      if (errorPayload?.message) {
        message = errorPayload.message;
      }
    } catch {
      // Ignore JSON parsing errors and keep fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getDoctorAvailability() {
  return request('/api/doctors/availability', {
    method: 'GET',
    headers: buildHeaders(),
  });
}

export function addDoctorAvailabilitySlot(slot) {
  return request('/api/doctors/availability/slots', {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(slot),
  });
}

export function replaceDoctorAvailability(slots) {
  return request('/api/doctors/availability', {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify({ slots }),
  });
}

export function deleteDoctorAvailabilitySlot(slotId) {
  return request(`/api/doctors/availability/slots/${slotId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
}

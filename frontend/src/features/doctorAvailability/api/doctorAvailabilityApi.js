const API_BASE_URL =
  import.meta.env.VITE_DOCTOR_SERVICE_URL?.replace(/\/$/, "") || "/doctor-service";

function buildHeaders(userContext, hasBody = false) {
  const headers = {
    "X-User-Id": userContext.userId,
    "X-User-Role": userContext.userRole,
  };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
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

export function getDoctorAvailability(userContext) {
  return request("/api/doctors/availability", {
    method: "GET",
    headers: buildHeaders(userContext),
  });
}

export function addDoctorAvailabilitySlot(userContext, slot) {
  return request("/api/doctors/availability/slots", {
    method: "POST",
    headers: buildHeaders(userContext, true),
    body: JSON.stringify(slot),
  });
}

export function replaceDoctorAvailability(userContext, slots) {
  return request("/api/doctors/availability", {
    method: "PUT",
    headers: buildHeaders(userContext, true),
    body: JSON.stringify({ slots }),
  });
}

export function deleteDoctorAvailabilitySlot(userContext, slotId) {
  return request(`/api/doctors/availability/slots/${slotId}`, {
    method: "DELETE",
    headers: buildHeaders(userContext),
  });
}

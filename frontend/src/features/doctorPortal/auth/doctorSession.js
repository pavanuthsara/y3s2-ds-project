const STORAGE_KEY = "doctorPortalSession";

export function saveDoctorSession(session) {
  if (!session) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getDoctorSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.userId || !parsed?.userRole) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearDoctorSession() {
  localStorage.removeItem(STORAGE_KEY);
}

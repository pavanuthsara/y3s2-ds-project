import { useState, useEffect } from "react";
import { PatientAuth } from "../components/PatientAuth";
import { createProfileFormState } from "../components/PatientProfileForm";
import PatientWorkspace from "../components/PatientWorkspace";
import appointmentService from "../../appointments/services/appointmentService";
import { authAPI, isLoggedIn, patientAPI } from "../services/api";

export function PatientPortal() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState(createProfileFormState(null));
  const [profileFormBusy, setProfileFormBusy] = useState(false);
  const [profileFormError, setProfileFormError] = useState("");
  const [profileFormMessage, setProfileFormMessage] = useState("");
  const [refreshReports, setRefreshReports] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    const savedSession = localStorage.getItem("patientSession");
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) {
        setProfile(null);
        setProfileError("");
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError("");

      try {
        const data = await patientAPI.getMyProfile();
        setProfile(data);
      } catch (err) {
        setProfile(null);
        setProfileError(
          err.status === 404
            ? ""
            : err.message || "Failed to load patient profile",
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    setProfileForm(createProfileFormState(profile));
    setProfileFormError("");
    setProfileFormMessage("");
  }, [profile]);

  const handleLoginSuccess = (result) => {
    const sessionData = {
      username: result.username,
      email: result.email,
      role: result.role,
    };

    setSession(sessionData);
    localStorage.setItem("patientSession", JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    authAPI.logout();
    setSession(null);
    setProfile(null);
    setProfileError("");
    setProfileLoading(false);
    setProfileForm(createProfileFormState(null));
    setProfileFormBusy(false);
    setProfileFormError("");
    setProfileFormMessage("");
    localStorage.removeItem("patientSession");
    setActiveTab("dashboard");
  };

  const handleUploadSuccess = () => {
    setRefreshReports((prev) => prev + 1);
  };

  const handleAppointmentBooking = async (data) => {
    return appointmentService.createAppointment({
      ...data,
      slotId: data.slotId,
    });
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileFormBusy(true);
    setProfileFormError("");
    setProfileFormMessage("");

    try {
      const savedProfile = profile
        ? await patientAPI.updateProfile(profileForm)
        : await patientAPI.createProfile(profileForm);

      setProfile(savedProfile);
      setProfileFormMessage(
        profile
          ? "Profile updated successfully."
          : "Profile created successfully.",
      );
    } catch (err) {
      setProfileFormError(err.message || "Failed to save profile");
    } finally {
      setProfileFormBusy(false);
    }
  };

  if (!session) {
    return <PatientAuth onLoginSuccess={handleLoginSuccess} />;
  }

  const patientProfileId = profile?.id ?? null;
  const appointmentPatientId = profile?.username || session.username;

  return (
    <PatientWorkspace
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      session={session}
      profile={profile}
      profileLoading={profileLoading}
      profileError={profileError}
      profileForm={profileForm}
      onProfileChange={handleProfileFormChange}
      onProfileSubmit={handleProfileSubmit}
      profileBusy={profileFormBusy}
      profileFormError={profileFormError}
      profileFormMessage={profileFormMessage}
      patientProfileId={patientProfileId}
      appointmentPatientId={appointmentPatientId}
      refreshReports={refreshReports}
      onUploadSuccess={handleUploadSuccess}
      onAppointmentBooking={handleAppointmentBooking}
    />
  );
}

export default PatientPortal;

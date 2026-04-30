import { useState, useEffect } from "react";
import { PatientAuth } from "../components/PatientAuth";
import { PatientHistoryPanel } from "../components/PatientHistoryPanel";
import {
  PatientProfileForm,
  createProfileFormState,
} from "../components/PatientProfileForm";
import { PatientPrescriptionsPanel } from "../components/PatientPrescriptionsPanel";
import { FileUpload } from "../components/FileUpload";
import { FileList } from "../components/FileList";
import { SymptomCheckerPanel } from "../components/SymptomCheckerPanel";
import AppointmentBookingForm from "../../appointments/components/AppointmentBookingForm";
import AppointmentHistoryPage from "../../appointments/pages/AppointmentHistoryPage";
import { TransactionHistory } from "../../payments/components";
import appointmentService from "../../appointments/services/appointmentService";
import { authAPI, isLoggedIn, patientAPI } from "../services/api";
import {
  UserIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CreditCardIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { id: "profile",          label: "My Profile",         icon: UserIcon },
  { id: "files",            label: "Files & Reports",    icon: FolderIcon },
  { id: "history",          label: "Health History",     icon: ClipboardDocumentListIcon },
  { id: "prescriptions",    label: "Prescriptions",      icon: DocumentTextIcon },
  { id: "book-appointment", label: "Book Appointment",   icon: CalendarDaysIcon },
  { id: "my-appointments",  label: "My Appointments",    icon: CalendarIcon },
  { id: "payments",         label: "Payments",           icon: CreditCardIcon },
  { id: "symptom-checker",  label: "AI Symptom Checker", icon: SparklesIcon },
];

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
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return;
    const savedSession = localStorage.getItem("patientSession");
    if (savedSession) setSession(JSON.parse(savedSession));
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
          err.status === 404 ? "" : err.message || "Failed to load patient profile"
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
    setActiveTab("profile");
  };

  const handleUploadSuccess = () => setRefreshReports((prev) => prev + 1);

  const handleAppointmentBooking = async (data) =>
    appointmentService.createAppointment({ ...data, slotId: data.slotId });

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
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
        profile ? "Profile updated successfully." : "Profile created successfully."
      );
    } catch (err) {
      setProfileFormError(err.message || "Failed to save profile");
    } finally {
      setProfileFormBusy(false);
    }
  };

  if (!session) return <PatientAuth onLoginSuccess={handleLoginSuccess} />;

  const patientProfileId = profile?.id ?? null;
  const appointmentPatientId = profile?.username || session.username;
  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : session.username;
  const activeNavItem = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col transition-transform duration-300
          lg:sticky lg:top-4 lg:self-start lg:h-[calc(100vh-2rem)] lg:translate-x-0 lg:shadow-sm lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* User header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate text-sm">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{session.email}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Patient
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Patient Portal
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    setActiveTab(id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                    ${activeTab === id
                      ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-5 h-5 text-slate-600" />
          </button>
          <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            {activeNavItem && <activeNavItem.icon className="w-5 h-5 text-slate-500" />}
            {activeNavItem?.label ?? "Patient Portal"}
          </span>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {activeNavItem && <activeNavItem.icon className="w-7 h-7 text-slate-500" />}
              {activeNavItem?.label}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back,{" "}
              <span className="font-medium text-slate-700">{displayName}</span>
            </p>
          </div>

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {profileLoading && (
                <div className="text-sm text-slate-500">Loading profile...</div>
              )}
              {/* Summary card */}
              {profile && !profileLoading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-700 mb-4">Profile Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Full Name", value: `${profile.firstName} ${profile.lastName}` },
                      { label: "Username", value: profile.username || session.username },
                      { label: "Email", value: session.email },
                      { label: "Phone", value: profile.phone || "Not provided" },
                      { label: "Date of Birth", value: profile.dateOfBirth || "Not provided" },
                      { label: "Address", value: profile.address || "Not provided" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {profileError}
                </div>
              )}
              {/* Edit form */}
              <PatientProfileForm
                profile={profile}
                form={profileForm}
                busy={profileFormBusy}
                error={profileFormError}
                message={profileFormMessage}
                onChange={handleProfileFormChange}
                onSubmit={handleProfileSubmit}
              />
            </div>
          )}

          {/* ── Files tab ── */}
          {activeTab === "files" && (
            patientProfileId ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FileUpload patientId={patientProfileId} onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="lg:col-span-2">
                  <FileList patientId={patientProfileId} refreshTrigger={refreshReports} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-slate-600 text-sm shadow-sm">
                {profileLoading
                  ? "Loading your patient profile securely..."
                  : "Please complete your profile first to upload and manage reports."}
              </div>
            )
          )}

          {/* ── History tab ── */}
          {activeTab === "history" && (
            <PatientHistoryPanel patientId={patientProfileId} />
          )}

          {/* ── Prescriptions tab ── */}
          {activeTab === "prescriptions" && (
            <PatientPrescriptionsPanel patientId={patientProfileId} />
          )}

          {/* ── Book Appointment tab ── */}
          {activeTab === "book-appointment" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <AppointmentBookingForm
                onSubmit={handleAppointmentBooking}
                patientIdFromSession={appointmentPatientId}
              />
            </div>
          )}

          {/* ── My Appointments tab ── */}
          {activeTab === "my-appointments" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <AppointmentHistoryPage patientIdFromSession={appointmentPatientId} />
            </div>
          )}

          {/* ── Payments tab ── */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <TransactionHistory
                patientId={appointmentPatientId}
                showActions={true}
                title="Your Payment History"
                onViewDetails={(txn) => console.log("View transaction:", txn)}
                onRefund={(txn) => console.log("Refund transaction:", txn)}
              />
            </div>
          )}

          {/* ── AI Symptom Checker tab ── */}
          {activeTab === "symptom-checker" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <SymptomCheckerPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PatientPortal;

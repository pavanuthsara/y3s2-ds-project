import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import DoctorAuthPage from "../components/DoctorAuthPage";
import DoctorAvailabilityPage from "../../doctorAvailability/pages/DoctorAvailabilityPage";
import DoctorAppointmentsPanel from "../components/DoctorAppointmentsPanel";
import DoctorProfilePanel, { EMPTY_DOCTOR_PROFILE } from "../components/DoctorProfilePanel";
import DoctorPrescriptionsPanel from "../components/DoctorPrescriptionsPanel";
import {
  doctorAuthAPI,
  doctorProfileAPI,
  getStoredDoctorSession,
  isDoctorLoggedIn,
} from "../services/api";
import {
  UserIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { id: "profile",       label: "My Profile",     icon: UserIcon },
  { id: "availability",  label: "Availability",   icon: ClockIcon },
  { id: "appointments",  label: "Appointments",   icon: CalendarDaysIcon },
  { id: "prescriptions", label: "Prescriptions",  icon: DocumentTextIcon },
];

function DoctorPortal({ initialTab = "profile" }) {
  const [session, setSession] = useState(getStoredDoctorSession());
  const [activeTab, setActiveTab] = useState(initialTab);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_DOCTOR_PROFILE);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [bootstrapping, setBootstrapping] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!isDoctorLoggedIn()) {
        if (!cancelled) setBootstrapping(false);
        return;
      }
      try {
        const nextProfile = await doctorProfileAPI.getOwnProfile();
        if (cancelled) return;
        setProfile(nextProfile);
        setProfileForm(nextProfile || EMPTY_DOCTOR_PROFILE);
      } catch (error) {
        if (!cancelled) setProfileError(error.message);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [session]);

  const handleAuthSuccess = (nextSession) => {
    setSession(nextSession);
    setAuthError("");
    setProfile(null);
    setProfileForm(EMPTY_DOCTOR_PROFILE);
    setProfileError("");
    setProfileMessage("");
  };

  const handleLogin = async (form) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      const nextSession = await doctorAuthAPI.login(form);
      handleAuthSuccess(nextSession);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (form) => {
    setAuthBusy(true);
    setAuthError("");
    try {
      await doctorAuthAPI.register(form);
      const nextSession = await doctorAuthAPI.login({
        username: form.username,
        password: form.password,
      });
      handleAuthSuccess(nextSession);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileBusy(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const savedProfile = await doctorProfileAPI.upsertOwnProfile(profileForm);
      setProfile(savedProfile);
      setProfileForm(savedProfile);
      setProfileMessage("Doctor profile saved successfully.");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileBusy(false);
    }
  };

  const handleLogout = () => {
    doctorAuthAPI.logout();
    setSession(null);
    setProfile(null);
    setProfileForm(EMPTY_DOCTOR_PROFILE);
    setActiveTab("profile");
  };

  // Redirect unauthenticated access to sub-routes
  if (
    (initialTab === "availability" ||
      initialTab === "appointments" ||
      initialTab === "prescriptions") &&
    !session
  ) {
    return <Navigate replace to="/doctor" />;
  }

  if (bootstrapping && session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="text-sm text-slate-500">Loading doctor workspace...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <DoctorAuthPage
        busy={authBusy}
        error={authError}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ""}`.trim()
    : session.username;
  const activeNavItem = NAV_ITEMS.find((n) => n.id === activeTab);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[oklch(0.99_0.005_200)]">
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
            {profile?.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate text-sm">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{session.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Doctor
            </span>
            {profile?.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                ✓ Verified
              </span>
            )}
          </div>
          {profile?.specialty && (
            <p className="mt-2 text-xs text-slate-500 truncate">{profile.specialty}</p>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Doctor Portal
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
                      ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100"
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
            {activeNavItem?.label ?? "Doctor Portal"}
          </span>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {activeNavItem && <activeNavItem.icon className="w-7 h-7 text-teal-500" />}
              {activeNavItem?.label}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back,{" "}
              <span className="font-medium text-slate-700">{displayName}</span>
            </p>
          </div>

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <DoctorProfilePanel
              busy={profileBusy}
              error={profileError}
              form={profileForm}
              message={profileMessage}
              onChange={handleProfileChange}
              onSubmit={handleProfileSubmit}
              profile={profile}
              session={session}
            />
          )}

          {/* ── Availability tab ── */}
          {activeTab === "availability" && <DoctorAvailabilityPage />}

          {/* ── Appointments tab ── */}
          {activeTab === "appointments" && (
            <DoctorAppointmentsPanel session={session} />
          )}

          {/* ── Prescriptions tab ── */}
          {activeTab === "prescriptions" && (
            <DoctorPrescriptionsPanel session={session} />
          )}
        </main>
      </div>
    </div>
  );
}

export default DoctorPortal;

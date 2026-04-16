import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import {
  createMyPatientProfile,
  getMyPatientProfile,
  loginPatientAccount,
  registerPatientAccount,
  updateMyPatientProfile,
} from "./api/patientPortalApi";
import About from "./components/About";
import { AuthPage } from "./components/AuthPage";
import Contact from "./components/Contact";
import { DashboardPage } from "./components/DashboardPage";
import Home from "./components/Home";
import DoctorAvailabilityPage from "./features/doctorAvailability/pages/DoctorAvailabilityPage";

const SESSION_STORAGE_KEY = "patientPortalSession";

const EMPTY_LOGIN_FORM = {
  username: "",
  password: "",
};

const EMPTY_REGISTER_FORM = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
};

const EMPTY_PROFILE_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  dateOfBirth: "",
};

function toProfileForm(profile) {
  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
  };
}

function App() {
  const [session, setSession] = useState(() => {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER_FORM);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [profile, setProfile] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setProfile(null);
      setProfileForm(EMPTY_PROFILE_FORM);
      return;
    }

    let active = true;

    async function loadProfile() {
      setProfileBusy(true);
      setProfileMessage("");
      try {
        const data = await getMyPatientProfile(session.token);
        if (!active) {
          return;
        }
        setProfile(data);
        setProfileForm(toProfileForm(data));
      } catch (error) {
        if (!active) {
          return;
        }
        if (error.message === "Patient profile not found") {
          setProfile(null);
          setProfileForm({
            ...EMPTY_PROFILE_FORM,
            firstName: session.firstName ?? "",
            lastName: session.lastName ?? "",
          });
          setProfileMessage("No patient profile found yet. Create one below.");
        } else {
          setProfileMessage(error.message);
        }
      } finally {
        if (active) {
          setProfileBusy(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session]);

  const persistSession = (nextSession) => {
    setSession(nextSession);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
  };

  const handleLogout = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setProfile(null);
    setProfileForm(EMPTY_PROFILE_FORM);
    setAuthError("");
    setProfileMessage("");
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setAuthError("");
    try {
      const data = await loginPatientAccount(loginForm);
      persistSession(data);
      setLoginForm(EMPTY_LOGIN_FORM);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setAuthError("");
    try {
      const data = await registerPatientAccount(registerForm);
      persistSession({
        ...data,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
      });
      setRegisterForm(EMPTY_REGISTER_FORM);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!session?.token) {
      return;
    }

    setProfileBusy(true);
    setProfileMessage("");
    try {
      const action = profile
        ? updateMyPatientProfile
        : createMyPatientProfile;
      const data = await action(session.token, profileForm);
      setProfile(data);
      setProfileForm(toProfileForm(data));
      setProfileMessage(profile ? "Profile updated successfully." : "Profile created successfully.");
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setProfileBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/patient">{session ? "Patient Dashboard" : "Patient Portal"}</Link>
          </li>
          <li>
            <Link to="/doctor/availability">Doctor Availability</Link>
          </li>
        </ul>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/patient"
            element={
              session ? (
                <DashboardPage
                  session={session}
                  profile={profile}
                  profileForm={profileForm}
                  onProfileChange={handleProfileChange}
                  onProfileUpdate={handleProfileUpdate}
                  profileBusy={profileBusy}
                  profileMessage={profileMessage}
                  onLogout={handleLogout}
                />
              ) : (
                <AuthPage
                  loginForm={loginForm}
                  registerForm={registerForm}
                  onLoginChange={handleLoginChange}
                  onRegisterChange={handleRegisterChange}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  isBusy={isBusy}
                  error={authError}
                />
              )
            }
          />
          <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

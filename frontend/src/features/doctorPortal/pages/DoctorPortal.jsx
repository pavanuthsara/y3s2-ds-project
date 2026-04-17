import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DoctorAuthPage from '../components/DoctorAuthPage';
import DoctorWorkspace from '../components/DoctorWorkspace';
import {
  doctorAuthAPI,
  doctorProfileAPI,
  getStoredDoctorSession,
  isDoctorLoggedIn,
} from '../services/api';
import { EMPTY_DOCTOR_PROFILE } from '../components/DoctorProfilePanel';

function DoctorPortal({ initialTab = 'profile' }) {
  const [session, setSession] = useState(getStoredDoctorSession());
  const [activeTab, setActiveTab] = useState(initialTab);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_DOCTOR_PROFILE);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!isDoctorLoggedIn()) {
        if (!cancelled) {
          setBootstrapping(false);
        }
        return;
      }

      try {
        const nextProfile = await doctorProfileAPI.getOwnProfile();
        if (cancelled) {
          return;
        }
        setProfile(nextProfile);
        setProfileForm(nextProfile || EMPTY_DOCTOR_PROFILE);
      } catch (error) {
        if (!cancelled) {
          setProfileError(error.message);
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const handleAuthSuccess = (nextSession) => {
    setSession(nextSession);
    setAuthError('');
    setProfile(null);
    setProfileForm(EMPTY_DOCTOR_PROFILE);
    setProfileError('');
    setProfileMessage('');
  };

  const handleLogin = async (form) => {
    setAuthBusy(true);
    setAuthError('');
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
    setAuthError('');
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
    setProfileError('');
    setProfileMessage('');
    try {
      const savedProfile = await doctorProfileAPI.upsertOwnProfile(profileForm);
      setProfile(savedProfile);
      setProfileForm(savedProfile);
      setProfileMessage('Doctor profile saved successfully.');
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
    setActiveTab('profile');
  };

  if ((initialTab === 'availability' || initialTab === 'prescriptions') && !session) {
    return <Navigate replace to="/doctor" />;
  }

  if (bootstrapping && session) {
    return <div className="px-6 py-10 text-slate-600">Loading doctor workspace...</div>;
  }

  if (!session) {
    return <DoctorAuthPage busy={authBusy} error={authError} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <DoctorWorkspace
      activeTab={activeTab}
      onLogout={handleLogout}
      onProfileChange={handleProfileChange}
      onProfileSubmit={handleProfileSubmit}
      onTabChange={setActiveTab}
      profile={profile}
      profileBusy={profileBusy}
      profileError={profileError}
      profileForm={profileForm}
      profileMessage={profileMessage}
      session={session}
    />
  );
}

export default DoctorPortal;

import { useState, useEffect } from 'react';
import { PatientLogin } from '../components/PatientLogin';
import { PatientDashboard } from '../components/PatientDashboard';
import { PatientHistoryPanel } from '../components/PatientHistoryPanel';
import { PatientProfileForm, createProfileFormState } from '../components/PatientProfileForm';
import { PatientPrescriptionsPanel } from '../components/PatientPrescriptionsPanel';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import { SymptomCheckerPanel } from '../components/SymptomCheckerPanel';
import AppointmentBookingForm from '../../appointments/components/AppointmentBookingForm';
import AppointmentHistoryPage from '../../appointments/pages/AppointmentHistoryPage';
import { TransactionHistory } from '../../payments/components';
import appointmentService from '../../appointments/services/appointmentService';
import { authAPI, isLoggedIn, patientAPI } from '../services/api';

export function PatientPortal() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState(createProfileFormState(null));
  const [profileFormBusy, setProfileFormBusy] = useState(false);
  const [profileFormError, setProfileFormError] = useState('');
  const [profileFormMessage, setProfileFormMessage] = useState('');
  const [refreshReports, setRefreshReports] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    const savedSession = localStorage.getItem('patientSession');
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) {
        setProfile(null);
        setProfileError('');
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfileError('');

      try {
        const data = await patientAPI.getMyProfile();
        setProfile(data);
      } catch (err) {
        setProfile(null);
        setProfileError(err.status === 404 ? '' : (err.message || 'Failed to load patient profile'));
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    setProfileForm(createProfileFormState(profile));
    setProfileFormError('');
    setProfileFormMessage('');
  }, [profile]);

  const handleLoginSuccess = (result) => {
    const sessionData = {
      username: result.username,
      email: result.email,
      role: result.role,
    };

    setSession(sessionData);
    localStorage.setItem('patientSession', JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    authAPI.logout();
    setSession(null);
    setProfile(null);
    setProfileError('');
    setProfileLoading(false);
    setProfileForm(createProfileFormState(null));
    setProfileFormBusy(false);
    setProfileFormError('');
    setProfileFormMessage('');
    localStorage.removeItem('patientSession');
    setActiveTab('dashboard');
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
    setProfileFormError('');
    setProfileFormMessage('');

    try {
      const savedProfile = profile
        ? await patientAPI.updateProfile(profileForm)
        : await patientAPI.createProfile(profileForm);

      setProfile(savedProfile);
      setProfileFormMessage(profile ? 'Profile updated successfully.' : 'Profile created successfully.');
    } catch (err) {
      setProfileFormError(err.message || 'Failed to save profile');
    } finally {
      setProfileFormBusy(false);
    }
  };

  if (!session) {
    return <PatientLogin onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => {}} />;
  }

  const patientProfileId = profile?.id ?? null;
  const appointmentPatientId = profile?.username || session.username;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientDashboard
        session={session}
        profile={profile}
        loading={profileLoading}
        error={profileError}
        onLogout={handleLogout}
      />

      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'prescriptions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('book-appointment')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'book-appointment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('my-appointments')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'my-appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'payments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💳 Payments
          </button>
          <button
            onClick={() => setActiveTab('symptom-checker')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'symptom-checker'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            AI Symptom Checker
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h2>
              <p className="text-gray-600">Use the tabs above to manage your appointments, files, history, and profile information.</p>
            </div>

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

        {activeTab === 'files' && (
          patientProfileId ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FileUpload patientId={patientProfileId} onUploadSuccess={handleUploadSuccess} />
              </div>
              <div className="lg:col-span-2">
                <FileList patientId={patientProfileId} refreshTrigger={refreshReports} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-gray-700">
              {profileLoading
                ? 'Loading your patient profile before opening reports...'
                : 'Your patient profile is not available yet. Create your profile first to upload and manage reports.'}
            </div>
          )
        )}

        {activeTab === 'history' && (
          <PatientHistoryPanel patientId={patientProfileId} />
        )}

        {activeTab === 'prescriptions' && (
          <PatientPrescriptionsPanel patientId={patientProfileId} />
        )}

        {activeTab === 'book-appointment' && (
          <div className="bg-white rounded-lg p-8">
            <AppointmentBookingForm
              onSubmit={handleAppointmentBooking}
              patientIdFromSession={appointmentPatientId}
            />
          </div>
        )}

        {activeTab === 'my-appointments' && (
          <div className="bg-white rounded-lg p-8">
            <AppointmentHistoryPage patientIdFromSession={appointmentPatientId} />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg p-8">
            <TransactionHistory
              patientId={appointmentPatientId}
              showActions={true}
              title="Your Payment History"
              onViewDetails={(txn) => console.log('View transaction:', txn)}
              onRefund={(txn) => console.log('Refund transaction:', txn)}
            />
          </div>
        )}

        {activeTab === 'symptom-checker' && (
          <div className="bg-white rounded-lg p-8">
            <SymptomCheckerPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientPortal;

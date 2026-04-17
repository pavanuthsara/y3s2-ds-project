import { useState } from 'react';
import { PatientLogin } from '../components/PatientLogin';
import { PatientDashboard } from '../components/PatientDashboard';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import PatientPrescriptionsPanel from '../components/PatientPrescriptionsPanel';
import AppointmentBookingForm from '../../appointments/components/AppointmentBookingForm';
import AppointmentHistoryPage from '../../appointments/pages/AppointmentHistoryPage';
import appointmentService from '../../appointments/services/appointmentService';
import { authAPI, isLoggedIn, patientAPI } from '../services/api';

export function PatientPortal() {
  const [session, setSession] = useState(() => {
    if (!isLoggedIn()) {
      return null;
    }

    const savedSession = localStorage.getItem('patientSession');
    if (!savedSession) {
      return null;
    }

    try {
      return JSON.parse(savedSession);
    } catch {
      return null;
    }
  });
  const [refreshReports, setRefreshReports] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLoginSuccess = async (result) => {
    const sessionData = {
      username: result.username,
      email: result.email,
      role: result.role,
    };
    try {
      const profile = await patientAPI.getMyProfile();
      sessionData.patientId = profile.id;
    } catch {
      sessionData.patientId = result.username;
    }
    setSession(sessionData);
    localStorage.setItem('patientSession', JSON.stringify(sessionData));
  };

  const handleLogout = () => {
    authAPI.logout();
    setSession(null);
    localStorage.removeItem('patientSession');
    setActiveTab('dashboard');
  };

  const handleUploadSuccess = () => {
    // Trigger refresh of file list
    setRefreshReports((prev) => prev + 1);
  };

  const handleAppointmentBooking = async (data) => {
    return appointmentService.createAppointment({
      ...data,
      slotId: data.slotId,
    });
  };

  if (!session) {
    return <PatientLogin onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header & Profile */}
      <PatientDashboard session={session} onLogout={handleLogout} />

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📁 Files
          </button>
          <button
            onClick={() => setActiveTab('book-appointment')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'book-appointment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('my-appointments')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'my-appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏥 My Appointments
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === 'prescriptions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💊 Prescriptions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h2>
            <p className="text-gray-600">Use the tabs above to manage your appointments, files, and profile information.</p>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <FileUpload patientId={session.patientId || 2} onUploadSuccess={handleUploadSuccess} />
            </div>
            <div className="lg:col-span-2">
              <FileList patientId={session.patientId || 2} refreshTrigger={refreshReports} />
            </div>
          </div>
        )}

        {activeTab === 'book-appointment' && (
          <div className="bg-white rounded-lg p-8">
            <AppointmentBookingForm 
              onSubmit={handleAppointmentBooking}
              patientIdFromSession={session.username}
            />
          </div>
        )}

        {activeTab === 'my-appointments' && (
          <div className="bg-white rounded-lg p-8">
            <AppointmentHistoryPage patientIdFromSession={session.patientId} />
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <PatientPrescriptionsPanel patientId={session.username} />
        )}
      </div>
    </div>
  );
}

export default PatientPortal;

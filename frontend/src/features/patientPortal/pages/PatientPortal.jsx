import { useState, useEffect } from 'react';
import { PatientLogin } from '../components/PatientLogin';
import { PatientDashboard } from '../components/PatientDashboard';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import { authAPI, isLoggedIn } from '../services/api';

export function PatientPortal() {
  const [session, setSession] = useState(null);
  const [refreshReports, setRefreshReports] = useState(0);

  // Check if already logged in on mount
  useEffect(() => {
    if (isLoggedIn()) {
      // If we have a token, we can assume session is active
      // In a real app, you'd verify the token with the backend
      const savedSession = localStorage.getItem('patientSession');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }
    }
  }, []);

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
    localStorage.removeItem('patientSession');
  };

  const handleUploadSuccess = () => {
    // Trigger refresh of file list
    setRefreshReports((prev) => prev + 1);
  };

  if (!session) {
    return <PatientLogin onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header & Profile */}
      <PatientDashboard session={session} onLogout={handleLogout} />

      {/* Main Content - File Management */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload - Left column */}
          <div className="lg:col-span-1">
            <FileUpload patientId={session.patientId || 2} onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* File List - Right column */}
          <div className="lg:col-span-2">
            <FileList patientId={session.patientId || 2} refreshTrigger={refreshReports} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPortal;

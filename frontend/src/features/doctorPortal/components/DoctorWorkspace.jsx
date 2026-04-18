import { Navigate } from 'react-router-dom';
import DoctorAvailabilityPage from '../../doctorAvailability/pages/DoctorAvailabilityPage';
import DoctorProfilePanel from './DoctorProfilePanel';
import DoctorPrescriptionsPanel from './DoctorPrescriptionsPanel';

export default function DoctorWorkspace({
  activeTab,
  onTabChange,
  onLogout,
  session,
  profile,
  profileForm,
  onProfileChange,
  onProfileSubmit,
  profileBusy,
  profileError,
  profileMessage,
}) {
  if (!session) {
    return <Navigate replace to="/doctor" />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 py-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Doctor Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome, {profile?.firstName || session.username}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Manage your professional profile and consultation schedule from the same workspace connected to the healthcare platform backend.
            </p>
          </div>
          <button className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-b border-slate-200 pb-4">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'profile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => onTabChange('profile')}
            type="button"
          >
            Profile
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'availability' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => onTabChange('availability')}
            type="button"
          >
            Availability
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === 'prescriptions' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => onTabChange('prescriptions')}
            type="button"
          >
            Prescriptions
          </button>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-7xl">
        {activeTab === 'profile' ? (
          <DoctorProfilePanel
            busy={profileBusy}
            error={profileError}
            form={profileForm}
            message={profileMessage}
            onChange={onProfileChange}
            onSubmit={onProfileSubmit}
            profile={profile}
            session={session}
          />
        ) : activeTab === 'availability' ? (
          <DoctorAvailabilityPage />
        ) : (
          <DoctorPrescriptionsPanel />
        )}
      </div>
    </div>
  );
}

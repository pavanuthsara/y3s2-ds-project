import { Navigate } from "react-router-dom";
import AppointmentBookingForm from "../../appointments/components/AppointmentBookingForm";
import AppointmentHistoryPage from "../../appointments/pages/AppointmentHistoryPage";
import { TransactionHistory } from "../../payments/components";
import { FileList } from "./FileList";
import { FileUpload } from "./FileUpload";
import { PatientHistoryPanel } from "./PatientHistoryPanel";
import { PatientPrescriptionsPanel } from "./PatientPrescriptionsPanel";
import { PatientProfileForm } from "./PatientProfileForm";
import { SymptomCheckerPanel } from "./SymptomCheckerPanel";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "files", label: "Files" },
  { id: "history", label: "History" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "book-appointment", label: "Book Appointment" },
  { id: "my-appointments", label: "My Appointments" },
  { id: "payments", label: "Payments" },
  { id: "symptom-checker", label: "AI Symptom Checker" },
];

export default function PatientWorkspace({
  activeTab,
  onTabChange,
  onLogout,
  session,
  profile,
  profileLoading,
  profileError,
  profileForm,
  onProfileChange,
  onProfileSubmit,
  profileBusy,
  profileFormError,
  profileFormMessage,
  patientProfileId,
  appointmentPatientId,
  refreshReports,
  onUploadSuccess,
  onAppointmentBooking,
}) {
  if (!session) {
    return <Navigate replace to="/patient" />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 py-6 lg:px-8">
      <section className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Patient Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Welcome, {profile?.firstName || session.username}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Manage your profile, reports, appointments, payments, and symptom
              checks from one connected healthcare workspace.
            </p>
            {profileLoading ? (
              <p className="mt-3 text-sm text-slate-500">Loading profile...</p>
            ) : null}
            {profileError ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {profileError}
              </p>
            ) : null}
          </div>
          <button
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>

        <div className="-mx-2 mt-8 overflow-x-auto border-b border-slate-200 pb-4">
          <div className="flex min-w-max gap-3 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => onTabChange(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-7xl">
        {activeTab === "dashboard" ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Your Personal Health Space
              </h2>
              <p className="mt-2 text-slate-600">
                Keep your details up to date to improve appointments, reports,
                and prescription records.
              </p>
            </div>

            <PatientProfileForm
              profile={profile}
              form={profileForm}
              busy={profileBusy}
              error={profileFormError}
              message={profileFormMessage}
              onChange={onProfileChange}
              onSubmit={onProfileSubmit}
            />
          </div>
        ) : null}

        {activeTab === "files" ? (
          patientProfileId ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <FileUpload
                  patientId={patientProfileId}
                  onUploadSuccess={onUploadSuccess}
                />
              </div>
              <div className="lg:col-span-2">
                <FileList
                  patientId={patientProfileId}
                  refreshTrigger={refreshReports}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200/50 bg-white/60 p-8 text-slate-700 shadow-sm">
              {profileLoading
                ? "Loading your patient profile securely before opening reports..."
                : "Your patient profile is not available yet. Please complete your profile to upload and manage reports."}
            </div>
          )
        ) : null}

        {activeTab === "history" ? (
          <PatientHistoryPanel patientId={patientProfileId} />
        ) : null}

        {activeTab === "prescriptions" ? (
          <PatientPrescriptionsPanel patientId={patientProfileId} />
        ) : null}

        {activeTab === "book-appointment" ? (
          <div className="rounded-xl border border-white/80 bg-white/60 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-sm">
            <AppointmentBookingForm
              onSubmit={onAppointmentBooking}
              patientIdFromSession={appointmentPatientId}
            />
          </div>
        ) : null}

        {activeTab === "my-appointments" ? (
          <div className="rounded-xl border border-white/80 bg-white/60 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-sm">
            <AppointmentHistoryPage
              patientIdFromSession={appointmentPatientId}
            />
          </div>
        ) : null}

        {activeTab === "payments" ? (
          <div className="rounded-lg bg-white p-8">
            <TransactionHistory
              patientId={appointmentPatientId}
              showActions={true}
              title="Your Payment History"
              onViewDetails={(txn) => console.log("View transaction:", txn)}
              onRefund={(txn) => console.log("Refund transaction:", txn)}
            />
          </div>
        ) : null}

        {activeTab === "symptom-checker" ? (
          <div className="rounded-lg bg-white p-8">
            <SymptomCheckerPanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}

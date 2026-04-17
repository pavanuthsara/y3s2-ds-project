import { useEffect, useState } from 'react';
import { doctorRecordsAPI } from '../services/api';

export default function DoctorPatientRecordsPanel({ session }) {
  const [patientUsername, setPatientUsername] = useState('');
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPatientUsername('');
    setReports([]);
    setAppointments([]);
  }, [session.username]);

  const loadPatientData = async (targetPatientUsername = patientUsername) => {
    if (!targetPatientUsername) {
      setReports([]);
      setAppointments([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [nextReports, nextAppointments] = await Promise.all([
        doctorRecordsAPI.getPatientReportsByUsername(targetPatientUsername),
        doctorRecordsAPI.getPatientAppointments(targetPatientUsername),
      ]);
      setReports(nextReports || []);
      setAppointments(nextAppointments || []);
    } catch (fetchError) {
      setError(fetchError.message);
      setReports([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadPatientData();
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Patient Records</p>
        <h2 className="text-2xl font-semibold text-slate-900">Inspect a patient before treatment</h2>
      </div>

      <form className="mb-6 flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleSubmit}>
        <label className="grid flex-1 gap-2 text-sm font-medium text-slate-800">
          Patient username
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3"
            value={patientUsername}
            onChange={(event) => setPatientUsername(event.target.value)}
            placeholder="Enter the patient username"
          />
        </label>
        <button className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white" type="submit">
          Load records
        </button>
      </form>

      {error ? <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-slate-600">Loading patient records...</p>
      ) : patientUsername ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Appointments</h3>
            {appointments.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-5 text-slate-600">No appointments found for this patient.</div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <article key={appointment.appointmentId} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : 'Unknown time'}</p>
                    <p className="text-sm text-slate-600">Status: {appointment.status}</p>
                    <p className="text-sm text-slate-600">Mode: {appointment.appointmentMode || 'N/A'}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Medical reports</h3>
            {reports.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-5 text-slate-600">No medical reports found for this patient.</div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <article key={report.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{report.fileName}</p>
                    <p className="text-sm text-slate-600">{report.fileType || 'Unknown type'} • {report.fileSize ? `${Math.round(report.fileSize / 1024)} KB` : 'Unknown size'}</p>
                    {report.description ? <p className="mt-2 text-sm text-slate-700">{report.description}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-5 text-slate-600">
          Search a patient username to view appointments and reports.
        </div>
      )}
    </section>
  );
}
import { useCallback, useEffect, useMemo, useState } from 'react';
import { doctorAppointmentAPI, doctorPrescriptionAPI } from '../services/api';

const EMPTY_PRESCRIPTION_FORM = {
  patientId: '',
  appointmentId: '',
  medication: '',
  dosage: '',
  instructions: '',
  notes: '',
};

export default function DoctorAppointmentsPanel({ session, onSelectPrescriptionDraft }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState(EMPTY_PRESCRIPTION_FORM);
  const [issuing, setIssuing] = useState(false);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((left, right) => {
      const leftDate = left.appointmentDateTime ? new Date(left.appointmentDateTime).getTime() : 0;
      const rightDate = right.appointmentDateTime ? new Date(right.appointmentDateTime).getTime() : 0;
      return rightDate - leftDate;
    });
  }, [appointments]);

  const loadAppointments = useCallback(async () => {
    if (!session?.username) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      const data = await doctorAppointmentAPI.getAppointments(session.username);
      setAppointments(data || []);
    } catch (fetchError) {
      setError(fetchError.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [session?.username]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const openPrescriptionDraft = (appointment) => {
    const draft = {
      patientId: appointment.patientId || '',
      appointmentId: appointment.appointmentId || '',
    };
    setSelectedAppointment(appointment);
    setPrescriptionForm((current) => ({
      ...current,
      patientId: draft.patientId,
      appointmentId: draft.appointmentId,
    }));
    if (onSelectPrescriptionDraft) {
      onSelectPrescriptionDraft(draft);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    setError('');
    setStatusMessage('');
    try {
      const updated = await doctorAppointmentAPI.updateStatus(appointmentId, status);
      setAppointments((current) => current.map((appointment) => (appointment.appointmentId === appointmentId ? updated : appointment)));
      setStatusMessage(`Appointment ${status.toLowerCase()}.`);
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const handlePrescriptionChange = (event) => {
    const { name, value } = event.target;
    setPrescriptionForm((current) => ({ ...current, [name]: value }));
  };

  const handleIssuePrescription = async (event) => {
    event.preventDefault();
    setIssuing(true);
    setError('');
    setStatusMessage('');

    try {
      await doctorPrescriptionAPI.createPrescription(prescriptionForm);
      setStatusMessage('Prescription issued successfully.');
      setPrescriptionForm((current) => ({
        ...EMPTY_PRESCRIPTION_FORM,
        patientId: current.patientId,
        appointmentId: current.appointmentId,
      }));
    } catch (issueError) {
      setError(issueError.message);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Appointments</p>
          <h2 className="text-2xl font-semibold text-slate-900">Approve requests and issue prescriptions</h2>
        </div>
        <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700" type="button" onClick={loadAppointments} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh appointments'}
        </button>
      </div>

      {error ? <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
      {statusMessage ? <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{statusMessage}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-6 text-slate-600">
              No appointments found for {session.username}.
            </div>
          ) : (
            sortedAppointments.map((appointment) => (
              <article key={appointment.appointmentId} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{appointment.status}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">Patient {appointment.patientId}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {appointment.appointmentDateTime ? new Date(appointment.appointmentDateTime).toLocaleString() : 'No time available'}
                    </p>
                    <p className="text-sm text-slate-600">Mode: {appointment.appointmentMode || 'N/A'} {appointment.hospital ? `• ${appointment.hospital}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => handleStatusUpdate(appointment.appointmentId, 'CONFIRMED')}>
                      Confirm
                    </button>
                    <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => handleStatusUpdate(appointment.appointmentId, 'CANCELLED')}>
                      Reject
                    </button>
                    <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => openPrescriptionDraft(appointment)}>
                      Prescribe
                    </button>
                  </div>
                </div>
                {appointment.notes ? <p className="mt-4 text-sm text-slate-600">Notes: {appointment.notes}</p> : null}
              </article>
            ))
          )}
        </div>

        <form className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleIssuePrescription}>
          <div className="mb-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Prescription Draft</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {selectedAppointment ? `Patient ${selectedAppointment.patientId}` : 'Issue a new prescription'}
            </h3>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Patient ID
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="patientId" onChange={handlePrescriptionChange} required value={prescriptionForm.patientId} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Appointment ID
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="appointmentId" onChange={handlePrescriptionChange} required value={prescriptionForm.appointmentId} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Medication
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="medication" onChange={handlePrescriptionChange} required value={prescriptionForm.medication} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Dosage
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="dosage" onChange={handlePrescriptionChange} required value={prescriptionForm.dosage} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Instructions
              <textarea className="min-h-28 rounded-2xl border border-slate-300 px-4 py-3" name="instructions" onChange={handlePrescriptionChange} required value={prescriptionForm.instructions} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Notes
              <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3" name="notes" onChange={handlePrescriptionChange} value={prescriptionForm.notes} />
            </label>
          </div>

          <button className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={issuing} type="submit">
            {issuing ? 'Issuing...' : 'Issue prescription'}
          </button>
        </form>
      </div>
    </section>
  );
}
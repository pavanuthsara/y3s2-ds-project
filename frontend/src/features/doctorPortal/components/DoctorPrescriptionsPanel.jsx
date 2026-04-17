import { useCallback, useEffect, useState } from 'react';
import { doctorPrescriptionAPI } from '../services/api';

export default function DoctorPrescriptionsPanel({ initialDraft, onDraftConsumed, onPatientChange, session, selectedPatientId }) {
  const [patientId, setPatientId] = useState(selectedPatientId || initialDraft?.patientId || session.username || '');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const nextPatientId = selectedPatientId || initialDraft?.patientId || session.username || '';
    setPatientId(nextPatientId);
  }, [selectedPatientId, initialDraft, session.username]);

  useEffect(() => {
    if (initialDraft?.patientId && onDraftConsumed) {
      onDraftConsumed();
    }
  }, [initialDraft, onDraftConsumed]);

  const loadPrescriptions = useCallback(async (targetPatientId = patientId) => {
    if (!targetPatientId) {
      setPrescriptions([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await doctorPrescriptionAPI.getPrescriptionsByPatientId(targetPatientId);
      setPrescriptions(data || []);
    } catch (fetchError) {
      setError(fetchError.message);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      loadPrescriptions(patientId);
    }
  }, [loadPrescriptions, patientId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadPrescriptions(patientId);
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Prescriptions</p>
        <h2 className="text-2xl font-semibold text-slate-900">Review prescriptions for a patient</h2>
      </div>

      <form className="mb-6 flex flex-col gap-3 md:flex-row md:items-end" onSubmit={handleSubmit}>
        <label className="grid flex-1 gap-2 text-sm font-medium text-slate-800">
          Patient ID
          <input
            className="rounded-2xl border border-slate-300 px-4 py-3"
            value={patientId}
            onChange={(event) => {
              setPatientId(event.target.value);
              if (onPatientChange) {
                onPatientChange(event.target.value);
              }
            }}
          />
        </label>
        <button className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white" type="submit">
          Load prescriptions
        </button>
      </form>

      {error ? <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-slate-600">Loading prescriptions...</p>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-6 text-slate-600">
          No prescriptions found for this patient.
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <article key={prescription.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{prescription.medication}</h3>
                  <p className="text-sm text-slate-600">Appointment {prescription.appointmentId}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString() : 'Issued'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Dosage</p>
                  <p className="font-medium">{prescription.dosage}</p>
                </div>
                <div>
                  <p className="text-slate-500">Doctor</p>
                  <p className="font-medium">{prescription.doctorUsername}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-500">Instructions</p>
                  <p className="font-medium">{prescription.instructions}</p>
                </div>
                {prescription.notes ? (
                  <div className="md:col-span-2">
                    <p className="text-slate-500">Notes</p>
                    <p className="font-medium">{prescription.notes}</p>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
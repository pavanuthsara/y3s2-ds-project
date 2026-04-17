import { useEffect, useState } from 'react';
import { prescriptionsAPI } from '../services/api';

export default function PatientPrescriptionsPanel({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPrescriptions() {
      if (!patientId) {
        setPrescriptions([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await prescriptionsAPI.getPrescriptions(patientId);
        if (!cancelled) {
          setPrescriptions(data || []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
          setPrescriptions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPrescriptions();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Prescriptions</h2>
      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
      {loading ? (
        <div className="text-gray-600">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-gray-600">
          No prescriptions found yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <article key={prescription.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
                  <p className="text-sm text-gray-600">Issued {prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleString() : 'recently'}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Appointment {prescription.appointmentId}</span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Dosage</dt>
                  <dd className="font-medium">{prescription.dosage}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Doctor</dt>
                  <dd className="font-medium">{prescription.doctorUsername}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-gray-500">Instructions</dt>
                  <dd className="font-medium">{prescription.instructions}</dd>
                </div>
                {prescription.notes ? (
                  <div className="md:col-span-2">
                    <dt className="text-gray-500">Notes</dt>
                    <dd className="font-medium">{prescription.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
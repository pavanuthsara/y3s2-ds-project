import { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';

export function PatientPrescriptionsPanel({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!patientId) {
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await patientAPI.getPrescriptions(patientId);
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load prescriptions');
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Prescriptions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Prescription records will appear here once the patient prescriptions endpoint is available.
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-gray-600">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-gray-500">No prescriptions are available yet.</div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription, index) => (
            <div className="border border-gray-200 rounded-lg p-4" key={prescription.id || index}>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{JSON.stringify(prescription, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';

const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

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
          Prescription records issued for this patient are shown here.
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
        <div className="space-y-4">
          {prescriptions.map((prescription, index) => (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50" key={prescription.id || index}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {prescription.medication || 'Medication'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Prescribed by Dr. {prescription.doctorUsername || 'Unknown Doctor'}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  Issued {formatDateTime(prescription.issuedAt)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Dosage</p>
                  <p className="text-gray-800 font-medium">{prescription.dosage || 'Not specified'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-500 text-sm">Instructions</p>
                <p className="text-gray-800 text-sm mt-1">{prescription.instructions || 'No instructions provided.'}</p>
              </div>

              {prescription.notes ? (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-gray-800 text-sm mt-1">{prescription.notes}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

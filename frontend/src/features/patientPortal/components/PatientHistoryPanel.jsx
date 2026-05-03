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

const formatLabel = (value) => {
  if (!value) {
    return 'Not available';
  }

  return String(value)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export function PatientHistoryPanel({ patientId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!patientId) {
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await patientAPI.getHistory(patientId);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load patient history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Medical History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Past appointments for this patient are shown here.
        </p>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-gray-600">Loading medical history...</div>
      ) : history.length === 0 ? (
        <div className="text-gray-500">No medical history is available yet.</div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50" key={item.appointmentId || index}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Dr. {item.doctorUsername || 'Unknown Doctor'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Appointment on {formatDateTime(item.appointmentDateTime)}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {formatLabel(item.status)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {formatLabel(item.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Mode</p>
                  <p className="text-gray-800 font-medium">{formatLabel(item.appointmentMode)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hospital</p>
                  <p className="text-gray-800 font-medium">{item.hospital || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Booked At</p>
                  <p className="text-gray-800 font-medium">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>

              {item.notes ? (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-gray-800 text-sm mt-1">{item.notes}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

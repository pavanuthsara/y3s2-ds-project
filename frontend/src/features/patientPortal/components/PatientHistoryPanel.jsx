import { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';

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
          Past patient activity will appear here once the backend history endpoint is connected.
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
        <div className="space-y-3">
          {history.map((item, index) => (
            <div className="border border-gray-200 rounded-lg p-4" key={item.id || item.appointmentId || index}>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

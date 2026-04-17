import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

export function FileList({ patientId, refreshTrigger }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await reportsAPI.getReports(patientId);
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [patientId, refreshTrigger]);

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setDeleting(reportId);
    try {
      await reportsAPI.deleteReport(patientId, reportId);
      setReports((current) => current.filter((report) => report.id !== reportId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleViewReport = (report) => {
    if (!report.downloadUrl) {
      setError('This report does not have a download link yet.');
      return;
    }

    const reportUrl = report.downloadUrl.startsWith('http')
      ? report.downloadUrl
      : `http://localhost:8080${report.downloadUrl}`;

    const openedWindow = window.open(reportUrl, '_blank', 'noopener,noreferrer');

    if (!openedWindow) {
      setError('Unable to open the report. Allow pop-ups and try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Medical Reports</h2>
        <div className="text-center py-8 text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Medical Reports</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg">No reports uploaded yet</p>
          <p className="text-sm">Upload a medical report to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="h-5 w-5 text-red-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <h3 className="font-semibold text-gray-800 truncate">
                      {report.fileName}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Size: {formatFileSize(report.fileSize)} • Type: {report.fileType}
                    </p>
                    <p className="text-gray-500">
                      Uploaded: {formatDate(report.uploadedAt)}
                    </p>
                    {report.description && (
                      <p className="text-gray-700 italic">"{report.description}"</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                    type="button"
                  >
                    View
                  </button>
                  <button
                    disabled={deleting === report.id}
                    onClick={() => handleDelete(report.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 text-sm font-medium"
                    type="button"
                  >
                    {deleting === report.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

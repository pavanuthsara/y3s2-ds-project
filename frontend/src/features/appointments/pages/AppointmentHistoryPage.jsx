import { useState, useEffect } from 'react';
import AppointmentCard from '../components/AppointmentCard';
import appointmentService from '../services/appointmentService';
import '../styles/AppointmentHistory.css';

const AppointmentHistoryPage = ({ patientIdFromSession }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED, COMPLETED, CANCELLED
  const [patientId, setPatientId] = useState(patientIdFromSession || '');

  // Auto-load appointments when patient ID is available
  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, []);

  const fetchAppointments = async (id = patientId) => {
    if (!id.trim()) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getPatientAppointments(id);
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      // Remove from list or refresh
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.appointmentId === appointmentId
            ? { ...apt, status: 'CANCELLED' }
            : apt
        )
      );
    } catch (err) {
      throw new Error(err.message || 'Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  return (
    <div className="appointment-history-container">
      <h1>My Appointments</h1>

      {!patientIdFromSession && (
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="patientId">Patient ID:</label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={handlePatientIdChange}
              placeholder="Enter your patient ID"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      )}

      {(patientId || patientIdFromSession) && (
        <>
          <div className="filter-section">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="ALL">All Appointments</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {isLoading ? (
            <div className="loading">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="empty-state">
              <p>No appointments found</p>
            </div>
          ) : (
            <div className="appointments-grid">
              <p className="appointment-count">
                Showing {filteredAppointments.length} appointment(s)
              </p>
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointmentId}
                  appointment={appointment}
                  onCancel={handleCancelAppointment}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!patientId && !patientIdFromSession && (
        <div className="empty-state">
          <p>Enter your Patient ID to view appointments</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryPage;

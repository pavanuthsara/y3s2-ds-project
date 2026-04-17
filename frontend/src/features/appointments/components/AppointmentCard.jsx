import { useState } from 'react';
import StatusBadge from './StatusBadge';
import '../styles/AppointmentCard.css';

const AppointmentCard = ({ appointment, onCancel, onReschedule, showActions = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setIsLoading(true);
      try {
        await onCancel(appointment.appointmentId);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to cancel appointment');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = ['PENDING', 'CONFIRMED'].includes(appointment.status);

  return (
    <div className="appointment-card">
      {error && <div className="error-message">{error}</div>}
      
      <div className="appointment-card-header">
        <div>
          <h3>Dr. {appointment.doctorUsername}</h3>
          <p className="appointment-date">{formatDateTime(appointment.appointmentDateTime)}</p>
        </div>
        <StatusBadge status={appointment.status} paymentStatus={appointment.paymentStatus} />
      </div>

      <div className="appointment-card-body">
        <div className="appointment-detail">
          <span className="label">Appointment ID:</span>
          <span className="value">{appointment.appointmentId}</span>
        </div>

        <div className="appointment-detail">
          <span className="label">Mode:</span>
          <span className="value">{appointment.appointmentMode || 'N/A'}</span>
        </div>

        {appointment.hospital && (
          <div className="appointment-detail">
            <span className="label">Location:</span>
            <span className="value">{appointment.hospital}</span>
          </div>
        )}

        {appointment.price && (
          <div className="appointment-detail">
            <span className="label">Price:</span>
            <span className="value">LKR {appointment.price}</span>
          </div>
        )}

        {appointment.notes && (
          <div className="appointment-detail">
            <span className="label">Notes:</span>
            <span className="value">{appointment.notes}</span>
          </div>
        )}

        <div className="appointment-timestamps">
          <small>Created: {formatDateTime(appointment.createdAt)}</small>
          <small>Updated: {formatDateTime(appointment.updatedAt)}</small>
        </div>
      </div>

      {showActions && (
        <div className="appointment-card-footer">
          {canCancel && (
            <button
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? 'Canceling...' : 'Cancel Appointment'}
            </button>
          )}
          {onReschedule && (
            <button
              className="btn btn-secondary"
              onClick={() => onReschedule(appointment)}
              disabled={!canCancel || isLoading}
            >
              Reschedule
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;

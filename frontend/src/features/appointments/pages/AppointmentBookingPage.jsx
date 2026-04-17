import { useState, useEffect } from 'react';
import AppointmentBookingForm from '../components/AppointmentBookingForm';
import appointmentService from '../services/appointmentService';
import '../styles/AppointmentBooking.css';

const AppointmentBookingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [patientIdFromSession, setPatientIdFromSession] = useState(null);

  // Get patient ID from session
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setPatientIdFromSession(username);
    }
  }, []);

  const handleBooking = async (formData) => {
    setIsLoading(true);
    try {
      // Convert slotId string to proper format if needed
      const appointmentData = {
        ...formData,
        slotId: formData.slotId,
      };

      const result = await appointmentService.createAppointment(appointmentData);
      setBookingResult({
        success: true,
        appointment: result,
      });
    } catch (error) {
      setBookingResult({
        success: false,
        error: error.message || 'Failed to book appointment',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="appointment-booking-page">
      <div className="booking-container">
        <div className="booking-form-section">
          <AppointmentBookingForm
            onSubmit={handleBooking}
            isLoading={isLoading}
            patientIdFromSession={patientIdFromSession}
          />
        </div>

        {bookingResult && (
          <div className="booking-result-section">
            {bookingResult.success ? (
              <div className="success-result">
                <h2>✓ Appointment Booked Successfully!</h2>
                <div className="result-details">
                  <div className="detail-item">
                    <span className="label">Appointment ID:</span>
                    <span className="value">
                      {bookingResult.appointment.appointmentId}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Doctor:</span>
                    <span className="value">
                      {bookingResult.appointment.doctorUsername}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date & Time:</span>
                    <span className="value">
                      {new Date(
                        bookingResult.appointment.appointmentDateTime
                      ).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Mode:</span>
                    <span className="value">
                      {bookingResult.appointment.appointmentMode}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value badge badge-warning">
                      {bookingResult.appointment.status}
                    </span>
                  </div>
                  {bookingResult.appointment.price && (
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span className="value">
                        LKR {bookingResult.appointment.price}
                      </span>
                    </div>
                  )}
                </div>

                <div className="next-steps">
                  <h3>Next Steps:</h3>
                  <ul>
                    <li>Check your email for confirmation</li>
                    <li>View appointment details in your history</li>
                    <li>Proceed to payment if required</li>
                    <li>Contact support if you have any issues</li>
                  </ul>
                </div>

                <button
                  onClick={() => setBookingResult(null)}
                  className="btn btn-primary"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <div className="error-result">
                <h2>✗ Booking Failed</h2>
                <p>{bookingResult.error}</p>
                <button
                  onClick={() => setBookingResult(null)}
                  className="btn btn-secondary"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-section">
        <h2>How to Book an Appointment</h2>
        <ol>
          <li>
            <strong>Enter Your Patient ID:</strong> Your unique identifier in
            the system
          </li>
          <li>
            <strong>Enter Doctor's Username:</strong> The username of the doctor
            you want to book
          </li>
          <li>
            <strong>Select a Slot:</strong> Enter the slot ID for your preferred
            time
          </li>
          <li>
            <strong>Choose Mode:</strong> Virtual or Physical appointment
          </li>
          <li>
            <strong>Add Location (if Physical):</strong> Hospital or clinic name
          </li>
          <li>
            <strong>Add Notes (Optional):</strong> Any special requirements or
            notes
          </li>
          <li>
            <strong>Confirm & Book:</strong> Click the Book button to complete
          </li>
        </ol>
        <p className="info-note">
          💡 <strong>Note:</strong> You will receive a confirmation email with
          appointment details. Payment will be collected after confirmation if
          required.
        </p>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;

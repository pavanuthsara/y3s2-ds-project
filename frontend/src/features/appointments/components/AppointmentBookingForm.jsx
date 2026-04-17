import { useState } from 'react';
import '../styles/AppointmentForm.css';

const AppointmentBookingForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorUsername: '',
    slotId: '',
    appointmentDateTime: '',
    appointmentMode: 'VIRTUAL',
    hospital: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required';
    }
    if (!formData.doctorUsername.trim()) {
      newErrors.doctorUsername = 'Doctor username is required';
    }
    if (!formData.slotId.trim()) {
      newErrors.slotId = 'Slot ID is required';
    }
    if (!formData.appointmentDateTime) {
      newErrors.appointmentDateTime = 'Date and time is required';
    }
    if (!formData.appointmentMode) {
      newErrors.appointmentMode = 'Appointment mode is required';
    }
    if (formData.appointmentMode === 'PHYSICAL' && !formData.hospital.trim()) {
      newErrors.hospital = 'Hospital/Location is required for physical appointments';
    }

    const selectedDateTime = new Date(formData.appointmentDateTime);
    const now = new Date();
    if (selectedDateTime <= now) {
      newErrors.appointmentDateTime = 'Appointment date and time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          patientId: '',
          doctorUsername: '',
          slotId: '',
          appointmentDateTime: '',
          appointmentMode: 'VIRTUAL',
          hospital: '',
          notes: '',
        });
        setSuccess(false);
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to book appointment' });
    }
  };

  return (
    <div className="appointment-form-container">
      <h2>Book an Appointment</h2>

      {success && (
        <div className="success-message">
          ✓ Appointment booked successfully!
        </div>
      )}

      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label htmlFor="patientId">Patient ID *</label>
          <input
            type="text"
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            placeholder="Enter your patient ID"
            className={errors.patientId ? 'input-error' : ''}
          />
          {errors.patientId && (
            <span className="error-text">{errors.patientId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="doctorUsername">Doctor Username *</label>
          <input
            type="text"
            id="doctorUsername"
            name="doctorUsername"
            value={formData.doctorUsername}
            onChange={handleChange}
            placeholder="Enter doctor's username"
            className={errors.doctorUsername ? 'input-error' : ''}
          />
          {errors.doctorUsername && (
            <span className="error-text">{errors.doctorUsername}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="slotId">Slot ID *</label>
          <input
            type="text"
            id="slotId"
            name="slotId"
            value={formData.slotId}
            onChange={handleChange}
            placeholder="Enter slot ID (UUID)"
            className={errors.slotId ? 'input-error' : ''}
          />
          {errors.slotId && (
            <span className="error-text">{errors.slotId}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="appointmentDateTime">Appointment Date & Time *</label>
          <input
            type="datetime-local"
            id="appointmentDateTime"
            name="appointmentDateTime"
            value={formData.appointmentDateTime}
            onChange={handleChange}
            className={errors.appointmentDateTime ? 'input-error' : ''}
          />
          {errors.appointmentDateTime && (
            <span className="error-text">{errors.appointmentDateTime}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="appointmentMode">Appointment Mode *</label>
          <select
            id="appointmentMode"
            name="appointmentMode"
            value={formData.appointmentMode}
            onChange={handleChange}
            className={errors.appointmentMode ? 'input-error' : ''}
          >
            <option value="VIRTUAL">Virtual</option>
            <option value="PHYSICAL">Physical</option>
          </select>
          {errors.appointmentMode && (
            <span className="error-text">{errors.appointmentMode}</span>
          )}
        </div>

        {formData.appointmentMode === 'PHYSICAL' && (
          <div className="form-group">
            <label htmlFor="hospital">Hospital/Location *</label>
            <input
              type="text"
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              placeholder="Enter hospital or location"
              className={errors.hospital ? 'input-error' : ''}
            />
            {errors.hospital && (
              <span className="error-text">{errors.hospital}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes or requirements"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentBookingForm;

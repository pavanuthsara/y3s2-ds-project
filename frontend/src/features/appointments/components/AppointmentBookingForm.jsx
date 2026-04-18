import { useState, useEffect } from 'react';
import DoctorSlotSelector from './DoctorSlotSelector';
import { PaymentModal } from '../../payments/components';
import '../styles/AppointmentForm.css';

const DAY_NAME_TO_INDEX = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const formatDateTimeLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getNextSlotDateTime = (slot) => {
  if (!slot?.dayOfWeek || !slot?.startTime) {
    return '';
  }

  const targetDay = DAY_NAME_TO_INDEX[slot.dayOfWeek.toUpperCase()];
  if (targetDay === undefined) {
    return '';
  }

  const [hours = '0', minutes = '0'] = slot.startTime.split(':');
  const now = new Date();
  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setHours(Number(hours), Number(minutes), 0, 0);

  const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
  candidate.setDate(now.getDate() + daysUntilTarget);

  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return formatDateTimeLocal(candidate);
};

const AppointmentBookingForm = ({ onSubmit, isLoading = false, patientIdFromSession = null }) => {
  const [formData, setFormData] = useState({
    patientId: patientIdFromSession || '',
    doctorUsername: '',
    slotId: '',
    appointmentDateTime: '',
    appointmentMode: 'VIRTUAL',
    hospital: '',
    notes: '',
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [appointmentAmount, setAppointmentAmount] = useState(0);

  // Auto-populate fields when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      setFormData((prev) => ({
        ...prev,
        doctorUsername: selectedSlot.doctorUsername || '',
        slotId: selectedSlot.slotId || '',
        appointmentDateTime: getNextSlotDateTime(selectedSlot),
      }));
    }
  }, [selectedSlot]);

  // Auto-populate patient ID from session
  useEffect(() => {
    if (patientIdFromSession) {
      setFormData((prev) => ({
        ...prev,
        patientId: patientIdFromSession,
      }));
    }
  }, [patientIdFromSession]);

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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSlotSelected = (slot) => {
    setSelectedSlot(slot);
    setSelectedDoctor(slot.doctorName || '');
  };

  const handleDoctorSelected = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // First create the appointment to get appointmentId
      const response = await onSubmit(formData);

      // Extract appointmentId from response (assuming it returns the appointment object)
      const newAppointmentId = response?.id || response?.appointmentId || 'appointment-' + Date.now();
      setAppointmentId(newAppointmentId);

      // Use the doctor's consultation fee (fall back to response price if present)
      const fee = Number(selectedSlot?.consultationFee ?? response?.price);
      if (!fee || fee <= 0) {
        setErrors({ submit: 'This doctor has not set a consultation fee. Please contact support.' });
        return;
      }
      setAppointmentAmount(fee);
      setShowPaymentModal(true);
    } catch (error) {
      if (error?.status === 409) {
        setSelectedSlot(null);
        setFormData((prev) => ({
          ...prev,
          slotId: '',
          appointmentDateTime: '',
        }));
        setErrors({
          submit: 'This slot has already been booked. Please choose a different time slot.',
        });
        return;
      }
      setErrors({ submit: error?.message || 'Failed to create appointment. Please try again.' });
    }
  };

  const handlePaymentSuccess = async () => {
    // Payment is complete, close modal and show success
    setSuccess(true);
    setShowPaymentModal(false);
    setTimeout(() => {
      setFormData({
        patientId: patientIdFromSession || '',
        doctorUsername: '',
        slotId: '',
        appointmentDateTime: '',
        appointmentMode: 'VIRTUAL',
        hospital: '',
        notes: '',
      });
      setSuccess(false);
      setAppointmentId(null);
    }, 2000);
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

      <div className="appointment-doctor-selector">
        <DoctorSlotSelector
          onDoctorSelected={handleDoctorSelected}
          onSlotSelected={handleSlotSelected}
          selectedDoctorUsername={formData.doctorUsername}
          selectedSlotId={formData.slotId}
          appointmentMode={formData.appointmentMode}
        />
      </div>

      <div className="appointment-details-section">
        <h3>Appointment Details</h3>

        <form onSubmit={handleSubmit} className="appointment-form">
          {!patientIdFromSession && (
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
          )}

          {selectedDoctor && (
            <div className="form-group">
              <label>Selected Doctor</label>
              <input
                type="text"
                value={selectedDoctor}
                disabled
                className="input-readonly"
              />
            </div>
          )}

          <input
            type="hidden"
            id="doctorUsername"
            name="doctorUsername"
            value={formData.doctorUsername}
          />

          <input
            type="hidden"
            id="slotId"
            name="slotId"
            value={formData.slotId}
          />

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
            {selectedSlot && !errors.appointmentDateTime && (
              <span className="text-sm text-gray-500">
                Auto-filled from the selected slot. Adjust only if you need a later matching time.
              </span>
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
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : '💳 Proceed to Payment'}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        appointmentId={appointmentId}
        patientId={formData.patientId}
        amount={appointmentAmount}
        currency="LKR"
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default AppointmentBookingForm;

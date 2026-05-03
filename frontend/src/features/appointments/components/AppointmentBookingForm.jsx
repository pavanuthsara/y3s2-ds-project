import { useState, useEffect, useRef } from 'react';
import DoctorSlotSelector from './DoctorSlotSelector';
import { PaymentModal } from '../../payments/components';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

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
  if (!slot?.dayOfWeek || !slot?.startTime) return '';
  const targetDay = DAY_NAME_TO_INDEX[slot.dayOfWeek.toUpperCase()];
  if (targetDay === undefined) return '';
  const [hours = '0', minutes = '0'] = slot.startTime.split(':');
  const now = new Date();
  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setHours(Number(hours), Number(minutes), 0, 0);
  const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
  candidate.setDate(now.getDate() + daysUntilTarget);
  if (candidate <= now) candidate.setDate(candidate.getDate() + 7);
  return formatDateTimeLocal(candidate);
};

const formatReadableDateTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [appointmentAmount, setAppointmentAmount] = useState(0);

  const bottomPanelRef = useRef(null);

  // Auto-populate fields when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      setFormData((prev) => ({
        ...prev,
        doctorUsername: selectedSlot.doctorUsername || '',
        slotId: selectedSlot.slotId || '',
        appointmentDateTime: getNextSlotDateTime(selectedSlot),
      }));
      
      // Scroll to progressive disclosure panel
      setTimeout(() => {
        if (bottomPanelRef.current) {
          bottomPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 150);
    }
  }, [selectedSlot]);

  useEffect(() => {
    if (patientIdFromSession) {
      setFormData((prev) => ({ ...prev, patientId: patientIdFromSession }));
    }
  }, [patientIdFromSession]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId.trim()) newErrors.patientId = 'Patient ID is required';
    if (!formData.doctorUsername.trim()) newErrors.doctorUsername = 'Doctor username is required';
    if (!formData.slotId.trim()) newErrors.slotId = 'Slot ID is required';
    if (!formData.appointmentDateTime) newErrors.appointmentDateTime = 'Date and time is required';
    if (formData.appointmentMode === 'PHYSICAL' && !formData.hospital.trim()) {
      newErrors.hospital = 'Hospital/Location is required for physical appointments';
    }
    const selectedDateTime = new Date(formData.appointmentDateTime);
    if (selectedDateTime <= new Date()) newErrors.appointmentDateTime = 'Time must be in the future';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await onSubmit(formData);
      const newAppointmentId = response?.id || response?.appointmentId || 'appointment-' + Date.now();
      setAppointmentId(newAppointmentId);
      const fee = Number(selectedSlot?.consultationFee ?? response?.price);
      if (!fee || fee <= 0) {
        setErrors({ submit: 'Doctor has not set a consultation fee. Please contact support.' });
        return;
      }
      setAppointmentAmount(fee);
      setShowPaymentModal(true);
    } catch (error) {
      if (error?.status === 409) {
        setSelectedSlot(null);
        setErrors({ submit: 'This slot has already been booked. Please choose a different time.' });
        return;
      }
      setErrors({ submit: error?.message || 'Failed to create appointment.' });
    }
  };

  const handlePaymentSuccess = async (result) => {
    if (!result?.completed) return;
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
      setSelectedSlot(null);
      setSuccess(false);
      setAppointmentId(null);
    }, 2000);
  };

  return (
    <div className="relative pb-40">
      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-sm transition-all">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">✓</div>
          <div>
            <h4 className="font-bold">Booking Confirmed!</h4>
            <p className="text-sm font-medium">Your appointment has been successfully booked.</p>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm font-medium shadow-sm flex items-center gap-2">
          <span className="text-lg">⚠️</span> {errors.submit}
        </div>
      )}

      {/* Main Content Area - Grid of Doctors */}
      <DoctorSlotSelector
        onSlotSelected={setSelectedSlot}
        selectedDoctorUsername={formData.doctorUsername}
        selectedSlotId={formData.slotId}
        appointmentMode={formData.appointmentMode}
      />

      {/* Progressive Disclosure Bottom Panel */}
      {selectedSlot && (
        <div 
          ref={bottomPanelRef}
          className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 shadow-[0_-20px_40px_rgba(0,0,0,0.08)] z-40 transform transition-transform duration-500 ease-out"
        >
          <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                
                {/* Summary Info */}
                <div className="w-full xl:w-auto xl:flex-1 space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Booking Summary</h3>
                  <div className="flex flex-wrap gap-4 items-center text-slate-800">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      Dr. {selectedSlot.doctorName}
                    </div>
                    <div className="flex items-center gap-2 font-bold bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-sm border border-blue-100 shadow-sm">
                      <CalendarIcon className="w-4 h-4" />
                      {formatReadableDateTime(formData.appointmentDateTime)}
                    </div>
                  </div>
                </div>

                {/* Final Inputs & Actions */}
                <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-auto">
                    <select
                      name="appointmentMode"
                      value={formData.appointmentMode}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors cursor-pointer"
                    >
                      <option value="VIRTUAL">Virtual Consultation</option>
                      <option value="PHYSICAL">In-Person Visit</option>
                    </select>
                  </div>

                  {formData.appointmentMode === 'PHYSICAL' && (
                    <div className="w-full sm:w-auto">
                      <input
                        type="text"
                        name="hospital"
                        value={formData.hospital}
                        onChange={handleChange}
                        placeholder="Location / Hospital *"
                        className={`w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors ${errors.hospital ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                      />
                    </div>
                  )}

                  <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Symptoms or notes (optional)"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-colors"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Proceed to Payment
                        <span className="font-bold bg-blue-700 px-2 py-0.5 rounded-lg text-xs ml-1 shadow-inner">LKR {selectedSlot?.consultationFee || 0}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        appointmentId={appointmentId}
        patientId={formData.patientId}
        amount={appointmentAmount}
        currency="LKR"
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        appointmentDetails={{
          doctorName: selectedSlot?.doctorName || formData.doctorUsername,
          appointmentMode: formData.appointmentMode,
          hospital: formData.hospital,
          appointmentDateTime: formData.appointmentDateTime,
        }}
      />
    </div>
  );
};

export default AppointmentBookingForm;

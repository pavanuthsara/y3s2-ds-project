import { useEffect, useMemo, useState } from 'react';
import { doctorAppointmentsAPI, doctorPrescriptionAPI } from '../services/api';

const EMPTY_FORM = {
  patientId: '',
  appointmentId: '',
  medication: '',
  dosage: '',
  instructions: '',
  notes: '',
};

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

const normalizeAppointments = (appointments) => {
  if (!Array.isArray(appointments)) {
    return [];
  }

  return appointments
    .map((appointment) => ({
      appointmentDateTime: appointment.appointmentDateTime || appointment.createdAt || null,
      appointmentId: String(appointment.appointmentId || '').trim(),
      appointmentMode: appointment.appointmentMode || '',
      hospital: appointment.hospital || '',
      patientId: String(appointment.patientId || '').trim(),
      status: appointment.status || 'UNKNOWN',
    }))
    .filter((appointment) => appointment.patientId && appointment.appointmentId)
    .sort((left, right) => {
      const leftTime = left.appointmentDateTime ? new Date(left.appointmentDateTime).getTime() : 0;
      const rightTime = right.appointmentDateTime ? new Date(right.appointmentDateTime).getTime() : 0;
      return rightTime - leftTime;
    });
};

export default function DoctorPrescriptionsPanel({ profile, session }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createBusy, setCreateBusy] = useState(false);
  const [appointmentsBusy, setAppointmentsBusy] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);

  const patientOptions = useMemo(() => {
    const unique = new Set(appointments.map((appointment) => appointment.patientId));
    return Array.from(unique).sort((left, right) => left.localeCompare(right));
  }, [appointments]);

  const patientAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.patientId === selectedPatientId),
    [appointments, selectedPatientId]
  );

  const doctorIdentifier = useMemo(() => {
    const profileDoctorUsername = (profile?.doctorUsername || '').trim();
    if (profileDoctorUsername) {
      return profileDoctorUsername;
    }

    return (session?.username || '').trim();
  }, [profile?.doctorUsername, session?.username]);

  const syncLockedIdentifiers = (patientId, appointmentId) => {
    setForm((current) => ({
      ...current,
      patientId,
      appointmentId,
    }));
  };

  const loadDoctorAppointments = async () => {
    if (!doctorIdentifier) {
      return;
    }

    setAppointmentsBusy(true);
    setAppointmentsError('');

    try {
      const data = await doctorAppointmentsAPI.getDoctorAppointments(doctorIdentifier);
      const nextAppointments = normalizeAppointments(data);
      setAppointments(nextAppointments);
      if (nextAppointments.length === 0) {
        setSelectedPatientId('');
        setSelectedAppointmentId('');
        syncLockedIdentifiers('', '');
      }
    } catch (nextError) {
      setAppointments([]);
      setSelectedPatientId('');
      setSelectedAppointmentId('');
      syncLockedIdentifiers('', '');
      setAppointmentsError(nextError.message || 'Failed to load doctor appointments');
    } finally {
      setAppointmentsBusy(false);
    }
  };

  useEffect(() => {
    loadDoctorAppointments();
  }, [doctorIdentifier]);

  useEffect(() => {
    if (appointments.length === 0) {
      return;
    }

    const patientExists = patientOptions.includes(selectedPatientId);
    const nextPatientId = patientExists ? selectedPatientId : patientOptions[0] || '';
    const matchingAppointments = appointments.filter((appointment) => appointment.patientId === nextPatientId);
    const appointmentExists = matchingAppointments.some((appointment) => appointment.appointmentId === selectedAppointmentId);
    const nextAppointmentId = appointmentExists ? selectedAppointmentId : matchingAppointments[0]?.appointmentId || '';

    if (nextPatientId !== selectedPatientId) {
      setSelectedPatientId(nextPatientId);
    }

    if (nextAppointmentId !== selectedAppointmentId) {
      setSelectedAppointmentId(nextAppointmentId);
    }

    if (form.patientId !== nextPatientId || form.appointmentId !== nextAppointmentId) {
      syncLockedIdentifiers(nextPatientId, nextAppointmentId);
    }
  }, [appointments, patientOptions, selectedPatientId, selectedAppointmentId, form.patientId, form.appointmentId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPatientId || !selectedAppointmentId) {
      setError('Select a patient and appointment from your real appointment records first.');
      return;
    }

    setCreateBusy(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        patientId: selectedPatientId,
        appointmentId: selectedAppointmentId,
        medication: form.medication.trim(),
        dosage: form.dosage.trim(),
        instructions: form.instructions.trim(),
        notes: form.notes.trim() || null,
      };

      const created = await doctorPrescriptionAPI.createPrescription(payload);
      setMessage('Prescription created successfully.');
      setForm((current) => ({
        ...EMPTY_FORM,
        patientId: selectedPatientId,
        appointmentId: selectedAppointmentId,
      }));

      if (payload.patientId) {
        const nextPrescriptions = await doctorPrescriptionAPI.getPrescriptionsByPatientId(payload.patientId);
        setPrescriptions(Array.isArray(nextPrescriptions) ? nextPrescriptions : created ? [created] : []);
      }
    } catch (nextError) {
      setError(nextError.message || 'Failed to create prescription');
    } finally {
      setCreateBusy(false);
    }
  };

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!selectedPatientId) {
      setError('Select a patient from appointment data to load prescriptions.');
      return;
    }

    setLookupBusy(true);
    setError('');
    setMessage('');

    try {
      const data = await doctorPrescriptionAPI.getPrescriptionsByPatientId(selectedPatientId);
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (nextError) {
      setError(nextError.message || 'Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLookupBusy(false);
    }
  };

  const handlePatientSelection = (event) => {
    const nextPatientId = event.target.value;
    const nextAppointments = appointments.filter((appointment) => appointment.patientId === nextPatientId);
    const nextAppointmentId = nextAppointments[0]?.appointmentId || '';

    setSelectedPatientId(nextPatientId);
    setSelectedAppointmentId(nextAppointmentId);
    syncLockedIdentifiers(nextPatientId, nextAppointmentId);
  };

  const handleAppointmentSelection = (event) => {
    const nextAppointmentId = event.target.value;
    setSelectedAppointmentId(nextAppointmentId);
    syncLockedIdentifiers(selectedPatientId, nextAppointmentId);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Create Prescription</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Issue medication instructions for a patient</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select a real appointment first. Patient username and appointment ID are then auto-filled and locked.
          </p>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Appointment source: authenticated doctor schedule</span>
            <button
              className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={appointmentsBusy}
              onClick={loadDoctorAppointments}
              type="button"
            >
              {appointmentsBusy ? 'Refreshing...' : 'Refresh appointments'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Username contract is enforced for patient identifiers.
          </p>
        </div>

        {appointmentsError ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {appointmentsError}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="patientSelect">
              Select Patient (from appointments)
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="patientSelect"
              onChange={handlePatientSelection}
              required
              value={selectedPatientId}
            >
              <option value="">Select patient</option>
              {patientOptions.map((patientId) => (
                <option key={patientId} value={patientId}>
                  {patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="appointmentSelect">
              Select Appointment (for selected patient)
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="appointmentSelect"
              onChange={handleAppointmentSelection}
              required
              value={selectedAppointmentId}
            >
              <option value="">Select appointment</option>
              {patientAppointments.map((appointment) => (
                <option key={appointment.appointmentId} value={appointment.appointmentId}>
                  {appointment.appointmentId} - {formatDateTime(appointment.appointmentDateTime)} - {appointment.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="patientId">
              Patient Username (locked)
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="patientId"
              name="patientId"
              placeholder="Auto-filled from selected patient"
              readOnly
              required
              type="text"
              value={form.patientId}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="appointmentId">
              Appointment ID
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="appointmentId"
              name="appointmentId"
              placeholder="Auto-filled from selected appointment"
              readOnly
              required
              type="text"
              value={form.appointmentId}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="medication">
              Medication
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="medication"
              name="medication"
              onChange={handleChange}
              placeholder="Amoxicillin"
              required
              type="text"
              value={form.medication}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="dosage">
              Dosage
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="dosage"
              name="dosage"
              onChange={handleChange}
              placeholder="500mg twice daily"
              required
              type="text"
              value={form.dosage}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="instructions">
              Instructions
            </label>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="instructions"
              name="instructions"
              onChange={handleChange}
              placeholder="Take after meals for 5 days."
              required
              value={form.instructions}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
              id="notes"
              name="notes"
              onChange={handleChange}
              placeholder="Optional additional notes"
              value={form.notes}
            />
          </div>

          <button
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createBusy}
            type="submit"
          >
            {createBusy ? 'Saving...' : 'Create Prescription'}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Patient Lookup</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">View prescriptions for selected patient</h2>
        </div>

        <form className="mb-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleLookup}>
          <select
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            onChange={handlePatientSelection}
            value={selectedPatientId}
          >
            <option value="">Select patient</option>
            {patientOptions.map((patientId) => (
              <option key={patientId} value={patientId}>
                {patientId}
              </option>
            ))}
          </select>
          <button
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={lookupBusy}
            type="submit"
          >
            {lookupBusy ? 'Loading...' : 'Load Prescriptions'}
          </button>
        </form>

        {prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No prescriptions loaded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={prescription.id || index}>
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {prescription.medication || 'Medication'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Dosage: {prescription.dosage || 'Not specified'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    Issued {formatDateTime(prescription.issuedAt)}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Patient Username</p>
                    <p className="font-medium text-slate-800">{prescription.patientId || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Appointment ID</p>
                    <p className="break-all font-medium text-slate-800">{prescription.appointmentId || 'Not available'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-slate-500 text-sm">Instructions</p>
                  <p className="mt-1 text-sm text-slate-800">{prescription.instructions || 'No instructions provided.'}</p>
                </div>

                {prescription.notes ? (
                  <div className="mt-4">
                    <p className="text-slate-500 text-sm">Notes</p>
                    <p className="mt-1 text-sm text-slate-800">{prescription.notes}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

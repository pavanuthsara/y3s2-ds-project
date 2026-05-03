import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doctorPrescriptionAPI } from "../services/api";

const EMPTY_FORM = {
  medication: "",
  dosage: "",
  instructions: "",
  notes: "",
};

const EMPTY_EDIT_STATE = null;

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export default function DoctorPrescriptionsPanel({ session }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createBusy, setCreateBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  const [editingPrescription, setEditingPrescription] =
    useState(EMPTY_EDIT_STATE);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedAppointment = {
    appointmentId: searchParams.get("appointmentId") || "",
    patientId: searchParams.get("patientId") || "",
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const clearSelectedAppointment = () => {
    navigate("/doctor/prescriptions");
  };

  const startEdit = (prescription) => {
    setMessage("");
    setError("");
    setEditingPrescription(prescription);
    setForm({
      medication: prescription.medication || "",
      dosage: prescription.dosage || "",
      instructions: prescription.instructions || "",
      notes: prescription.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingPrescription(EMPTY_EDIT_STATE);
    setForm(EMPTY_FORM);
    setMessage("");
    setError("");
  };

  useEffect(() => {
    let cancelled = false;

    const loadPrescriptions = async () => {
      if (!session?.username) {
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data =
          await doctorPrescriptionAPI.getPrescriptionsByDoctorUsername(
            session.username,
          );
        if (!cancelled) {
          setPrescriptions(Array.isArray(data) ? data : []);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError.message || "Failed to load prescriptions");
          setPrescriptions([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    loadPrescriptions();

    return () => {
      cancelled = true;
    };
  }, [session?.username]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !editingPrescription &&
      (!selectedAppointment.appointmentId || !selectedAppointment.patientId)
    ) {
      setError(
        "Select an appointment from the appointments tab to create a prescription.",
      );
      return;
    }

    setCreateBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        medication: form.medication.trim(),
        dosage: form.dosage.trim(),
        instructions: form.instructions.trim(),
        notes: form.notes.trim() || null,
      };

      if (editingPrescription) {
        setEditBusy(true);
        const updated = await doctorPrescriptionAPI.updatePrescription(
          editingPrescription.id,
          payload,
        );
        setMessage("Prescription updated successfully.");
        setPrescriptions((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        setEditingPrescription(EMPTY_EDIT_STATE);
        setForm(EMPTY_FORM);
      } else {
        const createPayload = {
          ...payload,
          patientId: selectedAppointment.patientId.trim(),
          appointmentId: selectedAppointment.appointmentId.trim(),
        };

        const created =
          await doctorPrescriptionAPI.createPrescription(createPayload);
        setMessage("Prescription created successfully.");
        setForm(EMPTY_FORM);
        setPrescriptions((current) => [
          created,
          ...current.filter((item) => item.id !== created.id),
        ]);
      }
    } catch (nextError) {
      setError(nextError.message || "Failed to save prescription");
    } finally {
      setCreateBusy(false);
      setEditBusy(false);
    }
  };

  const handleDelete = async (prescription) => {
    if (!window.confirm("Delete this prescription?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await doctorPrescriptionAPI.deletePrescription(prescription.id);
      setPrescriptions((current) =>
        current.filter((item) => item.id !== prescription.id),
      );
      if (editingPrescription?.id === prescription.id) {
        cancelEdit();
      }
      setMessage("Prescription deleted successfully.");
    } catch (nextError) {
      setError(nextError.message || "Failed to delete prescription");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            {editingPrescription ? "Edit Prescription" : "Create Prescription"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {editingPrescription
              ? "Update an existing prescription"
              : "Issue medication instructions for an appointment"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {editingPrescription
              ? "Edit the medication details for this prescription. Appointment and patient links stay unchanged."
              : "Appointment and patient details are pulled from the selected appointment so you only enter the medication details."}
          </p>
        </div>

        {!editingPrescription ? (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Selected appointment
                </p>
                <div className="mt-3 text-sm">
                   {selectedAppointment.appointmentId ? (
                     <p className="font-medium text-slate-900 flex items-center gap-2">
                       <span className="text-emerald-600 font-bold">✓</span> Appointment Selected
                     </p>
                   ) : (
                     <p className="text-slate-500">Choose an appointment from the Appointments tab</p>
                   )}
                </div>
              </div>
              {selectedAppointment.appointmentId ? (
                <button
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                  onClick={clearSelectedAppointment}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Editing existing prescription.
            <button
              className="ml-3 inline-flex rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
              onClick={cancelEdit}
              type="button"
            >
              Cancel edit
            </button>
          </div>
        )}

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
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="medication"
            >
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
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="dosage"
            >
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
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="instructions"
            >
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
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="notes"
            >
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
            disabled={
              createBusy ||
              editBusy ||
              (!editingPrescription &&
                (!selectedAppointment.appointmentId ||
                  !selectedAppointment.patientId))
            }
            type="submit"
          >
            {createBusy || editBusy
              ? "Saving..."
              : editingPrescription
                ? "Save Changes"
                : "Create Prescription"}
          </button>
          {editingPrescription ? (
            <button
              className="ml-3 inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={cancelEdit}
              type="button"
            >
              Cancel
            </button>
          ) : null}
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Prescription History
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            All prescriptions issued by you
          </h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Loading prescription history...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No prescriptions have been issued by you yet.
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                key={prescription.id || index}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {prescription.medication || "Medication"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Dosage: {prescription.dosage || "Not specified"}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    Issued {formatDateTime(prescription.issuedAt)}
                  </p>
                </div>



                <div className="mt-4">
                  <p className="text-slate-500 text-sm">Instructions</p>
                  <p className="mt-1 text-sm text-slate-800">
                    {prescription.instructions || "No instructions provided."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white"
                    onClick={() => startEdit(prescription)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    onClick={() => handleDelete(prescription)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>

                {prescription.notes ? (
                  <div className="mt-4">
                    <p className="text-slate-500 text-sm">Notes</p>
                    <p className="mt-1 text-sm text-slate-800">
                      {prescription.notes}
                    </p>
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

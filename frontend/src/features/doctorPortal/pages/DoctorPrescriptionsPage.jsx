import { useState } from "react";
import DoctorPortalLayout from "../components/DoctorPortalLayout";
import { createDoctorPrescription } from "../api/doctorPortalApi";
import { getDoctorSession } from "../auth/doctorSession";

const session = getDoctorSession();
const DEFAULT_CONTEXT = session || {
  userId: "doctor_001",
  userRole: "ROLE_DOCTOR",
};

const DEFAULT_FORM = {
  patientId: "",
  appointmentId: "",
  medication: "",
  dosage: "",
  instructions: "",
  notes: "",
};

function DoctorPrescriptionsPage() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [issued, setIssued] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onContextChange = (field) => (event) => {
    setContext((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onFormChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const payload = {
        ...form,
        appointmentId: form.appointmentId,
      };
      const created = await createDoctorPrescription(context, payload);
      setIssued((prev) => [created, ...prev]);
      setForm(DEFAULT_FORM);
      setStatus({ loading: false, error: "", success: "Prescription issued successfully." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <DoctorPortalLayout
      title="Digital Prescriptions"
      subtitle="Issue and track prescriptions after consultations."
    >
      <section className="panel">
        <div className="panel-title-row">
          <h3>Auth Context</h3>
          <p>Required for doctor-service write operations</p>
        </div>
        <div className="grid-two">
          <label>
            Doctor Username
            <input value={context.userId} onChange={onContextChange("userId")} />
          </label>

          <label>
            Role
            <input value={context.userRole} onChange={onContextChange("userRole")} />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h3>Issue Prescription</h3>
          <p>Creates POST /api/prescriptions payload</p>
        </div>

        <form className="doctor-form-grid" onSubmit={onSubmit}>
          <label>
            Patient ID
            <input value={form.patientId} onChange={onFormChange("patientId")} required />
          </label>

          <label>
            Appointment ID (UUID)
            <input value={form.appointmentId} onChange={onFormChange("appointmentId")} required />
          </label>

          <label>
            Medication
            <input value={form.medication} onChange={onFormChange("medication")} required />
          </label>

          <label>
            Dosage
            <input value={form.dosage} onChange={onFormChange("dosage")} required />
          </label>

          <label className="full-row">
            Instructions
            <input value={form.instructions} onChange={onFormChange("instructions")} required />
          </label>

          <label className="full-row">
            Notes
            <input value={form.notes} onChange={onFormChange("notes")} />
          </label>

          <button type="submit" className="btn-primary full-row" disabled={status.loading}>
            {status.loading ? "Submitting..." : "Issue Prescription"}
          </button>
        </form>
      </section>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <section className="panel">
        <div className="panel-title-row">
          <h3>Recently Issued</h3>
          <p>{issued.length} records this session</p>
        </div>

        {issued.length === 0 ? (
          <p className="empty-state">No newly issued prescriptions yet.</p>
        ) : (
          <ul className="doctor-list">
            {issued.map((item) => (
              <li key={item.id} className="doctor-row-card">
                <div>
                  <strong>{item.medication}</strong>
                  <p>
                    Patient: {item.patientId} | Appointment: {item.appointmentId}
                  </p>
                </div>
                <span className="tag-active">Issued</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DoctorPortalLayout>
  );
}

export default DoctorPrescriptionsPage;

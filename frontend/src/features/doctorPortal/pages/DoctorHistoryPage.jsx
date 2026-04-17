import { useState } from "react";
import DoctorPortalLayout from "../components/DoctorPortalLayout";
import { getDoctorAppointments } from "../api/doctorPortalApi";
import { getDoctorSession } from "../auth/doctorSession";

const session = getDoctorSession();
const DEFAULT_CONTEXT = session || {
  userId: "doctor_001",
  userRole: "ROLE_DOCTOR",
};

function DoctorHistoryPage() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onContextChange = (field) => (event) => {
    setContext((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadHistory = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await getDoctorAppointments(context, context.userId);
      const completed = (data || []).filter((item) =>
        ["ACCEPTED", "COMPLETED", "FINISHED"].includes((item.status || "").toUpperCase()),
      );
      setHistory(completed);
      setStatus({ loading: false, error: "", success: "Consultation history loaded." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <DoctorPortalLayout
      title="Consultation History"
      subtitle="Review past consultations, outcomes, and appointment statuses."
    >
      <section className="panel">
        <div className="panel-title-row">
          <h3>Fetch History</h3>
          <p>Derived from doctor appointment stream</p>
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

        <button className="btn-primary" type="button" onClick={loadHistory} disabled={status.loading}>
          {status.loading ? "Loading..." : "Load History"}
        </button>
      </section>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <section className="panel">
        <div className="panel-title-row">
          <h3>Consultation Timeline</h3>
          <p>{history.length} completed records</p>
        </div>

        {history.length === 0 ? (
          <p className="empty-state">No consultation history returned yet.</p>
        ) : (
          <ul className="doctor-list">
            {history.map((item) => (
              <li key={item.appointmentId} className="doctor-row-card">
                <div>
                  <strong>Patient: {item.patientId || "Unknown"}</strong>
                  <p>
                    Appointment: {item.appointmentId} | Status: {item.status}
                  </p>
                </div>
                <span className="tag-active">Archived</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DoctorPortalLayout>
  );
}

export default DoctorHistoryPage;

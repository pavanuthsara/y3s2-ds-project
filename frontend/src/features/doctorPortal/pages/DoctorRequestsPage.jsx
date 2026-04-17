import { useState } from "react";
import DoctorPortalLayout from "../components/DoctorPortalLayout";
import {
  acceptDoctorAppointment,
  getDoctorAppointments,
  rejectDoctorAppointment,
} from "../api/doctorPortalApi";
import { getDoctorSession } from "../auth/doctorSession";

const session = getDoctorSession();
const DEFAULT_CONTEXT = session || {
  userId: "doctor_001",
  userRole: "ROLE_DOCTOR",
};

function DoctorRequestsPage() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onChange = (field) => (event) => {
    setContext((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadAppointments = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await getDoctorAppointments(context, context.userId);
      setAppointments(data || []);
      setStatus({ loading: false, error: "", success: "Appointments loaded." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  const handleDecision = async (appointmentId, action) => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      if (action === "accept") {
        await acceptDoctorAppointment(context, appointmentId);
      } else {
        await rejectDoctorAppointment(context, appointmentId);
      }

      setAppointments((prev) =>
        prev.map((item) => (item.appointmentId === appointmentId ? { ...item, status: action.toUpperCase() } : item)),
      );
      setStatus({ loading: false, error: "", success: `Appointment ${action}ed successfully.` });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <DoctorPortalLayout
      title="Appointment Requests"
      subtitle="Review booking requests and respond quickly."
    >
      <section className="panel">
        <div className="panel-title-row">
          <h3>Doctor Context</h3>
          <p>Matches gateway injected headers</p>
        </div>
        <div className="grid-two">
          <label>
            Doctor Username
            <input value={context.userId} onChange={onChange("userId")} />
          </label>

          <label>
            Role
            <input value={context.userRole} onChange={onChange("userRole")} />
          </label>
        </div>
        <button type="button" className="btn-primary" onClick={loadAppointments} disabled={status.loading}>
          {status.loading ? "Loading..." : "Load Requests"}
        </button>
      </section>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <section className="panel">
        <div className="panel-title-row">
          <h3>Pending and Recent Requests</h3>
          <p>{appointments.length} items</p>
        </div>

        {appointments.length === 0 ? (
          <p className="empty-state">No appointments loaded yet. Use the button above.</p>
        ) : (
          <ul className="doctor-list">
            {appointments.map((appointment) => (
              <li key={appointment.appointmentId} className="doctor-row-card">
                <div>
                  <strong>{appointment.patientId || "Unknown patient"}</strong>
                  <p>
                    Appointment ID: {appointment.appointmentId} | Status: {appointment.status || "PENDING"}
                  </p>
                </div>
                <div className="button-group">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={status.loading}
                    onClick={() => handleDecision(appointment.appointmentId, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={status.loading}
                    onClick={() => handleDecision(appointment.appointmentId, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DoctorPortalLayout>
  );
}

export default DoctorRequestsPage;

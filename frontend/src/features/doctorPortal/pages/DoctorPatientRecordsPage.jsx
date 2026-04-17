import { useState } from "react";
import { useParams } from "react-router-dom";
import DoctorPortalLayout from "../components/DoctorPortalLayout";
import { getPatientReports } from "../api/doctorPortalApi";
import { getDoctorSession } from "../auth/doctorSession";

const session = getDoctorSession();
const DEFAULT_CONTEXT = session || {
  userId: "doctor_001",
  userRole: "ROLE_DOCTOR",
};

function DoctorPatientRecordsPage() {
  const { patientId: routePatientId } = useParams();
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [patientId, setPatientId] = useState(routePatientId || "patient_001");
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onContextChange = (field) => (event) => {
    setContext((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadReports = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await getPatientReports(context, context.userId, patientId);
      setReports(data || []);
      setStatus({ loading: false, error: "", success: "Patient reports loaded." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <DoctorPortalLayout
      title="Patient Records"
      subtitle="View uploaded reports and history artifacts for clinical decisions."
    >
      <section className="panel">
        <div className="panel-title-row">
          <h3>Lookup Context</h3>
          <p>Uses doctor-service patient report endpoint</p>
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

          <label className="full-row">
            Patient ID
            <input value={patientId} onChange={(event) => setPatientId(event.target.value)} />
          </label>
        </div>

        <button className="btn-primary" type="button" onClick={loadReports} disabled={status.loading}>
          {status.loading ? "Loading..." : "Load Patient Reports"}
        </button>
      </section>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <section className="panel">
        <div className="panel-title-row">
          <h3>Reports</h3>
          <p>{reports.length} records found</p>
        </div>

        {reports.length === 0 ? (
          <p className="empty-state">No records returned yet.</p>
        ) : (
          <ul className="doctor-list">
            {reports.map((report) => (
              <li key={report.reportId} className="doctor-row-card">
                <div>
                  <strong>{report.reportType || "Medical Report"}</strong>
                  <p>{report.summary || "No summary available."}</p>
                </div>
                <a className="btn-ghost" href={report.fileUrl} target="_blank" rel="noreferrer">
                  Open File
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DoctorPortalLayout>
  );
}

export default DoctorPatientRecordsPage;

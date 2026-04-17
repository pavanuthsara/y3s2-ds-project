import DoctorPortalLayout from "../components/DoctorPortalLayout";

const dashboardMetrics = [
  { label: "Pending Requests", value: "6" },
  { label: "Today Consultations", value: "4" },
  { label: "Prescriptions Issued", value: "18" },
  { label: "Active Slots", value: "12" },
];

function DoctorDashboardPage() {
  return (
    <DoctorPortalLayout
      title="Doctor Dashboard"
      subtitle="Your workbench for appointments, slots, and patient care tasks."
    >
      <section className="doctor-metric-grid">
        {dashboardMetrics.map((metric) => (
          <article key={metric.label} className="doctor-metric-card">
            <p>{metric.label}</p>
            <h2>{metric.value}</h2>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title-row">
          <h3>Today at a glance</h3>
          <p>Quick planning notes</p>
        </div>
        <ul className="doctor-list">
          <li>Check pending appointment decisions before 10:00 AM.</li>
          <li>Issue post-consultation prescriptions for completed sessions.</li>
          <li>Review uploaded patient reports for afternoon consultations.</li>
        </ul>
      </section>
    </DoctorPortalLayout>
  );
}

export default DoctorDashboardPage;

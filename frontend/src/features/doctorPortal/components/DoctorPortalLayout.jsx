import { NavLink } from "react-router-dom";

const portalLinks = [
  { to: "/doctor/dashboard", label: "Dashboard" },
  { to: "/doctor/availability", label: "Availability" },
  { to: "/doctor/requests", label: "Requests" },
  { to: "/doctor/prescriptions", label: "Prescriptions" },
  { to: "/doctor/patients/patient_001/records", label: "Records" },
  { to: "/doctor/history", label: "History" },
];

function DoctorPortalLayout({ title, subtitle, children }) {
  return (
    <section className="doctor-portal-shell">
      <header className="doctor-portal-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="doctor-chip">Doctor Portal</div>
      </header>

      <nav className="doctor-subnav" aria-label="Doctor portal pages">
        {portalLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `doctor-subnav-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="doctor-portal-content">{children}</div>
    </section>
  );
}

export default DoctorPortalLayout;

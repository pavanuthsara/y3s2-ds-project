import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import DoctorAvailabilityPage from "./features/doctorAvailability/pages/DoctorAvailabilityPage";
import DoctorDashboardPage from "./features/doctorPortal/pages/DoctorDashboardPage";
import DoctorRequestsPage from "./features/doctorPortal/pages/DoctorRequestsPage";
import DoctorPrescriptionsPage from "./features/doctorPortal/pages/DoctorPrescriptionsPage";
import DoctorPatientRecordsPage from "./features/doctorPortal/pages/DoctorPatientRecordsPage";
import DoctorHistoryPage from "./features/doctorPortal/pages/DoctorHistoryPage";
import DoctorLoginPage from "./features/doctorPortal/pages/DoctorLoginPage";
import DoctorRegisterPage from "./features/doctorPortal/pages/DoctorRegisterPage";

function App() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/doctor/dashboard">Doctor Portal</Link>
          </li>
          <li>
            <Link to="/doctor/login">Doctor Login</Link>
          </li>
        </ul>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctor/login" element={<DoctorLoginPage />} />
          <Route path="/doctor/register" element={<DoctorRegisterPage />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
          <Route path="/doctor/requests" element={<DoctorRequestsPage />} />
          <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
          <Route path="/doctor/patients/:patientId/records" element={<DoctorPatientRecordsPage />} />
          <Route path="/doctor/history" element={<DoctorHistoryPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

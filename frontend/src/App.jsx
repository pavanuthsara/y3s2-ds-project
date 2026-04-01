import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Auth Components
import PatientLogin from "./auth-service/PatientLogin";
import PatientRegister from "./auth-service/PatientRegister";
import DoctorLogin from "./auth-service/DoctorLogin";
import DoctorRegister from "./auth-service/DoctorRegister";
import AdminLogin from "./auth-service/AdminLogin";
import AdminRegister from "./auth-service/AdminRegister";

// Patient Service Components
import PatientDashboard from "./patient-service/PatientDashboard";
import PatientProfile from "./patient-service/PatientProfile";

// Home/Landing Page
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home/Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Patient Routes */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/profile" element={<PatientProfile />} />

        {/* Doctor Routes */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

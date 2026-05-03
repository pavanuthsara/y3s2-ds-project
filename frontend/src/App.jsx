import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./features/public/pages/HomePage";
import AboutPage from "./features/public/pages/AboutPage";
import ContactPage from "./features/public/pages/ContactPage";
import PatientPortal from "./features/patientPortal/pages/PatientPortal";
import DoctorPortal from "./features/doctorPortal/pages/DoctorPortal";
import { PaymentPage } from "./features/payments/pages";
import TelemedicinePage from "./features/telemedicine/pages/TelemedicinePage";
import { isLoggedIn } from "./features/patientPortal/services/api";
import { isDoctorLoggedIn } from "./features/doctorPortal/services/api";

function ProtectedPatientRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/patient" replace />;
  }
  return children;
}

function ProtectedDoctorRoute({ children }) {
  if (!isDoctorLoggedIn()) {
    return <Navigate to="/doctor" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/patient" element={<PatientPortal />} />
      <Route
        path="/patient/payments"
        element={
          <ProtectedPatientRoute>
            <PaymentPage />
          </ProtectedPatientRoute>
        }
      />
      <Route
        path="/telemedicine/:appointmentId"
        element={
          <ProtectedPatientRoute>
            <TelemedicinePage />
          </ProtectedPatientRoute>
        }
      />
      <Route
        path="/payments/confirmation"
        element={<Navigate to="/patient/payments" replace />}
      />
      <Route
        path="/doctor"
        element={<DoctorPortal initialTab="profile" />}
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedDoctorRoute>
            <DoctorPortal initialTab="availability" />
          </ProtectedDoctorRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedDoctorRoute>
            <DoctorPortal initialTab="appointments" />
          </ProtectedDoctorRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedDoctorRoute>
            <DoctorPortal initialTab="prescriptions" />
          </ProtectedDoctorRoute>
        }
      />
    </Routes>
  );
}

export default App;

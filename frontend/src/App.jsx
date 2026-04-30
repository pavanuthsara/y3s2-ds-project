import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./features/public/pages/HomePage";
import AboutPage from "./features/public/pages/AboutPage";
import ContactPage from "./features/public/pages/ContactPage";
import PatientPortal from "./features/patientPortal/pages/PatientPortal";
import DoctorPortal from "./features/doctorPortal/pages/DoctorPortal";
import { PaymentPage } from "./features/payments/pages";
import TelemedicinePage from "./features/telemedicine/pages/TelemedicinePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/patient" element={<PatientPortal />} />
      <Route path="/patient/payments" element={<PaymentPage />} />
      <Route
        path="/telemedicine/:appointmentId"
        element={<TelemedicinePage />}
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
        element={<DoctorPortal initialTab="availability" />}
      />
      <Route
        path="/doctor/appointments"
        element={<DoctorPortal initialTab="appointments" />}
      />
      <Route
        path="/doctor/prescriptions"
        element={<DoctorPortal initialTab="prescriptions" />}
      />
    </Routes>
  );
}

export default App;

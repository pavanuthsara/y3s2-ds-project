import './App.css'

import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import PatientPortal from './features/patientPortal/pages/PatientPortal'
import DoctorPortal from './features/doctorPortal/pages/DoctorPortal'
import { PaymentPage } from './features/payments/pages'
import HealthLanding from './components/HealthLanding'


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
            <Link to="/patient">Patient Portal</Link>
          </li>
          <li>
            <Link to="/doctor">Doctor Portal</Link>
          </li>
        </ul>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HealthLanding />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/patient" element={<PatientPortal />} />
          <Route path="/patient/payments" element={<PaymentPage />} />
          <Route path="/payments/confirmation" element={<Navigate to="/patient/payments" replace />} />
          <Route path="/doctor" element={<DoctorPortal initialTab="profile" />} />
          <Route path="/doctor/availability" element={<DoctorPortal initialTab="availability" />} />
          <Route path="/doctor/prescriptions" element={<DoctorPortal initialTab="prescriptions" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

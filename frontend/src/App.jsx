import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import { SymptomChecker } from './components/SymptomChecker'
import DoctorAvailabilityPage from './features/doctorAvailability/pages/DoctorAvailabilityPage'
import PatientPortal from './features/patientPortal/pages/PatientPortal'

function App() {
  const [count, setCount] = useState(0)

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
            <Link to="/symptom-checker">AI Symptom Checker</Link>
          </li>
          <li>
            <Link to="/patient">Patient Portal</Link>
          </li>
          <li>
            <Link to="/doctor/availability">Doctor Availability</Link>
          </li>
        </ul>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/patient" element={<PatientPortal />} />
          <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

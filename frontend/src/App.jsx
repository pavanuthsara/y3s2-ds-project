import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import About from './components/About'
import Contact from './components/Contact'
import PatientPortal from './features/patientPortal/pages/PatientPortal'
import DoctorPortal from './features/doctorPortal/pages/DoctorPortal'
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
          <Route path="/doctor" element={<DoctorPortal initialTab="profile" />} />
          <Route path="/doctor/availability" element={<DoctorPortal initialTab="availability" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

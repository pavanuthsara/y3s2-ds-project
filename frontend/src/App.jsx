import { Link, Route, Routes } from "react-router-dom";
import About from "./components/About";
import Contact from "./components/Contact";
import Home from "./components/Home";
import DoctorAvailabilityPage from "./features/doctorAvailability/pages/DoctorAvailabilityPage";

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
            <Link to="/doctor/availability">Doctor Availability</Link>
          </li>
        </ul>
      </nav>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

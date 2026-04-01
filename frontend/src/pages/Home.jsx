import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Healthcare Platform</h1>
      <p>Welcome to our healthcare management system</p>

      <section>
        <h2>Patient</h2>
        <nav>
          <ul>
            <li>
              <Link to="/patient/login">Patient Login</Link>
            </li>
            <li>
              <Link to="/patient/register">Patient Register</Link>
            </li>
          </ul>
        </nav>
      </section>

      <section>
        <h2>Doctor</h2>
        <nav>
          <ul>
            <li>
              <Link to="/doctor/login">Doctor Login</Link>
            </li>
            <li>
              <Link to="/doctor/register">Doctor Register</Link>
            </li>
          </ul>
        </nav>
      </section>

      <section>
        <h2>Admin</h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin/login">Admin Login</Link>
            </li>
            <li>
              <Link to="/admin/register">Admin Register</Link>
            </li>
          </ul>
        </nav>
      </section>
    </div>
  );
}

export default Home;

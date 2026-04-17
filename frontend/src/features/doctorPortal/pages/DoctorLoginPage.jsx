import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { loginDoctor } from "../api/doctorPortalApi";
import { saveDoctorSession } from "../auth/doctorSession";

function DoctorLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const authResponse = await loginDoctor(form);
      const role = authResponse?.role ? `ROLE_${authResponse.role}` : "ROLE_DOCTOR";

      saveDoctorSession({
        token: authResponse?.token,
        userId: authResponse?.username || form.username,
        userRole: role,
      });

      setStatus({ loading: false, error: "", success: "Login successful. Redirecting to dashboard..." });
      navigate("/doctor/dashboard");
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <section className="auth-shell">
      <article className="auth-card">
        <h1>Doctor Login</h1>
        <p>Sign in with your doctor account credentials.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Username
            <input value={form.username} onChange={onChange("username")} placeholder="doctor_001" required />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={onChange("password")}
              placeholder="••••••••"
              required
            />
          </label>

          <button className="btn-primary" type="submit" disabled={status.loading}>
            {status.loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {status.error ? <p className="notice error">{status.error}</p> : null}
        {status.success ? <p className="notice success">{status.success}</p> : null}

        <p className="auth-footer">
          Need a doctor account? <Link to="/doctor/register">Register here</Link>
        </p>
      </article>
    </section>
  );
}

export default DoctorLoginPage;

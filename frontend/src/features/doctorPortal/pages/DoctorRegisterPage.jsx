import { useState } from "react";
import { Link } from "react-router-dom";
import { registerDoctor, upsertDoctorProfile } from "../api/doctorPortalApi";

function DoctorRegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    specialty: "",
  });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      await registerDoctor({ ...form, role: "DOCTOR" });

      await upsertDoctorProfile(
        { userId: form.username, userRole: "ROLE_DOCTOR" },
        form.username,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          specialty: form.specialty,
          consultationFee: 0,
        },
      );

      setStatus({
        loading: false,
        error: "",
        success: "Doctor account and profile created successfully. You can now login.",
      });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  };

  return (
    <section className="auth-shell">
      <article className="auth-card wide">
        <h1>Doctor Registration</h1>
        <p>Create your doctor account for platform access.</p>

        <form className="auth-form grid-two" onSubmit={onSubmit}>
          <label>
            First Name
            <input value={form.firstName} onChange={onChange("firstName")} required />
          </label>

          <label>
            Last Name
            <input value={form.lastName} onChange={onChange("lastName")} required />
          </label>

          <label>
            Username
            <input value={form.username} onChange={onChange("username")} required />
          </label>

          <label>
            Email
            <input type="email" value={form.email} onChange={onChange("email")} required />
          </label>

          <label>
            Specialty
            <input value={form.specialty} onChange={onChange("specialty")} required />
          </label>

          <label className="full-row">
            Password
            <input type="password" value={form.password} onChange={onChange("password")} required />
          </label>

          <button className="btn-primary full-row" type="submit" disabled={status.loading}>
            {status.loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {status.error ? <p className="notice error">{status.error}</p> : null}
        {status.success ? <p className="notice success">{status.success}</p> : null}

        <p className="auth-footer">
          Already have an account? <Link to="/doctor/login">Go to login</Link>
        </p>
      </article>
    </section>
  );
}

export default DoctorRegisterPage;

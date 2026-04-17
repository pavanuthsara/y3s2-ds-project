import { useState } from 'react';

const EMPTY_LOGIN_FORM = {
  username: '',
  password: '',
};

const EMPTY_REGISTER_FORM = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  specialty: '',
};

function DoctorLoginForm({ form, onChange, onSubmit, isBusy, error }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 font-semibold text-slate-800">
        Username
        <input
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
          name="username"
          onChange={onChange}
          required
          value={form.username}
        />
      </label>
      <label className="grid gap-2 font-semibold text-slate-800">
        Password
        <input
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
          name="password"
          onChange={onChange}
          required
          type="password"
          value={form.password}
        />
      </label>
      <button
        className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        disabled={isBusy}
        type="submit"
      >
        {isBusy ? 'Signing in...' : 'Doctor login'}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </form>
  );
}

function DoctorRegisterForm({ form, onChange, onSubmit, isBusy, error }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 font-semibold text-slate-800">
        Username
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="username" onChange={onChange} required value={form.username} />
      </label>
      <label className="grid gap-2 font-semibold text-slate-800">
        Email
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="email" onChange={onChange} required type="email" value={form.email} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 font-semibold text-slate-800">
          First name
          <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="firstName" onChange={onChange} required value={form.firstName} />
        </label>
        <label className="grid gap-2 font-semibold text-slate-800">
          Last name
          <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="lastName" onChange={onChange} required value={form.lastName} />
        </label>
      </div>
      <label className="grid gap-2 font-semibold text-slate-800">
        Specialty
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="specialty" onChange={onChange} required value={form.specialty} />
      </label>
      <label className="grid gap-2 font-semibold text-slate-800">
        Password
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-3" name="password" onChange={onChange} required type="password" value={form.password} />
      </label>
      <button
        className="rounded-2xl bg-emerald-700 px-4 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        disabled={isBusy}
        type="submit"
      >
        {isBusy ? 'Creating account...' : 'Create doctor account'}
      </button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </form>
  );
}

export default function DoctorAuthPage({ onLogin, onRegister, busy, error }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN_FORM);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER_FORM);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    onLogin(loginForm);
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    onRegister(registerForm);
  };

  return (
    <main className="grid min-h-[calc(100vh-8rem)] gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.95fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f4f4f5_0%,#e0f2fe_45%,#dcfce7_100%)] p-8 shadow-xl lg:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-slate-500">Doctor Workspace</p>
        <h1 className="mb-4 text-4xl font-semibold text-slate-900">Doctor access, profile setup, and schedule control.</h1>
        <p className="max-w-xl text-lg text-slate-700">
          Sign in with a doctor account, complete your professional profile, and manage availability from one dashboard tied to the backend services you just validated.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">Role-aware auth</span>
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">Own profile management</span>
          <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-700">Availability controls</span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl lg:p-8">
        <div className="mb-6 flex gap-3">
          <button
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
            onClick={() => setMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <DoctorLoginForm error={error} form={loginForm} isBusy={busy} onChange={handleLoginChange} onSubmit={handleLoginSubmit} />
        ) : (
          <DoctorRegisterForm error={error} form={registerForm} isBusy={busy} onChange={handleRegisterChange} onSubmit={handleRegisterSubmit} />
        )}
      </section>
    </main>
  );
}

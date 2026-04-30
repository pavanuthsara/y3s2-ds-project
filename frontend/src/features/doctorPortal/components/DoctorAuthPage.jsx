import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../../../components/public/SiteHeader';
import { Activity, UserIcon } from 'lucide-react';

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
};

function DoctorLoginForm({ form, onChange, onSubmit, isBusy, error }) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
        <input
          className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
          name="username"
          onChange={onChange}
          placeholder="doctor_username"
          required
          value={form.username}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
        <input
          className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
          name="password"
          onChange={onChange}
          placeholder="••••••••"
          required
          type="password"
          value={form.password}
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
          {error}
        </div>
      )}
      <div className="pt-2">
        <button
          className="w-full py-3 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold shadow-soft hover:opacity-90 transition-base disabled:opacity-50"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? 'Signing in...' : 'Sign In to Doctor Portal'}
        </button>
      </div>
    </form>
  );
}

function DoctorRegisterForm({ form, onChange, onSubmit, isBusy, error }) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
        <input
          className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
          name="username"
          onChange={onChange}
          placeholder="doctor_username"
          required
          value={form.username}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <input
          className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
          name="email"
          onChange={onChange}
          placeholder="doctor@hospital.com"
          required
          type="email"
          value={form.email}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">First name</label>
          <input
            className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
            name="firstName"
            onChange={onChange}
            placeholder="John"
            required
            value={form.firstName}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Last name</label>
          <input
            className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
            name="lastName"
            onChange={onChange}
            placeholder="Smith"
            required
            value={form.lastName}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
        <input
          className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
          name="password"
          onChange={onChange}
          placeholder="••••••••"
          required
          type="password"
          value={form.password}
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
          {error}
        </div>
      )}
      <div className="pt-2">
        <button
          className="w-full py-3 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold shadow-soft hover:opacity-90 transition-base disabled:opacity-50"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? 'Creating account...' : 'Create Doctor Account'}
        </button>
      </div>
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
    <div className="min-h-screen flex flex-col bg-hero">
      <SiteHeader />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Portal switcher */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold shadow-soft">
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Doctor Portal
            </span>
            <Link
              to="/patient"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-base"
            >
              <UserIcon className="h-4 w-4" />
              Switch to Patient Portal
            </Link>
          </div>
        </div>

        {/* Brand heading */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-gradient shadow-glow mb-4">
            <Activity className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            {mode === 'login' ? 'Doctor sign in' : 'Join as a doctor'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Access your clinical workspace and patient schedule'
              : 'Create your professional account to start seeing patients'}
          </p>
        </div>

        {/* Auth card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-card border border-border px-8 py-8">

            {/* Login / Register tab switcher */}
            <div className="flex mb-6 bg-muted rounded-2xl p-1">
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMode('login')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
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

            {/* Toggle hint */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-semibold text-primary hover:underline"
              >
                {mode === 'login' ? 'Register here' : 'Sign in instead'}
              </button>
            </p>
          </div>

          {/* Patient portal link at the bottom */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Looking for the patient portal?{" "}
            <Link to="/patient" className="font-semibold text-primary hover:underline">
              Access Patient Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

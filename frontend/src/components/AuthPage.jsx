import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthPage({
  loginForm,
  registerForm,
  onLoginChange,
  onRegisterChange,
  onLogin,
  onRegister,
  isBusy,
  error,
}) {
  const [mode, setMode] = useState('login')

  const handleModeChange = (newMode) => {
    setMode(newMode)
  }

  return (
    <main className="min-h-screen p-12 grid grid-cols-[1.2fr_0.9fr] gap-7 items-center max-lg:grid-cols-1 max-lg:p-5">
      <section className="border border-slate-200 rounded-full bg-orange-100 bg-opacity-92 shadow-2xl p-10">
        <p className="m-0 mb-3 uppercase tracking-widest text-sm text-accent-strong">Clinic Access</p>
        <h1>Patient sign in and profile dashboard</h1>
        <p className="max-w-56 text-lg">
          Patients authenticate with the auth-service, then the dashboard loads profile
          data from the separate patient-service.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="px-3.5 py-2.5 rounded-full bg-accent-soft text-accent-strong text-sm">JWT login</span>
          <span className="px-3.5 py-2.5 rounded-full bg-accent-soft text-accent-strong text-sm">Patient-only access</span>
          <span className="px-3.5 py-2.5 rounded-full bg-accent-soft text-accent-strong text-sm">Editable profile</span>
        </div>
      </section>

      <section className="border border-slate-200 rounded-full bg-orange-100 bg-opacity-92 shadow-2xl p-7">
        <div className="flex gap-2.5 mb-6">
          <button
            type="button"
            className={`px-4.5 py-3 rounded-lg border-0 cursor-pointer transition-all ${
              mode === 'login'
                ? 'bg-accent text-orange-50 shadow-lg'
                : 'bg-orange-50 text-text'
            } hover:-translate-y-0.5`}
            onClick={() => handleModeChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`px-4.5 py-3 rounded-lg border-0 cursor-pointer transition-all ${
              mode === 'register'
                ? 'bg-accent text-orange-50 shadow-lg'
                : 'bg-orange-50 text-text'
            } hover:-translate-y-0.5`}
            onClick={() => handleModeChange('register')}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm
            form={loginForm}
            onChange={onLoginChange}
            onSubmit={onLogin}
            isBusy={isBusy}
            error={error}
          />
        ) : (
          <RegisterForm
            form={registerForm}
            onChange={onRegisterChange}
            onSubmit={onRegister}
            isBusy={isBusy}
            error={error}
          />
        )}
      </section>
    </main>
  )
}

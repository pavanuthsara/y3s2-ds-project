import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:8080/api'
const AUTH_SERVICE_URL = `${API_BASE_URL}/auth`
const PATIENT_SERVICE_URL = `${API_BASE_URL}/patients`
const SESSION_STORAGE_KEY = 'patientPortalSession'

const emptyLoginForm = {
  username: '',
  password: '',
}

const emptyRegisterForm = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'PATIENT',
}

const emptyProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  dateOfBirth: '',
}

async function readResponsePayload(response) {
  const text = await response.text()

  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function App() {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [profileForm, setProfileForm] = useState(emptyProfileForm)
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY)
    return savedSession ? JSON.parse(savedSession) : null
  })
  const [profile, setProfile] = useState(null)
  const [authError, setAuthError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [profileBusy, setProfileBusy] = useState(false)

  useEffect(() => {
    if (!session?.token || !session?.username) {
      setProfile(null)
      return
    }

    let cancelled = false

    async function loadProfile() {
      setProfileBusy(true)

      try {
        const response = await fetch(`${PATIENT_SERVICE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })
        const data = await readResponsePayload(response)

        if (!response.ok) {
          if (response.status === 404) {
            if (!cancelled) {
              setProfile(null)
              setProfileMessage('Patient profile not found yet. Complete it below.')
            }
            return
          }

          throw new Error(data.message || 'Unable to load patient profile')
        }

        if (!cancelled) {
          setProfile(data)
          setProfileMessage('')
          setProfileForm({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
            dateOfBirth: data.dateOfBirth ?? '',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setProfileMessage(error.message)
        }
      } finally {
        if (!cancelled) {
          setProfileBusy(false)
        }
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [session])

  function persistSession(authResponse) {
    const nextSession = {
      token: authResponse.token,
      username: authResponse.username,
      role: authResponse.role,
      email: authResponse.email,
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  function clearSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
    setProfile(null)
    setProfileForm(emptyProfileForm)
    setLoginForm(emptyLoginForm)
    setAuthError('')
    setProfileMessage('')
  }

  function handleFormChange(setter) {
    return (event) => {
      const { name, value } = event.target
      setter((current) => ({ ...current, [name]: value }))
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError('')

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      const data = await readResponsePayload(response)

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (data.role !== 'PATIENT') {
        throw new Error('This login is only for patients')
      }

      persistSession(data)
      setLoginForm(emptyLoginForm)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError('')

    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registerForm, role: 'PATIENT' }),
      })

      const data = await readResponsePayload(response)

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      await fetch(PATIENT_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          phone: '',
          address: '',
          dateOfBirth: null,
        }),
      })

      persistSession(data)
      setRegisterForm(emptyRegisterForm)
      setMode('login')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleProfileUpdate(event) {
    event.preventDefault()
    if (!session) {
      return
    }

    setProfileBusy(true)
    setProfileMessage('')

    try {
      const hasExistingProfile = Boolean(profile)
      const response = await fetch(hasExistingProfile ? `${PATIENT_SERVICE_URL}/me` : PATIENT_SERVICE_URL, {
        method: hasExistingProfile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(profileForm),
      })

      const data = await readResponsePayload(response)

      if (!response.ok) {
        throw new Error(data.message || 'Profile save failed')
      }

      setProfile(data)
      setProfileMessage(hasExistingProfile ? 'Profile updated successfully' : 'Profile created successfully')
    } catch (error) {
      setProfileMessage(error.message)
    } finally {
      setProfileBusy(false)
    }
  }

  const isAuthenticatedPatient = session?.role === 'PATIENT'

  if (isAuthenticatedPatient) {
    return (
      <main className="app-shell">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">Patient Portal</p>
            <h1>{profile ? `Welcome back, ${profile.firstName}` : `Welcome, ${session.username}`}</h1>
            <p className="hero-copy">
              Your patient account is authenticated through the auth-service. Your patient
              details are stored separately in the patient-service.
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={clearSession}>
            Log out
          </button>
        </section>

        <section className="dashboard-grid">
          <article className="summary-card">
            <p className="card-label">Account Summary</p>
            <h2>{profile ? `${profile.firstName} ${profile.lastName}` : session.username}</h2>
            <dl className="summary-list">
              <div>
                <dt>Username</dt>
                <dd>{session.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{session.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{session.role}</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card">
            <div className="card-head">
              <div>
                <p className="card-label">Manage Profile</p>
                <h2>Patient details</h2>
              </div>
              {profileBusy ? <span className="status-pill">Working...</span> : null}
            </div>

            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <label>
                First name
                <input
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleFormChange(setProfileForm)}
                  required
                />
              </label>
              <label>
                Last name
                <input
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleFormChange(setProfileForm)}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleFormChange(setProfileForm)}
                />
              </label>
              <label>
                Address
                <input
                  name="address"
                  value={profileForm.address}
                  onChange={handleFormChange(setProfileForm)}
                />
              </label>
              <label>
                Date of birth
                <input
                  name="dateOfBirth"
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={handleFormChange(setProfileForm)}
                />
              </label>
              <button className="primary-button" type="submit" disabled={profileBusy}>
                {profile ? 'Save profile' : 'Create profile'}
              </button>
            </form>

            {profileMessage ? <p className="form-message">{profileMessage}</p> : null}
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Clinic Access</p>
        <h1>Patient sign in and profile dashboard</h1>
        <p className="hero-copy">
          Patients authenticate with the auth-service, then the dashboard loads profile
          data from the separate patient-service.
        </p>
        <div className="feature-strip">
          <span>JWT login</span>
          <span>Patient-only access</span>
          <span>Editable profile</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('login')
              setAuthError('')
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'tab active' : 'tab'}
            onClick={() => {
              setMode('register')
              setAuthError('')
            }}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                name="username"
                value={loginForm.username}
                onChange={handleFormChange(setLoginForm)}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleFormChange(setLoginForm)}
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={authBusy}>
              {authBusy ? 'Signing in...' : 'Login to dashboard'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              Username
              <input
                name="username"
                value={registerForm.username}
                onChange={handleFormChange(setRegisterForm)}
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={registerForm.email}
                onChange={handleFormChange(setRegisterForm)}
                required
              />
            </label>
            <label>
              First name
              <input
                name="firstName"
                value={registerForm.firstName}
                onChange={handleFormChange(setRegisterForm)}
                required
              />
            </label>
            <label>
              Last name
              <input
                name="lastName"
                value={registerForm.lastName}
                onChange={handleFormChange(setRegisterForm)}
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                value={registerForm.password}
                onChange={handleFormChange(setRegisterForm)}
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={authBusy}>
              {authBusy ? 'Creating account...' : 'Create patient account'}
            </button>
          </form>
        )}

        {authError ? <p className="form-message error">{authError}</p> : null}
      </section>
    </main>
  )
}

export default App

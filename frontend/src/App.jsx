import { useEffect, useState } from 'react'
import './App.css'
import { AuthPage } from './components/AuthPage'
import { DashboardPage } from './components/DashboardPage'

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
      <DashboardPage
        session={session}
        profile={profile}
        profileForm={profileForm}
        onProfileChange={handleFormChange(setProfileForm)}
        onProfileUpdate={handleProfileUpdate}
        profileBusy={profileBusy}
        profileMessage={profileMessage}
        onLogout={clearSession}
      />
    )
  }

  return (
    <AuthPage
      loginForm={loginForm}
      registerForm={registerForm}
      onLoginChange={handleFormChange(setLoginForm)}
      onRegisterChange={handleFormChange(setRegisterForm)}
      onLogin={handleLogin}
      onRegister={handleRegister}
      isBusy={authBusy}
      error={authError}
    />
  )
}

export default App;

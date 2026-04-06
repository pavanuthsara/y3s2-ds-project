import { AccountSummary } from './AccountSummary'
import { ProfileCard } from './ProfileCard'

export function DashboardPage({
  session,
  profile,
  profileForm,
  onProfileChange,
  onProfileUpdate,
  profileBusy,
  profileMessage,
  onLogout,
}) {
  return (
    <main className="min-h-screen p-12 grid gap-7 max-lg:p-5">
      <section className="border border-slate-200 rounded-full bg-orange-100 bg-opacity-92 shadow-2xl p-10 flex justify-between items-start gap-6 max-lg:flex-col">
        <div>
          <p className="m-0 mb-3 uppercase tracking-widest text-sm text-accent-strong">Patient Portal</p>
          <h1>{profile ? `Welcome back, ${profile.firstName}` : `Welcome, ${session.username}`}</h1>
          <p className="max-w-56 text-lg">
            Your patient account is authenticated through the auth-service. Your patient
            details are stored separately in the patient-service.
          </p>
        </div>
        <button 
          className="px-4 py-3 rounded-lg bg-orange-50 text-text-h font-semibold hover:-translate-y-0.5 transition-transform border-0 cursor-pointer"
          type="button" 
          onClick={onLogout}
        >
          Log out
        </button>
      </section>

      <section className="grid grid-cols-[0.9fr_1.4fr] gap-7 max-lg:grid-cols-1">
        <AccountSummary profile={profile} session={session} />
        <ProfileCard
          profile={profile}
          profileForm={profileForm}
          onProfileChange={onProfileChange}
          onProfileUpdate={onProfileUpdate}
          isBusy={profileBusy}
          message={profileMessage}
        />
      </section>
    </main>
  )
}

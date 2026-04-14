export function ProfileCard({
  profile,
  profileForm,
  onProfileChange,
  onProfileUpdate,
  isBusy,
  message,
}) {
  return (
    <article className="border border-slate-200 rounded-full bg-orange-100 bg-opacity-92 shadow-2xl p-7">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <p className="m-0 mb-3 uppercase tracking-widest text-sm text-accent-strong">Manage Profile</p>
          <h2>Patient details</h2>
        </div>
        {isBusy ? <span className="px-3.5 py-2.5 rounded-full bg-accent-soft text-accent-strong text-sm">Working...</span> : null}
      </div>

      <form className="grid gap-4" onSubmit={onProfileUpdate}>
        <label className="grid gap-2 font-semibold text-text-h">
          First name
          <input
            name="firstName"
            value={profileForm.firstName}
            onChange={onProfileChange}
            className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
            required
          />
        </label>
        <label className="grid gap-2 font-semibold text-text-h">
          Last name
          <input
            name="lastName"
            value={profileForm.lastName}
            onChange={onProfileChange}
            className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
            required
          />
        </label>
        <label className="grid gap-2 font-semibold text-text-h">
          Phone
          <input
            name="phone"
            value={profileForm.phone}
            onChange={onProfileChange}
            className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          />
        </label>
        <label className="grid gap-2 font-semibold text-text-h">
          Address
          <input
            name="address"
            value={profileForm.address}
            onChange={onProfileChange}
            className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          />
        </label>
        <label className="grid gap-2 font-semibold text-text-h">
          Date of birth
          <input
            name="dateOfBirth"
            type="date"
            value={profileForm.dateOfBirth}
            onChange={onProfileChange}
            className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          />
        </label>
        <button 
          className="bg-accent text-orange-50 px-4 py-3.5 rounded-lg font-semibold shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          type="submit" 
          disabled={isBusy}
        >
          {profile ? 'Save profile' : 'Create profile'}
        </button>
      </form>

      {message ? <p className="mt-4 text-teal-700">{message}</p> : null}
    </article>
  )
}

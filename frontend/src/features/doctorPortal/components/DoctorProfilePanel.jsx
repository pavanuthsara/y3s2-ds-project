export default function DoctorProfilePanel({
  form,
  onChange,
  onSubmit,
  busy,
  message,
  error,
  profile,
  session,
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Doctor Summary</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          {profile ? `${profile.firstName} ${profile.lastName}` : session.username}
        </h2>
        <p className="mt-2 text-slate-600">{session.email}</p>

        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Specialty</dt>
            <dd className="font-medium text-slate-900">{profile?.specialty || 'Not set yet'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900">{profile?.phoneNumber || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Consultation fee</dt>
            <dd className="font-medium text-slate-900">
              {profile?.consultationFee !== '' && profile?.consultationFee !== null && profile?.consultationFee !== undefined
                ? profile.consultationFee
                : 'Not set'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Verification</dt>
            <dd className="font-medium text-slate-900">{profile?.verified ? 'Verified' : 'Pending verification'}</dd>
          </div>
        </dl>
      </aside>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Profile</p>
          <h2 className="text-2xl font-semibold text-slate-900">Create or update your public doctor profile</h2>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-medium text-slate-800">
              First name
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="firstName" onChange={onChange} required value={form.firstName} />
            </label>
            <label className="grid gap-2 font-medium text-slate-800">
              Last name
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="lastName" onChange={onChange} required value={form.lastName} />
            </label>
          </div>

          <label className="grid gap-2 font-medium text-slate-800">
            Specialty
            <input className="rounded-2xl border border-slate-300 px-4 py-3" name="specialty" onChange={onChange} required value={form.specialty} />
          </label>

          <label className="grid gap-2 font-medium text-slate-800">
            Qualifications
            <textarea className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3" name="qualifications" onChange={onChange} value={form.qualifications} />
          </label>

          <label className="grid gap-2 font-medium text-slate-800">
            Bio
            <textarea className="min-h-32 rounded-2xl border border-slate-300 px-4 py-3" name="bio" onChange={onChange} value={form.bio} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-medium text-slate-800">
              Phone number
              <input className="rounded-2xl border border-slate-300 px-4 py-3" name="phoneNumber" onChange={onChange} value={form.phoneNumber} />
            </label>
            <label className="grid gap-2 font-medium text-slate-800">
              Consultation fee
              <input className="rounded-2xl border border-slate-300 px-4 py-3" min="0" name="consultationFee" onChange={onChange} step="0.01" type="number" value={form.consultationFee} />
            </label>
          </div>

          <label className="grid gap-2 font-medium text-slate-800">
            Profile photo URL
            <input className="rounded-2xl border border-slate-300 px-4 py-3" name="profilePhoto" onChange={onChange} value={form.profilePhoto} />
          </label>

          <button className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={busy} type="submit">
            {busy ? 'Saving profile...' : profile ? 'Update profile' : 'Create profile'}
          </button>

          {message ? <p className="text-emerald-700">{message}</p> : null}
          {error ? <p className="text-red-600">{error}</p> : null}
        </form>
      </section>
    </section>
  );
}

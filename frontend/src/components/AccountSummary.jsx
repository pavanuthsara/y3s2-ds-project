export function AccountSummary({ profile, session }) {
  return (
    <article className="border border-slate-200 rounded-full bg-orange-100 bg-opacity-92 shadow-2xl p-7">
      <p className="m-0 mb-3 uppercase tracking-widest text-sm text-accent-strong">Account Summary</p>
      <h2>{profile ? `${profile.firstName} ${profile.lastName}` : session.username}</h2>
      <dl className="grid gap-4 mt-6">
        <div className="p-3.5 rounded-xl bg-orange-50">
          <dt className="text-xs uppercase tracking-wider text-text mb-1.5">Username</dt>
          <dd className="m-0 text-text-h font-semibold">{session.username}</dd>
        </div>
        <div className="p-3.5 rounded-xl bg-orange-50">
          <dt className="text-xs uppercase tracking-wider text-text mb-1.5">Email</dt>
          <dd className="m-0 text-text-h font-semibold">{session.email}</dd>
        </div>
        <div className="p-3.5 rounded-xl bg-orange-50">
          <dt className="text-xs uppercase tracking-wider text-text mb-1.5">Role</dt>
          <dd className="m-0 text-text-h font-semibold">{session.role}</dd>
        </div>
      </dl>
    </article>
  )
}

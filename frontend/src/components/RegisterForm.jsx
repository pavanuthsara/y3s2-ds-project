export function RegisterForm({ form, onChange, onSubmit, isBusy, error }) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 font-semibold text-text-h">
        Username
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          required
        />
      </label>
      <label className="grid gap-2 font-semibold text-text-h">
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          required
        />
      </label>
      <label className="grid gap-2 font-semibold text-text-h">
        First name
        <input
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          required
        />
      </label>
      <label className="grid gap-2 font-semibold text-text-h">
        Last name
        <input
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          required
        />
      </label>
      <label className="grid gap-2 font-semibold text-text-h">
        Password
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          className="border border-slate-300 rounded-lg p-3.5 bg-orange-50 text-text-h focus:outline-2 focus:outline-accent focus:border-accent"
          required
        />
      </label>
      <button 
        className="bg-accent text-orange-50 px-4 py-3.5 rounded-lg font-semibold shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-50"
        type="submit" 
        disabled={isBusy}
      >
        {isBusy ? 'Creating account...' : 'Create patient account'}
      </button>
      {error ? <p className="mt-4 text-red-600">{error}</p> : null}
    </form>
  )
}

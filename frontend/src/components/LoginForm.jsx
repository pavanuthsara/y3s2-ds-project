export function LoginForm({ form, onChange, onSubmit, isBusy, error }) {
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
        {isBusy ? 'Signing in...' : 'Login to dashboard'}
      </button>
      {error ? <p className="mt-4 text-red-600">{error}</p> : null}
    </form>
  )
}

import { useState } from "react";
import { authAPI } from "../services/api";

export function PatientAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClassName =
    "block w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
  const labelClassName = "mb-1.5 block text-sm font-semibold text-slate-700";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await authAPI.login(username, password);
        onLoginSuccess(result);
      } else {
        const result = await authAPI.register(
          username,
          email,
          password,
          firstName,
          lastName,
        );
        onLoginSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_16px_50px_-22px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            CareConnect Patient
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin
              ? "Sign in to access your health portal"
              : "Create an account to manage your healthcare"}
          </p>
        </div>

        <div className="mt-6 flex rounded-xl border border-slate-200 bg-slate-50 p-1.5">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              isLogin
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            type="button"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              !isLogin
                ? "bg-white text-sky-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            type="button"
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Personal Details
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Tell us your name so we can personalize your records.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClassName}>First Name</span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="block">
                  <span className={labelClassName}>Last Name</span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClassName}
                  />
                </label>
              </div>
            </section>
          )}

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Account Credentials
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use these details every time you sign in.
              </p>
            </div>

            <label className="block">
              <span className={labelClassName}>Username</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClassName}
              />
            </label>

            {!isLogin && (
              <label className="block">
                <span className={labelClassName}>Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                />
              </label>
            )}

            <label className="block">
              <span className={labelClassName}>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
              />
            </label>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : isLogin
                ? "Sign In Securely"
                : "Create Free Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

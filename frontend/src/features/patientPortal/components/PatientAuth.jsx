import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { SiteHeader } from "../../../components/public/SiteHeader";
import { Activity, UserIcon, Stethoscope } from "lucide-react";

export function PatientAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-hero">
      <SiteHeader />

      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Portal switcher */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold shadow-soft">
              <span className="w-2 h-2 rounded-full bg-white/70" />
              Patient Portal
            </span>
            <Link
              to="/doctor"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-base"
            >
              <Stethoscope className="h-4 w-4" />
              Switch to Doctor Portal
            </Link>
          </div>
        </div>

        {/* Brand heading */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-gradient shadow-glow mb-4">
            <Activity className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin
              ? "Sign in to access your health portal"
              : "Start managing your healthcare journey today"}
          </p>
        </div>

        {/* Auth card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-card border border-border px-8 py-8">

            {/* Login / Register tab switcher */}
            <div className="flex mb-6 bg-muted rounded-2xl p-1">
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isLogin
                    ? "bg-white text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  !isLogin
                    ? "bg-white text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
                  placeholder="your_username"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
                    placeholder="jane@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-input rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-base"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold shadow-soft hover:opacity-90 transition-base disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : isLogin
                      ? "Sign In to Patient Portal"
                      : "Create Patient Account"}
                </button>
              </div>
            </form>

            {/* Toggle hint at the bottom */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="font-semibold text-primary hover:underline"
              >
                {isLogin ? "Register here" : "Sign in instead"}
              </button>
            </p>
          </div>

          {/* Doctor portal link at the bottom */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Are you a healthcare provider?{" "}
            <Link to="/doctor" className="font-semibold text-primary hover:underline">
              Access the Doctor Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

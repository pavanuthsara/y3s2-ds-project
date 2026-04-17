import { useState } from 'react';
import { authAPI } from '../services/api';

export function PatientAuth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await authAPI.login(username, password);
        onLoginSuccess(result);
      } else {
        const result = await authAPI.register(username, email, password, firstName, lastName);
        onLoginSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          CareConnect Patient
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isLogin ? 'Sign in to access your health portal' : 'Create an account to manage your healthcare'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/70 backdrop-blur-xl py-8 px-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05),_0_0_20px_rgba(167,139,250,0.1)] sm:rounded-2xl sm:px-10 border border-white/90">
          
          <div className="flex mb-6 border-b border-slate-200/60">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${isLogin ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${!isLogin ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50/90 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="ml-3 text-sm text-red-700 font-medium">{error}</div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First Name</label>
                  <div className="mt-1">
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-200/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last Name</label>
                  <div className="mt-1">
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-200/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/50" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <div className="mt-1">
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-200/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/50" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <div className="mt-1">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-200/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/50" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-200/80 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white/50" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 disabled:opacity-50 transition-all transform hover:-translate-y-0.5">
                {loading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Free Account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

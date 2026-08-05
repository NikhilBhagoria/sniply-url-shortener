import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.msg || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#f8fafc] via-[#f0f4ff] to-[#f8fafc] py-12 overflow-hidden">
      {/* Ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1e75ff]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Badge/Logo Pill */}
      <div className="relative inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-100 shadow-[0_8px_30px_rgba(30,117,255,0.04)] mb-8 select-none z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e75ff] to-[#0052d9] text-white shadow-sm">
          <Link2 className="h-4.5 w-4.5 rotate-45" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-slate-900 leading-none">Sniply</span>
          <span className="text-[10px] uppercase font-bold tracking-[0.12em] text-slate-400 mt-1">URL Shortener</span>
        </div>
      </div>

      {/* Login Card with Gradient Border */}
      <div className="relative w-full max-w-[480px] bg-gradient-to-tr from-[#1e75ff]/20 via-[#1e75ff]/5 to-indigo-500/20 p-[1.5px] rounded-[33px] shadow-[0_20px_50px_rgba(30,117,255,0.04)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(30,117,255,0.08)] z-10">
        <div className="w-full bg-gradient-to-b from-white to-[#fcfdfe]/95 backdrop-blur-xl rounded-[32px] p-8 md:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-center mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-500 text-center mb-8 font-medium">
            Log in to manage your links, analytics, and workspace settings.
          </p>

          {error && (
            <div className="mb-6 text-xs font-semibold text-red-600 bg-red-50/80 border border-red-100 px-4 py-3 rounded-2xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#1e75ff] focus:ring-4 focus:ring-blue-50 transition-all duration-200"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[13px] font-bold text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset functionality is not available in the demo.');
                  }}
                  className="text-[13px] font-bold text-[#1e75ff] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:border-[#1e75ff] focus:ring-4 focus:ring-blue-50 transition-all duration-200"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#1e75ff] to-[#0a65ff] hover:opacity-95 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-100 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-center mt-8 text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1e75ff] font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}



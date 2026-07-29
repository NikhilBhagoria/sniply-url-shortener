import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-lg border border-slate-200">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-5">Sign in to Sniply</p>
        {error && <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <input type="email" placeholder="Email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-3 px-3 py-2 border border-slate-300 rounded-md" />
        <input type="password" placeholder="Password" required value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md" />
        <button disabled={loading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-sm text-center mt-4 text-slate-500">No account? <Link to="/register" className="text-indigo-600">Register</Link></p>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
export default function AccountRecovery() {
  const { pathname } = useLocation();
  const mode = pathname.slice(1);
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { if (window.location.hash) window.history.replaceState(null, '', pathname); }, [pathname]);
  const submit = async e => {
    e.preventDefault(); if (busy) return; setError('');
    if (mode === 'reset-password' && password !== confirm) { setError('Passwords do not match'); return; }
    setBusy(true);
    try {
      const body = mode === 'forgot-password' ? { email } : mode === 'reset-password' ? { token, password } : { token };
      const { data } = await api.post('/auth/' + mode, body);
      setMessage(data.msg); setDone(true);
    } catch (err) { setError(err.response?.data?.msg || 'Request failed. Please try again.'); }
    finally { setBusy(false); }
  };
  const input = 'w-full mt-1 rounded-lg border border-slate-300 dark:border-slate-700 p-3 bg-transparent';
  return <main className="max-w-md mx-auto my-16 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
    <h1 className="text-2xl font-bold">{mode === 'forgot-password' ? 'Forgot password' : mode === 'reset-password' ? 'Reset password' : 'Verify email'}</h1>
    {error && <p role="alert" className="text-red-600 mt-4">{error}</p>}{message && <p role="status" className="mt-4">{message}</p>}
    {!done && <form onSubmit={submit} className="space-y-4 mt-4">
      {mode === 'forgot-password' ? <label className="block">Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={input} /></label> : !token ? <p>This link is missing its token. Request a new email.</p> : mode === 'reset-password' ? <><label className="block">New password<input type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={e => setPassword(e.target.value)} className={input} /></label><label className="block">Confirm password<input type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} className={input} /></label></> : <p>Confirm to verify your email address.</p>}
      <button disabled={busy || (mode !== 'forgot-password' && !token)} className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-40">{busy ? 'Please wait…' : 'Continue'}</button>
    </form>}
    <Link to="/login" className="block mt-5 text-blue-500">Back to login</Link>
  </main>;
}

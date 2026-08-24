import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function Unlock() {
  const { slug } = useParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post(`/unlock/${slug}`, { password });
      window.location.href = data.originalUrl; // go to the real destination
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not unlock');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xl">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Protected link</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Enter the password to continue</p>
        {error && <p className="mb-3 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-3 py-2 rounded-xl">{error}</p>}
        <input 
          type="password" 
          required 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/20 transition" 
        />
        <button 
          disabled={loading}
          className="w-full py-2.5 bg-[#1e75ff] hover:bg-[#0a65ff] text-white rounded-xl font-semibold text-xs shadow-sm transition disabled:opacity-50"
        >
          {loading ? 'Unlocking...' : 'Unlock & continue'}
        </button>
      </form>
    </div>
  );
}

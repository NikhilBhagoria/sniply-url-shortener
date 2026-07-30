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
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-lg border border-slate-200 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-xl font-bold mb-1">Protected link</h1>
        <p className="text-sm text-slate-500 mb-5">Enter the password to continue</p>
        {error && <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <input type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md" />
        <button disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50">
          {loading ? 'Unlocking...' : 'Unlock & continue'}
        </button>
      </form>
    </div>
  );
}

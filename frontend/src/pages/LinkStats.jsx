import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import BarBlock from '../components/BarBlock';
import TimelineChart from '../components/TimelineChart';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';

export default function LinkStats() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/links/${id}/stats`)
      .then((res) => setData(res.data))
      .catch((err) => {
        const msg = err.response?.data?.msg || 'Could not load stats';
        setError(msg);
      });
  }, [id]);

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Link unavailable</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">This link can't be opened</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Back to dashboard
        </button>
      </div>
    </div>
  );
  if (!data) return <div className="max-w-5xl mx-auto px-4 py-6 text-slate-400">Loading...</div>;

  const { link, totalClicks, devices, browsers, referrers, timeline } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => navigate('/')} className="text-sm text-indigo-600 mb-4">&larr; Back</button>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <p className="font-semibold text-indigo-600">{SHORT_BASE.replace(/^https?:\/\//, '')}/{link.slug}</p>
        <p className="text-sm text-slate-500 break-all mt-1">{link.originalUrl}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total clicks" value={totalClicks} />
        <StatCard label="Unique devices" value={devices.length} />
        <StatCard label="Referrer sources" value={referrers.length} />
      </div>

      <div className="mb-6"><TimelineChart data={timeline} /></div>

      <div className="grid md:grid-cols-3 gap-4">
        <BarBlock title="Devices" data={devices} />
        <BarBlock title="Browsers" data={browsers} />
        <BarBlock title="Referrers" data={referrers} />
      </div>
    </div>
  );
}

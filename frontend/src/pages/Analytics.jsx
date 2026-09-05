import { useEffect, useState } from 'react';
import api from '../api/axios';
import { TrendingUp, Link as LinkIcon, MousePointerClick, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';

export default function Analytics() {
  const [summary, setSummary] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/links/summary')
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff] dark:text-[#1e75ff]">Workspace / Analytics</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Analytics Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Real-time performance metrics and top performing links.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-[#1e75ff]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{loading ? '...' : summary.totalClicks.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Total Clicks</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LinkIcon className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{loading ? '...' : summary.totalLinks.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Total Short Links</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              {loading ? '...' : summary.totalLinks > 0 ? (summary.totalClicks / summary.totalLinks).toFixed(1) : '0'}
            </h3>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Avg Clicks / Link</p>
          </div>
        </div>
      </div>

      {/* Top Performing Links */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Links</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Links receiving the highest click volume.</p>
        </div>

        {summary.topLinks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No link analytics recorded yet. Create links and share them to see click activity!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.topLinks.map((item) => (
              <div key={item._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {item.title || item.slug}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {SHORT_BASE.replace(/^https?:\/\//, '')}/{item.slug} &rarr; {item.originalUrl}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1e75ff] dark:text-blue-400 text-xs font-bold">
                    {item.clicks} clicks
                  </span>
                  <Link
                    to={`/analytics/${item._id}`}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

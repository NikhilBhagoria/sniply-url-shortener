import { useEffect, useState } from 'react';
import api from '../api/axios';
import { 
  Link2, 
  MousePointerClick, 
  Activity, 
  QrCode,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';
const EMPTY = { originalUrl: '', slug: '', title: '', expiresAt: '', password: '' };

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [] });
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState(EMPTY);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadSummary = async () => {
    try {
      const res = await api.get('/links/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.originalUrl) {
      setError('Please provide a URL to shorten.');
      return;
    }
    
    try {
      const payload = { ...form };
      if (!payload.expiresAt) delete payload.expiresAt;
      if (!payload.password) delete payload.password;
      
      const { data } = await api.post('/links', payload);
      setForm(EMPTY);
      setShowAdvanced(false);
      setSuccess(`Link shortened successfully: ${SHORT_BASE}/${data.slug}`);
      setTimeout(() => setSuccess(''), 6000);
      loadSummary();
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not create link');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Messages */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl shadow-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {/* 1. Gradient Hero Banner Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1e75ff]/10 via-[#0a65ff]/5 to-[#f8f9fc] border border-slate-200/80 p-8 md:p-12 shadow-sm">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1e75ff]/10 px-3.5 py-1.5 text-xs font-semibold text-[#1e75ff]">
            <span>⚡</span>
            <span>Fast & reliable link management</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl leading-tight">
            Shorten, Track &amp; Analyze Your Links
          </h1>
          
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Create branded short links, generate QR codes, and unlock powerful analytics — all from one clean, beautiful dashboard.
          </p>

          {/* Inline Shortener Form */}
          <form onSubmit={create} className="space-y-4">
            <div className="relative flex flex-col md:flex-row items-stretch gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition duration-150">
              <div className="flex items-center gap-2 px-3.5 py-2.5 flex-1">
                <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="url"
                  required
                  placeholder="Paste a long URL to shorten..."
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition duration-150 shrink-0"
              >
                <span>+</span>
                <span>Shorten URL</span>
              </button>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-950 transition"
              >
                <span>Advanced settings</span>
                {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <span className="text-slate-400">No credit card required. Free tier includes 500 links.</span>
            </div>
          </form>

          {/* Advanced Settings Fields (Moved outside form to prevent browser autofill) */}
          {showAdvanced && (
            <div className="grid gap-4 sm:grid-cols-2 bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl animate-in slide-in-from-top-3 duration-200 mt-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Link Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. My Website Portals"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && create(e)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Custom Alias / Slug</label>
                <input
                  type="text"
                  placeholder="e.g. customalias"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && create(e)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>Expiry Date</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && create(e)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>Password protection</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter key password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && create(e)}
                  style={{ WebkitTextSecurity: 'disc' }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Stats Grid (4 cards as per mockup) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Links</span>
            <div className="h-8 w-8 bg-blue-50 text-[#1e75ff] rounded-xl flex items-center justify-center">
              <Link2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none">
                {summary.totalLinks.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <span>↗</span>
                <span>+12%</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">Total Links</p>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <MousePointerClick className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none">
                {summary.totalClicks.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <span>↗</span>
                <span>+34%</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">Total Clicks</p>
          </div>
        </div>

        {/* Active Links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Links</span>
            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none">
                {summary.totalLinks.toLocaleString()}
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                <span>↗</span>
                <span>+8%</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">Active Links</p>
          </div>
        </div>

        {/* QR Codes Generated */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QR Codes</span>
            <div className="h-8 w-8 bg-orange-55 text-orange-600 rounded-xl flex items-center justify-center">
              <QrCode className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 leading-none">12</h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100 flex items-center gap-0.5">
                <span>↘</span>
                <span>-3%</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">QR Codes Generated</p>
          </div>
        </div>
      </div>

    </div>
  );
}

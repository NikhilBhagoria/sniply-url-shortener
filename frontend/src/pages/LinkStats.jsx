import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BarBlock from '../components/BarBlock';
import TimelineChart from '../components/TimelineChart';
import QRCard from '../components/QRCard';
import BrowserChart from '../components/BrowserChart';
import { 
  ArrowLeft, 
  MousePointerClick, 
  Monitor, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';

const iso = d => d.toISOString().slice(0, 10);
const presetRange = (days, interval = 'day') => ({ from: iso(new Date(Date.now() - (days - 1) * 86400000)), to: iso(new Date()), interval });
const initial = () => presetRange(30);
const duration = ms => {
  if (ms === null || ms === undefined) return 'No data';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor(seconds / 3600) % 24}h`;
};
export default function LinkStats() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const handleCopy = async text => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setError("Could not copy link."); } };
  const { id } = useParams();
  const [draft, setDraft] = useState(initial);
  const [range, setRange] = useState(initial);
  const [preset, setPreset] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    api.get('/links/' + id + '/stats', { params: range, signal: controller.signal }).then(r => setData(r.data)).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.msg || 'Could not load analytics'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, range, revision]);
  const exportCsv = async () => {
    setExporting(true); setError('');
    try {
      const { data: blob } = await api.get('/links/' + id + '/stats/export', { params: range, responseType: 'blob' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = 'sniply-clicks.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Could not export analytics. Please try again.'); } finally { setExporting(false); }
  };
  if (error) return (
    <div className="p-6 max-w-2xl mx-auto text-center mt-12 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-8 shadow-sm space-y-4">
        <div className="h-12 w-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Stats Unavailable</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
        </div>
        <button 
          onClick={() => { const next = initial(); setDraft(next); setRange(next); setPreset('30'); setRevision(n => n + 1); }}
          className="px-4 py-2 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition"
        >
          Reset dates and retry
        </button>
      </div>
    </div>
  );

  if (loading || !data) return (
    <div className="p-6 max-w-7xl mx-auto text-slate-400 dark:text-slate-500 text-xs animate-pulse">
      Loading analytics details...
    </div>
  );

  const { link, totalClicks, devices, browsers, referrers, timeline } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff] dark:text-[#1e75ff]">Workspace / Links / Analytics</span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">Link Performance</h1>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); setRange({ ...draft }); }} className="flex flex-wrap items-end gap-3 text-xs bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
<label className="font-semibold">Date range<select aria-label="Date range" value={preset} onChange={e => { setPreset(e.target.value); if (e.target.value !== 'custom') { const next = presetRange(Number(e.target.value), draft.interval); setDraft(next); setRange(next); } }} className="block mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="custom">Custom dates</option></select></label>
{['from','to'].map(field => <label key={field} className="capitalize font-semibold">{field} (UTC)<input type="date" required value={draft[field]} onChange={e => { setPreset('custom'); setDraft({ ...draft, [field]: e.target.value }); }} className="block mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" /></label>)}
<label className="font-semibold">Group by<select aria-label="Group by" value={draft.interval} onChange={e => setDraft({ ...draft, interval: e.target.value })} className="block mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2"><option value="day">Daily</option><option value="week">Weekly</option></select></label>
<button className="rounded-xl bg-[#1e75ff] text-white px-4 py-2">Apply dates</button><button type="button" disabled={exporting} onClick={exportCsv} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 disabled:opacity-50">{exporting ? 'Exporting…' : 'Export CSV'}</button></form>
      {/* Target Details Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1e75ff] dark:text-blue-400 hover:underline cursor-pointer">
              {SHORT_BASE.replace(/^https?:\/\//, '')}/{link.slug}
            </span>
            <a 
              href={`${SHORT_BASE}/${link.slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl" title={link.originalUrl}>
            Destination: <span className="font-mono text-slate-600 dark:text-slate-300">{link.originalUrl}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => handleCopy(link.shortUrl || `${SHORT_BASE}/${link.slug}`)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        {/* Clicks in date range */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-[#1e75ff] shrink-0">
            <MousePointerClick className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Clicks</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalClicks.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Devices */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Devices</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{devices.length.toLocaleString()}</h3>
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Referrers</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{referrers.length.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          ['Estimated unique visitors', data.visitorTrackedClicks ? data.estimatedUniqueVisitors.toLocaleString() : 'No data', `${data.visitorTrackedClicks} of ${totalClicks} clicks have visitor estimates. Shared networks and browser changes can affect this count.`],
          ['Vs previous period', data.comparison.percentChange === null ? (totalClicks ? 'New activity' : 'No activity') : `${data.comparison.percentChange > 0 ? '+' : ''}${data.comparison.percentChange}%`, `${data.comparison.previousClicks} clicks from ${data.comparison.from} to ${data.comparison.to}. Equal-length UTC periods; today may be incomplete.`],
          ['Avg. link age at click', duration(data.averageLinkAgeMs), `Time from link creation to click, averaged across ${data.linkAgeSamples} measured clicks. Not time spent viewing the link.`],
        ].map(([title, value, help]) => <section key={title} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</h3><p className="text-xl font-extrabold mt-2">{value}</p><p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{help}</p>
        </section>)}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{data.interval === 'week' ? 'Weeks start Monday (UTC); edge weeks include only the selected dates.' : 'Daily totals use UTC.'} Visitor and timing metrics are available for newly recorded events; older clicks remain in total counts.</p>

      {/* Main Stats Charts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{data.interval === 'week' ? 'Weekly Click Timeline' : 'Daily Click Timeline'}</h3>
          <TimelineChart data={timeline} />
        </div>
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 font-semibold">QR Code</h3>
          <QRCard linkId={id} />
        </div>
      </div>

      {/* Device / Browser Breakdowns */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Devices</h3>
          <BarBlock title="Devices" data={devices} />
        </div>
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Browsers</h3>
          <BrowserChart data={browsers} />
        </div>
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Referrers</h3>
          <BarBlock title="Referrers" data={referrers} />
        </div>
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Operating Systems</h3>
          <BarBlock title="Operating systems" data={data.operatingSystems} />
        </div>
      </div>

    </div>
  );
}

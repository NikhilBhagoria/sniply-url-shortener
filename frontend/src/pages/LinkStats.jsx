import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BarBlock from '../components/BarBlock';
import TimelineChart from '../components/TimelineChart';
import QRCard from '../components/QRCard';
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

export default function LinkStats() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/links/${id}/stats`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.msg || 'Could not load stats'));
  }, [id]);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${SHORT_BASE}/${data.link.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error) return (
    <div className="p-6 max-w-2xl mx-auto text-center mt-12 animate-in fade-in duration-300">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stats Unavailable</h1>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-6 max-w-7xl mx-auto text-slate-400 text-xs animate-pulse">
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
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Workspace / Links / Analytics</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">Link Performance</h1>
        </div>
      </div>

      {/* Target Details Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1e75ff] hover:underline cursor-pointer">
              {SHORT_BASE.replace(/^https?:\/\//, '')}/{link.slug}
            </span>
            <a 
              href={`${SHORT_BASE}/${link.slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-slate-500 truncate max-w-xl" title={link.originalUrl}>
            Destination: <span className="font-mono">{link.originalUrl}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
        {/* Total Clicks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e75ff] shrink-0">
            <MousePointerClick className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Clicks</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{totalClicks.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Devices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devices</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{devices.length.toLocaleString()}</h3>
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 col-span-2 sm:col-span-1">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referrers</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{referrers.length.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Main Stats Charts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Click Timeline</h3>
          <TimelineChart data={timeline} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 font-semibold">QR Code</h3>
          <QRCard linkId={id} />
        </div>
      </div>

      {/* Device / Browser Breakdowns */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Devices</h3>
          <BarBlock title="Devices" data={devices} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Browsers</h3>
          <BarBlock title="Browsers" data={browsers} />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Referrers</h3>
          <BarBlock title="Referrers" data={referrers} />
        </div>
      </div>

    </div>
  );
}

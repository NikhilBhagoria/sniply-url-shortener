import { Code2, Key, HelpCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function Api() {
  const [copied, setCopied] = useState(false);
  const apiKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Workspace / API</span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">API Access</h1>
        <p className="text-slate-500 text-xs mt-0.5">Access your shortening service programmatically with API keys and docs.</p>
      </div>

      {/* API Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e75ff]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Key</h3>
              <p className="text-slate-500 text-xs mt-1">Generate and manage API keys to authenticate requests from your apps.</p>
            </div>
          </div>
          
          <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl flex items-center justify-between gap-3">
            <code className="text-xs font-mono text-slate-600 truncate">{apiKey}</code>
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Documentation</h3>
              <p className="text-slate-500 text-xs mt-1">Learn how to create, update, and track links using our REST API.</p>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>Read API Reference</span>
          </button>
        </div>
      </div>
    </div>
  );
}

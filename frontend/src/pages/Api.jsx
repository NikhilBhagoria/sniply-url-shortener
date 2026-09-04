import { Code2, Key, HelpCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const DOCS_URL = API_BASE.replace(/\/api\/v1\/?$/, '/api/docs');

export default function Api() {
  const [copied, setCopied] = useState(false);
  const token = localStorage.getItem('token') || 'Your_JWT_Token_Will_Appear_Here';

  const handleCopy = () => {
    navigator.clipboard.writeText(`Bearer ${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff] dark:text-[#1e75ff]">Workspace / API</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">API & Developers</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Programmatically shorten links, generate QR codes, and access analytics.</p>
      </div>

      {/* API Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-[#1e75ff]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bearer Authentication Token</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Use this JWT token in the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Authorization</code> header for API calls.</p>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl flex items-center justify-between gap-3">
            <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">Bearer {token}</code>
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 transition"
              title="Copy Header Value"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Swagger OpenAPI Docs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Explore all REST endpoints, schemas, and test API requests directly in your browser.</p>
            </div>
          </div>
          <a 
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full mt-4 px-4 py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Open API Swagger Documentation</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

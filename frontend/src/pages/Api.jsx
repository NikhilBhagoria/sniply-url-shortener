import { Code2, Key, HelpCircle, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';
const docs = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '/api/docs');
export default function Api() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [days, setDays] = useState(30);
  const [write, setWrite] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true);
    api.get('/keys', { signal: controller.signal }).then(r => setItems(r.data.items)).catch(e => { if (!controller.signal.aborted) setError(e.response?.data?.msg || 'Could not load API keys'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);
  const create = async e => {
    e.preventDefault(); if (busy) return; setBusy(true); setError(''); setMessage('');
    try { const { data } = await api.post('/keys', { name, days: Number(days), scopes: write ? ['links:read', 'links:write'] : ['links:read'] }); setToken(data.token); setName(''); setRevision(n => n + 1); }
    catch (e) { setError(e.response?.data?.msg || 'Could not create key'); } finally { setBusy(false); }
  };
  const revoke = async id => {
    if (!window.confirm('Revoke this API key? Applications using it will lose access.')) return;
    setBusy(true); setError('');
    try { await api.delete('/keys/' + id); setToken(''); setMessage('Key revoked.'); setRevision(n => n + 1); }
    catch (e) { setError(e.response?.data?.msg || 'Could not revoke key'); } finally { setBusy(false); }
  };
  const input = 'rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs bg-transparent';
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Authentication Keys</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Use an API key in the <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Authorization</code> header for API calls.</p>
            </div>
          </div>
          
    <form onSubmit={create} className="flex flex-wrap items-end gap-4 text-xs"><label>Name<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} className={input + ' block'} /></label><label>Expires in days<input type="number" required min={1} max={365} value={days} onChange={e => setDays(e.target.value)} className={input + ' block w-28'} /></label><label className="flex gap-2 py-2"><input type="checkbox" checked={write} onChange={e => setWrite(e.target.checked)} />Allow link changes</label><button disabled={busy} className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-40">Create key</button></form>

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
            href={docs}
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
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}{message && <p role="status" className="text-xs text-emerald-600">{message}</p>}
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs space-y-4">    {token && <section className="border border-amber-400 rounded-xl p-4 space-y-3"><h2 className="font-bold">Copy your key now — it will not be shown again.</h2><code className="block break-all">{token}</code><button onClick={async () => { try { await navigator.clipboard.writeText(token); setMessage('API key copied.'); } catch { setError('Clipboard unavailable. Copy the displayed key manually.'); } }} className="text-blue-500">Copy key</button><button onClick={() => setToken('')} className="ml-4">Hide key</button><p className="text-sm">Send it as Authorization: Bearer &lt;key&gt;. Keep it out of screenshots and source control.</p></section>}
    {loading ? <p>Loading keys…</p> : !items.length ? <p>No API keys yet.</p> : <ul className="space-y-3">{items.map(key => <li key={key._id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{key.name}</h2><p className="text-sm">{key.prefix}… · {key.scopes.join(', ')}</p><p className="text-sm">Expires: {new Date(key.expiresAt).toLocaleDateString()} · Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}</p></div>{key.revokedAt ? <span>Revoked</span> : new Date(key.expiresAt) <= new Date() ? <span>Expired</span> : <button disabled={busy} onClick={() => revoke(key._id)} className="text-red-600">Revoke</button>}</li>)}</ul>}
</div>
    </div>
  );
}

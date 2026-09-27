import { Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
const input = 'mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-4 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/20';
const localDate = value => { if (!value) return ''; const d = new Date(value); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
export default function LinkEditor({ link, onClose, onSaved }) {
  const dialog = useRef(null);
  const [opener] = useState(() => document.activeElement);
  const [form, setForm] = useState({ originalUrl: link?.originalUrl || '', title: link?.title || '', slug: '', expiresAt: localDate(link?.expiresAt), password: '', removePassword: false });
  const [busy, setBusy] = useState(false);
  const [campaign, setCampaign] = useState({ source: '', medium: '', name: '' });
  const [error, setError] = useState('');
  useEffect(() => {
    const el = dialog.current;
    el.showModal();
    return () => { el.close(); if (opener?.isConnected) opener.focus(); };
  }, [opener]);
  const change = e => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async e => {
    e.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      const body = { originalUrl: form.originalUrl, title: form.title, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null };
      if (campaign.source || campaign.medium || campaign.name) {
        const url = new URL(form.originalUrl);
        for (const [field, param] of [['source', 'utm_source'], ['medium', 'utm_medium'], ['name', 'utm_campaign']]) {
          if (campaign[field].trim()) url.searchParams.set(param, campaign[field].trim());
        }
        body.originalUrl = url.href;
      }
      if (!link) body.slug = form.slug;
      if (form.removePassword) body.password = null;
      else if (form.password) body.password = form.password;
      if (link) await api.patch('/links/' + link._id, body); else await api.post('/links', body);
      onSaved();
    } catch (err) { setError(err.response?.data?.msg || 'Could not save link'); }
    finally { setBusy(false); }
  };
  return <dialog ref={dialog} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} aria-labelledby="link-editor-title" className="w-[min(95vw,34rem)] max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white p-0 border border-slate-200 dark:border-slate-800 shadow-xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm">
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#1e75ff]"><Sparkles className="h-4 w-4" /></div><div><h2 id="link-editor-title" className="text-sm font-bold">{link ? 'Edit link' : 'Shorten a URL'}</h2><p className="text-[10px] text-slate-400">Manage your shortened link and preferences.</p></div></div><button type="button" aria-label="Close" disabled={busy} onClick={onClose}><X className="h-4 w-4 text-slate-400" /></button></div>
    <form onSubmit={submit} className="space-y-4 p-6 text-xs font-semibold">
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <label className="block">Destination URL<input autoFocus required type="url" maxLength={2048} name="originalUrl" value={form.originalUrl} onChange={change} className={input} /></label>
      <label className="block">Title<input name="title" maxLength={200} value={form.title} onChange={change} className={input} /></label>
      <details><summary>Campaign parameters (optional)</summary><p className="text-sm text-slate-500 mt-2">Add UTM parameters to your destination URL. Existing parameters are preserved unless replaced below.</p>
        {['source', 'medium', 'name'].map(field => <label key={field} className="block capitalize mt-2">Campaign {field}<input maxLength={100} value={campaign[field]} onChange={e => setCampaign({ ...campaign, [field]: e.target.value })} className={input} /></label>)}
      </details>
      {!link && <label className="block">Custom alias (optional)<input name="slug" pattern="[a-zA-Z0-9_-]{3,30}" maxLength={30} value={form.slug} onChange={change} className={input} /></label>}
      <label className="block">Expiry (your local time)<input type="datetime-local" name="expiresAt" value={form.expiresAt} onChange={change} className={input} /></label>
      <label className="block">{link ? 'New link password (leave blank to keep)' : 'Link password (optional)'}<input type="password" autoComplete="new-password" minLength={8} maxLength={72} name="password" disabled={form.removePassword} value={form.password} onChange={change} className={input} /></label>
      {link?.isProtected && <label className="flex gap-2"><input type="checkbox" name="removePassword" checked={form.removePassword} onChange={change} />Remove password protection</label>}
      {!!link?.history?.length && <details className="rounded-xl border border-slate-100 dark:border-slate-800 p-3"><summary>Change history</summary><ul className="mt-2 space-y-2 text-slate-500">{[...link.history].reverse().map((entry, i) => <li key={i}>{new Date(entry.at).toLocaleString()} · {entry.fields.join(', ')}</li>)}</ul></details>}
      <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-5"><button type="button" disabled={busy} onClick={onClose}>Cancel</button><button disabled={busy} className="bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-50">{busy ? 'Saving…' : 'Save link'}</button></div>
    </form>
  </dialog>;
}

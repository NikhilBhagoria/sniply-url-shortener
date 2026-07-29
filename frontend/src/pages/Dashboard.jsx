import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [] });
  const [links, setLinks] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ originalUrl: '', slug: '', title: '' });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/links', { params: { search, page, limit: 8 } }),
        api.get('/links/summary'),
      ]);
      setLinks(listRes.data);
      setSummary(sumRes.data);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(loadLinks, 300);
    return () => clearTimeout(t);
  }, [loadLinks]);

  const create = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/links', form);
      setForm({ originalUrl: '', slug: '', title: '' });
      setPage(1);
      loadLinks();
    } catch (err) { setError(err.response?.data?.msg || 'Could not create link'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this link and its analytics?')) return;
    await api.delete(`/links/${id}`);
    loadLinks();
  };

  const copy = (slug) => {
    navigator.clipboard.writeText(`${SHORT_BASE}/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total links" value={summary.totalLinks} />
        <StatCard label="Total clicks" value={summary.totalClicks} />
        <StatCard label="Avg clicks / link"
          value={summary.totalLinks ? (summary.totalClicks / summary.totalLinks).toFixed(1) : 0} />
      </div>

      <form onSubmit={create} className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Shorten a URL</h2>
        {error && <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          <input required placeholder="https://example.com/very/long/link" value={form.originalUrl}
            onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-md" />
          <input placeholder="Title (optional)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-md" />
          <input placeholder="Custom slug (optional)" value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-md" />
        </div>
        <button className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Shorten</button>
      </form>

      <input placeholder="Search your links..." value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full mb-4 px-3 py-2 border border-slate-300 rounded-md" />

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
        {loading ? (
          <p className="p-6 text-center text-slate-400">Loading...</p>
        ) : links.items.length === 0 ? (
          <p className="p-6 text-center text-slate-400">No links yet — shorten one above.</p>
        ) : (
          links.items.map((l) => (
            <div key={l._id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <button onClick={() => navigate(`/links/${l._id}`)}
                  className="font-medium text-indigo-600 hover:underline truncate block max-w-full text-left">
                  {SHORT_BASE.replace(/^https?:\/\//, '')}/{l.slug}
                </button>
                <p className="text-sm text-slate-500 truncate">{l.title || l.originalUrl}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{l.clicks} clicks</span>
                <button onClick={() => copy(l.slug)} className="text-sm text-slate-500 hover:text-indigo-600">
                  {copied === l.slug ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => navigate(`/links/${l._id}`)} className="text-sm text-slate-500 hover:text-indigo-600">Stats</button>
                <button onClick={() => remove(l._id)} className="text-sm text-slate-500 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {links.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-md bg-slate-100 disabled:opacity-40">Prev</button>
          <span className="text-slate-500">Page {links.page} of {links.pages}</span>
          <button disabled={page >= links.pages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-md bg-slate-100 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

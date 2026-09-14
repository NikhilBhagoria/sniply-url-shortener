import LinkEditor from '../components/LinkEditor';
import { Pencil, Pause, Play } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Link2,
  Globe,
  Copy,
  Check,
  BarChart2,
  Trash2,
  MousePointerClick,
  Activity,
  Plus,
  X,
  Filter,
  ArrowUpDown,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';

export default function ShortenURL() {
  const navigate = useNavigate();
  const { search } = useAuth();
  
  const [summary, setSummary] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [] });
  const [links, setLinks] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [status, setStatus] = useState('all');
  const [busy, setBusy] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/links', { params: { status, search, page, limit: rowsPerPage, sort: sortBy, order: sortOrder } }),
        api.get('/links/summary'),
      ]);
      setLinks(listRes.data);
      if (page > listRes.data.pages) setPage(listRes.data.pages);
      setSummary(sumRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not load links');
    } finally {
      setLoading(false);
    }
  }, [status, search, page, rowsPerPage, sortBy, sortOrder]);

  useEffect(() => { setPage(1); }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(loadLinks, 300);
    return () => clearTimeout(timeout);
  }, [loadLinks]);

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this link and its analytics?')) return;
    try {
      await api.delete(`/links/${id}`);
      loadLinks();
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not delete link');
    }
  };

  const copy = async (slug) => {
    try { await navigator.clipboard.writeText(`${SHORT_BASE}/${slug}`); } catch { setError('Could not copy link.'); return; }
    setCopied(slug);
    setTimeout(() => setCopied(''), 1500);
  };

  const isExpired = (l) => l.expiresAt && new Date(l.expiresAt).getTime() < Date.now();
  const activeCount = summary.activeLinks || 0;

  const toggleSort = () => { setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); setPage(1); };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Notifications/Success/Error messages */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl shadow-sm">
          {success}
        </div>
      )}

      {error && <p role="alert" className="p-3 rounded-xl bg-red-50 text-red-600 text-xs">{error}</p>}
      {/* 1. Page Header with Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff]">Workspace / Links</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Recent Links</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage and track all your shortened URLs in one place.</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Link</span>
        </button>
      </div>

      {/* 2. Stats Grid (3 cards as per mockup) */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Total Links */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Links</span>
            <Link2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {summary.totalLinks.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5">All created links</p>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {summary.totalClicks.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-[#1e75ff] dark:text-blue-450 mt-1.5">All-time recorded clicks</p>
          </div>
        </div>

        {/* Active Links */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Links</span>
            <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {activeCount.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
              {summary.totalLinks > 0 ? `${Math.round((activeCount / summary.totalLinks) * 100)}% of total` : '0% of total'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. All Links Main Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        
        {/* Card Sub-header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">All Links</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">A list of your most recently created short links.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"><Filter className="h-3.5 w-3.5" /><select aria-label="Filter status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="bg-transparent">{['all','active','paused','expired'].map(v => <option key={v} value={v}>{v === 'all' ? 'All links' : v}</option>)}</select></label>
            <select aria-label="Sort links by" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-2 py-2 text-xs"><option value="createdAt">Created</option><option value="clicks">Clicks</option><option value="title">Title</option></select>
            <button
              aria-label={sortOrder === 'desc' ? 'Sort ascending' : 'Sort descending'}
              onClick={toggleSort}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e293b] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort</span>
            </button>
          </div>
        </div>

        {/* Links Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2.5 text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-2 pl-4 pr-3">Original URL</th>
                <th className="pb-2 px-3">Short URL</th>
                <th className="pb-2 px-3 text-right">Clicks</th>
                <th className="pb-2 px-3">Created</th>
                <th className="pb-2 px-3">Status</th>
                <th className="pb-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl">
                    Loading links list...
                  </td>
                </tr>
              ) : links.items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl">
                    No links found. Click "+ New Link" to create one.
                  </td>
                </tr>
              ) : (
                links.items.map((l) => {
                  const createdDate = new Date(l.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const active = !isExpired(l) && !l.isPaused;
                  
                  return (
                    <tr key={l._id} className="bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 transition rounded-xl">
                      {/* Original URL */}
                      <td className="py-3.5 pl-4 pr-3 align-middle rounded-l-xl max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white" title={l.originalUrl}>
                              {l.title || l.originalUrl}
                            </p>
                            {l.title && (
                              <p className="truncate text-[10px] text-slate-400 dark:text-slate-500 mt-0.5" title={l.originalUrl}>
                                {l.originalUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Short URL */}
                      <td className="py-3.5 px-3 align-middle text-xs font-medium text-[#1e75ff] dark:text-blue-400">
                        <a 
                          href={`${SHORT_BASE}/${l.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{l.shortUrl || `${SHORT_BASE.replace(/^https?:\/\//, '')}/${l.slug}`}</span>
                        </a>
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-3 align-middle text-right text-xs font-bold text-slate-900 dark:text-white">
                        {l.clicks?.toLocaleString() || 0}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-3 align-middle text-xs text-slate-500 dark:text-slate-400">
                        {createdDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          active 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                            : 'bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}>
                          {isExpired(l) ? 'Expired' : l.isPaused ? 'Paused' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 align-middle text-right rounded-r-xl">
                        <div className="flex items-center justify-end gap-1.5">
                          <button aria-label="Edit" title="Edit link" onClick={() => setEditor(l)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500"><Pencil className="h-3.5 w-3.5" /></button>
                          <button aria-label={l.isPaused ? 'Resume' : 'Pause'} title={l.isPaused ? 'Resume' : 'Pause'} disabled={busy === l._id} onClick={async () => { setBusy(l._id); try { await api.patch('/links/' + l._id, { isPaused: !l.isPaused }); await loadLinks(); } catch(e) { setError(e.response?.data?.msg || 'Could not update link'); } finally { setBusy(''); } }} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500">{l.isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}</button>
                          {/* Copy Link */}
                          <button
                            onClick={() => copy(l.slug)}
                            title="Copy link"
                            className="p-1.5 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#1e75ff] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                          >
                            {copied === l.slug ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* View Analytics */}
                          <button
                            onClick={() => navigate(`/links/${l._id}`)}
                            title="View Stats" aria-label="Stats"
                            className="p-1.5 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
                          >
                            <BarChart2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Link */}
                          <button
                            onClick={() => remove(l._id)}
                            title="Delete link"
                            className="p-1.5 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {links.pages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] px-2 py-1 text-slate-700 dark:text-slate-200 outline-none"
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span>Page {links.page} of {links.pages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-[#1e293b] transition"
                >
                  &lsaquo;
                </button>
                <button
                  disabled={page >= links.pages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-[#1e293b] transition"
                >
                  &rsaquo;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(isModalOpen || editor) && <LinkEditor link={editor} onClose={() => { setIsModalOpen(false); setEditor(null); }} onSaved={() => { setIsModalOpen(false); setEditor(null); setSuccess('Link saved.'); loadLinks(); }} />}
    </div>
  );
}

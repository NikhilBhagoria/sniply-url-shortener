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
const EMPTY = { originalUrl: '', slug: '', title: '', expiresAt: '', password: '' };

export default function ShortenURL() {
  const navigate = useNavigate();
  const { search } = useAuth();
  
  const [summary, setSummary] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [] });
  const [links, setLinks] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/links', { params: { search, page, limit: rowsPerPage, sort: sortBy, order: sortOrder } }),
        api.get('/links/summary'),
      ]);
      setLinks(listRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Error loading links:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage, sortBy, sortOrder]);

  useEffect(() => {
    const timeout = setTimeout(loadLinks, 300);
    return () => clearTimeout(timeout);
  }, [loadLinks]);

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
      setPage(1);
      setIsModalOpen(false);
      setSuccess(`Link shortened successfully: ${SHORT_BASE}/${data.slug}`);
      setTimeout(() => setSuccess(''), 5000);
      loadLinks();
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not create link');
    }
  };

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this link and its analytics?')) return;
    try {
      await api.delete(`/links/${id}`);
      loadLinks();
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const copy = (slug) => {
    navigator.clipboard.writeText(`${SHORT_BASE}/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(''), 1500);
  };

  const isExpired = (l) => l.expiresAt && new Date(l.expiresAt).getTime() < Date.now();
  const activeCount = links.items.filter((l) => !isExpired(l)).length || summary.totalLinks;

  const toggleSort = () => {
    if (sortBy === 'createdAt') {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Notifications/Success/Error messages */}
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl shadow-sm">
          {success}
        </div>
      )}

      {/* 1. Page Header with Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff]">Workspace / Links</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Recent Links</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage and track all your shortened URLs in one place.</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setForm(EMPTY);
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Links</span>
            <Link2 className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.totalLinks.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-slate-400 mt-1.5">+42 this week</p>
          </div>
        </div>

        {/* Total Clicks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <MousePointerClick className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">
              {summary.totalClicks.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-[#1e75ff] mt-1.5">+12.5% vs last month</p>
          </div>
        </div>

        {/* Active Links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Links</span>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 leading-none">
              {activeCount.toLocaleString()}
            </h3>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1.5">
              {summary.totalLinks > 0 ? `${Math.round((activeCount / summary.totalLinks) * 100)}% of total` : '100% of total'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. All Links Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        
        {/* Card Sub-header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Links</h2>
            <p className="text-slate-500 text-xs mt-0.5">A list of your most recently created short links.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>
            <button 
              onClick={toggleSort}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition"
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
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs bg-slate-50/50 rounded-2xl">
                    Loading links list...
                  </td>
                </tr>
              ) : links.items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs bg-slate-50/50 rounded-2xl">
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
                  const active = !isExpired(l);
                  
                  return (
                    <tr key={l._id} className="bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition rounded-xl">
                      {/* Original URL */}
                      <td className="py-3.5 pl-4 pr-3 align-middle rounded-l-xl max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                            <Globe className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900" title={l.originalUrl}>
                              {l.title || l.originalUrl}
                            </p>
                            {l.title && (
                              <p className="truncate text-[10px] text-slate-400 mt-0.5" title={l.originalUrl}>
                                {l.originalUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Short URL */}
                      <td className="py-3.5 px-3 align-middle text-xs font-medium text-[#1e75ff]">
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
                      <td className="py-3.5 px-3 align-middle text-right text-xs font-bold text-slate-900">
                        {l.clicks?.toLocaleString() || 0}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-3 align-middle text-xs text-slate-500">
                        {createdDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          active 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 align-middle text-right rounded-r-xl">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Link */}
                          <button
                            onClick={() => copy(l.slug)}
                            title="Copy link"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-[#1e75ff] hover:bg-blue-50 transition"
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
                            title="View Stats"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <BarChart2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Link */}
                          <button
                            onClick={() => remove(l._id)}
                            title="Delete link"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none"
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3 text-slate-500">
              <span>Page {links.page} of {links.pages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  &lsaquo;
                </button>
                <button
                  disabled={page >= links.pages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
                >
                  &rsaquo;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Shorten Link Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1e75ff]">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shorten a URL</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Create a premium shortened link instantly.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form id="shortenForm" onSubmit={create} className="p-6 pb-2 space-y-4">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Destination URL <span className="text-red-500">*</span></label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/very/long/destination/url"
                  value={form.originalUrl}
                  onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
            </form>

            {/* Advanced Settings (Placed outside form to prevent browser autofill) */}
            <div className="px-6 pb-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Link Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Work Portfolio"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('shortenForm').requestSubmit()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Custom Alias (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. portfolio"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('shortenForm').requestSubmit()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Expiry Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('shortenForm').requestSubmit()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password Protection (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter key password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('shortenForm').requestSubmit()}
                  style={{ WebkitTextSecurity: 'disc' }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="shortenForm"
                  className="px-4 py-2 rounded-lg bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition"
                >
                  Shorten URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

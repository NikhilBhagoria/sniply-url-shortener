import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Plus,
  Download,
  Copy,
  Check,
  ExternalLink,
  Globe,
  X,
  Sparkles,
  Sliders,
  Palette,
  MousePointerClick
} from 'lucide-react';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE || 'http://localhost:5000';
const EMPTY = { originalUrl: '', slug: '', title: '', expiresAt: '', password: '' };

const fgPresets = [
  { name: 'Black', hex: '#000000' },
  { name: 'Slate', hex: '#1e293b' },
  { name: 'Blue', hex: '#1e75ff' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Crimson', hex: '#e11d48' }
];

const bgPresets = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Off-white', hex: '#f8fafc' },
  { name: 'Sand', hex: '#fafaf9' },
  { name: 'Ice Blue', hex: '#f0f9ff' },
  { name: 'Light Green', hex: '#f0fdf4' }
];

export default function QRCodes() {
  const { search } = useAuth();
  
  // Lists and selection
  const [links, setLinks] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);

  // Customization state
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrMargin, setQrMargin] = useState(2);
  const [qrWidth, setQrWidth] = useState(320);
  const [qrData, setQrData] = useState(null);
  const [fetchingQr, setFetchingQr] = useState(false);

  // Clipboard success feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  // Modal creation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  // Fetch links list
  const loadLinks = useCallback(async (selectFirst = false) => {
    setLoading(true);
    try {
      const res = await api.get('/links', {
        params: { search, page, limit: rowsPerPage }
      });
      setLinks(res.data);
      if (res.data.items.length > 0) {
        if (selectFirst || !selectedLink) {
          setSelectedLink(res.data.items[0]);
        } else {
          // Keep selection synced if it's still in the current page list
          const updated = res.data.items.find(item => item._id === selectedLink._id);
          if (updated) setSelectedLink(updated);
        }
      } else {
        setSelectedLink(null);
      }
    } catch (err) {
      console.error('Error loading links:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadLinks();
    }, 300);
    return () => clearTimeout(timeout);
  }, [loadLinks]);

  // Handle initial auto-select when list finishes loading and none is selected
  useEffect(() => {
    if (links.items.length > 0 && !selectedLink) {
      setSelectedLink(links.items[0]);
    }
  }, [links.items, selectedLink]);

  // Fetch QR Code data on style parameters change
  useEffect(() => {
    if (!selectedLink) {
      setQrData(null);
      return;
    }

    const dark = foregroundColor.replace('#', '');
    const light = backgroundColor.replace('#', '');
    setFetchingQr(true);

    const controller = new AbortController();
    api.get(`/links/${selectedLink._id}/qr`, {
      params: { dark, light, margin: qrMargin, width: qrWidth },
      signal: controller.signal
    })
    .then((res) => {
      setQrData(res.data);
    })
    .catch((err) => {
      if (err.name !== 'CanceledError') {
        console.error('Error fetching QR:', err);
      }
    })
    .finally(() => {
      setFetchingQr(false);
    });

    return () => {
      controller.abort();
    };
  }, [selectedLink?._id, foregroundColor, backgroundColor, qrMargin, qrWidth]);

  // Create new link and select it
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
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
      setIsModalOpen(false);
      setSelectedLink(data);
      setPage(1);
      
      // Force reload links and select first
      await loadLinks(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not create link');
    }
  };

  // Download QR Code image
  const downloadQR = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.dataUrl;
    link.download = `${selectedLink.title || selectedLink.slug}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy QR Image to Clipboard
  const copyQRToClipboard = async () => {
    if (!qrData) return;
    try {
      const response = await fetch(qrData.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code image:', err);
    }
  };

  // Copy Shortened Link
  const copyLinkToClipboard = () => {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.shortUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1e75ff]">Workspace / QR Codes</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">QR Code Hub</h1>
          <p className="text-slate-500 text-xs mt-0.5">Generate, design, and download customized QR codes for your short links.</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setForm(EMPTY);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] duration-150 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Generate QR Code</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Side: Short Link Library */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[600px] justify-between">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Short Links</h2>
              <p className="text-slate-500 text-[11px] mt-0.5">Select a link to customize its corresponding QR code.</p>
            </div>

            {/* Links List Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[300px]">
              {loading && links.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>
                  <span>Loading links...</span>
                </div>
              ) : links.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <QrCode className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-xs font-medium">No links available</p>
                  <p className="text-slate-400 text-[10px] mt-1 max-w-[200px]">Create a short link first to generate a QR Code.</p>
                </div>
              ) : (
                links.items.map((item) => {
                  const isSelected = selectedLink?._id === item._id;
                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedLink(item)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-[#1e75ff] bg-blue-50/40 shadow-sm'
                          : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-100 text-[#1e75ff]' : 'bg-white border border-slate-200 text-slate-400 group-hover:text-slate-600'
                        }`}>
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800" title={item.title || item.originalUrl}>
                            {item.title || item.originalUrl}
                          </p>
                          <p className="truncate text-[10px] text-slate-400 mt-0.5" title={item.originalUrl}>
                            {item.originalUrl}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                          <MousePointerClick className="h-3 w-3 text-slate-400" />
                          {item.clicks || 0}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${
                          isSelected ? 'bg-blue-100/50 text-[#1e75ff] border-blue-200/50' : 'bg-slate-200/40 text-slate-500 border-slate-200/30'
                        }`}>
                          Selected
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          {links.pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-500">
              <span>Page {links.page} of {links.pages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Prev
                </button>
                <button
                  disabled={page >= links.pages}
                  onClick={() => setPage(page + 1)}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: QR Code Preview & Customizer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-[600px] flex flex-col justify-between">
          {!selectedLink ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="h-20 w-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center mb-4">
                <QrCode className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No QR Code Selected</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-[280px]">
                Choose one of your short links from the library on the left or generate a new one to start customizing your QR Code.
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col md:flex-row gap-8 overflow-hidden">
              
              {/* Customizer Controls */}
              <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Palette className="h-4.5 w-4.5 text-[#1e75ff]" />
                    Design Customizer
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Style your QR code for matching your branding.</p>
                </div>

                {/* Colors Section */}
                <div className="space-y-4">
                  {/* Foreground Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Foreground Color</label>
                    <div className="flex flex-wrap gap-1.5">
                      {fgPresets.map(preset => (
                        <button
                          key={preset.hex}
                          title={preset.name}
                          onClick={() => setForegroundColor(preset.hex)}
                          className={`w-6 h-6 rounded-full border border-slate-200/60 relative flex items-center justify-center transition-transform hover:scale-110`}
                          style={{ backgroundColor: preset.hex }}
                        >
                          {foregroundColor === preset.hex && (
                            <Check className="h-3 w-3 text-white mix-blend-difference" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 cursor-pointer">
                        <input
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={foregroundColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            setForegroundColor(val);
                          }
                        }}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Background Color</label>
                    <div className="flex flex-wrap gap-1.5">
                      {bgPresets.map(preset => (
                        <button
                          key={preset.hex}
                          title={preset.name}
                          onClick={() => setBackgroundColor(preset.hex)}
                          className={`w-6 h-6 rounded-full border border-slate-200 relative flex items-center justify-center transition-transform hover:scale-110`}
                          style={{ backgroundColor: preset.hex }}
                        >
                          {backgroundColor === preset.hex && (
                            <Check className="h-3 w-3 text-white mix-blend-difference" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 cursor-pointer">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                        />
                      </div>
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            setBackgroundColor(val);
                          }
                        }}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Sliders Section */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Sliders className="h-3.5 w-3.5 text-slate-400" />
                        Code Margin
                      </label>
                      <span className="font-semibold text-slate-500">{qrMargin}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      value={qrMargin}
                      onChange={(e) => setQrMargin(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1e75ff]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Sliders className="h-3.5 w-3.5 text-slate-400" />
                        Download Resolution
                      </label>
                      <span className="font-semibold text-slate-500">{qrWidth} x {qrWidth} px</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="600"
                      step="100"
                      value={qrWidth}
                      onChange={(e) => setQrWidth(parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1e75ff]"
                    />
                  </div>
                </div>

                {/* Details Footer */}
                <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 text-[10px] text-slate-500 space-y-1 mt-auto">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Target Link Info</p>
                  <p className="truncate"><span className="font-semibold">Short URL:</span> {selectedLink.shortUrl || `${SHORT_BASE}/${selectedLink.slug}`}</p>
                  <p className="truncate"><span className="font-semibold">Destination:</span> {selectedLink.originalUrl}</p>
                </div>
              </div>

              {/* QR Preview Panel */}
              <div className="w-full md:w-[260px] flex flex-col justify-between items-center bg-slate-50/50 border border-slate-100 rounded-3xl p-5 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Live Preview</span>
                
                {/* QR Canvas */}
                <div className="relative my-6 w-44 h-44 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                  {fetchingQr && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e75ff]"></div>
                    </div>
                  )}
                  {qrData ? (
                    <img
                      src={qrData.dataUrl}
                      alt="QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <QrCode className="h-10 w-10 text-slate-300" />
                  )}
                </div>

                {/* Actions */}
                <div className="w-full space-y-2">
                  <button
                    onClick={downloadQR}
                    disabled={!qrData}
                    className="w-full py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all duration-150"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PNG</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={copyQRToClipboard}
                      disabled={!qrData}
                      className="py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      {copiedQr ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Image</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={copyLinkToClipboard}
                      disabled={!qrData}
                      className="py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Generate QR Code / Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-[#1e75ff]">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Generate a QR Code</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Shorten a URL to generate a custom QR Code instantly.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Content */}
            <form id="qrShortenForm" onSubmit={handleCreate} className="p-6 pb-2 space-y-4">
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

            {/* Advanced Form Settings */}
            <div className="px-6 pb-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Link Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Work Portfolio"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('qrShortenForm').requestSubmit()}
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
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('qrShortenForm').requestSubmit()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="qrShortenForm"
                  className="px-4 py-2 rounded-lg bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Create & Select
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

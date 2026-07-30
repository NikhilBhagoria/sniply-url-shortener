import { QrCode, Plus, Download, Share2 } from 'lucide-react';

export default function QRCodes() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Workspace / QR Codes</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">QR Codes</h1>
          <p className="text-slate-500 text-xs mt-0.5">Generate and manage QR codes for your shortened links.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors duration-150 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Generate QR Code</span>
        </button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#1e75ff]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">QR Code Library</h3>
              <p className="text-slate-500 text-xs mt-1">Create custom QR codes for any destination or campaign.</p>
            </div>
          </div>
          <div className="mt-8 border border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center">
            <div className="h-28 w-28 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-slate-300" />
            </div>
            <p className="text-slate-400 text-xs mt-4">Generate a QR code above to display it here.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Codes</h3>
              <p className="text-slate-500 text-xs mt-1">See the latest QR codes generated from your dashboard.</p>
            </div>
          </div>
          <div className="mt-8 p-6 text-center border border-dashed border-slate-200 rounded-xl flex items-center justify-center h-44 text-slate-400 text-xs">
            No QR codes generated yet.
          </div>
        </div>
      </div>
    </div>
  );
}

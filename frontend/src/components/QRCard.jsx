import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function QRCard({ linkId }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api.get(`/links/${linkId}/qr`).then((res) => setQr(res.data)).catch(() => {});
  }, [linkId]);

  if (!qr) return null;

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center">
      <h3 className="font-semibold mb-3 self-start text-slate-800 dark:text-slate-200">QR code</h3>
      <img src={qr.dataUrl} alt="QR code" className="w-40 h-40 p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700" />
      <a href={qr.dataUrl} download="sniply-qr.png"
        className="mt-3 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0f172a] hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold transition">
        Download PNG
      </a>
    </div>
  );
}

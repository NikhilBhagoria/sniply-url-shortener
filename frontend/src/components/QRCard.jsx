import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function QRCard({ linkId }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api.get(`/links/${linkId}/qr`).then((res) => setQr(res.data)).catch(() => {});
  }, [linkId]);

  if (!qr) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col items-center">
      <h3 className="font-semibold mb-3 self-start">QR code</h3>
      <img src={qr.dataUrl} alt="QR code" className="w-40 h-40" />
      <a href={qr.dataUrl} download="sniply-qr.png"
        className="mt-3 text-sm px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200">
        Download PNG
      </a>
    </div>
  );
}

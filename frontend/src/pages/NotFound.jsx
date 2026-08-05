import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2 } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f3f7fd] via-[#f7faff] to-[#f3f7fd] flex flex-col items-center justify-center p-6 gap-6 select-none font-sans">
      {/* 1. Logo Pill */}
      <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-transform duration-200 hover:scale-105">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e75ff] text-white shadow-md shadow-blue-100">
          <Link2 className="h-4 w-4 rotate-45" />
        </div>
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-850 leading-tight">Sniply</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">URL Shortener</p>
        </div>
      </div>

      {/* 2. Main 404 Card */}
      <div className="w-full max-w-[600px] bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(28,95,255,0.04)] border border-slate-100/50">
        {/* Illustration inside glow background */}
        <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-tr from-[#edf2ff] to-[#f6f9ff] shadow-[inset_0_4px_12px_rgba(30,117,255,0.03)] mb-6">
          <div className="w-24 h-24 bg-white rounded-[24px] shadow-[0_12px_28px_rgba(30,117,255,0.06)] border border-blue-50/50 flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-[#1e75ff]">
              {/* Top search/title bar */}
              <rect x="14" y="14" width="28" height="4" rx="2" fill="#1e75ff" fillOpacity="0.2" />
              {/* Dashed search circle */}
              <circle cx="28" cy="34" r="12" stroke="#1e75ff" strokeWidth="2.5" strokeDasharray="5 4" strokeOpacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Big 404 Text */}
        <h1 className="text-7xl md:text-8xl font-black text-[#1e75ff] tracking-tight mb-5 leading-none select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-900 mb-3 tracking-tight">
          Oops! This Page Doesn't Exist
        </h2>

        {/* Paragraph Description */}
        <p className="text-slate-500 text-sm md:text-base max-w-sm md:max-w-md leading-relaxed mb-8">
          The page you're looking for might have been removed, renamed, or is temporarily unavailable
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col items-center gap-3">
          <Link
            to={user ? '/' : '/login'}
            className="w-full max-w-[280px] bg-[#1e75ff] hover:bg-[#0a65ff] text-white font-semibold py-3 px-6 rounded-full shadow-[0_8px_24px_rgba(30,117,255,0.2)] hover:shadow-[0_12px_28px_rgba(30,117,255,0.28)] transition-all duration-250 text-sm flex items-center justify-center"
          >
            Go to Homepage
          </Link>
          <Link
            to="/"
            className="w-full max-w-[280px] bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 px-6 rounded-full border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-250 text-sm flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Footer Support & Copyright */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Need help?{' '}
            <a href="mailto:support@sniply.com" className="text-[#1e75ff] hover:underline font-semibold transition-colors duration-150">
              Report this issue
            </a>
          </p>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            &copy; Sniply URL Shortener
          </p>
        </div>

      </div>
    </div>
  );
}

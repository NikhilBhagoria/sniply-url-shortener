import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2 } from 'lucide-react';

// Custom Link2Off icon to guarantee rendering across all lucide versions
function Link2OffIcon({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 0 1 4 4.3" />
      <line x1="8" x2="12" y1="12" y2="12" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function InvalidLink() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const reason = searchParams.get('reason') || 'not-found';
  
  // Extract dynamic short link path based on current URL
  const host = window.location.host;
  const cleanHost = host.includes('localhost') ? 'sniply.app' : host;
  const shortLink = slug ? `${cleanHost}/${slug}` : `${cleanHost}${window.location.pathname}`;

  const isExpired = reason === 'expired';

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] md:bg-[#f4f7fe] flex items-center justify-center p-4 md:p-6 font-sans">
      
      {/* Main Card */}
      <div className="w-full max-w-[620px] bg-white rounded-3xl p-8 md:p-12 flex flex-col items-center shadow-[0_15px_50px_rgba(0,0,0,0.025)] border border-slate-100/80 animate-in fade-in duration-300">
        
        {/* Broken Link Icon inside circle */}
        <div className="w-16 h-16 rounded-full bg-[#eef4ff] flex items-center justify-center text-[#1e75ff] mb-6">
          <Link2OffIcon className="h-7 w-7" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-[28px] font-extrabold text-[#0f172a] tracking-tight text-center leading-tight mb-2">
          This Short Link is Invalid or Expired
        </h1>

        {/* Sub-heading */}
        <p className="text-sm md:text-base text-slate-500 font-medium text-center mb-1">
          <span className="font-bold text-slate-800">{shortLink}</span> {isExpired ? 'has expired.' : 'could not be found.'}
        </p>

        {/* Description */}
        <p className="text-xs md:text-sm text-slate-400 font-medium text-center mb-8">
          This link may have been deleted, expired, or never existed.
        </p>

        {/* Primary Action Button */}
        <Link
          to="/"
          className="px-6 py-3 bg-[#1e75ff] hover:bg-[#0a65ff] text-white font-semibold rounded-full shadow-[0_6px_20px_rgba(30,117,255,0.22)] hover:shadow-[0_8px_24px_rgba(30,117,255,0.3)] transition-all duration-200 text-xs md:text-sm mb-3 text-center min-w-[200px]"
        >
          Create Your Own Short Link
        </Link>

        {/* Secondary Action Button */}
        <a
          href="mailto:support@sniply.com"
          className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-full text-xs transition-all duration-200 mb-8 shadow-sm text-center min-w-[150px]"
        >
          Contact Support
        </a>

        {/* Amber Alert Box */}
        <div className="w-full bg-[#fffcf5] border border-[#fde047] rounded-2xl p-4 md:p-5 flex items-start gap-3.5 text-left mb-6">
          {/* Warning Triangle Icon */}
          <div className="h-9 w-9 rounded-full bg-[#fef9c3] flex items-center justify-center shrink-0">
            <svg 
              className="h-5 w-5 text-amber-600 shrink-0" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-snug">
              {isExpired ? 'Error Code: 410 - Link Expired' : 'Error Code: 410 - Link Not Found'}
            </h4>
            <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-1 leading-normal">
              {isExpired 
                ? 'The destination is unavailable because the link has reached its expiry limit. Please verify the URL or create a new short link.' 
                : 'The destination is unavailable. Please verify the URL or create a new short link.'}
            </p>
          </div>
        </div>

        {/* Logo at bottom */}
        <div className="flex items-center gap-1.5 mt-2 mb-2">
          <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center text-[#1e75ff]">
            <Link2 className="h-3 w-3 rotate-45" />
          </div>
          <span className="text-xs font-bold text-slate-800">Sniply</span>
        </div>

        {/* Support Link */}
        <a 
          href="mailto:support@sniply.com" 
          className="text-[#1e75ff] hover:underline text-xs font-bold transition-all"
        >
          Report this issue
        </a>

      </div>
    </div>
  );
}

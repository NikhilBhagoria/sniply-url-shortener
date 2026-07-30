import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  QrCode,
  Code2,
  Settings,
  CreditCard,
  Users2,
  Zap,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Search,
  Sparkles,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Shorten URL', to: '/shorten', icon: Link2 },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'QR Codes', to: '/qr-codes', icon: QrCode },
  { label: 'API', to: '/api', icon: Code2 },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Billing', to: '/settings?tab=billing', icon: CreditCard, isDummy: true },
  { label: 'Team', to: '/settings?tab=team', icon: Users2, isDummy: true },
  { label: 'Integrations', to: '/settings?tab=integrations', icon: Zap, isDummy: true },
];

export default function DashboardLayout({ children }) {
  const { user, logout, search, setSearch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSearchPlaceholder = () => {
    switch (location.pathname) {
      case '/':
        return 'Search links...';
      case '/shorten':
        return 'Search links...';
      case '/settings':
        return 'Settings';
      case '/analytics':
        return 'Search analytics...';
      case '/qr-codes':
        return 'Search QR codes...';
      case '/api':
        return 'Search API...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className={`min-h-screen flex bg-[#f9fafc] text-slate-800 ${darkMode ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e75ff] text-white">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Sniply</h2>
            <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-slate-400">URL Shortener</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {sidebarLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#1e75ff] text-white shadow-md shadow-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Upgrade to Pro Card */}
        <div className="mt-auto bg-[#f4f7ff] border border-blue-50 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-blue-100 rounded-full opacity-30 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#1e75ff]" />
            <span className="text-xs font-bold text-slate-900">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Unlock advanced analytics, custom domains, and team controls.
          </p>
          <button className="mt-4 w-full rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white py-2 text-xs font-semibold shadow-sm transition-colors duration-150">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm">
          <aside className="w-72 bg-white p-6 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e75ff] text-white">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sniply</h2>
                  <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-slate-400">URL Shortener</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'bg-[#1e75ff] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto bg-[#f4f7ff] border border-blue-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#1e75ff]" />
                <span className="text-xs font-bold text-slate-900">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Unlock advanced analytics, custom domains, and team controls.
              </p>
              <button className="mt-4 w-full rounded-xl bg-[#1e75ff] hover:bg-[#0a65ff] text-white py-2 text-xs font-semibold shadow-sm transition-colors">
                Upgrade
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header / Topbar */}
        <header className="sticky top-0 z-30 h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Hamburger menu toggle */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
              <Menu className="h-5 w-5 text-slate-600" />
            </button>

            {/* Search links or static context input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={(location.pathname === '/' || location.pathname === '/shorten') ? (search || '') : ''}
                onChange={(e) => {
                  if (location.pathname === '/' || location.pathname === '/shorten') {
                    setSearch(e.target.value);
                  }
                }}
                disabled={location.pathname !== '/' && location.pathname !== '/shorten'}
                className={`w-full rounded-full border border-slate-200 bg-[#f9fafc] py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all duration-150 ${
                  (location.pathname === '/' || location.pathname === '/shorten') 
                    ? 'focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 cursor-text' 
                    : 'bg-slate-50 cursor-not-allowed opacity-80'
                }`}
              />
            </div>
          </div>

          {/* Right Header icons & user details */}
          <div className="flex items-center gap-6">
            {/* Light/Dark mode switcher */}
            <div className="flex items-center bg-[#f0f2f5] rounded-full p-1 border border-slate-100">
              <button 
                onClick={() => setDarkMode(false)}
                className={`p-1.5 rounded-full transition-all duration-150 ${!darkMode ? 'bg-white text-[#1e75ff] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setDarkMode(true)}
                className={`p-1.5 rounded-full transition-all duration-150 ${darkMode ? 'bg-white text-[#1e75ff] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Notifications Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-all duration-150">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ff4a4a] border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all duration-150"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-slate-100"
                />
                <div className="text-left hidden md:block">
                  <h4 className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'Alex Rivera'}</h4>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Pro plan</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 lg:hidden">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

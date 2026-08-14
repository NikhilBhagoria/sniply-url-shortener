import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  X,
  AlertTriangle,
  Shield
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
  
  const { darkMode, setDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Your link lnk.ly/xY7z9Q reached 1,000 clicks',
      description: 'Traffic is up 18% compared to yesterday.',
      time: '2m ago',
      unread: true,
      type: 'link',
    },
    {
      id: 2,
      title: 'New team member joined',
      description: 'Maya Patel accepted the invite and joined Workspace.',
      time: '1h ago',
      unread: false,
      type: 'user',
    },
    {
      id: 3,
      title: 'API rate limit at 80%',
      description: 'Consider upgrading your plan to avoid throttling.',
      time: '1d ago',
      unread: true,
      type: 'alert',
    },
    {
      id: 4,
      title: 'Weekly analytics report is ready',
      description: 'Open the dashboard to review top-performing links.',
      time: '2d ago',
      unread: false,
      type: 'chart',
    },
    {
      id: 5,
      title: 'Security scan completed',
      description: 'No vulnerabilities detected in your workspace.',
      time: '3d ago',
      unread: false,
      type: 'security',
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
    <div className={`min-h-screen flex text-slate-800 ${darkMode ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-[#f9fafc]'}`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800/60 p-6 shrink-0 h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e75ff] text-white">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Sniply</h2>
            <p className="text-[10px] uppercase font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500">URL Shortener</p>
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
                    ? 'bg-[#1e75ff] text-white shadow-md shadow-blue-100 dark:shadow-none'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-450 dark:hover:bg-slate-800/40 dark:hover:text-white'
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
        <div className="mt-auto bg-[#f4f7ff] border border-blue-50 dark:bg-[#1e293b]/20 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-12 h-12 bg-blue-100 rounded-full opacity-30 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#1e75ff]" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
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
        <header className="sticky top-0 z-30 h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800/60 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Hamburger menu toggle */}
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
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
                className={`w-full rounded-full border border-slate-200 dark:border-slate-800 bg-[#f9fafc] dark:bg-[#1e293b] py-2.5 pl-11 pr-4 text-sm text-slate-700 dark:text-slate-105 outline-none transition-all duration-150 ${
                  (location.pathname === '/' || location.pathname === '/shorten') 
                    ? 'focus:border-blue-400 focus:bg-white dark:focus:bg-[#1e293b] focus:ring-4 focus:ring-blue-50 cursor-text' 
                    : 'bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed opacity-80'
                }`}
              />
            </div>
          </div>

          {/* Right Header icons & user details */}
          <div className="flex items-center gap-6">
            {/* Light/Dark mode switcher */}
            <div className="flex items-center bg-[#f0f2f5] dark:bg-[#1e293b] rounded-full p-1 border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setDarkMode(false)}
                className={`p-1.5 rounded-full transition-all duration-150 ${!darkMode ? 'bg-white dark:bg-[#0f172a] text-[#1e75ff] shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'}`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setDarkMode(true)}
                className={`p-1.5 rounded-full transition-all duration-150 ${darkMode ? 'bg-white dark:bg-[#0f172a] text-[#1e75ff] shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'}`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Notifications Bell & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className="relative h-10 w-10 flex items-center justify-center bg-white text-slate-500 hover:text-slate-700 rounded-full border border-slate-200/80 shadow-sm hover:shadow transition-all duration-150"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-[#ff4a4a] border-2 border-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-[#1e75ff] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    {/* Body List */}
                    <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {notifications.map((n) => {
                        let iconBg = '';
                        let iconColor = '';
                        let Icon = null;

                        if (n.type === 'link') {
                          iconBg = 'bg-blue-50 border border-blue-100/50';
                          iconColor = 'text-[#1e75ff]';
                          Icon = Link2;
                        } else if (n.type === 'user') {
                          iconBg = 'bg-emerald-50 border border-emerald-100/50';
                          iconColor = 'text-emerald-600';
                          Icon = Users2;
                        } else if (n.type === 'alert') {
                          iconBg = 'bg-amber-50 border border-amber-100/50';
                          iconColor = 'text-amber-600';
                          Icon = AlertTriangle;
                        } else if (n.type === 'chart') {
                          iconBg = 'bg-indigo-50 border border-indigo-100/50';
                          iconColor = 'text-indigo-600';
                          Icon = BarChart3;
                        } else {
                          iconBg = 'bg-teal-50 border border-teal-100/50';
                          iconColor = 'text-teal-600';
                          Icon = Shield;
                        }

                        return (
                          <div 
                            key={n.id}
                            onClick={() => toggleRead(n.id)}
                            className={`flex gap-3 items-start p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                              n.unread 
                                ? 'bg-[#edf3ff] dark:bg-[#1e293b]/40 hover:bg-[#e1ecff] dark:hover:bg-[#1e293b]/60 border border-blue-100/40 dark:border-blue-900/30' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                            }`}
                          >
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{n.title}</h5>
                                <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                  {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#1e75ff]" />}
                                  <span>{n.time}</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">{n.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                      <button className="text-xs font-bold text-[#1e75ff] hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-150"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-slate-100 dark:border-slate-850"
                />
                <div className="text-left hidden md:block">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name || 'Alex Rivera'}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">Pro plan</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-850 lg:hidden">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/45 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-850"
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

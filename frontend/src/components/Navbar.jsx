import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  if (['/login', '/register'].includes(location.pathname) || user) return null;

  return (
    <nav className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-[#1e75ff]">Sniply</Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

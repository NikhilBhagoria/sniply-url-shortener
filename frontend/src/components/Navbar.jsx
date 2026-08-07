import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  if (['/login', '/register'].includes(location.pathname) || user) return null;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-indigo-600">Sniply</Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600 hidden sm:inline">Hi, {user.name}</span>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

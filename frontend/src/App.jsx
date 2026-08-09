import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ShortenURL from './pages/ShortenURL';
import LinkStats from './pages/LinkStats';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import QRCodes from './pages/QRCodes';
import Api from './pages/Api';
import Unlock from './pages/Unlock';
import Message from './pages/Message';
import NotFound from './pages/NotFound';
import InvalidLink from './pages/InvalidLink';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated Routes with DashboardLayout */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/shorten" element={<ProtectedRoute><DashboardLayout><ShortenURL /></DashboardLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
          <Route path="/qr-codes" element={<ProtectedRoute><DashboardLayout><QRCodes /></DashboardLayout></ProtectedRoute>} />
          <Route path="/api" element={<ProtectedRoute><DashboardLayout><Api /></DashboardLayout></ProtectedRoute>} />
          <Route path="/links/:id" element={<ProtectedRoute><DashboardLayout><LinkStats /></DashboardLayout></ProtectedRoute>} />
          
          <Route path="/unlock/:slug" element={<Unlock />} />
          <Route path="/invalid-link" element={<InvalidLink />} />
          <Route path="/expired" element={<Message emoji="⌛" title="Link expired" text="This short link is no longer active." />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

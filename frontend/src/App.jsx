import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShortenURL = lazy(() => import('./pages/ShortenURL'));
const LinkStats = lazy(() => import('./pages/LinkStats'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const QRCodes = lazy(() => import('./pages/QRCodes'));
const Api = lazy(() => import('./pages/Api'));
const Unlock = lazy(() => import('./pages/Unlock'));
const Message = lazy(() => import('./pages/Message'));
const NotFound = lazy(() => import('./pages/NotFound'));
const InvalidLink = lazy(() => import('./pages/InvalidLink'));
const AccountRecovery = lazy(() => import('./pages/AccountRecovery'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Suspense fallback={<p className="p-6" role="status">Loading page…</p>}><Routes>
            <Route path="/forgot-password" element={<AccountRecovery key="forgot" />} />
            <Route path="/reset-password" element={<AccountRecovery key="reset" />} />
            <Route path="/verify-email" element={<AccountRecovery key="verify" />} />
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
          </Routes></Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

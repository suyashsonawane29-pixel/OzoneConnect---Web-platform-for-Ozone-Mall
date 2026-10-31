import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Tag,
  Calendar,
  UtensilsCrossed,
  Film,
  Image,
  FileText,
  HelpCircle,
  MapPin,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating administrator access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Stores Directory', path: '/admin/stores', icon: Store },
    { label: 'Offers & Promos', path: '/admin/offers', icon: Tag },
    { label: 'Events & RSVPs', path: '/admin/events', icon: Calendar },
    { label: 'Dining Outlets', path: '/admin/dining', icon: UtensilsCrossed },
    { label: 'Entertainment', path: '/admin/entertainment', icon: Film },
    { label: 'Gallery Media', path: '/admin/gallery', icon: Image },
    { label: 'Pages Content (CMS)', path: '/admin/pages', icon: FileText },
    { label: 'FAQs Management', path: '/admin/faqs', icon: HelpCircle },
    { label: 'Visitor Information', path: '/admin/visitor-information', icon: MapPin },
    { label: 'Contact Enquiries', path: '/admin/enquiries', icon: Mail },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-charcoal-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-charcoal-950 text-white px-4 py-3 flex items-center justify-between border-b border-charcoal-800">
        <Logo light size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-charcoal-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-charcoal-950 text-white flex flex-col border-r border-charcoal-900 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Bar */}
        <div className="p-6 border-b border-charcoal-800/80 flex items-center justify-between">
          <Logo light size="sm" />
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
            Admin CMS
          </span>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 bg-charcoal-900/40 border-b border-charcoal-800/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-600/20 text-gold-400 border border-gold-500/30 flex items-center justify-center font-bold text-xs uppercase">
            {currentUser?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser?.displayName || 'Administrator'}
            </p>
            <p className="text-[11px] text-charcoal-400 truncate">{currentUser?.email}</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-500 text-charcoal-950 font-bold shadow-sm'
                    : 'text-charcoal-300 hover:text-white hover:bg-charcoal-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-charcoal-950' : 'text-gold-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-charcoal-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-300 hover:text-white hover:bg-charcoal-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-charcoal-500 font-mono">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-charcoal-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest">
              Ozone Mall Administration
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-charcoal-500" />
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

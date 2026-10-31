import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@ozonemall.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient gold lighting */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Logo light size="lg" className="justify-center" />
        <h2 className="mt-6 font-serif text-2xl font-bold tracking-tight text-white">
          Website Admin Portal
        </h2>
        <p className="mt-2 text-xs text-charcoal-300">
          Secure content management system for Ozone Mall, Ojhar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-charcoal-900/90 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-charcoal-800 backdrop-blur-md">
          {error && (
            <div className="p-3.5 mb-6 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@ozonemall.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-white placeholder-charcoal-500 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-white placeholder-charcoal-500 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-gold-500 hover:bg-gold-400 text-charcoal-950 transition-all shadow-md hover:shadow-gold-glow disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Secure Hint Box */}
          <div className="mt-6 pt-5 border-t border-charcoal-800/80 text-[11px] text-charcoal-400 space-y-2">
            <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {isFirebaseConfigured
                  ? 'Connected to Firebase Authentication'
                  : 'Development / Demo Credentials Pre-filled'}
              </span>
            </div>
            <p className="leading-relaxed">
              Email: <code className="text-white bg-charcoal-950 px-1 py-0.5 rounded">admin@ozonemall.com</code><br />
              Password: <code className="text-white bg-charcoal-950 px-1 py-0.5 rounded">admin123</code>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-charcoal-400 hover:text-gold-400 transition-colors"
          >
            ← Return to Ozone Mall Public Site
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Gift,
  Star,
  Compass,
  Crown,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const UserLoginPage: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/profile';

  // If already authenticated as a member, redirect to profile
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('closed')) {
        // User simply closed the popup — no need to show an error
        setErrorMsg(null);
      } else if (msg.toLowerCase().includes('blocked') || msg.toLowerCase().includes('popup')) {
        setErrorMsg(
          'Pop-up was blocked by your browser. Please click "Allow pop-ups" in your address bar and try again.'
        );
      } else {
        setErrorMsg(msg || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    setErrorMsg(null);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      alert('Please enter a valid registered email address.');
      return;
    }
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center py-8 lg:py-16 px-4 sm:px-6 lg:px-8">
      {/* Back to Home link */}
      <div className="max-w-6xl w-full mx-auto mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-charcoal-600 hover:text-gold-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Ozone Mall</span>
        </Link>

        <div className="text-xs text-charcoal-500">
          Need administrator access?{' '}
          <Link to="/admin/login" className="text-gold-700 hover:underline font-bold">
            Admin Portal →
          </Link>
        </div>
      </div>

      {/* Main Split Container */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-charcoal-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Lifestyle & Ozone Privilege Club Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-charcoal-950 text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
          {/* Background lifestyle visual with gradient overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1200&q=80"
              alt="Ozone Mall Lifestyle"
              className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-charcoal-950/60" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl" />
          </div>

          {/* Top Brand & Badge */}
          <div className="relative z-10 space-y-4">
            <Logo light size="md" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-950/80 border border-gold-500/40 text-gold-300 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Crown className="w-3.5 h-3.5 text-gold-400" />
              <span>Ozone Privilege Member Portal</span>
            </div>

            <h2 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight">
              A World of Elevated Retail & Lifestyle
            </h2>

            <p className="text-xs text-charcoal-300 font-light leading-relaxed">
              Sign in to your member account to access curated store perks, save favorite boutiques, and track digital passes for upcoming concerts.
            </p>
          </div>

          {/* Member Benefits List */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-charcoal-900/60 border border-charcoal-800">
              <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex-shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Exclusive Member Sales</p>
                <p className="text-[11px] text-charcoal-400">
                  Priority notifications for seasonal clearance & 50% discount days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-charcoal-900/60 border border-charcoal-800">
              <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex-shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Digital RSVP Passes</p>
                <p className="text-[11px] text-charcoal-400">
                  One-tap event passes saved directly to your phone for rapid atrium access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-charcoal-900/60 border border-charcoal-800">
              <div className="p-2 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex-shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Personalized Directory</p>
                <p className="text-[11px] text-charcoal-400">
                  Bookmark favorite fashion brands, restaurants, and Cineplex releases.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Tag */}
          <div className="relative z-10 pt-4 border-t border-charcoal-800/80 flex items-center justify-between text-[11px] text-charcoal-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Encrypted Secure Login</span>
            </span>
            <span>Ojhar, Maharashtra</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 xl:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header */}
            <div>
              <div className="lg:hidden mb-4">
                <Logo size="sm" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-px bg-gold-500"></span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                  Member Sign In
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-light leading-relaxed">
                Enter your credentials below to access your Ozone Privilege perks.
              </p>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Google Social Sign In */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white border border-charcoal-200 hover:border-gold-400 text-xs font-semibold text-charcoal-800 hover:bg-gold-50/40 transition-all shadow-subtle hover:shadow-md disabled:opacity-60 disabled:cursor-wait"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-charcoal-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-charcoal-600">Opening Google sign-in…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
              {isGoogleLoading && (
                <p className="text-center text-[11px] text-charcoal-400 mt-2">
                  A Google sign-in window has opened. Please complete sign-in there.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-charcoal-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-charcoal-400 font-medium uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="border-t border-charcoal-200 w-full" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="e.g. member@ozonemall.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-charcoal-600">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0 border-charcoal-300"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-gold-700 hover:text-gold-900 font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest bg-gold-500 hover:bg-gold-400 text-charcoal-950 transition-all shadow-md hover:shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Ozone Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-gold-600" /> Demo Quick Sign-in:
                </span>
                <span className="text-[10px] text-charcoal-400">Click to autofill</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('member@ozonemall.com', 'password123')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gold-50 text-charcoal-800 text-[11px] font-semibold border border-charcoal-200 hover:border-gold-300 transition-colors"
                >
                  Shopper: <span className="text-gold-700">Aarav (Gold)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('priya@gmail.com', 'password123')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-gold-50 text-charcoal-800 text-[11px] font-semibold border border-charcoal-200 hover:border-gold-300 transition-colors"
                >
                  Shopper: <span className="text-gold-700">Priya (Platinum)</span>
                </button>
              </div>
            </div>

            {/* Switch to Sign Up */}
            <div className="text-center pt-2">
              <p className="text-xs text-charcoal-600">
                New to Ozone Mall?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-charcoal-900 hover:text-gold-700 underline underline-offset-4 decoration-gold-400"
                >
                  Join Ozone Privilege Club
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-charcoal-200">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
              Reset Your Password
            </h3>
            <p className="text-xs text-charcoal-500 mb-4 leading-relaxed font-light">
              Enter your registered email address below. We'll send instructions to reset your account password.
            </p>

            {forgotSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold">Reset instructions dispatched!</p>
                <p className="text-emerald-700 text-[11px]">
                  Please check your inbox at <span className="font-mono">{forgotEmail}</span> to complete the reset.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="e.g. member@ozonemall.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

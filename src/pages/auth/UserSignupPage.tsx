import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Crown,
  Gift,
  ShieldCheck,
  Check,
  Star,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Please enter a valid 10-digit phone number')
      .max(15, 'Phone number too long')
      .regex(/^[0-9+ ]+$/, 'Please enter a valid numeric phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms & Privacy Policy' }),
    }),
    subscribeNews: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const UserSignupPage: React.FC = () => {
  const { signup, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to profile
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
      subscribeNews: true,
    },
  });

  const currentPassword = watch('password', '');
  const hasMinLength = currentPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(currentPassword);
  const hasNumber = /[0-9]/.test(currentPassword);

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signup(data.fullName, data.email, data.password, data.phone);
      navigate('/profile', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      navigate('/profile', { replace: true });
    } catch (err: any) {
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('closed')) {
        setErrorMsg(null);
      } else if (msg.toLowerCase().includes('blocked') || msg.toLowerCase().includes('popup')) {
        setErrorMsg(
          'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.'
        );
      } else {
        setErrorMsg(msg || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
      setIsSubmitting(false);
    }
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
          Already a Privilege Member?{' '}
          <Link to="/login" className="text-gold-700 hover:underline font-bold">
            Sign In Here →
          </Link>
        </div>
      </div>

      {/* Main Split Card */}
      <div className="max-w-6xl w-full mx-auto bg-white rounded-3xl shadow-2xl border border-charcoal-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Privilege Club Presentation & Perks */}
        <div className="hidden lg:flex lg:col-span-5 bg-charcoal-950 text-white p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
          {/* Background overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1200&q=80"
              alt="Ozone Mall Architecture"
              className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-charcoal-950/60" />
            <div className="absolute top-1/4 right-0 w-80 h-80 bg-gold-500/15 rounded-full blur-3xl" />
          </div>

          {/* Top Brand & Badge */}
          <div className="relative z-10 space-y-4">
            <Logo light size="md" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-950/80 border border-gold-500/40 text-gold-300 text-[10px] font-bold tracking-[0.2em] uppercase">
              <Crown className="w-3.5 h-3.5 text-gold-400" />
              <span>Ozone Privilege Membership</span>
            </div>

            <h2 className="font-serif text-3xl font-bold text-white tracking-tight leading-tight">
              Begin Your Journey of Exquisite Perks
            </h2>

            <p className="text-xs text-charcoal-300 font-light leading-relaxed">
              Join over 25,000 discerning shoppers across Nashik District who enjoy premier access, rewards, and unforgettable experiences.
            </p>
          </div>

          {/* Golden Privilege Digital Card Mockup */}
          <div className="relative z-10 my-6 p-6 rounded-2xl bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 text-charcoal-950 shadow-xl border border-gold-300/40 transform transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-charcoal-950" />
                <span className="font-serif font-bold text-sm tracking-wider uppercase">
                  Privilege Gold Pass
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-charcoal-950 text-gold-300 uppercase tracking-widest">
                Tier 1
              </span>
            </div>

            <div className="space-y-1 mb-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-800">
                Welcome Bonus Included
              </p>
              <p className="font-serif text-2xl font-bold text-charcoal-950">
                500 Reward Points
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-medium pt-3 border-t border-charcoal-950/20">
              <span>Ozone Mall, Ojhar</span>
              <span className="font-mono">VALID: 2026 - 2027</span>
            </div>
          </div>

          {/* Perks Highlights */}
          <div className="relative z-10 space-y-2.5 text-xs text-charcoal-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-gold-400" />
              </div>
              <span>Instant 500 Welcome Points upon joining</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-gold-400" />
              </div>
              <span>Digital RSVP passes for live concerts & workshops</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-gold-400" />
              </div>
              <span>Direct member-exclusive discounts at 80+ partner stores</span>
            </div>
          </div>

          {/* Bottom Trust */}
          <div className="relative z-10 pt-4 border-t border-charcoal-800/80 flex items-center justify-between text-[11px] text-charcoal-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Complimentary Membership</span>
            </span>
            <span>No Annual Fees</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Sign Up Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 xl:p-14 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Header */}
            <div>
              <div className="lg:hidden mb-4">
                <Logo size="sm" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-px bg-gold-500"></span>
                <span className="text-[10px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                  Exclusive Registration
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-light leading-relaxed">
                Unlock exclusive store offers, event passes, and personalized dining perks.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Google Social Sign Up */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                    <span>Quick Sign Up with Google</span>
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
                or register with email
              </span>
              <div className="border-t border-charcoal-200 w-full" />
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="e.g. Siddharth Joshi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="siddharth@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="98XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
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

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password strength helper */}
              {currentPassword && (
                <div className="flex items-center gap-3 text-[10px] text-charcoal-500 px-1">
                  <span className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-600' : ''}`}>
                    <Check className="w-3 h-3" /> 6+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${hasLetter ? 'text-emerald-600' : ''}`}>
                    <Check className="w-3 h-3" /> Letters
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-600' : ''}`}>
                    <Check className="w-3 h-3" /> Numbers
                  </span>
                </div>
              )}

              {/* Checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal-600">
                  <input
                    {...register('agreeTerms')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0 border-charcoal-300 mt-0.5"
                  />
                  <span>
                    I agree to the Ozone Mall{' '}
                    <Link to="/about" className="text-gold-700 hover:underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and Privacy Policy.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-[11px] text-red-500 pl-6">{errors.agreeTerms.message}</p>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-charcoal-600">
                  <input
                    {...register('subscribeNews')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0 border-charcoal-300 mt-0.5"
                  />
                  <span>
                    Receive VIP flash sale announcements & concert RSVP invites via WhatsApp/Email.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest bg-gold-500 hover:bg-gold-400 text-charcoal-950 transition-all shadow-md hover:shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Join Club & Claim 500 Points</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="text-center pt-2">
              <p className="text-xs text-charcoal-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-charcoal-900 hover:text-gold-700 underline underline-offset-4 decoration-gold-400"
                >
                  Sign In to Your Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

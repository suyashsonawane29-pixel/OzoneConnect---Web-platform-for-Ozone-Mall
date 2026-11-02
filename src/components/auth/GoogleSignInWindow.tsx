import React, { useState } from 'react';
import { User, ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import { AppUser } from '../../types';

interface GoogleSignInWindowProps {
  onSuccess: (user: AppUser) => void;
  onCancel?: () => void;
  isStandalonePopup?: boolean;
}

interface SavedAccount {
  name: string;
  email: string;
  avatarBg: string;
}

const DEFAULT_ACCOUNTS: SavedAccount[] = [
  {
    name: 'Aarav Deshmukh',
    email: 'aarav.deshmukh@gmail.com',
    avatarBg: 'bg-indigo-600',
  },
  {
    name: 'Priya Kulkarni',
    email: 'priya.kulkarni@gmail.com',
    avatarBg: 'bg-emerald-600',
  },
];

export const GoogleSignInWindow: React.FC<GoogleSignInWindowProps> = ({
  onSuccess,
  onCancel,
  isStandalonePopup = false,
}) => {
  const [step, setStep] = useState<'choose_account' | 'enter_email' | 'enter_password'>('choose_account');
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedAccount(account);
    setEmailInput(account.email);
    setPasswordInput('');
    setErrorMsg(null);
    setStep('enter_password');
  };

  const handleProceedFromEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Enter a valid email address');
      return;
    }
    const namePart = trimmed.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    setSelectedAccount({
      name: formattedName || 'Google User',
      email: trimmed,
      avatarBg: 'bg-blue-600',
    });
    setStep('enter_password');
  };

  const handleCompleteSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordInput || passwordInput.length < 4) {
      setErrorMsg('Wrong password. Try again or click Forgot password to reset it.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const email = selectedAccount?.email || emailInput.trim();
      const displayName = selectedAccount?.name || email.split('@')[0];

      const userObj: AppUser = {
        uid: `google-${Date.now()}`,
        email: email.toLowerCase(),
        displayName: displayName,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'member',
        membershipTier: 'Gold',
        memberSince: new Date().toISOString(),
        points: 500,
        favoriteStores: [],
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          displayName
        )}&background=1a73e8&color=fff`,
      };

      setIsLoading(false);
      onSuccess(userObj);
    }, 1200);
  };

  return (
    <div className={`w-full ${isStandalonePopup ? 'min-h-screen flex items-center justify-center p-4 bg-[#f8f9fa]' : ''}`}>
      <div className="w-full max-w-[450px] bg-white border border-[#dadce0] rounded-xl shadow-md overflow-hidden relative font-sans text-[#202124]">
        {/* Animated Google Progress Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#e8f0fe] overflow-hidden z-20">
            <div className="h-full bg-[#1a73e8] animate-pulse w-full origin-left" />
          </div>
        )}

        {/* Modal Close Button (if embedded) */}
        {!isStandalonePopup && onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8 sm:p-10">
          {/* Google 4-Color Logo */}
          <div className="flex justify-center mb-4">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
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
          </div>

          {/* STEP 1: Choose an Account */}
          {step === 'choose_account' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-normal text-[#202124]">
                  Choose an account
                </h2>
                <p className="text-sm text-[#5f6368] mt-1">
                  to continue to <span className="font-medium text-[#202124]">Ozone Mall</span>
                </p>
              </div>

              {/* Account List */}
              <div className="divide-y divide-[#dadce0] border-y border-[#dadce0] -mx-4 sm:-mx-6">
                {DEFAULT_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    disabled={isLoading}
                    className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] transition-colors text-left group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-medium text-sm flex items-center justify-center flex-shrink-0`}
                    >
                      {acc.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#202124] truncate group-hover:text-[#1a73e8]">
                        {acc.name}
                      </div>
                      <div className="text-xs text-[#5f6368] truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}

                {/* Use another account option */}
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    setStep('enter_email');
                  }}
                  disabled={isLoading}
                  className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#f8f9fa] transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full border border-[#dadce0] text-[#5f6368] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium text-[#202124]">Use another account</div>
                </button>
              </div>

              <div className="text-xs text-[#5f6368] leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with Ozone Mall.
              </div>
            </div>
          )}

          {/* STEP 2: Enter Email / Phone */}
          {step === 'enter_email' && (
            <form onSubmit={handleProceedFromEmail} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-normal text-[#202124]">Sign in</h2>
                <p className="text-sm text-[#5f6368] mt-1">with your Google Account</p>
              </div>

              {errorMsg && (
                <div className="text-xs text-[#d93025] flex items-center gap-1.5">
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Email or phone"
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-md border border-[#dadce0] text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
                  />
                </div>
                <div className="mt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => setEmailInput('shopper@gmail.com')}
                    className="text-xs text-[#1a73e8] hover:underline font-medium"
                  >
                    Forgot email?
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#5f6368] leading-relaxed">
                Not your computer? Use Guest mode to sign in privately.{' '}
                <span className="text-[#1a73e8] hover:underline cursor-pointer">Learn more</span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="text-xs sm:text-sm font-medium text-[#1a73e8] hover:bg-[#f8fafd] px-3 py-2 rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium shadow-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter Password */}
          {step === 'enter_password' && selectedAccount && (
            <form onSubmit={handleCompleteSignIn} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-normal text-[#202124]">Welcome</h2>
                {/* Account selector badge pill */}
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full border border-[#dadce0] text-xs font-medium text-[#202124] hover:bg-[#f8f9fa] transition-colors"
                >
                  <div className={`w-4 h-4 rounded-full ${selectedAccount.avatarBg} text-white text-[9px] flex items-center justify-center`}>
                    {selectedAccount.name[0]}
                  </div>
                  <span className="truncate max-w-[200px]">{selectedAccount.email}</span>
                  <span className="text-gray-400">▾</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded bg-red-50 text-xs text-[#d93025] border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 pr-10 rounded-md border border-[#dadce0] text-sm text-[#202124] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-[#5f6368] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-[#dadce0] text-[#1a73e8] focus:ring-0"
                    />
                    <span>Show password</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setPasswordInput('GooglePassword123')}
                    className="text-xs text-[#1a73e8] hover:underline font-medium"
                  >
                    Auto-fill demo
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="text-xs sm:text-sm font-medium text-[#1a73e8] hover:bg-[#f8fafd] px-3 py-2 rounded-md transition-colors"
                >
                  Forgot password?
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Google Footer */}
        <div className="bg-[#f8f9fa] border-t border-[#dadce0] px-8 py-3.5 flex flex-wrap items-center justify-between text-[11px] text-[#5f6368]">
          <span>English (United States)</span>
          <div className="flex items-center space-x-4">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

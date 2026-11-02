import React, { useEffect } from 'react';
import { GoogleSignInWindow } from '../../components/auth/GoogleSignInWindow';
import { AppUser } from '../../types';

const USER_SESSION_KEY = 'ozone_mall_user_session';
const REGISTERED_USERS_KEY = 'ozone_mall_registered_users';

export const GooglePopupPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Sign in – Google Accounts';
  }, []);

  const handleSuccess = (user: AppUser) => {
    try {
      // Persist session so any same-origin tab picks it up
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));

      // Register into the members list if not already there
      try {
        const raw = localStorage.getItem(REGISTERED_USERS_KEY);
        const list: AppUser[] = raw ? JSON.parse(raw) : [];
        if (!list.some((u) => u.email === user.email)) {
          list.push(user);
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
        }
      } catch (_) {
        /* silent */
      }

      // Post the result to the opener window
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: 'GOOGLE_SIGNIN_SUCCESS', user },
          window.location.origin
        );
      }

      // Give the message handler a moment, then close
      setTimeout(() => window.close(), 300);
    } catch (e) {
      console.error('Popup completion error', e);
      window.close();
    }
  };

  const handleCancel = () => window.close();

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <GoogleSignInWindow
        isStandalonePopup
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

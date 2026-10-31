import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { AdminUser } from '../types';

interface AuthContextType {
  currentUser: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'ozone_mall_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Mall Administrator',
            role: 'admin',
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local demo admin session check
      try {
        const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to read admin session', err);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        setFirebaseUser(cred.user);
        const adminObj: AdminUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || 'Mall Administrator',
          role: 'admin',
        };
        setCurrentUser(adminObj);
      } else {
        // Safe development validation
        if (
          (email.trim().toLowerCase() === 'admin@ozonemall.com' ||
            email.trim().toLowerCase() === 'admin@ozone.com') &&
          pass.trim().length >= 6
        ) {
          const adminObj: AdminUser = {
            uid: 'admin-local-1',
            email,
            displayName: 'Ozone Mall Executive Admin',
            role: 'admin',
          };
          setCurrentUser(adminObj);
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminObj));
        } else {
          throw new Error('Invalid email or password. For demo mode use: admin@ozonemall.com (password: admin123)');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

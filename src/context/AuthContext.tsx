import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { AppUser } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<AppUser>;
  signup: (name: string, email: string, pass: string, phone?: string) => Promise<AppUser>;
  loginWithGoogle: (customUser?: AppUser) => Promise<AppUser>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<AppUser>) => Promise<AppUser>;
  toggleFavoriteStore: (storeId: string) => Promise<void>;
  setSessionUser: (user: AppUser) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'ozone_mall_user_session';
const ADMIN_STORAGE_KEY = 'ozone_mall_admin_session';
const REGISTERED_USERS_KEY = 'ozone_mall_registered_users';

const DEFAULT_MEMBERS: Array<AppUser & { password?: string }> = [
  {
    uid: 'user-demo-1',
    email: 'member@ozonemall.com',
    displayName: 'Aarav Deshmukh',
    phone: '+91 98220 12345',
    role: 'member',
    membershipTier: 'Gold',
    memberSince: '2026-01-15T10:00:00.000Z',
    points: 1250,
    favoriteStores: ['store-1', 'store-2', 'store-3'],
    password: 'password123',
  },
  {
    uid: 'user-demo-2',
    email: 'priya@gmail.com',
    displayName: 'Priya Kulkarni',
    phone: '+91 98220 67890',
    role: 'member',
    membershipTier: 'Platinum',
    memberSince: '2025-11-20T10:00:00.000Z',
    points: 3400,
    favoriteStores: ['store-3', 'store-6'],
    password: 'password123',
  },
];

function getRegisteredUsers(): Array<AppUser & { password?: string }> {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEFAULT_MEMBERS));
      return DEFAULT_MEMBERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEMBERS;
  }
}

function saveRegisteredUsers(users: Array<AppUser & { password?: string }>) {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users to localStorage', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (user) {
          const isAdminUser =
            user.email?.toLowerCase().includes('admin') ||
            user.email?.toLowerCase() === 'admin@ozonemall.com';
          const userObj: AppUser = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (isAdminUser ? 'Mall Administrator' : 'Ozone Member'),
            role: isAdminUser ? 'admin' : 'member',
            membershipTier: isAdminUser ? 'Platinum' : 'Gold',
            memberSince: user.metadata.creationTime || new Date().toISOString(),
            points: isAdminUser ? 9999 : 500,
            avatarUrl: user.photoURL || undefined,
            favoriteStores: [],
          };
          setCurrentUser(userObj);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local demo session check
      try {
        const storedUser = localStorage.getItem(USER_SESSION_KEY);
        const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else if (storedAdmin) {
          setCurrentUser(JSON.parse(storedAdmin));
        }
      } catch (err) {
        console.error('Failed to read user session', err);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<AppUser> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        setFirebaseUser(cred.user);
        const isAdminUser =
          cleanEmail.includes('admin') || cleanEmail === 'admin@ozonemall.com';
        const userObj: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || (isAdminUser ? 'Mall Administrator' : 'Ozone Member'),
          role: isAdminUser ? 'admin' : 'member',
          membershipTier: isAdminUser ? 'Platinum' : 'Gold',
          memberSince: cred.user.metadata.creationTime || new Date().toISOString(),
          points: isAdminUser ? 9999 : 500,
          favoriteStores: [],
        };
        setCurrentUser(userObj);
        return userObj;
      } else {
        // Safe development / offline validation
        // 1. Admin login check
        if (
          (cleanEmail === 'admin@ozonemall.com' || cleanEmail === 'admin@ozone.com') &&
          cleanPass.length >= 6
        ) {
          const adminObj: AppUser = {
            uid: 'admin-local-1',
            email: cleanEmail,
            displayName: 'Ozone Mall Executive Admin',
            role: 'admin',
            membershipTier: 'Platinum',
            memberSince: '2025-01-01T00:00:00.000Z',
            points: 9999,
          };
          setCurrentUser(adminObj);
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminObj));
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(adminObj));
          return adminObj;
        }

        // 2. Member user check from local database
        const registeredUsers = getRegisteredUsers();
        const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

        if (existing) {
          if (existing.password && existing.password !== cleanPass) {
            throw new Error('Incorrect password. For demo members, use password: password123');
          }
          const memberObj: AppUser = {
            uid: existing.uid,
            email: existing.email,
            displayName: existing.displayName,
            phone: existing.phone,
            role: 'member',
            membershipTier: existing.membershipTier || 'Gold',
            memberSince: existing.memberSince || new Date().toISOString(),
            points: existing.points || 750,
            favoriteStores: existing.favoriteStores || [],
          };
          setCurrentUser(memberObj);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(memberObj));
          return memberObj;
        }

        // 3. Fallback for new demo email
        if (cleanPass.length >= 6) {
          const newMember: AppUser = {
            uid: `user-${Date.now()}`,
            email: cleanEmail,
            displayName: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Ozone Shopper',
            role: 'member',
            membershipTier: 'Gold',
            memberSince: new Date().toISOString(),
            points: 500,
            favoriteStores: [],
          };
          setCurrentUser(newMember);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newMember));
          registeredUsers.push({ ...newMember, password: cleanPass });
          saveRegisteredUsers(registeredUsers);
          return newMember;
        }

        throw new Error('Invalid email or password. Password must be at least 6 characters.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<AppUser> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone?.trim();

    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        await updateProfile(cred.user, { displayName: cleanName });
        setFirebaseUser(cred.user);

        const newMember: AppUser = {
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: cleanName,
          phone: cleanPhone,
          role: 'member',
          membershipTier: 'Gold',
          memberSince: new Date().toISOString(),
          points: 500, // 500 Welcome Bonus Privilege Points!
          favoriteStores: [],
        };
        setCurrentUser(newMember);
        return newMember;
      } else {
        // Local offline demo mode
        const registeredUsers = getRegisteredUsers();
        const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }

        const newMember: AppUser = {
          uid: `user-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanName,
          phone: cleanPhone || '+91 98220 00000',
          role: 'member',
          membershipTier: 'Gold',
          memberSince: new Date().toISOString(),
          points: 500, // 500 Welcome Bonus Privilege Points!
          favoriteStores: [],
        };

        registeredUsers.push({ ...newMember, password: pass });
        saveRegisteredUsers(registeredUsers);

        setCurrentUser(newMember);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newMember));
        return newMember;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AppUser> => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        setFirebaseUser(cred.user);

        const userObj: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          displayName: cred.user.displayName || 'Google Member',
          avatarUrl: cred.user.photoURL || undefined,
          role: 'member',
          membershipTier: 'Gold',
          memberSince: cred.user.metadata.creationTime || new Date().toISOString(),
          points: 500,
          favoriteStores: [],
        };
        setCurrentUser(userObj);
        return userObj;
      } else {
        // Demo mode: open our custom Google-style popup window
        return new Promise<AppUser>((resolve, reject) => {
          const popupWidth = 500;
          const popupHeight = 620;
          const left = window.screenX + (window.outerWidth - popupWidth) / 2;
          const top = window.screenY + (window.outerHeight - popupHeight) / 2;

          const popup = window.open(
            '/auth/google-popup',
            'GoogleSignIn',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=0,scrollbars=1,status=0,resizable=0,location=0,menuBar=0`
          );

          if (!popup) {
            setLoading(false);
            reject(new Error('Popup was blocked. Please allow popups for this site and try again.'));
            return;
          }

          // Listen for the message posted back from the popup page
          const messageHandler = (event: MessageEvent) => {
            if (
              event.data &&
              event.data.type === 'GOOGLE_SIGNIN_SUCCESS' &&
              event.data.user
            ) {
              window.removeEventListener('message', messageHandler);
              const googleUser: AppUser = {
                ...event.data.user,
                membershipTier: event.data.user.membershipTier || 'Gold',
                points: event.data.user.points || 500,
                favoriteStores: event.data.user.favoriteStores || [],
              };
              setCurrentUser(googleUser);
              localStorage.setItem(USER_SESSION_KEY, JSON.stringify(googleUser));
              setLoading(false);
              resolve(googleUser);
            }
          };

          window.addEventListener('message', messageHandler);

          // Poll every 500ms to detect if user manually closed the popup
          const closedPoller = setInterval(() => {
            if (popup.closed) {
              clearInterval(closedPoller);
              window.removeEventListener('message', messageHandler);
              setLoading(false);
              reject(new Error('Google sign-in was cancelled.'));
            }
          }, 500);
        });
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const setSessionUser = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  };

  const updateProfileData = async (updates: Partial<AppUser>): Promise<AppUser> => {
    if (!currentUser) throw new Error('No user is currently signed in');

    const updated = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updated);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));

    // Update in registered users list if local
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.uid === currentUser.uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveRegisteredUsers(users);
    }

    return updated;
  };

  const toggleFavoriteStore = async (storeId: string) => {
    if (!currentUser) return;
    const currentFavs = currentUser.favoriteStores || [];
    const exists = currentFavs.includes(storeId);
    const updatedFavs = exists
      ? currentFavs.filter((id) => id !== storeId)
      : [...currentFavs, storeId];

    await updateProfileData({ favoriteStores: updatedFavs });
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfileData,
        toggleFavoriteStore,
        setSessionUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        isMember: currentUser?.role === 'member',
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

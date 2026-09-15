import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOutUser,
  saveUserStateToFirestore,
  fetchUserStateFromFirestore,
  subscribeToUserState,
} from '../services/firebase';
import { AppState } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  authError: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  syncToCloud: (state: AppState) => Promise<void>;
  loadFromCloud: () => Promise<AppState | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onCloudStateLoaded?: (cloudState: AppState) => void;
  getCurrentState?: () => AppState;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        if (!currentUser) {
          setSyncStatus('idle');
          setLastSyncedAt(null);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Auth state listener error:', err);
      setLoading(false);
    }
  }, []);

  // Handle Google / Gmail Login
  const handleLoginWithGoogle = useCallback(async (): Promise<FirebaseUser | null> => {
    setAuthError(null);
    setLoading(true);
    try {
      const loggedUser = await signInWithGoogle();
      setIsLoginModalOpen(false);
      return loggedUser;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logOutUser();
      setUser(null);
      setSyncStatus('idle');
      setLastSyncedAt(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed.';
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual or automatic state sync to Cloud
  const syncToCloud = useCallback(
    async (state: AppState) => {
      if (!auth.currentUser) return;
      setSyncStatus('syncing');
      try {
        await saveUserStateToFirestore(auth.currentUser.uid, state);
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Failed to sync to cloud:', err);
        setSyncStatus('error');
      }
    },
    []
  );

  // Manual state load from Cloud
  const loadFromCloud = useCallback(async (): Promise<AppState | null> => {
    if (!auth.currentUser) return null;
    setSyncStatus('syncing');
    try {
      const state = await fetchUserStateFromFirestore(auth.currentUser.uid);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      return state;
    } catch (err) {
      console.error('Failed to load cloud state:', err);
      setSyncStatus('error');
      return null;
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        syncStatus,
        lastSyncedAt,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithGoogle: handleLoginWithGoogle,
        logout: handleLogout,
        clearAuthError,
        syncToCloud,
        loadFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

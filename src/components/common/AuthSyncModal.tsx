import React, { useState } from 'react';
import { X, Cloud, AlertTriangle, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState } from '../../types';
import { 
  signInWithGoogle, 
  logOutUser, 
  AuthUser 
} from '../../services/firebase';
import { PRIMARY_ADMIN_EMAIL, isAuthorizedAdmin, getAccessDeniedMessage } from '../../services/authGuard';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  authUser: AuthUser | null;
  onSignIn: (user: AuthUser) => void;
  onSignOut: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({
  isOpen,
  onClose,
  currentState,
  authUser,
  onSignIn,
  onSignOut,
  onToast
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetAdmin = (currentState.business?.ownerEmail || currentState.business?.email || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle(targetAdmin);

      if (!isAuthorizedAdmin(user.email, targetAdmin)) {
        await logOutUser();
        throw new Error(getAccessDeniedMessage());
      }

      onSignIn(user);
      onToast('Signed in successfully as Administrator', 'success');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(msg);
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    setLoading(true);
    try {
      await logOutUser();
      onSignOut();
      onToast('Signed out successfully. Data is now local only.', 'info');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setError(msg);
      onToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col relative z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 id="auth-modal-title" className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-neutral-900 dark:text-white" />
                Cloud Backup & Sync
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs flex items-start gap-2.5 font-medium leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {authUser ? (
                <div className="space-y-4">
                  <div className="bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex items-center gap-3.5">
                    {authUser.photoURL ? (
                      <img src={authUser.photoURL} alt={authUser.displayName || 'User'} className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                        {(authUser.displayName || authUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {authUser.displayName || 'Authorized Administrator'}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        Admin Session Connected
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                      <p>Your library seats, students, and financial logs sync live to Firestore.</p>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                      <p>Restores instantly when logging in from any mobile or desktop device.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Signing Out...</span>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Sign Out & Disconnect
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-center space-y-1.5">
                    <div className="mx-auto w-12 h-12 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex items-center justify-center mb-2">
                      <Cloud className="w-6 h-6 text-neutral-900 dark:text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Live Cloud Sync</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Sign in with Google to protect your library records against device loss or browser cache clears.
                    </p>
                  </div>

                  <button
                    onClick={handleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xs"
                  >
                    {loading ? (
                      <span>Connecting Google Account...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign In with Google
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

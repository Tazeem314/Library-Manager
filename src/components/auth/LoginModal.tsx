import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  LogOut,
  AlertCircle,
  Loader2,
  RefreshCw,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginModal: React.FC = () => {
  const {
    user,
    loading,
    authError,
    syncStatus,
    lastSyncedAt,
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithGoogle,
    logout,
    clearAuthError,
  } = useAuth();

  if (!isLoginModalOpen) return null;

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <AnimatePresence>
      <div
        id="login-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        onClick={() => {
          clearAuthError();
          setIsLoginModalOpen(false);
        }}
      >
        <motion.div
          id="login-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight font-display">
                  {user ? 'Google Account & Cloud Sync' : 'Sign in with Gmail'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user ? 'Connected to Firebase & Firestore' : 'Google Identity & Cloud Persistence'}
                </p>
              </div>
            </div>
            <button
              id="close-login-modal-btn"
              type="button"
              onClick={() => {
                clearAuthError();
                setIsLoginModalOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* If Already Logged In */}
            {user ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google Profile'}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-xs object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName || 'Study Hall Admin'}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {user.email}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <Cloud className="w-3.5 h-3.5 text-blue-500" />
                      <span>
                        Sync Status:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                          {syncStatus}
                        </strong>
                      </span>
                      {lastSyncedAt && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          ({lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cloud Features Info */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Your study hall seats, students, plans, and payments are backed up to Cloud Firestore.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <Smartphone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Access your workspace from your phone, laptop, or tablet using this Gmail account.</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    id="login-modal-close-btn"
                    onClick={() => setIsLoginModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    id="sign-out-account-btn"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Not Logged In */
              <div className="space-y-5">
                <div className="text-center space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Connect your Gmail Account
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Sign in with your Google account to save your study hall data to Cloud Firestore and sync seamlessly across devices.
                  </p>
                </div>

                {/* Benefits List */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Real-time persistence in Cloud Firestore</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Private & secure access restricted to your Google account</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Switch effortlessly between mobile and desktop</span>
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold">Sign-in issue</div>
                      <div className="mt-0.5 leading-snug">{authError}</div>
                    </div>
                  </div>
                )}

                {/* Main Google Login Button */}
                <div className="space-y-2">
                  <button
                    type="button"
                    id="google-signin-action-btn"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-semibold text-xs border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Signing in with Google...</span>
                      </>
                    ) : (
                      <>
                        {/* Official Google 'G' Icon */}
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Continue with Google (Gmail)</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                    Uses official Firebase Google Authentication
                  </p>
                </div>

                {(() => {
                  try {
                    return window.self !== window.top;
                  } catch {
                    return true;
                  }
                })() && (
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between gap-2">
                    <span>Opening in a new tab provides the smoothest Google popup experience.</span>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline flex items-center gap-1 shrink-0 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <span>New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                  >
                    Continue without signing in (Local device only)
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

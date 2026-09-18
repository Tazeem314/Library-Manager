import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { signInWithGoogle, AuthUser, logOutUser } from '../../services/firebase';
import { PRIMARY_ADMIN_EMAIL } from '../../services/authGuard';

interface AdminAuthGateProps {
  businessName: string;
  allowedEmail?: string;
  onAuthenticated: (user: AuthUser) => void;
  unauthorizedUser: AuthUser | null;
  onSignOut: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  businessName,
  allowedEmail = PRIMARY_ADMIN_EMAIL,
  onAuthenticated,
  unauthorizedUser,
  onSignOut,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetAdminEmail = (allowedEmail || PRIMARY_ADMIN_EMAIL).trim().toLowerCase();

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle(targetAdminEmail);
      onAuthenticated(user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setError(null);
    setLoading(true);
    try {
      await logOutUser();
      onSignOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 sm:p-6 selection:bg-neutral-800 selection:text-white">
      {/* Background subtle radial ambient light */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Minimal Brand & Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-white mb-3.5 shadow-sm"
          >
            {unauthorizedUser ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 stroke-[1.75]" />
            ) : (
              <Lock className="w-5 h-5 text-neutral-300 stroke-[1.75]" />
            )}
          </motion.div>
          <h1 className="text-xl font-medium tracking-tight text-white">
            {businessName || 'Study Space'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-normal tracking-wide">
            {unauthorizedUser ? 'Access Authorization Required' : 'Admin Security & Management Workspace'}
          </p>
        </div>

        {/* Minimal Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 shadow-2xl space-y-5"
        >
          {unauthorizedUser ? (
            /* Explicit Unauthorized Warning Screen (Zero Email Disclosure) */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Access Denied: Not Authorized</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-[12px]">
                  You are signed in with an account that is not authorized as an administrator.
                </p>
                <p className="text-neutral-400 leading-relaxed text-[12px]">
                  You do not have permission to access the study hall management portal, student records, seat allocations, or financial data in this app.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-neutral-300 font-medium">Single-Owner Admin Protection</div>
                  <div className="text-neutral-400 mt-0.5">Please sign in with the registered administrator account.</div>
                </div>
              </div>

              <motion.button
                id="switch-admin-account-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSwitchAccount}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>Sign Out & Switch to Admin Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            /* Admin Sign In Interface */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/90 text-neutral-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-neutral-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Admin Verification</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Only the registered study space administrator account has permission to access this management dashboard.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2 overflow-hidden"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-[11px]">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Minimalist Google Sign In Button */}
              <motion.button
                id="admin-google-signin-btn"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                ) : (
                  <>
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
                    <span>Sign In with Admin Account</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Minimal Footer Notice */}
        <div className="text-center mt-5">
          <p className="text-[11px] text-neutral-500 font-normal">
            Authorized Administrator Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { Cloud, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { safeLocalStorage } from '../../utils/safeStorage';

export const CloudSyncBanner: React.FC = () => {
  const { user, setIsLoginModalOpen } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    return safeLocalStorage.getItem('studyspace_cloud_banner_dismissed') === 'true';
  });

  if (user || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    safeLocalStorage.setItem('studyspace_cloud_banner_dismissed', 'true');
  };

  return (
    <div
      id="cloud-sync-invite-banner"
      className="mb-5 p-3.5 sm:p-4 rounded-xl bg-blue-950/40 dark:bg-blue-950/30 text-slate-900 dark:text-white shadow-2xs border border-blue-200/80 dark:border-blue-900/50 relative overflow-hidden"
    >
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span className="text-slate-900 dark:text-white">Cloud Firestore Backup</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60">
                Google Cloud
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl line-clamp-1 sm:line-clamp-none">
              Sign in with your Gmail account to back up student records, seat bookings, and fee dues safely.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="banner-signin-gmail-btn"
            onClick={() => setIsLoginModalOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            {/* Google Icon */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
            <span>Gmail Login</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800/50 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

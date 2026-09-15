import React from 'react';
import { Cloud, CheckCircle2, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthButtonProps {
  variant?: 'header' | 'sidebar';
}

export const AuthButton: React.FC<AuthButtonProps> = ({ variant = 'header' }) => {
  const { user, syncStatus, setIsLoginModalOpen, logout } = useAuth();

  if (variant === 'sidebar') {
    if (user) {
      return (
        <div
          id="sidebar-user-profile-section"
          className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60"
        >
          <div className="flex items-center gap-2.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google Profile'}
                className="w-8 h-8 rounded-full border border-slate-600 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{user.displayName || 'Admin'}</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 truncate font-mono">
                {user.email}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1 text-slate-300">
              <Cloud className="w-3 h-3 text-blue-400" />
              <span className="capitalize">{syncStatus}</span>
            </div>
            <button
              type="button"
              id="sidebar-signout-btn"
              onClick={() => logout()}
              className="px-2 py-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-[10px] font-semibold transition-colors flex items-center gap-1"
              title="Sign out of Google"
            >
              <LogOut className="w-2.5 h-2.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        id="sidebar-login-btn"
        onClick={() => setIsLoginModalOpen(true)}
        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs group"
      >
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
        <span>Sign in with Gmail</span>
      </button>
    );
  }

  // Header Variant
  if (user) {
    return (
      <button
        type="button"
        id="header-user-profile-btn"
        onClick={() => setIsLoginModalOpen(true)}
        className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs shrink-0"
        title={`Signed in as ${user.email}`}
        aria-label="User profile and sync status"
      >
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Google Profile'}
              className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="sm:hidden absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
            {user.displayName?.split(' ')[0] || 'Admin'}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-none flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Cloud Synced
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      id="header-google-signin-btn"
      onClick={() => setIsLoginModalOpen(true)}
      className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs group shrink-0"
      title="Sign in with your Gmail account"
      aria-label="Sign in with Gmail"
    >
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
      <span className="hidden sm:inline">Gmail Login</span>
      <span className="sm:hidden text-[11px]">Login</span>
    </button>
  );
};

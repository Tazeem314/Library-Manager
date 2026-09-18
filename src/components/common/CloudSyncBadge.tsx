import React from 'react';
import { Cloud, ShieldCheck, RefreshCw, Smartphone, ArrowRight } from 'lucide-react';
import { AuthUser } from '../../services/firebase';

interface CloudSyncBadgeProps {
  authUser: AuthUser | null;
  isSyncing?: boolean;
  onClick: () => void;
  variant?: 'header' | 'sidebar' | 'banner';
}

export const CloudSyncBadge: React.FC<CloudSyncBadgeProps> = ({
  authUser,
  isSyncing = false,
  onClick,
  variant = 'header',
}) => {
  if (variant === 'header') {
    if (authUser) {
      return (
        <button
          type="button"
          id="header-cloud-sync-btn"
          onClick={onClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold transition-colors shadow-2xs shrink-0"
          title="Synced to Admin Cloud Account"
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 animate-spin" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-900 dark:bg-white"></span>
            </span>
          )}
          <span className="hidden sm:inline font-medium text-[11px]">
            Synced
          </span>
          <span className="sm:hidden font-medium text-[11px]">Synced</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        id="header-cloud-sync-btn"
        onClick={onClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors shadow-2xs shrink-0"
        title="Sign in to sync your data"
      >
        <Cloud className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
        <span className="hidden sm:inline">Sign In to Sync</span>
        <span className="sm:hidden">Sync</span>
      </button>
    );
  }

  if (variant === 'sidebar') {
    if (authUser) {
      return (
        <div
          onClick={onClick}
          className="cursor-pointer p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
              <span>Cloud Synced</span>
            </div>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-neutral-400 animate-spin" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="truncate">Admin Account</span>
            <span className="text-[10px] text-neutral-300 group-hover:underline">Manage</span>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-medium text-neutral-200 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-neutral-400" />
          <span>Sign In to Sync</span>
        </div>
        <span className="text-[10px] text-neutral-400 group-hover:text-white transition-colors flex items-center gap-0.5">
          Connect <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </button>
    );
  }

  // Dashboard Banner variant
  if (authUser) {
    return (
      <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
              <span>Backed up to Google Cloud</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              Changes save automatically across your authorized devices.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-200 text-[11px] font-semibold border border-neutral-200 dark:border-neutral-700 transition-colors"
        >
          Manage
        </button>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Sync across your phone & laptop
          </h4>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Sign in with Google to securely backup your data and sync it automatically.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold shadow-xs transition-colors"
      >
        <Cloud className="w-3.5 h-3.5" />
        <span>Sign in with Google</span>
      </button>
    </div>
  );
};

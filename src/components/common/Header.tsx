import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Business } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { AuthButton } from '../auth/AuthButton';

interface HeaderProps {
  business: Business;
  onResetData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ business }) => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header id="main-header" className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-xs border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-8 py-2.5 sm:py-3.5 sticky top-0 z-30 transition-colors will-change-transform">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Library Name, Location & Live Status */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate font-display">
              {business.name}
            </h1>
            {/* Mobile Compact Live Indicator */}
            <span className="inline-flex sm:hidden items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Open
            </span>
            {business.city && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700 shrink-0">
                <MapPin className="w-3 h-3 text-slate-400" />
                {business.city}
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5 truncate">
            <span>Owner: <span className="text-slate-700 dark:text-slate-300 font-semibold">{business.ownerName}</span></span>
            {business.city && (
              <span className="sm:hidden text-slate-400 dark:text-slate-500">• {business.city}</span>
            )}
          </div>
        </div>

        {/* Right: Auth, Theme Toggle, Install Button, Date & Operational Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <PWAInstallButton variant="header" />

          <ThemeToggle variant="header" />

          <AuthButton variant="header" />

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{today}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Open Now</span>
          </div>
        </div>
      </div>
    </header>
  );
};

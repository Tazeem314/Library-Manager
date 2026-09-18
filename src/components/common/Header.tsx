import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar } from 'lucide-react';
import { Business } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { AuthUser } from '../../services/firebase';

interface HeaderProps {
  business: Business;
  onResetData?: () => void;
  authUser?: AuthUser | null;
  isSyncing?: boolean;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
}) => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, duration: 0.3 }}
      id="main-header"
      className="bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xs border-b border-neutral-200 dark:border-neutral-800 px-3.5 sm:px-8 py-2.5 sm:py-3.5 sticky top-0 z-30 transition-colors will-change-transform"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Library Name & Owner info */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white tracking-tight truncate font-display">
              {business.name}
            </h1>
            {business.city && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 shrink-0">
                <MapPin className="w-3 h-3 text-neutral-400" />
                {business.city}
              </span>
            )}
          </div>
          <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal flex items-center gap-1.5 truncate">
            <span>Owner: <span className="text-neutral-800 dark:text-neutral-200 font-medium">{business.ownerName}</span></span>
            {business.city && (
              <span className="sm:hidden text-neutral-400 dark:text-neutral-500">• {business.city}</span>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Install Button, Date */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <PWAInstallButton variant="header" />

          <ThemeToggle variant="header" />

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{today}</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  variant?: 'header' | 'settings' | 'sidebar';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'header', onThemeChange }) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggleTheme();
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  const handleSelect = (mode: 'light' | 'dark') => {
    setTheme(mode);
    if (onThemeChange) {
      onThemeChange(mode);
    }
  };

  if (variant === 'settings') {
    return (
      <div
        id="settings-theme-switcher"
        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Display Mode
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Current: <strong className="capitalize text-slate-800 dark:text-slate-200">{theme} Mode</strong>
            </div>
          </div>
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            id="theme-select-light"
            onClick={() => handleSelect('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isDark
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            id="theme-select-dark"
            onClick={() => handleSelect('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isDark
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.button
        id="sidebar-theme-toggle-btn"
        onClick={handleToggle}
        whileTap={{ scale: 0.96 }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-300">
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </div>
          <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {theme}
        </span>
      </motion.button>
    );
  }

  // Header compact button
  return (
    <motion.button
      id="header-theme-toggle-btn"
      onClick={handleToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 40, opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 stroke-[2]" />
        )}
      </motion.div>
    </motion.button>
  );
};

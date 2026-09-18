import React from 'react';
import { Sun, Moon } from 'lucide-react';
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
        className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center justify-center font-bold">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              Display Mode
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Current: <strong className="capitalize text-neutral-800 dark:text-neutral-200">{theme} Mode</strong>
            </div>
          </div>
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <button
            id="theme-select-light"
            onClick={() => handleSelect('light')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isDark
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
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
                ? 'bg-neutral-900 dark:bg-neutral-700 text-white shadow-2xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
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
      <button
        type="button"
        id="sidebar-theme-toggle-btn"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-850 active:scale-[0.98] transition-all"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 flex items-center justify-center text-neutral-400">
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </div>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
          {theme}
        </span>
      </button>
    );
  }

  // Header compact button
  return (
    <button
      type="button"
      id="header-theme-toggle-btn"
      onClick={handleToggle}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 shadow-2xs transition-all"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="flex items-center justify-center transition-transform duration-200">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 stroke-[2]" />
        ) : (
          <Moon className="w-3.5 h-3.5 stroke-[2]" />
        )}
      </span>
    </button>
  );
};

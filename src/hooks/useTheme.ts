import { useState, useEffect, useCallback } from 'react';
import { safeLocalStorage } from '../utils/safeStorage';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'studyspace_theme';

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = safeLocalStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === 'dark') return 'dark';
    if (stored === 'light') return 'light';
    // If no preference stored or 'system', check OS preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (err) {
    console.error('Error reading theme from safeLocalStorage', err);
  }
  return 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => getInitialTheme());

  const applyTheme = useCallback((mode: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    if (mode === 'dark') {
      root.classList.add('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#090d15');
    } else {
      root.classList.remove('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#f8fafc');
    }
  }, []);

  // Sync with DOM on mount and state change
  useEffect(() => {
    applyTheme(theme);
    safeLocalStorage.setItem(STORAGE_KEY, theme);
  }, [theme, applyTheme]);

  // Listen to system preference changes if user hasn't explicitly overridden (or can respond to changes)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = safeLocalStorage.getItem(STORAGE_KEY);
      // Only auto-update if no explicit user preference in localStorage
      if (!stored) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
}

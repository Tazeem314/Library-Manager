import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getInitialTheme } from '../../hooks/useTheme';

interface SplashScreenProps {
  onComplete?: () => void;
  forceTheme?: 'light' | 'dark';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, forceTheme }) => {
  const [isVisible, setIsVisible] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Sync theme with admin preference
  const currentTheme = forceTheme || getInitialTheme();
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    // Dismiss automatically after a crisp, professional 650ms loading duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      onCompleteRef.current?.();
    }, 650);

    return () => clearTimeout(timer);
  }, []); // Run once on mount

  const handleDismiss = () => {
    setIsVisible(false);
    onCompleteRef.current?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="studyspace-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.3, ease: 'easeInOut' } }}
          onClick={handleDismiss}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-colors duration-200 ${
            isDark ? 'bg-[#080c14] text-white' : 'bg-[#f8fafc] text-slate-900'
          }`}
          title="Click to enter"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className={`absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
              isDark ? 'bg-blue-600/10' : 'bg-blue-500/8'
            }`}
          />

          <div className="relative flex flex-col items-center max-w-xs w-full text-center z-10">
            {/* Minimalist Modern Logo Emblem */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-5"
            >
              {/* Soft Pulsing Backdrop Halo */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  opacity: isDark ? [0.35, 0.65, 0.35] : [0.2, 0.45, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute -inset-2 rounded-2xl blur-md ${
                  isDark ? 'bg-blue-500/25' : 'bg-blue-600/15'
                }`}
              />

              {/* Icon Container */}
              <div
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border transition-colors ${
                  isDark
                    ? 'bg-[#111722] border-slate-800/80 shadow-black/40'
                    : 'bg-white border-slate-200/90 shadow-slate-200/60'
                }`}
              >
                {/* Modern Geometric Study & Desk Emblem */}
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  {/* Desk Surface */}
                  <rect
                    x="5"
                    y="19"
                    width="22"
                    height="2.5"
                    rx="1.25"
                    className={isDark ? 'fill-blue-400' : 'fill-blue-600'}
                  />
                  {/* Legs */}
                  <rect
                    x="7"
                    y="22"
                    width="2"
                    height="5"
                    rx="1"
                    className={isDark ? 'fill-slate-600' : 'fill-slate-400'}
                  />
                  <rect
                    x="23"
                    y="22"
                    width="2"
                    height="5"
                    rx="1"
                    className={isDark ? 'fill-slate-600' : 'fill-slate-400'}
                  />
                  {/* Minimal Open Book */}
                  <path
                    d="M16 16.5C14 15 11 15 9 16V10.5C11 9.5 14 9.5 16 11V16.5Z"
                    className={isDark ? 'fill-slate-200' : 'fill-slate-800'}
                  />
                  <path
                    d="M16 16.5C18 15 21 15 23 16V10.5C21 9.5 18 9.5 16 11V16.5Z"
                    className={isDark ? 'fill-slate-300' : 'fill-slate-600'}
                  />
                  {/* Modern Light Beam Focus Dot */}
                  <circle
                    cx="16"
                    cy="6.5"
                    r="1.75"
                    className={isDark ? 'fill-blue-400' : 'fill-blue-500'}
                  />
                </svg>
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="space-y-1"
            >
              <h1
                className={`text-2xl font-bold font-display tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                StudySpace
              </h1>
              <p
                className={`text-[11px] font-medium tracking-wider uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Workspace Management
              </p>
            </motion.div>

            {/* Modern, Sleek Indeterminate Progress Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-36 mt-7"
            >
              <div
                className={`h-[2.5px] w-full rounded-full overflow-hidden relative ${
                  isDark ? 'bg-slate-800/80' : 'bg-slate-200'
                }`}
              >
                <motion.div
                  className="h-full bg-blue-500 rounded-full absolute"
                  animate={{
                    left: ['-40%', '100%'],
                    width: ['30%', '50%'],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

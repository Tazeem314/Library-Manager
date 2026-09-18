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

  const currentTheme = forceTheme || getInitialTheme();
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onCompleteRef.current?.();
    }, 40);

    return () => clearTimeout(timer);
  }, []);

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
          exit={{ opacity: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
          onClick={handleDismiss}
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 select-none cursor-pointer ${
            isDark ? 'bg-black text-white' : 'bg-[#fafafa] text-neutral-900'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white'
                  : 'bg-white border-neutral-200 text-black shadow-2xs'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-current" />
            </motion.div>
            <span className="text-xs font-medium tracking-widest uppercase opacity-60">
              StudySpace
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

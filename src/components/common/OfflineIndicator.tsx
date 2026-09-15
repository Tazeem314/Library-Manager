import React from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          id="offline-status-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-semibold shadow-lg backdrop-blur-xs max-w-sm"
        >
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <div className="leading-tight">
            <span>Offline Mode Active</span>
            <p className="text-[10px] font-normal text-amber-100">
              All records are stored locally on your device.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If already running as an installed PWA, hide from header/sidebar
  if (isInstalled && variant !== 'settings') {
    return null;
  }

  if (isInstalled && variant === 'settings') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Application installed on this device</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 3000);
      }
    } else {
      // Show guided instructions for iOS or browsers where prompt event hasn't fired yet
      setShowGuideModal(true);
    }
  };

  const modalJSX = (
    <AnimatePresence>
      {showGuideModal && (
        <div
          id="pwa-install-guide-portal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setShowGuideModal(false)}
          />

          {/* Dialog Container */}
          <motion.div
            id="pwa-install-guide-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto z-10"
          >
            {/* Modal Header */}
            <div className="p-4 bg-neutral-900 dark:bg-black text-white flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display text-white">
                    Download & Install App
                  </h3>
                  <p className="text-[11px] text-neutral-300">
                    Works offline, fast loading, 1-tap home screen access
                  </p>
                </div>
              </div>
              <button
                id="close-pwa-guide-modal"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {isIOS ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    How to install on iPhone / iPad (Safari):
                  </div>
                  <ol className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        1
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Tap the <strong className="text-neutral-900 dark:text-white">Share</strong> icon (
                        <Share2 className="inline w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mx-0.5 align-text-bottom" />
                        ) at the bottom toolbar of Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        2
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Scroll down the share sheet and tap{' '}
                        <strong className="text-neutral-900 dark:text-white">Add to Home Screen</strong> (
                        <PlusSquare className="inline w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mx-0.5 align-text-bottom" />
                        ).
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        3
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Tap <strong className="text-neutral-900 dark:text-white">Add</strong> at top right. The StudySpace app icon will now appear on your home screen!
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    How to install on Android (Chrome) or Laptop / Desktop:
                  </div>
                  <ol className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        1
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Tap or click the <strong className="text-neutral-900 dark:text-white">menu button (⋮)</strong> at the top right of your browser.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        2
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Select <strong className="text-neutral-900 dark:text-white">"Install app"</strong> or <strong className="text-neutral-900 dark:text-white">"Add to Home screen"</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        3
                      </span>
                      <span className="pt-0.5 leading-relaxed">
                        Tap <strong className="text-neutral-900 dark:text-white">Install</strong> to confirm. The app will install directly with full offline support.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                <button
                  id="confirm-close-pwa-guide-btn"
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Understood & Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          id="pwa-install-header-btn"
          onClick={handleInstallClick}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 active:scale-95 font-semibold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
          title="Download StudySpace App"
          aria-label="Install App"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          id="pwa-install-sidebar-btn"
          onClick={handleInstallClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 active:scale-[0.98] text-blue-300 border border-blue-500/30 transition-all"
        >
          <Download className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="text-left leading-tight truncate">
            <div>Install Mobile App</div>
            <div className="text-[10px] text-blue-400/80 font-normal">Add to home screen</div>
          </div>
        </button>
      )}

      {variant === 'settings' && (
        <button
          id="pwa-install-settings-btn"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">Download Mobile App</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Install StudySpace on your phone's home screen for fast 1-tap access
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs">
            Install
          </div>
        </button>
      )}

      {mounted && typeof document !== 'undefined' && createPortal(modalJSX, document.body)}
    </>
  );
};

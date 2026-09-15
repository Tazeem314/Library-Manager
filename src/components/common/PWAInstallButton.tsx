import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

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

  return (
    <>
      {variant === 'header' && (
        <motion.button
          id="pwa-install-header-btn"
          onClick={handleInstallClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.94 }}
          className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          title="Download StudySpace App to your phone or desktop"
          aria-label="Install App"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </motion.button>
      )}

      {variant === 'sidebar' && (
        <motion.button
          id="pwa-install-sidebar-btn"
          onClick={handleInstallClick}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
        >
          <Download className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="text-left leading-tight truncate">
            <div>Install Mobile App</div>
            <div className="text-[10px] text-blue-400/80 font-normal">Add to home screen</div>
          </div>
        </motion.button>
      )}

      {variant === 'settings' && (
        <button
          id="pwa-install-settings-btn"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Download Mobile App</div>
              <div className="text-xs text-slate-500">
                Install StudySpace on your phone's home screen for fast 1-tap access
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs">
            Install
          </div>
        </button>
      )}

      {/* Guided Install Modal for Mobile Browsers & iOS */}
      <AnimatePresence>
        {showGuideModal && (
          <div
            id="pwa-install-guide-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowGuideModal(false)}
            />

            <motion.div
              id="pwa-install-guide-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6 z-10"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-white">
                      Install StudySpace App
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Works offline, launches like a native app
                    </p>
                  </div>
                </div>
                <button
                  id="close-pwa-guide-modal"
                  onClick={() => setShowGuideModal(false)}
                  className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {isIOS ? (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-700">
                      How to install on iPhone / iPad (Safari):
                    </div>
                    <ol className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          1
                        </span>
                        <span>
                          Tap the <strong className="text-slate-900">Share</strong> button (
                          <Share2 className="inline w-3.5 h-3.5 text-blue-600 mx-0.5" />
                          icon) at the bottom toolbar of Safari.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          2
                        </span>
                        <span>
                          Scroll down the share options and tap{' '}
                          <strong className="text-slate-900">Add to Home Screen</strong> (
                          <PlusSquare className="inline w-3.5 h-3.5 text-blue-600 mx-0.5" />
                          ).
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          3
                        </span>
                        <span>
                          Tap <strong className="text-slate-900">Add</strong> at the top right. StudySpace icon will now appear on your home screen!
                        </span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-700">
                      How to install on Android (Chrome) or Desktop:
                    </div>
                    <ol className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          1
                        </span>
                        <span>
                          Tap the <strong className="text-slate-900">three dots menu (⋮)</strong> in Chrome at the top right.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          2
                        </span>
                        <span>
                          Select <strong className="text-slate-900">"Install app"</strong> or <strong className="text-slate-900">"Add to Home screen"</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          3
                        </span>
                        <span>
                          Confirm by tapping <strong className="text-slate-900">Install</strong>. The app will be downloaded directly to your phone.
                        </span>
                      </li>
                    </ol>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    id="confirm-close-pwa-guide-btn"
                    onClick={() => setShowGuideModal(false)}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

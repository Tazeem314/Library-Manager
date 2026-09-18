import React, { useState, useRef } from 'react';
import {
  Layers,
  Clock,
  Building2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Download,
  Upload,
  Database,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { AppState, MoreSubView, Business, Shift, MembershipPlan, TabType } from '../../types';
import { MembershipPlansView } from './MembershipPlansView';
import { ShiftsView } from './ShiftsView';
import { BusinessProfileView } from './BusinessProfileView';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { ThemeToggle } from '../common/ThemeToggle';
import { exportAppStateToJson, validateAndRestoreState } from '../../services/storage';
import { AuthUser } from '../../services/firebase';

interface MoreViewProps {
  state: AppState;
  subView: MoreSubView;
  onSubViewChange: (view: MoreSubView) => void;
  onNavigateTab?: (tab: TabType) => void;
  onAddPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  onUpdatePlan: (plan: MembershipPlan) => void;
  onTogglePlanActive: (planId: string) => void;
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  onUpdateShift: (shift: Shift) => void;
  onToggleShiftActive: (shiftId: string) => void;
  onUpdateBusiness: (business: Business) => void;
  onResetCleanData: () => void;
  onLoadSampleData?: () => void;
  onRestoreState?: (restoredState: AppState) => void;
  onReplaySplash?: () => void;
  authUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  state,
  subView,
  onSubViewChange,
  onNavigateTab,
  onAddPlan,
  onUpdatePlan,
  onTogglePlanActive,
  onAddShift,
  onUpdateShift,
  onToggleShiftActive,
  onUpdateBusiness,
  onResetCleanData,
  onLoadSampleData,
  onRestoreState,
  onReplaySplash,
  authUser = null,
  onOpenAuthModal,
}) => {
  const [confirmResetClean, setConfirmResetClean] = useState(false);
  const [confirmLoadSample, setConfirmLoadSample] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const menuItems = [
    {
      id: 'plans' as MoreSubView,
      title: 'Fee Plans',
      description: 'Monthly, 3 months, or full fee rates',
      icon: Layers,
      color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60',
    },
    {
      id: 'shifts' as MoreSubView,
      title: 'Shift Timings',
      description: 'Morning, Evening, Night batch hours',
      icon: Clock,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/60',
    },
    {
      id: 'business' as MoreSubView,
      title: 'Library Details',
      description: 'Library name, owner, phone & city',
      icon: Building2,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/60',
    },
  ];

  // If subView is 'menu' (default for mobile), show settings cards
  if (subView === 'menu') {
    return (
      <div id="more-menu-view" className="space-y-5 pb-20 md:pb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your display mode, fee plans, shift timings, and library details
          </p>
        </div>

        {/* Display Mode (Light / Dark) */}
        <div id="settings-appearance-section" className="space-y-2">
          <ThemeToggle variant="settings" />

          {onReplaySplash && (
            <button
              id="replay-splash-animation-btn"
              onClick={onReplaySplash}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Replay Opening Logo Animation
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Preview the brand splash screen in current mode
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Play
              </span>
            </button>
          )}
        </div>

        {onNavigateTab && (
          <button
            id="more-menu-analytics"
            onClick={() => onNavigateTab('analytics')}
            className="w-full p-4 rounded-2xl bg-linear-to-r from-slate-900 to-blue-950 text-white shadow-xs hover:shadow-md transition-all flex items-center justify-between text-left group border border-slate-800"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight flex items-center gap-2 font-display">
                  <span>Analytics & Profit / Loss</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 text-[10px] font-bold">
                    Full Report
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  View daily, monthly, yearly collections, expenses & net profit
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        )}

        <div className="space-y-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`more-menu-${item.id}`}
                onClick={() => onSubViewChange(item.id)}
                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight font-display">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Mobile App Download Card */}
        <div id="settings-pwa-install-card">
          <PWAInstallButton variant="settings" />
        </div>

        {/* Google Cloud Sync Card */}
        <div className="p-4.5 rounded-2xl bg-linear-to-br from-blue-50/70 via-slate-50 to-emerald-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20 border border-blue-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Google Cloud Sync</span>
            </div>
            {authUser ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-3 h-3" />
                <span>Connected ({authUser.email})</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Not Connected
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {authUser
              ? `Your library data is protected and automatically synced with your Google account (${authUser.email}). Sign in with Google on any phone or laptop to access this library.`
              : 'Safely sync your library across multiple phones, laptops, and staff devices by signing in with your Google account.'}
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{authUser ? 'Manage Google Account Sync' : 'Sign in to Sync with Google'}</span>
            </button>
          </div>
        </div>

        {/* Data Management & Backup Section */}
        <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Backup & Data Management</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Download an offline backup copy of all your students, seat allocations, fees, and expenses, or restore a previous backup file at any time.
          </p>

          {backupNotice && (
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-200 text-xs flex items-center justify-between">
              <span>{backupNotice}</span>
              <button
                type="button"
                onClick={() => setBackupNotice(null)}
                className="text-xs font-bold underline hover:opacity-80 ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Hidden File Input for Backup Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const content = event.target?.result as string;
                  const parsed = JSON.parse(content);
                  const restored = validateAndRestoreState(parsed);
                  if (onRestoreState) {
                    onRestoreState(restored);
                  }
                  setBackupNotice(`Successfully restored ${restored.students.length} students and ${restored.seats.length} seats from backup.`);
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : 'Invalid backup file.';
                  setBackupNotice(`Error restoring backup: ${msg}`);
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              id="export-backup-btn"
              type="button"
              onClick={() => {
                try {
                  exportAppStateToJson(state);
                  setBackupNotice('Backup downloaded successfully to your device!');
                } catch (err) {
                  setBackupNotice('Failed to create backup download.');
                }
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Download Backup (JSON)</span>
            </button>

            <button
              id="import-backup-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Restore from Backup</span>
            </button>

            <button
              id="reset-clean-data-btn"
              onClick={() => setConfirmResetClean(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Reset (Clean Slate)</span>
            </button>

            {onLoadSampleData && (
              <button
                id="load-sample-demo-btn"
                onClick={() => setConfirmLoadSample(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Demo Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean Reset Confirmation Dialog */}
        <ConfirmDialog
          id="confirm-reset-clean-dialog"
          isOpen={confirmResetClean}
          title="Reset All Data to Fresh Start?"
          message="This will clear all students, bookings, fee payments, and expenses, setting all 100 seats back to available so you can start completely from scratch. This action cannot be undone."
          confirmLabel="Yes, Reset Everything"
          isDestructive={true}
          onConfirm={() => {
            setConfirmResetClean(false);
            onResetCleanData();
          }}
          onCancel={() => setConfirmResetClean(false)}
        />

        {/* Load Sample Demo Confirmation Dialog */}
        <ConfirmDialog
          id="confirm-load-sample-dialog"
          isOpen={confirmLoadSample}
          title="Load Sample Demo Data?"
          message="This will load 67 sample student records, realistic seat allocations, payments, and sample expenses for testing."
          confirmLabel="Load Demo Data"
          isDestructive={false}
          onConfirm={() => {
            setConfirmLoadSample(false);
            if (onLoadSampleData) {
              onLoadSampleData();
            }
          }}
          onCancel={() => setConfirmLoadSample(false)}
        />
      </div>
    );
  }

  // Render Sub-view with back button
  return (
    <div id="more-subview-container" className="space-y-4 pb-20 md:pb-8">
      {/* Mobile Back Button */}
      <button
        id="more-back-to-menu-btn"
        onClick={() => onSubViewChange('menu')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Settings</span>
      </button>

      {subView === 'plans' && (
        <MembershipPlansView
          plans={state.plans}
          onAddPlan={onAddPlan}
          onUpdatePlan={onUpdatePlan}
          onTogglePlanActive={onTogglePlanActive}
        />
      )}

      {subView === 'shifts' && (
        <ShiftsView
          shifts={state.shifts}
          onAddShift={onAddShift}
          onUpdateShift={onUpdateShift}
          onToggleShiftActive={onToggleShiftActive}
        />
      )}

      {subView === 'business' && (
        <BusinessProfileView
          business={state.business}
          onUpdateBusiness={onUpdateBusiness}
        />
      )}
    </div>
  );
};

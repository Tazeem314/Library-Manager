import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Armchair,
  Users,
  CreditCard,
  BarChart3,
  Layers,
  Clock,
  Building2,
} from 'lucide-react';
import { TabType, MoreSubView, Business } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { CloudSyncBadge } from './CloudSyncBadge';
import { AuthUser } from '../../services/firebase';

interface SidebarProps {
  business: Business;
  activeTab: TabType;
  moreSubView: MoreSubView;
  onTabChange: (tab: TabType) => void;
  onMoreSubViewChange: (view: MoreSubView) => void;
  authUser?: AuthUser | null;
  isSyncing?: boolean;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  business,
  activeTab,
  moreSubView,
  onTabChange,
  onMoreSubViewChange,
  authUser = null,
  isSyncing = false,
  onOpenAuthModal,
}) => {
  const mainNav = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'seats' as TabType, label: 'Seats', icon: Armchair },
    { id: 'students' as TabType, label: 'Students', icon: Users },
    { id: 'payments' as TabType, label: 'Payments', icon: CreditCard },
    { id: 'analytics' as TabType, label: 'Analytics & P&L', icon: BarChart3 },
  ];

  const moreNav = [
    { id: 'plans' as MoreSubView, label: 'Fee Plans', icon: Layers },
    { id: 'shifts' as MoreSubView, label: 'Shift Timings', icon: Clock },
    { id: 'business' as MoreSubView, label: 'Library Details', icon: Building2 },
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300, duration: 0.3 }}
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-60 bg-black dark:bg-[#09090b] text-white border-r border-neutral-800 shrink-0 h-screen sticky top-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-neutral-800/90 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
          <Armchair className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white tracking-tight leading-tight">
            StudySpace
          </div>
          <div className="text-[11px] text-neutral-400 font-normal truncate">
            {business.name || 'Library Suite'}
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 scrollbar-thin">
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
            Menu
          </div>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.2]' : 'text-neutral-400 stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* More / Settings Section */}
        <div>
          <div className="px-2.5 mb-1.5 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
            Settings
          </div>
          <nav className="space-y-0.5">
            {moreNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === 'more' && moreSubView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`sidebar-more-${item.id}`}
                  onClick={() => {
                    onTabChange('more');
                    onMoreSubViewChange(item.id);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.2]' : 'text-neutral-400 stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Mode Switcher */}
        <div className="pt-1">
          <ThemeToggle variant="sidebar" />
        </div>

        {/* PWA Mobile App Download Prompt */}
        <div className="pt-1">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>

      {/* Cloud Sync & Hall Context Footer */}
      <div className="p-3 border-t border-neutral-800/90 bg-neutral-950/80 space-y-2">
        {onOpenAuthModal && (
          <CloudSyncBadge
            authUser={authUser}
            isSyncing={isSyncing}
            onClick={onOpenAuthModal}
            variant="sidebar"
          />
        )}

        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <div className="w-6 h-6 rounded-md bg-neutral-800 flex items-center justify-center text-neutral-200 text-xs font-semibold uppercase shrink-0 border border-neutral-700">
            {business.ownerName ? business.ownerName.charAt(0) : 'O'}
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="text-xs font-medium text-neutral-200 truncate">
              {business.ownerName || 'Owner'}
            </div>
            <div className="text-[10px] text-neutral-400 truncate">
              {business.email || 'Admin'}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

import React from 'react';
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
import { motion } from 'motion/react';
import { TabType, MoreSubView, Business } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { AuthButton } from '../auth/AuthButton';

interface SidebarProps {
  business: Business;
  activeTab: TabType;
  moreSubView: MoreSubView;
  onTabChange: (tab: TabType) => void;
  onMoreSubViewChange: (view: MoreSubView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  business,
  activeTab,
  moreSubView,
  onTabChange,
  onMoreSubViewChange,
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
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
          <Armchair className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white tracking-tight font-display leading-tight">
            StudySpace
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            Management Suite
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Library Menu
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* More / Settings Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Library Settings
          </div>
          <nav className="space-y-1">
            {moreNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === 'more' && moreSubView === item.id;
              return (
                <motion.button
                  key={item.id}
                  id={`sidebar-more-${item.id}`}
                  onClick={() => {
                    onTabChange('more');
                    onMoreSubViewChange(item.id);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Theme Mode Switcher */}
        <div className="pt-2">
          <ThemeToggle variant="sidebar" />
        </div>

        {/* PWA Mobile App Download Prompt */}
        <div className="pt-1">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>

      {/* Hall Context & Google Account Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/50 space-y-2.5">
        <AuthButton variant="sidebar" />

        <div className="flex items-center gap-2.5 px-1 pt-1">
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold uppercase shrink-0">
            {business.ownerName.charAt(0)}
          </div>
          <div className="overflow-hidden min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {business.ownerName}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {business.name}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

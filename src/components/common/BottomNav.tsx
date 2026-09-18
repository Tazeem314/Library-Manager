import React from 'react';
import { LayoutDashboard, Armchair, Users, CreditCard, BarChart3, MoreHorizontal } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
    { id: 'seats' as TabType, label: 'Seats', icon: Armchair },
    { id: 'students' as TabType, label: 'Students', icon: Users },
    { id: 'payments' as TabType, label: 'Fees', icon: CreditCard },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'more' as TabType, label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)] px-1 py-1.5 pb-safe transition-colors"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-0.5 px-1 rounded-xl transition-all duration-75 touch-manipulation select-none active:scale-95 will-change-transform ${
                isActive
                  ? 'text-neutral-900 dark:text-white font-bold'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-transform ${
                  isActive ? 'bg-neutral-100 dark:bg-neutral-800 scale-105 shadow-2xs' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-900 dark:text-white stroke-[2.4]' : 'stroke-[1.7]'}`} />
              </div>
              <span className={`text-[10px] leading-none mt-1 tracking-tight truncate max-w-[52px] ${isActive ? 'font-bold text-neutral-900 dark:text-white' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

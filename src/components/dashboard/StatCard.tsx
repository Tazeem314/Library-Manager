import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  id: string;
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  subtext,
  icon: Icon,
}) => {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -2, transition: { duration: 0.15, ease: 'easeOut' } }}
      className="p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {subtext && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</div>}
      </div>
    </motion.div>
  );
};

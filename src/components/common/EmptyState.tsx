import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id = 'empty-state',
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          id={`${id}-action-btn`}
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white text-sm font-semibold shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

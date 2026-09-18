import React from 'react';
import { UserPlus, UserCheck, CreditCard } from 'lucide-react';

interface QuickActionsProps {
  onAddStudent: () => void;
  onAssignSeat: () => void;
  onRecordPayment: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddStudent,
  onAssignSeat,
  onRecordPayment,
}) => {
  return (
    <div id="quick-actions-section" className="space-y-2">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight px-0.5">
        Quick Operations
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          id="quick-action-add-student"
          onClick={onAddStudent}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span className="truncate">Add Student</span>
        </button>

        <button
          type="button"
          id="quick-action-assign-seat"
          onClick={onAssignSeat}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 font-medium text-xs sm:text-sm shadow-2xs transition-all"
        >
          <UserCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          <span className="truncate">Assign Seat</span>
        </button>

        <button
          type="button"
          id="quick-action-record-payment"
          onClick={onRecordPayment}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 font-medium text-xs sm:text-sm shadow-2xs transition-all"
        >
          <CreditCard className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          <span className="truncate">Record Fee</span>
        </button>
      </div>
    </div>
  );
};

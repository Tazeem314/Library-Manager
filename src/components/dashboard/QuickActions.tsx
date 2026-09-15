import React from 'react';
import { UserPlus, UserCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

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
        <motion.button
          id="quick-action-add-student"
          onClick={onAddStudent}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span className="truncate">Add Student</span>
        </motion.button>

        <motion.button
          id="quick-action-assign-seat"
          onClick={onAssignSeat}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 font-medium text-xs sm:text-sm shadow-2xs transition-colors"
        >
          <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="truncate">Assign Seat</span>
        </motion.button>

        <motion.button
          id="quick-action-record-payment"
          onClick={onRecordPayment}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 font-medium text-xs sm:text-sm shadow-2xs transition-colors"
        >
          <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="truncate">Record Fee</span>
        </motion.button>
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';
import { Payment } from '../../types';

interface RecentPaymentsProps {
  payments: Payment[];
  onViewAllPayments: () => void;
}

export const RecentPayments: React.FC<RecentPaymentsProps> = ({
  payments,
  onViewAllPayments,
}) => {
  const recent = payments.slice(0, 4);

  const getRelativeDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    return dateStr;
  };

  return (
    <div
      id="dashboard-recent-payments"
      className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3.5 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Recent Fee Payments
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent collections recorded</p>
        </div>

        <button
          id="dashboard-view-all-payments-btn"
          onClick={onViewAllPayments}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>All Records</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          No fees received yet today
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((pay) => (
            <div
              key={pay.id}
              className="py-3 flex items-center justify-between first:pt-1 last:pb-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                  {(pay.studentName || 'Student').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {pay.studentName || 'Student'}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{pay.method}</span>
                    <span>•</span>
                    <span>{getRelativeDate(pay.date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  +₹{pay.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">Received</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Armchair, CheckCircle2, UserCheck, Users, BarChart3, TrendingUp, ArrowRight, IndianRupee } from 'lucide-react';
import { AppState, TabType, Student, Seat, Membership } from '../../types';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { SeatMiniOverview } from './SeatMiniOverview';
import { RecentPayments } from './RecentPayments';
import { UpcomingExpiriesWidget } from './UpcomingExpiriesWidget';
import { ReminderContext, ReminderType } from '../../utils/whatsapp';
import { CloudSyncBadge } from '../common/CloudSyncBadge';
import { AuthUser } from '../../services/firebase';

interface DashboardViewProps {
  state: AppState;
  onNavigateTab: (tab: TabType) => void;
  onOpenAddStudent: () => void;
  onOpenAssignSeat: () => void;
  onOpenRecordPayment: () => void;
  onOpenWhatsAppReminder: (ctx: ReminderContext, initialType?: ReminderType) => void;
  onRecordPaymentForStudent?: (student: Student, membership?: Membership) => void;
  onAssignSeatForStudent?: (seat?: Seat, student?: Student) => void;
  onSelectStudent?: (student: Student) => void;
  authUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigateTab,
  onOpenAddStudent,
  onOpenAssignSeat,
  onOpenRecordPayment,
  onOpenWhatsAppReminder,
  onRecordPaymentForStudent,
  onAssignSeatForStudent,
  onSelectStudent,
  authUser = null,
  onOpenAuthModal,
}) => {
  const { seats, students, payments, expenses, business } = state;

  const totalSeats = seats.length || business.totalSeats;
  const occupiedSeats = seats.filter((s) => s.status === 'occupied').length;
  const availableSeats = seats.filter((s) => s.status === 'available').length;
  const activeStudents = students.filter((s) => s.status === 'active').length;

  // Current month financial totals
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'short' });

  let monthRevenue = 0;
  for (const p of payments) {
    if (p.date) {
      const parts = p.date.split('-');
      if (parts.length >= 2 && parseInt(parts[0], 10) === curY && parseInt(parts[1], 10) - 1 === curM) {
        monthRevenue += p.amount;
      }
    }
  }

  let monthExpenses = 0;
  for (const e of expenses || []) {
    if (e.date) {
      const parts = e.date.split('-');
      if (parts.length >= 2 && parseInt(parts[0], 10) === curY && parseInt(parts[1], 10) - 1 === curM) {
        monthExpenses += e.amount;
      }
    }
  }

  const monthNetProfit = monthRevenue - monthExpenses;
  const isProfit = monthNetProfit >= 0;

  return (
    <div id="dashboard-view" className="space-y-5 pb-20 md:pb-8">
      {/* Cloud Sync Status Banner */}
      {onOpenAuthModal && (
        <CloudSyncBadge
          authUser={authUser}
          onClick={onOpenAuthModal}
          variant="banner"
        />
      )}

      {/* Top Section: Quick Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 px-0.5">
          Today's Summary
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            id="stat-total-seats"
            label="Total Seats"
            value={totalSeats}
            subtext="Total in library"
            icon={Armchair}
            variant="slate"
          />
          <StatCard
            id="stat-occupied-seats"
            label="Occupied"
            value={occupiedSeats}
            subtext={`${occupiedSeats} seats taken`}
            icon={UserCheck}
            variant="slate"
          />
          <StatCard
            id="stat-available-seats"
            label="Empty / Free"
            value={availableSeats}
            subtext="Free to book"
            icon={CheckCircle2}
            variant="slate"
          />
          <StatCard
            id="stat-active-students"
            label="Active Students"
            value={activeStudents}
            subtext="Enrolled students"
            icon={Users}
            variant="slate"
          />
        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
        <QuickActions
          onAddStudent={onOpenAddStudent}
          onAssignSeat={onOpenAssignSeat}
          onRecordPayment={onOpenRecordPayment}
        />
      </motion.div>

      {/* Upcoming Expiries in Next 7 Days Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <UpcomingExpiriesWidget
          state={state}
          onOpenWhatsAppReminder={onOpenWhatsAppReminder}
          onOpenRecordPayment={(student, membership) => {
            if (onRecordPaymentForStudent) {
              onRecordPaymentForStudent(student, membership);
            } else {
              onOpenRecordPayment();
            }
          }}
          onOpenAssignSeat={(seat, student) => {
            if (onAssignSeatForStudent) {
              onAssignSeatForStudent(seat, student);
            } else {
              onOpenAssignSeat();
            }
          }}
          onNavigateTab={(tab) => onNavigateTab(tab)}
          onSelectStudent={onSelectStudent}
        />
      </motion.div>

      {/* Quick Financial P&L Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        id="dashboard-pnl-banner"
        onClick={() => onNavigateTab('analytics')}
        className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-tight">
                {monthName} {curY} Financial Summary
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                {isProfit ? 'Profitable' : 'Deficit'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold font-display text-neutral-900 dark:text-white mt-0.5">
              Net Profit: <span>
                {isProfit ? '+' : '-'}₹{Math.abs(monthNetProfit).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-2 font-medium">
              <span>Fees: ₹{monthRevenue.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>Expenses: ₹{monthExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white group-hover:underline transition-colors self-end sm:self-center">
          <span>Detailed Analytics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.div>

      {/* Grid for Seat Overview & Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        <SeatMiniOverview
          seats={seats}
          onViewAllSeats={() => onNavigateTab('seats')}
        />
        <RecentPayments
          payments={payments}
          onViewAllPayments={() => onNavigateTab('payments')}
        />
      </motion.div>
    </div>
  );
};

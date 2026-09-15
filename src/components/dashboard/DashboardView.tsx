import React from 'react';
import { Armchair, CheckCircle2, UserCheck, Users, BarChart3, TrendingUp, ArrowRight, IndianRupee } from 'lucide-react';
import { AppState, TabType, Student, Seat, Membership } from '../../types';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { SeatMiniOverview } from './SeatMiniOverview';
import { RecentPayments } from './RecentPayments';
import { UpcomingExpiriesWidget } from './UpcomingExpiriesWidget';
import { CloudSyncBanner } from '../auth/CloudSyncBanner';
import { ReminderContext, ReminderType } from '../../utils/whatsapp';

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
      {/* Cloud Sync with Gmail Prompt Banner */}
      <CloudSyncBanner />

      {/* Top Section: Quick Summary Cards */}
      <div>
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
            variant="blue"
          />
          <StatCard
            id="stat-available-seats"
            label="Empty / Free"
            value={availableSeats}
            subtext="Free to book"
            icon={CheckCircle2}
            variant="emerald"
          />
          <StatCard
            id="stat-active-students"
            label="Active Students"
            value={activeStudents}
            subtext="Enrolled students"
            icon={Users}
            variant="amber"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <QuickActions
        onAddStudent={onOpenAddStudent}
        onAssignSeat={onOpenAssignSeat}
        onRecordPayment={onOpenRecordPayment}
      />

      {/* Upcoming Expiries in Next 7 Days Widget */}
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

      {/* Quick Financial P&L Banner */}
      <div
        id="dashboard-pnl-banner"
        onClick={() => onNavigateTab('analytics')}
        className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
                {monthName} {curY} Financial Summary
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                isProfit
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
              }`}>
                {isProfit ? 'Profitable' : 'Deficit'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white mt-0.5">
              Net Profit: <span className={isProfit ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                {isProfit ? '+' : '-'}₹{Math.abs(monthNetProfit).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 font-medium">
              <span>Fees: ₹{monthRevenue.toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>Expenses: ₹{monthExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors self-end sm:self-center">
          <span>Detailed Analytics</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Grid for Seat Overview & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SeatMiniOverview
          seats={seats}
          onViewAllSeats={() => onNavigateTab('seats')}
        />
        <RecentPayments
          payments={payments}
          onViewAllPayments={() => onNavigateTab('payments')}
        />
      </div>
    </div>
  );
};

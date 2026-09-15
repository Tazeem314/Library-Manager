import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  IndianRupee,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Printer,
  Download,
  Building2,
  Zap,
  Wifi,
  Users,
  Armchair,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { AppState, Expense, ExpenseCategory, PaymentMethod, TabType } from '../../types';
import { AddExpenseModal } from './AddExpenseModal';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AnalyticsViewProps {
  state: AppState;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (expenseId: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenRecordPayment: () => void;
  initialSubTab?: AnalyticsSubTab;
}

type PeriodType = 'today' | 'month' | 'year' | 'all';
export type AnalyticsSubTab = 'overview' | 'expenses' | 'report' | 'guide';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Rent: '#3B82F6', // Blue
  'Electricity / Power': '#F59E0B', // Amber
  'Internet / WiFi': '#8B5CF6', // Purple
  Water: '#06B6D4', // Cyan
  'Cleaning & Hygiene': '#10B981', // Emerald
  'Staff & Maintenance': '#EC4899', // Pink
  'Newspaper & Books': '#6366F1', // Indigo
  'Tea & Pantry': '#F97316', // Orange
  'Air Conditioning / Repair': '#14B8A6', // Teal
  'Marketing & Printing': '#84CC16', // Lime
  Other: '#64748B', // Slate
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  onAddExpense,
  onDeleteExpense,
  onNavigateTab,
  onOpenRecordPayment,
  initialSubTab,
}) => {
  const { payments, expenses, memberships, students, seats, shifts, business } = state;

  // View Controls
  const [activePeriod, setActivePeriod] = useState<PeriodType>('month');
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>(initialSubTab || 'overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Expense List Filters
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Today reference
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Specific selected month or year
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Helper date checker for filtered items
  const isDateInPeriod = (dateStr: string, period: PeriodType): boolean => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length < 3) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // 0-indexed
    const dStr = dateStr;

    switch (period) {
      case 'today':
        return dStr === todayStr;
      case 'month':
        return y === selectedYear && m === selectedMonthIndex;
      case 'year':
        return y === selectedYear;
      case 'all':
        return true;
      default:
        return true;
    }
  };

  // Filtered Payments & Expenses for the selected Period
  const periodPayments = useMemo(() => {
    return payments.filter((p) => isDateInPeriod(p.date, activePeriod));
  }, [payments, activePeriod, selectedMonthIndex, selectedYear, todayStr]);

  const periodExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInPeriod(e.date, activePeriod));
  }, [expenses, activePeriod, selectedMonthIndex, selectedYear, todayStr]);

  // Financial Aggregations
  const totalRevenue = useMemo(() => {
    return periodPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [periodPayments]);

  const totalExpenses = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodExpenses]);

  const netProfit = totalRevenue - totalExpenses;
  const isProfitable = netProfit >= 0;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Outstanding fees across active memberships
  const totalOutstandingDues = useMemo(() => {
    return memberships
      .filter((m) => m.status !== 'expired')
      .reduce((sum, m) => sum + m.outstandingAmount, 0);
  }, [memberships]);

  const studentsWithDuesCount = useMemo(() => {
    return memberships.filter((m) => m.status !== 'expired' && m.outstandingAmount > 0).length;
  }, [memberships]);

  // Library Operational Stats
  const totalSeatsCount = seats.length || business.totalSeats;
  const occupiedSeatsCount = seats.filter((s) => s.status === 'occupied').length;
  const occupancyRate = totalSeatsCount > 0 ? ((occupiedSeatsCount / totalSeatsCount) * 100).toFixed(0) : '0';
  const activeStudentsCount = students.filter((s) => s.status === 'active').length;
  const avgRevenuePerStudent = activeStudentsCount > 0 ? Math.round(totalRevenue / activeStudentsCount) : 0;

  // Monthly Revenue & Expense Data for Bar Chart (Last 6 Months)
  const monthlyChartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = `${monthNames[m]} ${y !== currentYear ? "'" + String(y).slice(-2) : ''}`;

      let rev = 0;
      for (const p of payments) {
        if (p.date) {
          const parts = p.date.split('-');
          if (parts.length >= 2 && parseInt(parts[0], 10) === y && parseInt(parts[1], 10) - 1 === m) {
            rev += p.amount;
          }
        }
      }

      let exp = 0;
      for (const e of expenses) {
        if (e.date) {
          const parts = e.date.split('-');
          if (parts.length >= 2 && parseInt(parts[0], 10) === y && parseInt(parts[1], 10) - 1 === m) {
            exp += e.amount;
          }
        }
      }

      const profit = rev - exp;
      data.push({
        name: label,
        Revenue: rev,
        Expenses: exp,
        NetProfit: profit,
      });
    }
    return data;
  }, [payments, expenses, currentYear, currentMonth]);

  // Daily Trend Data (Last 14 Days)
  const dailyChartData = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;

      let rev = 0;
      for (const p of payments) {
        if (p.date === dStr) rev += p.amount;
      }

      let exp = 0;
      for (const e of expenses) {
        if (e.date === dStr) exp += e.amount;
      }

      data.push({
        date: label,
        Collection: rev,
        Expense: exp,
      });
    }
    return data;
  }, [payments, expenses]);

  // Expense Category Breakdown
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of periodExpenses) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : '0',
        color: CATEGORY_COLORS[name as ExpenseCategory] || '#64748B',
      }))
      .sort((a, b) => b.value - a.value);
  }, [periodExpenses, totalExpenses]);

  // Payment Method Breakdown
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<PaymentMethod, number> = {
      UPI: 0,
      Cash: 0,
      'Bank Transfer': 0,
      Other: 0,
    };
    for (const p of periodPayments) {
      map[p.method] = (map[p.method] || 0) + p.amount;
    }
    return map;
  }, [periodPayments]);

  // Shift Revenue Breakdown
  const shiftRevenueBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    const membershipMap = new Map<string, (typeof memberships)[0]>(memberships.map((m) => [m.id, m]));
    const shiftMap = new Map<string, string>(shifts.map((s) => [s.id, s.name]));

    for (const p of periodPayments) {
      if (p.membershipId) {
        const mem = membershipMap.get(p.membershipId);
        if (mem && mem.shiftId) {
          const shiftName = shiftMap.get(mem.shiftId) || 'General';
          map[shiftName] = (map[shiftName] || 0) + p.amount;
          continue;
        }
      }
      map['Direct / General'] = (map['Direct / General'] || 0) + p.amount;
    }

    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : '0',
    }));
  }, [periodPayments, memberships, shifts, totalRevenue]);

  // Filtered expenses for the Expense Book tab
  const filteredExpenseList = useMemo(() => {
    return periodExpenses.filter((e) => {
      if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) {
        return false;
      }
      if (expenseSearch.trim()) {
        const q = expenseSearch.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesNotes = e.notes?.toLowerCase().includes(q) || false;
        const matchesReceipt = e.receiptNo?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesNotes && !matchesReceipt) return false;
      }
      return true;
    });
  }, [periodExpenses, selectedCategoryFilter, expenseSearch]);

  // Print Report Action
  const handlePrintReport = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    switch (activePeriod) {
      case 'today':
        return `Today (${todayStr})`;
      case 'month':
        return `${fullMonthNames[selectedMonthIndex]} ${selectedYear}`;
      case 'year':
        return `Year ${selectedYear}`;
      case 'all':
        return 'All Time Lifetime Data';
      default:
        return '';
    }
  };

  return (
    <div id="analytics-view" className="space-y-4 pb-20 md:pb-8">
      {/* Top Header & Accounting Period Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                Analytics & Profit / Loss
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Financial breakdown, revenue collections, operational expenses & net margin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="analytics-print-btn"
              onClick={handlePrintReport}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Print official financial statement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Accounting Period Selector (Day / Month / Year / All Time) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
            <button
              id="period-btn-today"
              onClick={() => setActivePeriod('today')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activePeriod === 'today'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              id="period-btn-month"
              onClick={() => setActivePeriod('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activePeriod === 'month'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              id="period-btn-year"
              onClick={() => setActivePeriod('year')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activePeriod === 'year'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Year
            </button>
            <button
              id="period-btn-all"
              onClick={() => setActivePeriod('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activePeriod === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Month or Year Dropdown when viewing Month or Year */}
          {activePeriod === 'month' && (
            <div className="flex items-center gap-2">
              <select
                id="analytics-month-select"
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {fullMonthNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                id="analytics-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activePeriod === 'year' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Year:</span>
              <select
                id="analytics-single-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Viewing: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{getPeriodLabel()}</strong></span>
          </div>
        </div>
      </div>

      {/* KEY FINANCIAL KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Collection / Revenue */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
                Total Collection
              </span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <ArrowDownRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{periodPayments.length} student fees</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">Gross Inflow</span>
          </div>
        </div>

        {/* 2. Total Operational Expenses */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
                Total Expenses
              </span>
              <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight mt-1">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{periodExpenses.length} expense items</span>
            <button
              onClick={() => setActiveSubTab('expenses')}
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
            >
              View breakdown
            </button>
          </div>
        </div>

        {/* 3. Net Profit / Loss */}
        <div
          className={`p-4 sm:p-5 rounded-xl border shadow-2xs flex flex-col justify-between ${
            isProfitable
              ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-700/80 ring-1 ring-rose-500/20'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-semibold tracking-tight ${
                  isProfitable ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
                }`}
              >
                {isProfitable ? 'Net Profit' : 'Net Loss'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                  isProfitable
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                }`}
              >
                {profitMargin}% Margin
              </span>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-display tracking-tight mt-1 ${
                isProfitable ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {isProfitable ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
            </div>
          </div>
          <div
            className={`mt-3 pt-3 border-t text-xs font-medium flex items-center justify-between ${
              isProfitable
                ? 'border-slate-100 dark:border-slate-800 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-100 dark:border-slate-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <span>Revenue minus Expenses</span>
            <span>{isProfitable ? 'Operating profit' : 'Operating loss'}</span>
          </div>
        </div>

        {/* 4. Pending / Remaining Fees Due */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
                Pending Fees Due
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                {studentsWithDuesCount} Students
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-amber-900 dark:text-amber-300 tracking-tight mt-1">
              ₹{totalOutstandingDues.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Pending student dues</span>
            <button
              onClick={() => onNavigateTab('payments')}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              Collect Dues →
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY OPERATIONAL METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-900 text-white rounded-xl shadow-xs text-xs">
        <div className="p-2">
          <span className="text-slate-400 block text-[11px] font-medium">Seat Occupancy</span>
          <div className="text-lg font-bold text-white mt-0.5 font-display">{occupancyRate}%</div>
          <span className="text-[10px] text-slate-400">{occupiedSeatsCount} of {totalSeatsCount} seats booked</span>
        </div>

        <div className="p-2 border-l border-slate-800">
          <span className="text-slate-400 block text-[11px] font-medium">Active Students</span>
          <div className="text-lg font-bold text-white mt-0.5 font-display">{activeStudentsCount}</div>
          <span className="text-[10px] text-slate-400">Enrolled library members</span>
        </div>

        <div className="p-2 border-l border-slate-800">
          <span className="text-slate-400 block text-[11px] font-medium">Avg Rev / Student</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5 font-display">₹{avgRevenuePerStudent}</div>
          <span className="text-[10px] text-slate-400">In selected period</span>
        </div>

        <div className="p-2 border-l border-slate-800">
          <span className="text-slate-400 block text-[11px] font-medium">Net Profit / Seat</span>
          <div className="text-lg font-bold text-slate-200 mt-0.5 font-display">
            ₹{totalSeatsCount > 0 ? Math.round(netProfit / totalSeatsCount) : 0}
          </div>
          <span className="text-[10px] text-slate-400">Efficiency per chair</span>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs overflow-x-auto no-scrollbar">
        <button
          id="subtab-overview"
          onClick={() => setActiveSubTab('overview')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Overview & Graphs</span>
        </button>

        <button
          id="subtab-expenses"
          onClick={() => setActiveSubTab('expenses')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'expenses'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Expenses ({periodExpenses.length})</span>
        </button>

        <button
          id="subtab-report"
          onClick={() => setActiveSubTab('report')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'report'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Business Report</span>
        </button>

        <button
          id="subtab-guide"
          onClick={() => setActiveSubTab('guide')}
          className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'guide'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How P&L Works</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 1: OVERVIEW & INTERACTIVE CHARTS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Chart 1: Multi-Month Collection vs. Expense vs. Profit */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
                  Monthly Revenue vs. Expenses vs. Net Profit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total fee inflow compared against library operating costs over the last 6 months
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> Expenses
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> Net Profit
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    formatter={(val: number | string | undefined) => [
                      `₹${(typeof val === 'number' ? val : 0).toLocaleString('en-IN')}`,
                      '',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="NetProfit" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dual Charts Grid: Daily Trend & Category Expense Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 2: Daily Collection Trend */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
                  Daily Collection Trend (Last 14 Days)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cashflow tracking for walk-in enrollments and plan renewals
                </p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(val: number | string | undefined) => [
                        `₹${(typeof val === 'number' ? val : 0).toLocaleString('en-IN')}`,
                        'Collection',
                      ]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Collection"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Expense Category Breakdown */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
                    Expense Breakdown by Category
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Where library funds are spent ({getPeriodLabel()})
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                  ₹{totalExpenses.toLocaleString('en-IN')} Total
                </span>
              </div>

              {expenseCategoryData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                  <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1.5" />
                  <span>No expenses recorded for this period</span>
                  <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="mt-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    + Add an expense
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {/* Progress bars for top categories */}
                  {expenseCategoryData.slice(0, 5).map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-xs"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{cat.value.toLocaleString('en-IN')}{' '}
                          <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                            ({cat.percentage}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {expenseCategoryData.length > 5 && (
                    <div className="pt-1 text-center">
                      <button
                        onClick={() => setActiveSubTab('expenses')}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all {expenseCategoryData.length} categories in Expense Book →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Distribution Cards: Shift Inflow & Payment Modes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shift Performance */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">Revenue by Study Shift</h4>
              <div className="space-y-2">
                {shiftRevenueBreakdown.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">{item.name}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.percentage}% of collections</span>
                    </div>
                    <div className="text-sm font-bold font-display text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Modes */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">Collection Modes</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">UPI Payments</span>
                  <div className="text-base font-bold font-display mt-0.5">₹{paymentMethodBreakdown.UPI.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">GPay, PhonePe, Paytm</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Cash at Desk</span>
                  <div className="text-base font-bold font-display mt-0.5">₹{paymentMethodBreakdown.Cash.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Desk receipts</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Bank Transfer</span>
                  <div className="text-base font-bold font-display mt-0.5">₹{paymentMethodBreakdown['Bank Transfer'].toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">NEFT, IMPS, RTGS</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Other Modes</span>
                  <div className="text-base font-bold font-display mt-0.5">₹{paymentMethodBreakdown.Other.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Cheques & others</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 2: EXPENSES (LIBRARY EXPENSES & OUTFLOWS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'expenses' && (
        <div id="expenses-page-content" className="space-y-4">
          {/* Expenses Page Header with Consistent Add Expense Button */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
                    Library Expenses
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200/60 dark:border-rose-800/60">
                    Total: ₹{totalExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Record operational bills, rent, and utility outflows for {getPeriodLabel()}
                </p>
              </div>
            </div>

            <button
              id="expense-page-add-btn"
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          {/* Action & Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="expense-search-input"
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Search expense title, receipt no, notes..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
                {expenseSearch && (
                  <button
                    id="clear-expense-search-btn"
                    onClick={() => setExpenseSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                id="filter-exp-all"
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Categories ({periodExpenses.length})
              </button>
              {expenseCategoryData.map((cat) => (
                <button
                  key={cat.name}
                  id={`filter-exp-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedCategoryFilter(cat.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategoryFilter === cat.name
                      ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenseList.length === 0 ? (
            <EmptyState
              id="no-expenses-state"
              icon={Receipt}
              title={periodExpenses.length === 0 ? 'No expenses recorded for this period' : 'No matching expenses'}
              description={
                periodExpenses.length === 0
                  ? 'Add your electricity bill, WiFi, rent, or cleaning costs to compute accurate net profit.'
                  : 'Try clearing your search or category filter.'
              }
              actionLabel="Add Expense"
              onAction={() => setIsAddExpenseOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {filteredExpenseList.map((expense) => {
                const color = CATEGORY_COLORS[expense.category] || '#64748B';
                return (
                  <div
                    key={expense.id}
                    id={`expense-row-${expense.id}`}
                    className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                          {expense.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          <span
                            className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {expense.category}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{expense.date}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            {expense.paymentMethod}
                          </span>
                          {expense.receiptNo && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                Ref: {expense.receiptNo}
                              </span>
                            </>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-bold font-display text-rose-700 dark:text-rose-400">
                          -₹{expense.amount.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Expense</span>
                      </div>

                      <button
                        id={`delete-expense-${expense.id}`}
                        onClick={() => setExpenseToDelete(expense)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors"
                        title="Delete this expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 3: COMPREHENSIVE BUSINESS REPORT & P&L SHEET */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'report' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Printable financial statement for accounting, bank, or partner records
            </span>
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Official Printable Statement Card */}
          <div
            id="printable-business-report"
            className="p-5 sm:p-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6 text-slate-900 dark:text-slate-100"
          >
            {/* Report Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-bold font-display tracking-tight text-slate-950 dark:text-white">
                  {business.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5 font-medium">
                  <div>Proprietor: {business.ownerName} | Tel: {business.phone}</div>
                  <div>{business.address}, {business.city}</div>
                  <div>Capacity: {totalSeatsCount} Study Seats | Shift Based Self-Study Hall</div>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider border border-slate-200/60 dark:border-slate-700">
                  Profit & Loss Statement
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Period: <strong className="text-slate-800 dark:text-slate-200">{getPeriodLabel()}</strong>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Income Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  A. Gross Revenue & Collections
                </h4>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1">
                  <span>Student Fee Collections & Plan Renewals ({periodPayments.length} transactions)</span>
                  <span className="font-mono font-semibold">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>- Via UPI (Google Pay, PhonePe, Paytm)</span>
                  <span className="font-mono">₹{paymentMethodBreakdown.UPI.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>- Via Cash at Counter</span>
                  <span className="font-mono">₹{paymentMethodBreakdown.Cash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>- Via Direct Bank Transfer / NEFT</span>
                  <span className="font-mono">₹{paymentMethodBreakdown['Bank Transfer'].toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                  <span>Total Gross Revenue (A)</span>
                  <span className="font-mono text-sm text-emerald-800 dark:text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  B. Library Operating Expenses
                </h4>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {expenseCategoryData.length === 0 ? (
                  <div className="py-2 text-slate-400 dark:text-slate-500 text-center text-xs italic">
                    No expenses recorded for this accounting period
                  </div>
                ) : (
                  expenseCategoryData.map((cat) => (
                    <div key={cat.name} className="flex justify-between py-1">
                      <span className="flex items-center gap-1.5">
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({cat.percentage}%)</span>
                      </span>
                      <span className="font-mono font-medium">₹{cat.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between py-1.5 border-t border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white">
                  <span>Total Operating Expenses (B)</span>
                  <span className="font-mono text-sm text-rose-800 dark:text-rose-400">-₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Summary Box */}
            <div
              className={`p-4 rounded-xl border ${
                isProfitable
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider block">
                    Net Operating Profit (A - B)
                  </span>
                  <span className="text-xs font-medium opacity-80">
                    Net Profit Margin: {profitMargin}%
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-display tracking-tight font-mono">
                  {isProfitable ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Operational Health Metrics */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Seat Occupancy</span>
                <span className="font-semibold text-slate-900 dark:text-white">{occupancyRate}% ({occupiedSeatsCount}/{totalSeatsCount})</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Active Members</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeStudentsCount} Students</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Pending Dues</span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">₹{totalOutstandingDues.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Avg Rev / Chair</span>
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  ₹{totalSeatsCount > 0 ? Math.round(totalRevenue / totalSeatsCount) : 0}
                </span>
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Report verified by StudySpace Library Manager</span>
              <span>Authorized Signatory: ________________________</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUBTAB 4: FEATURE GUIDE (P&L FOR LIBRARY OWNERS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'guide' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold font-display text-base">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Financial Overview Guide: How Library Profit & Loss Works</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Operating a modern study hall requires keeping track of recurring overheads alongside fee collections.
              Here is how StudySpace computes your true take-home margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Guide Card 1: Revenue */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">1. Automatic Fee Revenue Tracking</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Whenever you assign a seat, enroll a student, or collect an installment via the
                Payments screen, that amount is automatically logged with its payment mode (UPI, Cash,
                Bank Transfer).
              </p>
            </div>

            {/* Guide Card 2: Operating Expenses */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
                <Receipt className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">2. Recording Study Hall Expenses</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Study halls carry regular overheads: Commercial Rent, High-speed Fiber WiFi, Electricity & AC
                power bills, Water cans, Staff salaries, and Cleaning supplies. Tapping <strong>"Add Expense"</strong>
                keeps every rupee recorded with date, category, and bill reference.
              </p>
            </div>

            {/* Guide Card 3: Net Profit */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">3. Net Profit / Loss Calculation</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Net Profit = Total Collections - Total Expenses</strong>. StudySpace calculates
                your net margin percentage across any time period (Day, Month, Year) so you immediately know
                your bottom-line earnings.
              </p>
            </div>

            {/* Guide Card 4: Due Recovery */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white">4. Turning Pending Dues into Profit</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uncollected remaining fees represent working capital. Use the
                <strong> WhatsApp reminder button</strong> on the Payments screen to notify students with
                outstanding balances and recover pending dues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={onAddExpense}
      />

      {/* In-App Delete Expense Confirmation Dialog */}
      <ConfirmDialog
        id="confirm-delete-expense-dialog"
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${expenseToDelete?.title}" for ₹${expenseToDelete?.amount?.toLocaleString('en-IN')}? This will update your total expenses and net profit calculations.`}
        confirmLabel="Delete Expense"
        isDestructive={true}
        onConfirm={() => {
          if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};

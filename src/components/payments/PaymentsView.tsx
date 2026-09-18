import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  CreditCard,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Armchair,
  Clock,
  Send,
  UserCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AppState, PaymentMethod, Student, Membership, Seat, Shift } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { ReminderContext, ReminderType } from '../../utils/whatsapp';

interface PaymentsViewProps {
  state: AppState;
  onOpenRecordPayment: () => void;
  onRecordPaymentForStudent?: (student: Student, membership?: Membership) => void;
  onOpenWhatsAppReminder?: (ctx: ReminderContext, initialType?: ReminderType) => void;
}

interface DueRecord {
  student: Student;
  membership: Membership;
  seat?: Seat;
  shift?: Shift;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  state,
  onOpenRecordPayment,
  onRecordPaymentForStudent,
  onOpenWhatsAppReminder,
}) => {
  const { payments, memberships, students, seats, shifts, business } = state;

  // Active section: 'dues' (Pending Payments / Due Fees) or 'history' (Fee History)
  const [activeSection, setActiveSection] = useState<'dues' | 'history'>('dues');

  // Search & filters for fee history
  const [historySearch, setHistorySearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');

  // Search & filters for pending dues
  const [duesSearch, setDuesSearch] = useState('');
  const [duesAmountFilter, setDuesAmountFilter] = useState<'all' | 'high' | 'low'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial stats calculation
  const stats = useMemo(() => {
    let todayTotal = 0;
    let grandTotal = 0;
    for (const p of payments) {
      grandTotal += p.amount;
      if (p.date === todayStr) {
        todayTotal += p.amount;
      }
    }

    let outstandingTotal = 0;
    let countWithDue = 0;
    for (const m of memberships) {
      if (m.status !== 'expired' && m.outstandingAmount > 0) {
        outstandingTotal += m.outstandingAmount;
        countWithDue += 1;
      }
    }

    return { todayTotal, grandTotal, outstandingTotal, countWithDue };
  }, [payments, memberships, todayStr]);

  // Lookup maps for fast student & seat info
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const seatMap = useMemo(() => new Map(seats.map((s) => [s.id, s])), [seats]);
  const shiftMap = useMemo(() => new Map(shifts.map((s) => [s.id, s])), [shifts]);

  // All pending due records
  const allDueRecords = useMemo(() => {
    const list: DueRecord[] = [];
    for (const m of memberships) {
      if (m.status !== 'expired' && m.outstandingAmount > 0) {
        const student = studentMap.get(m.studentId);
        if (student) {
          const seat = m.seatId ? seatMap.get(m.seatId) : undefined;
          const shift = m.shiftId ? shiftMap.get(m.shiftId) : undefined;
          list.push({ student, membership: m, seat, shift });
        }
      }
    }
    // Highest outstanding fee first
    return list.sort((a, b) => b.membership.outstandingAmount - a.membership.outstandingAmount);
  }, [memberships, studentMap, seatMap, shiftMap]);

  // Filtered due records
  const filteredDueRecords = useMemo(() => {
    return allDueRecords.filter((item) => {
      // Amount range filter
      if (duesAmountFilter === 'high' && item.membership.outstandingAmount < 1000) {
        return false;
      }
      if (duesAmountFilter === 'low' && item.membership.outstandingAmount >= 1000) {
        return false;
      }

      // Search query filter
      if (duesSearch.trim()) {
        const q = duesSearch.toLowerCase().trim();
        const matchesName = item.student.fullName.toLowerCase().includes(q);
        const matchesPhone = item.student.phone.includes(q);
        const matchesSeat = item.seat?.seatNumber.toLowerCase().includes(q) || false;
        const matchesPlan = item.membership.planName.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesSeat && !matchesPlan) {
          return false;
        }
      }

      return true;
    });
  }, [allDueRecords, duesAmountFilter, duesSearch]);

  // Filtered fee history entries
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (methodFilter !== 'all' && p.method !== methodFilter) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase().trim();
        const matchesName = (p.studentName || '').toLowerCase().includes(q);
        const matchesRef = p.referenceNo?.toLowerCase().includes(q) || false;
        const matchesNotes = p.notes?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesRef && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [payments, methodFilter, historySearch]);

  const formatDisplayDate = (dStr: string) => {
    if (dStr === todayStr) return 'Today';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dStr;
  };

  const handleCollectForStudent = (record: DueRecord) => {
    if (onRecordPaymentForStudent) {
      onRecordPaymentForStudent(record.student, record.membership);
    } else {
      onOpenRecordPayment();
    }
  };

  const getWhatsAppReminderUrl = (record: DueRecord) => {
    const rawPhone = record.student.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const seatText = record.seat ? ` for Seat ${record.seat.seatNumber}` : '';
    const message = `Hello ${record.student.fullName}, this is a gentle reminder from ${business.name}. Your remaining fee of ₹${record.membership.outstandingAmount}${seatText} is pending. Please clear it at your earliest convenience. Thank you!`;
    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div id="payments-view" className="space-y-4 pb-20 md:pb-8">
      {/* Top Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Remaining Fee Due Card */}
        <button
          type="button"
          onClick={() => setActiveSection('dues')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSection === 'dues'
              ? 'bg-white dark:bg-slate-900 border-amber-400/80 dark:border-amber-500/80 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight block">
              Remaining Fee Due
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
              {stats.countWithDue} Students
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight mt-1">
            ₹{stats.outstandingTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
            Pending student fees
          </span>
        </button>

        {/* Total Fee Collected */}
        <button
          type="button"
          onClick={() => setActiveSection('history')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeSection === 'history'
              ? 'bg-white dark:bg-slate-900 border-blue-400/80 dark:border-blue-500/80 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight block mb-1">
            Total Fee Collected
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            ₹{stats.grandTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
            {payments.length} fee entries recorded
          </span>
        </button>

        {/* Collected Today */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight block mb-1">
            Collected Today
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            ₹{stats.todayTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">Money received today</span>
        </div>
      </motion.div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-lg w-full sm:w-auto border border-slate-200/60 dark:border-slate-800/80">
          <button
            id="tab-due-fees"
            onClick={() => setActiveSection('dues')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSection === 'dues'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Pending Fees Due</span>
            <span
              className={`px-1.5 py-0.2 rounded-sm text-[11px] font-semibold ${
                activeSection === 'dues'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {stats.countWithDue}
            </span>
          </button>

          <button
            id="tab-fee-history"
            onClick={() => setActiveSection('history')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSection === 'history'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Fee History</span>
            <span
              className={`px-1.5 py-0.2 rounded-sm text-[11px] font-semibold ${
                activeSection === 'history'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {payments.length}
            </span>
          </button>
        </div>

        <button
          id="payments-record-payment-btn"
          onClick={onOpenRecordPayment}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Record Fee</span>
        </button>
      </div>

      {/* SECTION 1: PENDING PAYMENTS / DUE FEES */}
      {activeSection === 'dues' && (
        <div className="space-y-3">
          {/* Dues Search & Filters */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="dues-search-input"
                  type="text"
                  value={duesSearch}
                  onChange={(e) => setDuesSearch(e.target.value)}
                  placeholder="Search students with pending fee by name, phone, or seat..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <button
                id="mobile-dues-collect-btn"
                onClick={onOpenRecordPayment}
                className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Collect</span>
              </button>
            </div>

            {/* Quick Amount Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                id="filter-dues-all"
                onClick={() => setDuesAmountFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  duesAmountFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600'
                }`}
              >
                All Dues ({allDueRecords.length})
              </button>
              <button
                id="filter-dues-high"
                onClick={() => setDuesAmountFilter('high')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  duesAmountFilter === 'high'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-800/60'
                }`}
              >
                ≥ ₹1,000 ({allDueRecords.filter((r) => r.membership.outstandingAmount >= 1000).length})
              </button>
              <button
                id="filter-dues-low"
                onClick={() => setDuesAmountFilter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  duesAmountFilter === 'low'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/60 dark:border-amber-800/60'
                }`}
              >
                &lt; ₹1,000 ({allDueRecords.filter((r) => r.membership.outstandingAmount < 1000).length})
              </button>
            </div>
          </div>

          {/* Dues List */}
          {filteredDueRecords.length === 0 ? (
            <EmptyState
              id="no-dues-empty-state"
              icon={CheckCircle2}
              title={allDueRecords.length === 0 ? 'All fees are cleared' : 'No matching pending dues'}
              description={
                allDueRecords.length === 0
                  ? 'All enrolled students have fully paid their library fees. No outstanding balances.'
                  : 'Try changing or clearing your search filter.'
              }
              actionLabel={allDueRecords.length === 0 ? undefined : 'Clear Search'}
              onAction={allDueRecords.length === 0 ? undefined : () => setDuesSearch('')}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {filteredDueRecords.map((record, index) => {
                const { student, membership, seat, shift } = record;
                const initials = student.fullName
                  .split(' ')
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={membership.id}
                    id={`due-card-student-${student.id}`}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Top Row: Student info & Remaining Fee */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                            {student.fullName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                            <a
                              href={`tel:${student.phone}`}
                              className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                              title="Call student"
                            >
                              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <span>{student.phone}</span>
                            </a>
                            {student.studentId && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                                  {student.studentId}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
                          Due Amount
                        </span>
                        <div className="text-lg sm:text-xl font-bold font-display text-amber-900 dark:text-amber-300 tracking-tight">
                          ₹{membership.outstandingAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Seat, Shift & Fee breakdown details */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Seat</span>
                        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                          <Armchair className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>{seat ? `Seat ${seat.seatNumber}` : 'No Seat'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Shift Timing</span>
                        <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">{shift ? shift.name : 'Morning'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Plan</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 block truncate mt-0.5">
                          {membership.planName}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">Total / Paid</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 block mt-0.5">
                          ₹{membership.totalAmount} / <strong className="text-emerald-700 dark:text-emerald-400">₹{membership.paidAmount}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Collect Fee & WhatsApp Reminder */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {onOpenWhatsAppReminder ? (
                        <button
                          type="button"
                          id={`whatsapp-remind-${student.id}`}
                          onClick={() => {
                            onOpenWhatsAppReminder(
                              {
                                studentName: student.fullName,
                                studentPhone: student.phone,
                                businessName: business.name,
                                ownerName: business.ownerName,
                                businessPhone: business.phone,
                                seatNumber: seat?.seatNumber,
                                shiftName: shift?.name,
                                planName: membership.planName,
                                endDate: membership.endDate,
                                outstandingDue: membership.outstandingAmount,
                              },
                              'due'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                          title="Send fee reminder on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Send WhatsApp</span>
                        </button>
                      ) : (
                        <a
                          id={`whatsapp-remind-${student.id}`}
                          href={getWhatsAppReminderUrl(record)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                          title="Send fee reminder on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Send WhatsApp</span>
                        </a>
                      )}

                      <button
                        id={`collect-due-btn-${student.id}`}
                        onClick={() => handleCollectForStudent(record)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect ₹{membership.outstandingAmount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* SECTION 2: FEE HISTORY */}
      {activeSection === 'history' && (
        <div className="space-y-3">
          {/* Action and Filter Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="payment-search-input"
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search fee history by student name or reference no..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <button
                id="payments-history-record-btn"
                onClick={onOpenRecordPayment}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Record Fee</span>
                <span className="sm:hidden">Record</span>
              </button>
            </div>

            {/* Method filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {(['all', 'UPI', 'Cash', 'Bank Transfer', 'Other'] as const).map((method) => {
                const isActive = methodFilter === method;
                return (
                  <button
                    key={method}
                    id={`filter-pay-method-${method.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMethodFilter(method)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-600'
                    }`}
                  >
                    {method === 'all' ? 'All Payment Modes' : method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payments List */}
          {filteredPayments.length === 0 ? (
            <EmptyState
              id="no-payments-empty-state"
              icon={CreditCard}
              title={payments.length === 0 ? 'No fees recorded yet' : 'No matching fee entries'}
              description={
                payments.length === 0
                  ? 'Record your first student fee payment to start tracking library earnings.'
                  : 'Try clearing your search or payment mode filter.'
              }
              actionLabel={payments.length === 0 ? 'Record Fee' : 'Clear Filters'}
              onAction={
                payments.length === 0
                  ? onOpenRecordPayment
                  : () => {
                      setHistorySearch('');
                      setMethodFilter('all');
                    }
              }
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-2.5"
            >
              {filteredPayments.map((payment, index) => {
                const methodColors =
                  {
                    UPI: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
                    Cash: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
                    'Bank Transfer': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
                    Other: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
                  }[payment.method] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';

                return (
                  <div
                    key={payment.id}
                    id={`payment-row-${payment.id}`}
                    className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-semibold text-xs shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                          {payment.studentName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          <span
                            className={`px-1.5 py-0.2 rounded-sm border font-medium text-[10px] ${methodColors}`}
                          >
                            {payment.method}
                          </span>
                          {payment.referenceNo && (
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                              {payment.referenceNo}
                            </span>
                          )}
                          <span className="text-slate-400 dark:text-slate-500">•</span>
                          <span className="text-slate-500 dark:text-slate-400">{formatDisplayDate(payment.date)}</span>
                        </div>
                        {payment.notes && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                        +₹{payment.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-sm">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Received</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

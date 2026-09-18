import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  MessageCircle,
  Phone,
  Armchair,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AppState, Student, Seat, Shift, Membership, Business } from '../../types';
import { getDaysLeft, formatDisplayDate, ReminderContext, ReminderType } from '../../utils/whatsapp';

interface UpcomingExpiriesWidgetProps {
  state: AppState;
  onOpenWhatsAppReminder: (ctx: ReminderContext, initialType?: ReminderType) => void;
  onOpenRecordPayment: (student: Student, membership?: Membership) => void;
  onOpenAssignSeat: (seat?: Seat, student?: Student) => void;
  onNavigateTab: (tab: 'students' | 'seats' | 'payments') => void;
  onSelectStudent?: (student: Student) => void;
}

interface ExpiringItem {
  student: Student;
  membership: Membership;
  seat?: Seat;
  shift?: Shift;
  daysLeft: number;
  hasDue: boolean;
}

export const UpcomingExpiriesWidget: React.FC<UpcomingExpiriesWidgetProps> = ({
  state,
  onOpenWhatsAppReminder,
  onOpenRecordPayment,
  onOpenAssignSeat,
  onNavigateTab,
  onSelectStudent,
}) => {
  const { students, memberships, seats, shifts, business } = state;

  const [filter, setFilter] = useState<'all' | 'urgent' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find all active memberships expiring within the next 7 days (or expired recently e.g. <= 7 days)
  const expiringItems: ExpiringItem[] = useMemo(() => {
    const studentMap = new Map<string, Student>();
    for (const s of students) {
      studentMap.set(s.id, s);
    }
    const seatMap = new Map<string, Seat>();
    for (const s of seats) {
      seatMap.set(s.id, s);
    }
    const shiftMap = new Map<string, Shift>();
    for (const s of shifts) {
      shiftMap.set(s.id, s);
    }

    const list: ExpiringItem[] = [];

    // Filter memberships that have an endDate
    for (const mem of memberships) {
      if (!mem.endDate) continue;
      const student = studentMap.get(mem.studentId);
      if (!student) continue;

      // Only count active students or active/expiring memberships
      if (student.status !== 'active' && mem.status === 'expired') {
        // Skip long-deactivated students
        continue;
      }

      const days = getDaysLeft(mem.endDate);

      // Window: -1 (expired yesterday) to 7 days from today
      if (days >= -1 && days <= 7) {
        const seat = mem.seatId ? seatMap.get(mem.seatId) : undefined;
        const shift = mem.shiftId ? shiftMap.get(mem.shiftId) : undefined;
        const hasDue = (mem.outstandingAmount || 0) > 0;

        list.push({
          student,
          membership: mem,
          seat,
          shift,
          daysLeft: days,
          hasDue,
        });
      }
    }

    // Sort by urgency: least days left first (0, 1, 2... then -1 if any)
    list.sort((a, b) => {
      // 0 days (today) is highest urgency
      const scoreA = a.daysLeft < 0 ? 0.5 : a.daysLeft;
      const scoreB = b.daysLeft < 0 ? 0.5 : b.daysLeft;
      return scoreA - scoreB;
    });

    return list;
  }, [memberships, students, seats, shifts]);

  // Apply sub-filters
  const filteredItems = useMemo(() => {
    return expiringItems.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.student.fullName.toLowerCase().includes(q);
        const matchesSeat = item.seat?.seatNumber.toLowerCase().includes(q);
        const matchesPhone = item.student.phone.includes(q);
        if (!matchesName && !matchesSeat && !matchesPhone) return false;
      }

      if (filter === 'urgent') {
        return item.daysLeft <= 2;
      }
      if (filter === 'due') {
        return item.hasDue;
      }
      return true;
    });
  }, [expiringItems, filter, searchQuery]);

  // Quick counts
  const urgentCount = expiringItems.filter((i) => i.daysLeft <= 2).length;
  const dueCount = expiringItems.filter((i) => i.hasDue).length;

  const handleReminderClick = (item: ExpiringItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const ctx: ReminderContext = {
      studentName: item.student.fullName,
      studentPhone: item.student.phone,
      businessName: business.name,
      ownerName: business.ownerName,
      businessPhone: business.phone,
      seatNumber: item.seat?.seatNumber,
      shiftName: item.shift?.name,
      planName: item.membership.planName,
      endDate: item.membership.endDate,
      daysLeft: item.daysLeft,
      outstandingDue: item.membership.outstandingAmount,
    };

    // Auto-select type based on whether they also have due
    const initialType: ReminderType = item.hasDue ? 'both' : 'expiry';
    onOpenWhatsAppReminder(ctx, initialType);
  };

  const handleRenewClick = (item: ExpiringItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.hasDue) {
      onOpenRecordPayment(item.student, item.membership);
    } else {
      onOpenAssignSeat(item.seat, item.student);
    }
  };

  return (
    <div
      id="upcoming-expiries-widget"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors"
    >
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">
                  Upcoming Expiries
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200/60 dark:border-amber-800">
                  {expiringItems.length} in next 7 days
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Students whose study hall memberships end within the next week
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('students')}
            className="self-start sm:self-center text-xs font-semibold text-neutral-900 dark:text-white hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View All Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Chips & Search (Only show if there are items) */}
        {expiringItems.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                id="filter-expiries-all"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                All ({expiringItems.length})
              </button>

              <button
                type="button"
                id="filter-expiries-urgent"
                onClick={() => setFilter('urgent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filter === 'urgent'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white"></span>
                <span>≤ 2 Days ({urgentCount})</span>
              </button>

              <button
                type="button"
                id="filter-expiries-due"
                onClick={() => setFilter('due')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  filter === 'due'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white"></span>
                <span>With Due ({dueCount})</span>
              </button>
            </div>

            {expiringItems.length > 3 && (
              <div className="relative sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name / seat..."
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expiries List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-850 max-h-[440px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mx-auto border border-neutral-200 dark:border-neutral-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              {expiringItems.length === 0
                ? 'All Memberships Up to Date'
                : 'No students match this filter'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {expiringItems.length === 0
                ? 'No library students have plans expiring in the next 7 days.'
                : 'Try switching the filter tab above to view other upcoming expiries.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const { student, membership, seat, shift, daysLeft, hasDue } = item;

            // Compute urgency styling
            let urgencyBadgeClass = '';
            let urgencyLabel = '';

            if (daysLeft === 0) {
              urgencyBadgeClass = 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent font-bold';
              urgencyLabel = 'Expires Today';
            } else if (daysLeft === 1) {
              urgencyBadgeClass = 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 font-bold';
              urgencyLabel = 'Expires Tomorrow';
            } else if (daysLeft < 0) {
              urgencyBadgeClass = 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 font-semibold';
              urgencyLabel = `Expired (${Math.abs(daysLeft)}d ago)`;
            } else if (daysLeft <= 3) {
              urgencyBadgeClass = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 font-semibold';
              urgencyLabel = `In ${daysLeft} days`;
            } else {
              urgencyBadgeClass = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 font-medium';
              urgencyLabel = `In ${daysLeft} days`;
            }

            return (
              <div
                key={membership.id}
                id={`expiring-item-${student.id}`}
                onClick={() => onSelectStudent && onSelectStudent(student)}
                className="p-3.5 sm:p-4 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                {/* Left: Student info & badges */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                    {student.fullName.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {student.fullName}
                      </h4>
                      {student.studentId && (
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                          {student.studentId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-wrap">
                      {seat && (
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200 dark:border-neutral-700">
                          <Armchair className="w-3 h-3 text-neutral-400" />
                          <span>Seat {seat.seatNumber}</span>
                        </span>
                      )}
                      {shift && (
                        <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                          {shift.name}
                        </span>
                      )}
                      {membership.planName && (
                        <>
                          <span>•</span>
                          <span className="text-neutral-400 dark:text-neutral-500 text-xs">
                            {membership.planName}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Expiry Date & Dues */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${urgencyBadgeClass}`}>
                        <Clock className="w-3 h-3" />
                        <span>{urgencyLabel}</span>
                      </span>

                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                        Ends: {formatDisplayDate(membership.endDate)}
                      </span>

                      {hasDue ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 px-1.5 py-0.2 rounded">
                          ₹{membership.outstandingAmount?.toLocaleString('en-IN')} Due
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                          Fees Cleared
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                  {/* WhatsApp Reminder Button */}
                  <button
                    type="button"
                    id={`whatsapp-remind-${student.id}`}
                    onClick={(e) => handleReminderClick(item, e)}
                    className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs group/btn"
                    title="Send WhatsApp reminder for upcoming expiry or fee due"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Phone Call Button */}
                  <a
                    href={`tel:${student.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors shadow-2xs"
                    title={`Call ${student.fullName}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                  </a>

                  {/* Renew / Collect Shortcut Button */}
                  <button
                    type="button"
                    id={`renew-student-${student.id}`}
                    onClick={(e) => handleRenewClick(item, e)}
                    className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold transition-colors"
                    title={hasDue ? 'Collect pending fee balance' : 'Renew seat membership'}
                  >
                    {hasDue ? 'Collect' : 'Renew'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Widget Footer Status Note */}
      {expiringItems.length > 0 && (
        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/60 dark:border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Tip: Reach out early to lock in re-enrollments and prevent seat churn.
            </span>
          </div>
          <span className="font-mono text-slate-400 dark:text-slate-500">
            Window: Today + Next 7 Days
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Armchair,
  Clock,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  UserCheck,
  MessageCircle,
} from 'lucide-react';
import { Student, Seat, Shift, Membership, Payment, Business } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { ReminderContext, ReminderType } from '../../utils/whatsapp';

interface StudentProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  seat?: Seat;
  shift?: Shift;
  membership?: Membership;
  payments: Payment[];
  onAssignSeat: (student: Student) => void;
  onRecordPayment: (student: Student, membership?: Membership) => void;
  onOpenWhatsAppReminder?: (ctx: ReminderContext, initialType?: ReminderType) => void;
  business?: Business;
}

export const StudentProfileSheet: React.FC<StudentProfileSheetProps> = ({
  isOpen,
  onClose,
  student,
  seat,
  shift,
  membership,
  payments,
  onAssignSeat,
  onRecordPayment,
  onOpenWhatsAppReminder,
  business,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');

  if (!student) return null;

  const studentPayments = payments.filter((p) => p.studentId === student.id);

  const formatDisplayDate = (dStr?: string) => {
    if (!dStr) return '—';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dStr;
  };

  const getDaysLeft = (endStr?: string) => {
    if (!endStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endStr);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysLeft = membership ? getDaysLeft(membership.endDate) : null;

  return (
    <BottomSheet
      id={`student-profile-${student.id}`}
      isOpen={isOpen}
      onClose={onClose}
      title={student.fullName}
      subtitle={student.studentId || `Joined ${formatDisplayDate(student.createdAt)}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Student Top Header Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {student.fullName}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    student.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{student.phone}</span>
              </p>
              {student.email && (
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{student.email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            {seat ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-xs font-bold font-mono">
                <Armchair className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>Seat {seat.seatNumber}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                No Seat Assigned
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="student-profile-assign-seat-btn"
            onClick={() => {
              onClose();
              onAssignSeat(student);
            }}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>{seat ? 'Change Seat / Plan' : 'Give Seat'}</span>
          </button>

          <button
            id="student-profile-record-payment-btn"
            onClick={() => {
              onClose();
              onRecordPayment(student, membership);
            }}
            className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Collect Fee</span>
          </button>
        </div>

        {/* WhatsApp Reminder Button */}
        {onOpenWhatsAppReminder && business && (
          <button
            type="button"
            id="student-profile-whatsapp-reminder-btn"
            onClick={() => {
              onClose();
              const hasDue = (membership?.outstandingAmount || 0) > 0;
              const dLeft = daysLeft !== null ? daysLeft : undefined;
              const type: ReminderType =
                hasDue && dLeft !== undefined && dLeft <= 7
                  ? 'both'
                  : hasDue
                  ? 'due'
                  : 'expiry';

              onOpenWhatsAppReminder(
                {
                  studentName: student.fullName,
                  studentPhone: student.phone,
                  businessName: business.name,
                  ownerName: business.ownerName,
                  businessPhone: business.phone,
                  seatNumber: seat?.seatNumber,
                  shiftName: shift?.name,
                  planName: membership?.planName,
                  endDate: membership?.endDate,
                  daysLeft: dLeft,
                  outstandingDue: membership?.outstandingAmount,
                },
                type
              );
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Send WhatsApp Reminder (Expiry / Due)</span>
          </button>
        )}

        {/* Navigation Tabs: Overview vs Payment History */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            id="student-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            id="student-tab-payments"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Fee History</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
              {studentPayments.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENT: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pt-1">
            {/* Membership Details Card */}
            {membership ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-3 shadow-2xs transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Seat & Fee Plan
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      membership.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : membership.status === 'expiring'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {membership.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Fee Plan</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {membership.planName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Shift Timing</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {shift ? `${shift.name} (${shift.startTime} – ${shift.endTime})` : 'Morning'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Start Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDisplayDate(membership.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">End Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDisplayDate(membership.endDate)}
                      {daysLeft !== null && (
                        <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                          ({daysLeft > 0 ? `${daysLeft} days left` : 'Expired'})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Total Fee</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">₹{membership.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Paid</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{membership.paidAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block text-[11px]">Remaining Fee</span>
                    <span
                      className={`font-bold ${
                        membership.outstandingAmount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      ₹{membership.outstandingAmount}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center py-6">
                <Armchair className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">No active seat or plan</div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
                  Give a seat and shift timing to this student.
                </p>
                <button
                  id="student-assign-seat-cta"
                  onClick={() => {
                    onClose();
                    onAssignSeat(student);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
                >
                  Give Seat Now
                </button>
              </div>
            )}

            {/* Notes if any */}
            {student.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Student Notes</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{student.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Payment History */}
        {activeTab === 'payments' && (
          <div className="space-y-3 pt-1">
            {studentPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No fee received for this student yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800/60 overflow-hidden">
                {studentPayments.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {p.method}
                        {p.referenceNo && (
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-1.5">
                            ({p.referenceNo})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDisplayDate(p.date)}
                        {p.notes && <span> • {p.notes}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Received</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

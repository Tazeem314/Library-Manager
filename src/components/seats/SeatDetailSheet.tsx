import React, { useState } from 'react';
import {
  Armchair,
  User,
  Clock,
  Calendar,
  CreditCard,
  ShieldOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { Seat, Student, Shift, Membership } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SeatDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  student?: Student;
  shift?: Shift;
  membership?: Membership;
  onAssignStudent: (seat: Seat) => void;
  onViewStudent: (student: Student) => void;
  onRecordPayment: (student: Student, membership?: Membership) => void;
  onReleaseSeat: (seat: Seat) => void;
  onToggleSeatStatus: (seat: Seat) => void;
}

export const SeatDetailSheet: React.FC<SeatDetailSheetProps> = ({
  isOpen,
  onClose,
  seat,
  student,
  shift,
  membership,
  onAssignStudent,
  onViewStudent,
  onRecordPayment,
  onReleaseSeat,
  onToggleSeatStatus,
}) => {
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  if (!seat) return null;

  const isOccupied = seat.status === 'occupied';
  const isAvailable = seat.status === 'available';
  const isDisabled = seat.status === 'disabled';

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
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = membership ? getDaysLeft(membership.endDate) : null;

  return (
    <>
      <BottomSheet
        id={`seat-detail-${seat.seatNumber}`}
        isOpen={isOpen}
        onClose={onClose}
        title={`Seat ${seat.seatNumber}`}
        subtitle={`Row ${seat.row} • ${seat.status === 'available' ? 'EMPTY / FREE' : seat.status === 'occupied' ? 'OCCUPIED' : 'CLOSED'}`}
      >
        <div className="space-y-5">
          {/* Status Badge & Header */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                  isOccupied
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                    : isAvailable
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Seat Status</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {isAvailable ? 'Empty / Free' : isOccupied ? 'Occupied' : 'Closed'}
                </div>
              </div>
            </div>

            {isOccupied && membership && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  membership.outstandingAmount === 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                }`}
              >
                {membership.outstandingAmount === 0 ? 'Fully Paid' : `₹${membership.outstandingAmount} Remaining Fee`}
              </span>
            )}
          </div>

          {/* OCCUPIED SEAT VIEW */}
          {isOccupied && student && (
            <div className="space-y-4">
              {/* Student Info Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-2xs space-y-3 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {student.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{student.phone}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    id="seat-detail-view-student-btn"
                    onClick={() => {
                      onClose();
                      onViewStudent(student);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    View Student
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Shift / Timing</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {shift ? `${shift.name} (${shift.startTime} – ${shift.endTime})` : 'Morning'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Fee Plan</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {membership?.planName || 'Monthly'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">Start Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDisplayDate(membership?.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 block font-medium">End Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDisplayDate(membership?.endDate)}{' '}
                      {daysLeft !== null && (
                        <span className={`text-[10px] ${daysLeft < 5 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                          ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Status Summary */}
                {membership && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Total Fee / Paid</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{membership.totalAmount} / ₹{membership.paidAmount}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-slate-400 block">Remaining Fee</span>
                      <span className={`font-bold ${membership.outstandingAmount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        ₹{membership.outstandingAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Occupied Actions */}
              <div className="space-y-2 pt-1">
                <button
                  id="seat-detail-record-payment-btn"
                  onClick={() => {
                    onClose();
                    onRecordPayment(student, membership);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Collect Fee</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="seat-detail-change-student-btn"
                    onClick={() => {
                      onClose();
                      onAssignStudent(seat);
                    }}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Change Student / Seat</span>
                  </button>

                  <button
                    id="seat-detail-release-seat-btn"
                    onClick={() => setConfirmRelease(true)}
                    className="py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Vacate Seat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AVAILABLE SEAT VIEW */}
          {isAvailable && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <div className="text-base font-bold">Seat is Empty & Free</div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-xs mx-auto">
                  Ready to be given to any student for any shift.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  id="seat-detail-assign-student-btn"
                  onClick={() => {
                    onClose();
                    onAssignStudent(seat);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Book Seat for Student</span>
                </button>

                <button
                  id="seat-detail-disable-seat-btn"
                  onClick={() => setConfirmDisable(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldOff className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Close Seat (For Repair)</span>
                </button>
              </div>
            </div>
          )}

          {/* DISABLED SEAT VIEW */}
          {isDisabled && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-center space-y-1">
                <ShieldOff className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                <div className="text-base font-bold text-slate-800 dark:text-white">Seat is Closed</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  This seat is closed for maintenance or repair. You can open it anytime.
                </p>
              </div>

              <button
                id="seat-detail-enable-seat-btn"
                onClick={() => {
                  onToggleSeatStatus(seat);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Open Seat</span>
              </button>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Confirmation for Vacate Seat */}
      <ConfirmDialog
        id="confirm-release-seat-dialog"
        isOpen={confirmRelease}
        title={`Vacate Seat ${seat.seatNumber}?`}
        message={`Are you sure you want to vacate Seat ${seat.seatNumber}? The seat will become empty and free for other students.`}
        confirmLabel="Vacate Seat"
        isDestructive={true}
        onConfirm={() => {
          setConfirmRelease(false);
          onReleaseSeat(seat);
          onClose();
        }}
        onCancel={() => setConfirmRelease(false)}
      />

      {/* Confirmation for Close Seat */}
      <ConfirmDialog
        id="confirm-disable-seat-dialog"
        isOpen={confirmDisable}
        title={`Close Seat ${seat.seatNumber}?`}
        message="This seat will be marked as closed and cannot be booked until reopened."
        confirmLabel="Close Seat"
        isDestructive={false}
        onConfirm={() => {
          setConfirmDisable(false);
          onToggleSeatStatus(seat);
          onClose();
        }}
        onCancel={() => setConfirmDisable(false)}
      />
    </>
  );
};

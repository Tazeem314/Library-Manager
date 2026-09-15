import React, { memo } from 'react';
import { Phone, Armchair, ChevronRight } from 'lucide-react';
import { Student, Seat, Shift, Membership } from '../../types';

interface StudentCardProps {
  student: Student;
  seat?: Seat;
  shift?: Shift;
  membership?: Membership;
  onSelect: (student: Student) => void;
}

const StudentCardComponent: React.FC<StudentCardProps> = ({
  student,
  seat,
  shift,
  membership,
  onSelect,
}) => {
  return (
    <div
      id={`student-card-${student.id}`}
      onClick={() => onSelect(student)}
      className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
          {student.fullName.charAt(0)}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
              {student.fullName}
            </h4>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-sm shrink-0 uppercase tracking-wider ${
                student.status === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {student.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              {student.phone}
            </span>
            {shift && (
              <>
                <span>•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{shift.name}</span>
              </>
            )}
          </div>

          {/* Seat & Due Badges */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {seat ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 rounded-sm font-mono">
                <Armchair className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>Seat {seat.seatNumber}</span>
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                No Seat
              </span>
            )}

            {membership && membership.outstandingAmount > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.2 rounded-sm">
                ₹{membership.outstandingAmount} Fee Due
              </span>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
    </div>
  );
};

export const StudentCard = memo(StudentCardComponent);

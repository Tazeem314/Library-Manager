import React, { memo } from 'react';
import { User, ShieldOff, Check } from 'lucide-react';
import { Seat, Student, Shift } from '../../types';

interface SeatTileProps {
  seat: Seat;
  student?: Student;
  shift?: Shift;
  onSelect: (seat: Seat) => void;
}

const SeatTileComponent: React.FC<SeatTileProps> = ({
  seat,
  student,
  shift,
  onSelect,
}) => {
  const isOccupied = seat.status === 'occupied';
  const isAvailable = seat.status === 'available';
  const isDisabled = seat.status === 'disabled';

  // Short student name (e.g. "Rahul K.")
  const getShortName = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  };

  return (
    <button
      type="button"
      id={`seat-tile-${seat.seatNumber}`}
      onClick={() => onSelect(seat)}
      className={`relative flex flex-col justify-between p-2.5 sm:p-3 rounded-lg border text-left transition-transform duration-100 min-h-[70px] sm:min-h-[78px] shadow-2xs hover:shadow-xs group hover:-translate-y-0.5 active:scale-[0.98] will-change-transform ${
        isOccupied
          ? 'bg-slate-50/90 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800'
          : isAvailable
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-850'
          : 'bg-slate-100/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 cursor-pointer'
      }`}
    >
      {/* Top Row: Seat Number & Status Indicator */}
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-xs sm:text-sm font-bold tracking-tight font-mono ${
            isOccupied ? 'text-slate-900 dark:text-white' : isAvailable ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600'
          }`}
        >
          {seat.seatNumber}
        </span>

        {isOccupied && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="hidden sm:inline">Occ</span>
          </span>
        )}

        {isAvailable && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-1.5 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="hidden sm:inline">Free</span>
          </span>
        )}

        {isDisabled && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
            <ShieldOff className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Bottom Row: Student Name or Status Text */}
      <div className="w-full mt-1 overflow-hidden">
        {isOccupied && student ? (
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">
              {getShortName(student.fullName)}
            </div>
            {shift && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {shift.name}
              </div>
            )}
          </div>
        ) : isAvailable ? (
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            Available
          </div>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-600 truncate">
            Closed
          </div>
        )}
      </div>
    </button>
  );
};

export const SeatTile = memo(SeatTileComponent);

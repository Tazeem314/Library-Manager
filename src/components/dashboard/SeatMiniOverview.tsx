import React from 'react';
import { ArrowRight, Armchair, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Seat } from '../../types';

interface SeatMiniOverviewProps {
  seats: Seat[];
  onViewAllSeats: () => void;
}

export const SeatMiniOverview: React.FC<SeatMiniOverviewProps> = ({
  seats,
  onViewAllSeats,
}) => {
  const total = seats.length || 100;
  const occupied = seats.filter((s) => s.status === 'occupied').length;
  const available = seats.filter((s) => s.status === 'available').length;
  const disabled = seats.filter((s) => s.status === 'disabled').length;

  const occupiedPct = Math.round((occupied / total) * 100);
  const availablePct = Math.round((available / total) * 100);
  const disabledPct = Math.round((disabled / total) * 100);

  // Group seats by row for mini visual representation
  const rows = ['A', 'B', 'C', 'D'];

  return (
    <div
      id="dashboard-seat-overview"
      className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Seat Overview</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time status across all {total} seats
          </p>
        </div>

        <button
          id="dashboard-view-all-seats-btn"
          onClick={onViewAllSeats}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>All Seats</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Distribution Numbers & Legend */}
      <div className="grid grid-cols-3 gap-3 py-2 border-y border-slate-100 dark:border-slate-800">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white"></span>
            <span>Occupied</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {occupied}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({occupiedPct}%)</span>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Empty / Free</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {available}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({availablePct}%)</span>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span>Blocked / Off</span>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {disabled}{' '}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({disabledPct}%)</span>
          </span>
        </div>
      </div>

      {/* Proportional Segment Bar */}
      <div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${occupiedPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-blue-600 h-full"
            title={`Occupied: ${occupied} seats`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${availablePct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
            className="bg-emerald-500 h-full"
            title={`Empty / Free: ${available} seats`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${disabledPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="bg-slate-300 dark:bg-slate-700 h-full"
            title={`Blocked: ${disabled} seats`}
          />
        </div>
      </div>

      {/* Mini Visual Seat Grid Preview (Condensed rows preview) */}
      <div className="pt-1">
        <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Seat Rows (A – D)
        </div>
        <div className="space-y-1.5">
          {rows.map((rowLetter) => {
            const rowSeats = seats.filter((s) => s.row === rowLetter);
            return (
              <div key={rowLetter} className="flex items-center gap-2">
                <span className="w-4 text-xs font-bold text-slate-400 dark:text-slate-500 text-center">
                  {rowLetter}
                </span>
                <div className="flex-1 flex gap-1 overflow-hidden py-0.5">
                  {rowSeats.slice(0, 25).map((seat) => {
                    const isOcc = seat.status === 'occupied';
                    const isDis = seat.status === 'disabled';
                    return (
                      <div
                        key={seat.id}
                        title={`Seat ${seat.seatNumber}: ${seat.status}`}
                        className={`h-4 flex-1 min-w-[6px] rounded-xs transition-colors ${
                          isOcc
                            ? 'bg-blue-500/80 hover:bg-blue-600'
                            : isDis
                            ? 'bg-slate-300 dark:bg-slate-700'
                            : 'bg-emerald-400/80 hover:bg-emerald-500 dark:bg-emerald-500/70'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

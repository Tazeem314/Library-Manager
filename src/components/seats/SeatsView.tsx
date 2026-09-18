import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Armchair, CheckCircle2, UserCheck, ShieldOff } from 'lucide-react';
import { AppState, Seat, Student, Shift, Membership } from '../../types';
import { SeatTile } from './SeatTile';
import { SeatDetailSheet } from './SeatDetailSheet';
import { EmptyState } from '../common/EmptyState';

interface SeatsViewProps {
  state: AppState;
  onAssignStudent: (seat: Seat) => void;
  onViewStudent: (student: Student) => void;
  onRecordPayment: (student: Student, membership?: Membership) => void;
  onReleaseSeat: (seat: Seat) => void;
  onToggleSeatStatus: (seat: Seat) => void;
}

export const SeatsView: React.FC<SeatsViewProps> = ({
  state,
  onAssignStudent,
  onViewStudent,
  onRecordPayment,
  onReleaseSeat,
  onToggleSeatStatus,
}) => {
  const { seats, students, shifts, memberships } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'disabled'>('all');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Student lookup map
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    for (const stu of students) {
      map.set(stu.id, stu);
    }
    return map;
  }, [students]);

  // Shift lookup map
  const shiftMap = useMemo(() => {
    const map = new Map<string, Shift>();
    for (const sh of shifts) {
      map.set(sh.id, sh);
    }
    return map;
  }, [shifts]);

  // Membership lookup map
  const membershipMap = useMemo(() => {
    const map = new Map<string, Membership>();
    for (const mem of memberships) {
      map.set(mem.id, mem);
    }
    return map;
  }, [memberships]);

  // Filtered Seats
  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      // Status filter
      if (statusFilter !== 'all' && seat.status !== statusFilter) {
        return false;
      }

      // Shift filter
      if (selectedShiftId !== 'all') {
        if (seat.status !== 'occupied' || seat.currentShiftId !== selectedShiftId) {
          return false;
        }
      }

      // Search query (matches seat number like "A01" or student name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesSeatNum = seat.seatNumber.toLowerCase().includes(query);
        const student = seat.currentStudentId ? studentMap.get(seat.currentStudentId) : null;
        const matchesStudent = student?.fullName.toLowerCase().includes(query) || false;
        if (!matchesSeatNum && !matchesStudent) {
          return false;
        }
      }

      return true;
    });
  }, [seats, statusFilter, selectedShiftId, searchQuery, studentMap]);

  // Group seats by Row (A, B, C, D)
  const groupedSeats = useMemo(() => {
    const groups: { [key: string]: Seat[] } = {};
    for (const s of filteredSeats) {
      if (!groups[s.row]) {
        groups[s.row] = [];
      }
      groups[s.row].push(s);
    }
    return groups;
  }, [filteredSeats]);

  const totalSeats = seats.length;
  const availableCount = seats.filter((s) => s.status === 'available').length;
  const occupiedCount = seats.filter((s) => s.status === 'occupied').length;
  const disabledCount = seats.filter((s) => s.status === 'disabled').length;

  return (
    <div id="seats-view" className="space-y-4 pb-20 md:pb-8">
      {/* Top Filter Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
        {/* Search & Shift row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="seat-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seat number (e.g. A01) or student name..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                id="clear-seat-search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Shift Selector */}
          <div className="w-full sm:w-56">
            <select
              id="seat-shift-filter"
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Shift Timings</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} – {shift.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            id="filter-status-all"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            All ({totalSeats})
          </button>

          <button
            id="filter-status-available"
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'available'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 border border-emerald-200/60 dark:border-emerald-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'available' ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Available ({availableCount})</span>
          </button>

          <button
            id="filter-status-occupied"
            onClick={() => setStatusFilter('occupied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'occupied'
                ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'occupied' ? 'bg-white' : 'bg-blue-600'}`} />
            <span>Occupied ({occupiedCount})</span>
          </button>

          <button
            id="filter-status-disabled"
            onClick={() => setStatusFilter('disabled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'disabled'
                ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldOff className="w-3 h-3" />
            <span>Closed ({disabledCount})</span>
          </button>
        </div>
      </div>

      {/* Visual Seat Matrix */}
      {filteredSeats.length === 0 ? (
        <EmptyState
          id="no-seats-found-empty-state"
          icon={Armchair}
          title="No seats match your search"
          description="Try clearing your search or filter to see all seats."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setSelectedShiftId('all');
          }}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {Object.keys(groupedSeats).sort().map((rowLetter, index) => (
            <div
              key={rowLetter}
              id={`seat-row-${rowLetter}`}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 transition-colors"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {rowLetter}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
                    Row {rowLetter}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    ({groupedSeats[rowLetter].length} seats)
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Click or tap any seat to view
                </span>
              </div>

              {/* Grid of seat tiles: 4 col on mobile (360-430px), 5 col on tablet, 8-10 on desktop */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-2.5">
                {groupedSeats[rowLetter].map((seat) => {
                  const student = seat.currentStudentId
                    ? studentMap.get(seat.currentStudentId)
                    : undefined;
                  const shift = seat.currentShiftId
                    ? shiftMap.get(seat.currentShiftId)
                    : undefined;

                  return (
                    <SeatTile
                      key={seat.id}
                      seat={seat}
                      student={student}
                      shift={shift}
                      onSelect={(s) => setSelectedSeat(s)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Seat Detail Bottom Sheet */}
      {selectedSeat && (
        <SeatDetailSheet
          isOpen={Boolean(selectedSeat)}
          onClose={() => setSelectedSeat(null)}
          seat={selectedSeat}
          student={
            selectedSeat.currentStudentId
              ? studentMap.get(selectedSeat.currentStudentId)
              : undefined
          }
          shift={
            selectedSeat.currentShiftId
              ? shiftMap.get(selectedSeat.currentShiftId)
              : undefined
          }
          membership={
            selectedSeat.currentMembershipId
              ? membershipMap.get(selectedSeat.currentMembershipId)
              : undefined
          }
          onAssignStudent={onAssignStudent}
          onViewStudent={onViewStudent}
          onRecordPayment={onRecordPayment}
          onReleaseSeat={onReleaseSeat}
          onToggleSeatStatus={onToggleSeatStatus}
        />
      )}
    </div>
  );
};

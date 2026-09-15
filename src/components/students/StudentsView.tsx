import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Users, Armchair } from 'lucide-react';
import { AppState, Student, Seat, Shift, Membership, Payment } from '../../types';
import { StudentCard } from './StudentCard';
import { StudentProfileSheet } from './StudentProfileSheet';
import { EmptyState } from '../common/EmptyState';
import { ReminderContext, ReminderType } from '../../utils/whatsapp';

interface StudentsViewProps {
  state: AppState;
  onOpenAddStudent: () => void;
  onAssignSeat: (student: Student) => void;
  onRecordPayment: (student: Student, membership?: Membership) => void;
  onOpenWhatsAppReminder?: (ctx: ReminderContext, initialType?: ReminderType) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  state,
  onOpenAddStudent,
  onAssignSeat,
  onRecordPayment,
  onOpenWhatsAppReminder,
}) => {
  const { students, seats, shifts, memberships, payments } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assigned' | 'unassigned' | 'due'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Lookup maps
  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    for (const seat of seats) {
      map.set(seat.id, seat);
    }
    return map;
  }, [seats]);

  const shiftMap = useMemo(() => {
    const map = new Map<string, Shift>();
    for (const shift of shifts) {
      map.set(shift.id, shift);
    }
    return map;
  }, [shifts]);

  const membershipMapByStudent = useMemo(() => {
    const map = new Map<string, Membership>();
    for (const mem of memberships) {
      if (mem.status !== 'expired') {
        map.set(mem.studentId, mem);
      }
    }
    return map;
  }, [memberships]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      // Filter by assignment or due status
      if (filterType === 'assigned' && !stu.seatId) return false;
      if (filterType === 'unassigned' && stu.seatId) return false;
      if (filterType === 'due') {
        const mem = membershipMapByStudent.get(stu.id);
        if (!mem || mem.outstandingAmount <= 0) return false;
      }

      // Filter by search query (name, phone, studentId, or seatNumber)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (stu.fullName || '').toLowerCase().includes(query);
        const matchesPhone = (stu.phone || '').includes(query);
        const matchesCode = stu.studentId?.toLowerCase().includes(query) || false;
        const seat = stu.seatId ? seatMap.get(stu.seatId) : null;
        const matchesSeat = seat?.seatNumber.toLowerCase().includes(query) || false;

        if (!matchesName && !matchesPhone && !matchesCode && !matchesSeat) {
          return false;
        }
      }

      return true;
    });
  }, [students, filterType, searchQuery, seatMap, membershipMapByStudent]);

  const totalCount = students.length;
  const assignedCount = students.filter((s) => Boolean(s.seatId)).length;
  const unassignedCount = students.filter((s) => !s.seatId).length;
  const dueCount = students.filter((s) => {
    const mem = membershipMapByStudent.get(s.id);
    return mem && mem.outstandingAmount > 0;
  }).length;

  return (
    <div id="students-view" className="space-y-4 pb-20 md:pb-8">
      {/* Search & Actions Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, phone, or seat..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                id="clear-student-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            id="students-add-student-btn"
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            id="filter-students-all"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            All Students ({totalCount})
          </button>
          <button
            id="filter-students-assigned"
            onClick={() => setFilterType('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'assigned'
                ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
            }`}
          >
            Has Seat ({assignedCount})
          </button>
          <button
            id="filter-students-unassigned"
            onClick={() => setFilterType('unassigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'unassigned'
                ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            No Seat Yet ({unassignedCount})
          </button>
          <button
            id="filter-students-due"
            onClick={() => setFilterType('due')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filterType === 'due'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/60'
            }`}
          >
            Fee Due ({dueCount})
          </button>
        </div>
      </div>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          id="no-students-empty-state"
          icon={Users}
          title={students.length === 0 ? 'No students yet' : 'No matching students found'}
          description={
            students.length === 0
              ? 'Add your first student to start giving seats and collecting fees.'
              : 'Try clearing your search to see all students.'
          }
          actionLabel={students.length === 0 ? 'Add Student' : 'Clear Search'}
          onAction={students.length === 0 ? onOpenAddStudent : () => setSearchQuery('')}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredStudents.map((student) => {
            const seat = student.seatId ? seatMap.get(student.seatId) : undefined;
            const shift = student.shiftId ? shiftMap.get(student.shiftId) : undefined;
            const membership = membershipMapByStudent.get(student.id);

            return (
              <StudentCard
                key={student.id}
                student={student}
                seat={seat}
                shift={shift}
                membership={membership}
                onSelect={(s) => setSelectedStudent(s)}
              />
            );
          })}
        </div>
      )}

      {/* Student Profile Bottom Sheet */}
      {selectedStudent && (
        <StudentProfileSheet
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          seat={selectedStudent.seatId ? seatMap.get(selectedStudent.seatId) : undefined}
          shift={selectedStudent.shiftId ? shiftMap.get(selectedStudent.shiftId) : undefined}
          membership={membershipMapByStudent.get(selectedStudent.id)}
          payments={payments}
          onAssignSeat={(stu) => {
            setSelectedStudent(null);
            onAssignSeat(stu);
          }}
          onRecordPayment={(stu, mem) => {
            setSelectedStudent(null);
            onRecordPayment(stu, mem);
          }}
          onOpenWhatsAppReminder={onOpenWhatsAppReminder}
          business={state.business}
        />
      )}
    </div>
  );
};

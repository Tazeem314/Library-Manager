import React, { useState, useEffect, useMemo } from 'react';
import {
  Armchair,
  User,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { AppState, Seat, Student, Shift, MembershipPlan, PaymentMethod } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

interface AssignSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  initialSeat?: Seat | null;
  initialStudent?: Student | null;
  onConfirmAssignment: (data: {
    seatId: string;
    studentId?: string;
    newStudent?: { fullName: string; phone: string; email?: string; notes?: string };
    shiftId: string;
    planId: string;
    startDate: string;
    endDate: string;
    paidAmount: number;
    paymentMethod: PaymentMethod;
  }) => void;
}

export const AssignSeatModal: React.FC<AssignSeatModalProps> = ({
  isOpen,
  onClose,
  state,
  initialSeat,
  initialStudent,
  onConfirmAssignment,
}) => {
  const { seats, students, shifts, plans } = state;

  // Form State
  const [selectedSeatId, setSelectedSeatId] = useState<string>('');
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // New Student fields
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');

  // Shift & Plan
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Dates
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Payment
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const [error, setError] = useState<string | null>(null);

  // Available seats list
  const availableSeats = useMemo(() => {
    return seats.filter((s) => s.status === 'available');
  }, [seats]);

  // Selected plan object
  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId);
  }, [plans, selectedPlanId]);

  // Track previous isOpen state to initialize when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);

    // Set Seat
    if (initialSeat) {
      setSelectedSeatId(initialSeat.id);
    } else {
      const firstFree = seats.find((s) => s.status === 'available');
      setSelectedSeatId(firstFree ? firstFree.id : (seats[0]?.id || ''));
    }

    // Set Student
    if (initialStudent) {
      setStudentMode('existing');
      setSelectedStudentId(initialStudent.id);
    } else if (students.length === 0) {
      setStudentMode('new');
      setSelectedStudentId('');
    } else {
      setStudentMode('existing');
      setSelectedStudentId(students[0]?.id || '');
    }

    // Reset new student fields
    setNewFullName('');
    setNewPhone('');
    setNewEmail('');
    setStudentSearch('');

    // Set Shift
    const activeShift = shifts.find((s) => s.active) || shifts[0];
    setSelectedShiftId(activeShift ? activeShift.id : '');

    // Set Plan & initial duration/payment
    const activePlan = plans.find((p) => p.active) || plans[0];
    if (activePlan) {
      setSelectedPlanId(activePlan.id);
      setPaidAmount(activePlan.price);
      const d = new Date(today);
      d.setDate(d.getDate() + activePlan.durationDays);
      setEndDate(d.toISOString().split('T')[0]);
    } else {
      setSelectedPlanId('');
      setPaidAmount(0);
      setEndDate(today);
    }

    setPaymentMethod('UPI');
  }, [isOpen, initialSeat, initialStudent, seats, students, shifts, plans]);

  // Explicit handler when user switches Plan in dropdown
  const handlePlanChange = (newPlanId: string) => {
    setSelectedPlanId(newPlanId);
    const plan = plans.find((p) => p.id === newPlanId);
    if (plan) {
      setPaidAmount(plan.price);
      if (startDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + plan.durationDays);
        setEndDate(d.toISOString().split('T')[0]);
      }
    }
  };

  // Explicit handler when user changes Start Date
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    if (selectedPlan && newStartDate) {
      const d = new Date(newStartDate);
      d.setDate(d.getDate() + selectedPlan.durationDays);
      setEndDate(d.toISOString().split('T')[0]);
    }
  };

  // Filtered existing students for selection
  const filteredExistingStudents = useMemo(() => {
    let list = students;
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      list = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.studentId && s.studentId.toLowerCase().includes(q))
      );
    }
    if (selectedStudentId && !list.some((s) => s.id === selectedStudentId)) {
      const sel = students.find((s) => s.id === selectedStudentId);
      if (sel) {
        list = [sel, ...list];
      }
    }
    return list;
  }, [students, studentSearch, selectedStudentId]);

  const activeSelectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSeatId) {
      setError('Please select an available seat.');
      return;
    }

    if (studentMode === 'existing') {
      if (!selectedStudentId) {
        setError('Please select a student from the list.');
        return;
      }
    } else {
      if (!newFullName.trim()) {
        setError('Please enter student full name.');
        return;
      }
      const cleanPhone = newPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        setError('Please enter a valid 10-digit phone number for the new student.');
        return;
      }
    }

    if (!selectedShiftId) {
      setError('Please select a study shift.');
      return;
    }

    if (!selectedPlanId) {
      setError('Please select a fee plan.');
      return;
    }

    if (paidAmount < 0) {
      setError('Paid amount cannot be negative.');
      return;
    }

    onConfirmAssignment({
      seatId: selectedSeatId,
      studentId: studentMode === 'existing' ? selectedStudentId : undefined,
      newStudent:
        studentMode === 'new'
          ? {
              fullName: newFullName.trim(),
              phone: newPhone.replace(/[^0-9]/g, ''),
              email: newEmail.trim() || undefined,
            }
          : undefined,
      shiftId: selectedShiftId,
      planId: selectedPlanId,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || startDate || new Date().toISOString().split('T')[0],
      paidAmount: Number(paidAmount) || 0,
      paymentMethod,
    });

    onClose();
  };

  const currentSeat = seats.find((s) => s.id === selectedSeatId);
  const outstanding = selectedPlan ? Math.max(0, selectedPlan.price - paidAmount) : 0;

  return (
    <BottomSheet
      id="assign-seat-sheet"
      isOpen={isOpen}
      onClose={onClose}
      title={currentSeat ? `Book Seat ${currentSeat.seatNumber}` : 'Book Seat for Student'}
      subtitle="Give seat to student, choose shift timing, and collect fee"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Seat Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            1. Choose Seat <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Armchair className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="assign-seat-select"
              required
              value={selectedSeatId}
              onChange={(e) => {
                setSelectedSeatId(e.target.value);
                setError(null);
              }}
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
            >
              {!selectedSeatId && <option value="">-- Choose Seat --</option>}
              {currentSeat && currentSeat.status !== 'available' && (
                <option value={currentSeat.id}>
                  Seat {currentSeat.seatNumber} (Row {currentSeat.row} - Current Selection)
                </option>
              )}
              {availableSeats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  Seat {seat.seatNumber} (Row {seat.row} - Free & Available)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 2: Student Selection (Existing vs New) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Student Details <span className="text-rose-500">*</span>
            </label>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                type="button"
                id="assign-mode-existing-btn"
                onClick={() => {
                  setStudentMode('existing');
                  setError(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  studentMode === 'existing'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Existing ({students.length})</span>
              </button>
              <button
                type="button"
                id="assign-mode-new-btn"
                onClick={() => {
                  setStudentMode('new');
                  setError(null);
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  studentMode === 'new'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Student</span>
              </button>
            </div>
          </div>

          {studentMode === 'existing' ? (
            <div className="space-y-2">
              {initialStudent && activeSelectedStudent && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeSelectedStudent.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {activeSelectedStudent.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeSelectedStudent.phone} • {activeSelectedStudent.studentId || 'Enrolled'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    Selected
                  </span>
                </div>
              )}

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student by name, phone or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <select
                id="assign-existing-student-select"
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setError(null);
                }}
                className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
              >
                {students.length === 0 ? (
                  <option value="">No students added yet — switch to + New Student</option>
                ) : (
                  <>
                    {!selectedStudentId && <option value="">-- Choose student from list --</option>}
                    {filteredExistingStudents.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.fullName} ({stu.phone}) {stu.seatId ? '• [Already has seat]' : '• [No Seat]'}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="assign-new-student-name"
                  type="text"
                  required={studentMode === 'new'}
                  value={newFullName}
                  onChange={(e) => {
                    setNewFullName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full py-2 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="assign-new-student-phone"
                    type="tel"
                    required={studentMode === 'new'}
                    value={newPhone}
                    onChange={(e) => {
                      setNewPhone(e.target.value);
                      setError(null);
                    }}
                    placeholder="10-digit mobile number"
                    className="w-full py-2 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    id="assign-new-student-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full py-2 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: Shift & Fee Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              3. Shift Timing <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="assign-shift-select"
                required
                value={selectedShiftId}
                onChange={(e) => {
                  setSelectedShiftId(e.target.value);
                  setError(null);
                }}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
              >
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} – {shift.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              4. Fee Plan <span className="text-rose-500">*</span>
            </label>
            <select
              id="assign-plan-select"
              required
              value={selectedPlanId}
              onChange={(e) => {
                handlePlanChange(e.target.value);
                setError(null);
              }}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price} ({p.durationDays} days)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 4: Start Date & End Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="assign-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              End Date (Auto)
            </label>
            <input
              id="assign-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* STEP 5: Payment Collection */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              5. Fee Payment
            </span>
            {selectedPlan && (
              <span className="text-slate-500 dark:text-slate-400">
                Fee: <strong className="text-slate-900 dark:text-white">₹{selectedPlan.price}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Amount Paid (₹)
              </label>
              <input
                id="assign-payment-amount"
                type="number"
                min="0"
                value={paidAmount === 0 ? '' : paidAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setPaidAmount(val === '' ? 0 : Math.max(0, Number(val) || 0));
                }}
                placeholder="0"
                className="w-full py-2 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-emerald-800 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                id="assign-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full py-2 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {outstanding > 0 && (
            <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/70 dark:border-amber-800 flex items-center justify-between">
              <span>Remaining Fee:</span>
              <strong className="text-xs font-bold">₹{outstanding}</strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            id="assign-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="assign-confirm-btn"
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Book Seat & Save</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

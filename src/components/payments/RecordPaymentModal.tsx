import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Calendar, User, FileText, Hash, AlertCircle } from 'lucide-react';
import { AppState, Student, Membership, PaymentMethod } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  initialStudent?: Student | null;
  initialMembership?: Membership | null;
  onSavePayment: (data: {
    studentId: string;
    studentName: string;
    membershipId?: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    referenceNo?: string;
    notes?: string;
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  state,
  initialStudent,
  initialMembership,
  onSavePayment,
}) => {
  const { students, memberships } = state;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync initial student on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialStudent) {
        setSelectedStudentId(initialStudent.id);
      } else if (students.length > 0) {
        setSelectedStudentId(students[0].id);
      }
      setDate(todayStr);
      setReferenceNo('');
      setNotes('');
    }
  }, [isOpen, initialStudent, students, todayStr]);

  // Find selected student
  const student = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Find active membership for this student
  const membership = useMemo(() => {
    if (initialMembership && initialMembership.studentId === selectedStudentId) {
      return initialMembership;
    }
    return memberships.find((m) => m.studentId === selectedStudentId && m.status !== 'expired');
  }, [memberships, selectedStudentId, initialMembership]);

  // Update default amount to outstanding or plan price
  useEffect(() => {
    if (membership) {
      if (membership.outstandingAmount > 0) {
        setAmount(membership.outstandingAmount);
      } else {
        setAmount(membership.totalAmount);
      }
    } else {
      setAmount(1000);
    }
  }, [membership]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId || !student) {
      setError('Please select a student.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Fee amount must be greater than zero.');
      return;
    }

    onSavePayment({
      studentId: student.id,
      studentName: student.fullName,
      membershipId: membership?.id,
      amount: numAmount,
      method,
      date,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <BottomSheet
      id="record-payment-sheet"
      isOpen={isOpen}
      onClose={onClose}
      title="Collect Fee"
      subtitle="Save fee received from student"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Student Selection */}
        {students.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>No Enrolled Students Yet</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300">
              Please add a student or assign a seat first to collect their fee.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Student <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="payment-student-select"
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
              >
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} ({stu.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Linked Membership Card Preview */}
        {membership ? (
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold">
              <span>Fee Plan: {membership.planName}</span>
              <span className="font-mono">Total: ₹{membership.totalAmount}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
              <div>
                Paid So Far: <strong className="text-emerald-700 dark:text-emerald-400">₹{membership.paidAmount}</strong>
              </div>
              <div className="text-right">
                Remaining Fee:{' '}
                <strong className={membership.outstandingAmount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                  ₹{membership.outstandingAmount}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            No active plan linked for this student. Recording standalone fee.
          </div>
        )}

        {/* Amount & Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Fee Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              id="payment-amount-input"
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full py-2.5 px-3 text-base font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-emerald-800 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Payment Mode <span className="text-rose-500">*</span>
            </label>
            <select
              id="payment-method-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-medium"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Date & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Payment Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="payment-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              UPI / Transaction Ref No <span className="text-slate-400 dark:text-slate-500 text-[11px]">(Optional)</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="payment-ref-input"
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. UPI/409210..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Notes <span className="text-slate-400 dark:text-slate-500 text-[11px]">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <textarea
              id="payment-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared remaining monthly dues"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            id="cancel-record-payment-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="submit-record-payment-btn"
            type="submit"
            disabled={students.length === 0}
            className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${
              students.length === 0
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Save Fee ₹{amount.toLocaleString('en-IN')}</span>
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};

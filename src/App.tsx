import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, TabType, MoreSubView, Seat, SeatStatus, Student, Membership, Payment, Expense, Shift, MembershipPlan, Business, PaymentMethod } from './types';
import { loadAppState, saveAppState, resetAppState, loadSampleDemoState } from './services/storage';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { SeatsView } from './components/seats/SeatsView';
import { StudentsView } from './components/students/StudentsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { MoreView } from './components/settings/MoreView';
import { AddStudentModal } from './components/students/AddStudentModal';
import { AssignSeatModal } from './components/assign/AssignSeatModal';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';
import { WhatsAppReminderModal } from './components/common/WhatsAppReminderModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SplashScreen } from './components/common/SplashScreen';
import { ReminderContext, ReminderType } from './utils/whatsapp';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { safeSessionStorage } from './utils/safeStorage';

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [moreSubView, setMoreSubView] = useState<MoreSubView>('menu');

  const { user, syncToCloud, loadFromCloud } = useAuth();

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Guard against overwriting remote data before initial cloud load completes
  const cloudSyncReadyRef = useRef<string | null>(null);

  // Initial cloud state load on user login
  useEffect(() => {
    if (!user) {
      cloudSyncReadyRef.current = null;
      return;
    }
    let isSubscribed = true;

    (async () => {
      try {
        const cloudState = await loadFromCloud();
        if (!isSubscribed) return;

        if (cloudState && Array.isArray(cloudState.students) && cloudState.students.length > 0) {
          setState(cloudState);
          saveAppState(cloudState);
          addToast(`Loaded ${cloudState.students.length} students from Cloud Firestore (${user.email})`, 'success');
        } else {
          // If user has no existing records in cloud, backup current local state
          await syncToCloud(state);
          addToast(`Study hall workspace synced with ${user.email}`, 'success');
        }
        cloudSyncReadyRef.current = user.uid;
      } catch (err) {
        console.warn('Initial cloud sync notice:', err);
        cloudSyncReadyRef.current = user.uid;
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  // Save to localStorage and Cloud Firestore with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveAppState(state);
      if (user && cloudSyncReadyRef.current === user.uid) {
        syncToCloud(state);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [state, user, syncToCloud]);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAssignSeatOpen, setIsAssignSeatOpen] = useState(false);
  const [assignInitialSeat, setAssignInitialSeat] = useState<Seat | null>(null);
  const [assignInitialStudent, setAssignInitialStudent] = useState<Student | null>(null);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentInitialStudent, setPaymentInitialStudent] = useState<Student | null>(null);
  const [paymentInitialMembership, setPaymentInitialMembership] = useState<Membership | null>(null);

  // WhatsApp Reminder Modal state
  const [isWhatsAppReminderOpen, setIsWhatsAppReminderOpen] = useState(false);
  const [reminderContext, setReminderContext] = useState<ReminderContext | null>(null);
  const [reminderInitialType, setReminderInitialType] = useState<ReminderType>('expiry');

  const handleOpenWhatsAppReminder = useCallback((ctx: ReminderContext, initialType: ReminderType = 'expiry') => {
    setReminderContext(ctx);
    setReminderInitialType(initialType);
    setIsWhatsAppReminderOpen(true);
  }, []);

  // Quick Action / Trigger Handlers
  const handleOpenAssignSeatFromDashboard = () => {
    setAssignInitialSeat(null);
    setAssignInitialStudent(null);
    setIsAssignSeatOpen(true);
  };

  const handleAssignStudentFromSeat = (seat: Seat) => {
    setAssignInitialSeat(seat);
    setAssignInitialStudent(null);
    setIsAssignSeatOpen(true);
  };

  const handleAssignSeatForStudent = (student: Student) => {
    setAssignInitialSeat(null);
    setAssignInitialStudent(student);
    setIsAssignSeatOpen(true);
  };

  const handleOpenRecordPaymentGeneral = () => {
    setPaymentInitialStudent(null);
    setPaymentInitialMembership(null);
    setIsRecordPaymentOpen(true);
  };

  const handleRecordPaymentForStudent = (student: Student, membership?: Membership) => {
    setPaymentInitialStudent(student);
    setPaymentInitialMembership(membership || null);
    setIsRecordPaymentOpen(true);
  };

  // Navigating from Seat detail to student profile
  const handleViewStudentFromSeat = (student: Student) => {
    setActiveTab('students');
  };

  // Business Logic: Assign Seat Workflow
  const handleConfirmAssignment = (data: {
    seatId: string;
    studentId?: string;
    newStudent?: { fullName: string; phone: string; email?: string; notes?: string };
    shiftId: string;
    planId: string;
    startDate: string;
    endDate: string;
    paidAmount: number;
    paymentMethod: PaymentMethod;
  }) => {
    setState((prevState) => {
      let currentStudentId = data.studentId;
      let newStudentsList = [...prevState.students];
      let assignedStudentName = '';

      // Create new student if needed
      if (data.newStudent) {
        const newStuId = `stu-${Date.now()}`;
        assignedStudentName = data.newStudent.fullName;
        const newStu: Student = {
          id: newStuId,
          fullName: data.newStudent.fullName,
          phone: data.newStudent.phone,
          email: data.newStudent.email,
          notes: data.newStudent.notes,
          studentId: `STU-${1000 + newStudentsList.length + 1}`,
          seatId: data.seatId,
          shiftId: data.shiftId,
          status: 'active',
          createdAt: data.startDate,
        };
        newStudentsList.unshift(newStu);
        currentStudentId = newStuId;
      } else if (currentStudentId) {
        // Update existing student
        const stu = newStudentsList.find((s) => s.id === currentStudentId);
        if (stu) {
          assignedStudentName = stu.fullName;
        }
        newStudentsList = newStudentsList.map((s) =>
          s.id === currentStudentId
            ? { ...s, seatId: data.seatId, shiftId: data.shiftId, status: 'active' as const }
            : s
        );
      }

      if (!currentStudentId) return prevState;

      const plan = prevState.plans.find((p) => p.id === data.planId);
      const planPrice = plan ? plan.price : 1000;
      const planName = plan ? plan.name : 'Monthly';

      const memId = `mem-${Date.now()}`;
      const outstanding = Math.max(0, planPrice - data.paidAmount);

      const newMembership: Membership = {
        id: memId,
        studentId: currentStudentId,
        seatId: data.seatId,
        shiftId: data.shiftId,
        planId: data.planId,
        planName,
        startDate: data.startDate,
        endDate: data.endDate,
        totalAmount: planPrice,
        paidAmount: data.paidAmount,
        outstandingAmount: outstanding,
        status: 'active',
        createdAt: data.startDate,
      };

      // Update seat
      const updatedSeats = prevState.seats.map((seat) => {
        if (seat.id === data.seatId) {
          return {
            ...seat,
            status: 'occupied' as const,
            currentStudentId,
            currentMembershipId: memId,
            currentShiftId: data.shiftId,
          };
        }
        return seat;
      });

      // Record payment if paidAmount > 0
      let updatedPayments = [...prevState.payments];
      if (data.paidAmount > 0) {
        const payId = `pay-${Date.now()}`;
        updatedPayments.unshift({
          id: payId,
          studentId: currentStudentId,
          studentName: assignedStudentName || 'Student',
          membershipId: memId,
          amount: data.paidAmount,
          method: data.paymentMethod,
          date: data.startDate,
          referenceNo: data.paymentMethod === 'UPI' ? `UPI/${Date.now().toString().slice(-8)}` : undefined,
          notes: outstanding === 0 ? 'Full fee payment on booking' : 'Advance fee payment on booking',
          createdAt: data.startDate,
        });
      }

      const assignedSeat = prevState.seats.find((s) => s.id === data.seatId);
      const seatName = assignedSeat ? assignedSeat.seatNumber : 'Seat';
      addToast(`Seat ${seatName} booked for ${assignedStudentName || 'Student'} successfully!`);

      return {
        ...prevState,
        seats: updatedSeats,
        students: newStudentsList,
        memberships: [newMembership, ...prevState.memberships],
        payments: updatedPayments,
      };
    });
  };

  // Release Seat
  const handleReleaseSeat = (seat: Seat) => {
    setState((prevState) => {
      const updatedSeats = prevState.seats.map((s) =>
        s.id === seat.id
          ? {
              ...s,
              status: 'available' as const,
              currentStudentId: undefined,
              currentMembershipId: undefined,
              currentShiftId: undefined,
            }
          : s
      );

      // Unassign seat from student if linked
      const updatedStudents = prevState.students.map((stu) =>
        stu.seatId === seat.id
          ? { ...stu, seatId: undefined, shiftId: undefined }
          : stu
      );

      // Mark membership as expired/unlinked
      const updatedMemberships = prevState.memberships.map((mem) =>
        mem.seatId === seat.id && mem.status === 'active'
          ? { ...mem, status: 'expired' as const }
          : mem
      );

      addToast(`Seat ${seat.seatNumber} is now empty and free.`);

      return {
        ...prevState,
        seats: updatedSeats,
        students: updatedStudents,
        memberships: updatedMemberships,
      };
    });
  };

  // Toggle seat status (Disabled <-> Available)
  const handleToggleSeatStatus = (seat: Seat) => {
    setState((prevState) => {
      const isCurrentlyDisabled = seat.status === 'disabled';
      const newStatus: SeatStatus = isCurrentlyDisabled ? 'available' : 'disabled';

      const updatedSeats = prevState.seats.map((s) =>
        s.id === seat.id ? { ...s, status: newStatus } : s
      );

      addToast(
        isCurrentlyDisabled
          ? `Seat ${seat.seatNumber} is now open and free to book.`
          : `Seat ${seat.seatNumber} is now marked as closed.`
      );

      return {
        ...prevState,
        seats: updatedSeats,
      };
    });
  };

  // Add Student
  const handleAddStudent = (
    studentData: Omit<Student, 'id' | 'createdAt' | 'status'>
  ) => {
    setState((prevState) => {
      const newId = `stu-${Date.now()}`;
      const newStu: Student = {
        id: newId,
        fullName: studentData.fullName,
        phone: studentData.phone,
        email: studentData.email,
        studentId: studentData.studentId || `STU-${1000 + prevState.students.length + 1}`,
        notes: studentData.notes,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };

      addToast(`Student "${studentData.fullName}" added successfully!`);

      return {
        ...prevState,
        students: [newStu, ...prevState.students],
      };
    });
  };

  // Save Recorded Payment
  const handleSavePayment = (data: {
    studentId: string;
    studentName: string;
    membershipId?: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    referenceNo?: string;
    notes?: string;
  }) => {
    setState((prevState) => {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        studentId: data.studentId,
        studentName: data.studentName,
        membershipId: data.membershipId,
        amount: data.amount,
        method: data.method,
        date: data.date,
        referenceNo: data.referenceNo,
        notes: data.notes,
        createdAt: data.date,
      };

      // Update membership paid & outstanding amounts
      let updatedMemberships = [...prevState.memberships];
      if (data.membershipId) {
        updatedMemberships = updatedMemberships.map((m) => {
          if (m.id === data.membershipId) {
            const newPaid = m.paidAmount + data.amount;
            const newOutstanding = Math.max(0, m.totalAmount - newPaid);
            return {
              ...m,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
            };
          }
          return m;
        });
      }

      addToast(`Fee payment of ₹${data.amount.toLocaleString('en-IN')} saved for ${data.studentName}!`);

      return {
        ...prevState,
        payments: [newPayment, ...prevState.payments],
        memberships: updatedMemberships,
      };
    });
  };

  // Membership Plans management
  const handleAddPlan = (planData: Omit<MembershipPlan, 'id'>) => {
    setState((prevState) => {
      const newPlan: MembershipPlan = {
        ...planData,
        id: `plan-${Date.now()}`,
      };
      addToast(`Fee plan "${planData.name}" created successfully!`);
      return {
        ...prevState,
        plans: [...prevState.plans, newPlan],
      };
    });
  };

  const handleUpdatePlan = (updatedPlan: MembershipPlan) => {
    setState((prevState) => ({
      ...prevState,
      plans: prevState.plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    }));
    addToast(`Fee plan "${updatedPlan.name}" updated!`);
  };

  const handleTogglePlanActive = (planId: string) => {
    setState((prevState) => {
      const updatedPlans = prevState.plans.map((p) =>
        p.id === planId ? { ...p, active: !p.active } : p
      );
      const plan = prevState.plans.find((p) => p.id === planId);
      addToast(`Fee plan "${plan?.name}" ${plan?.active ? 'turned off' : 'turned on'}.`);
      return {
        ...prevState,
        plans: updatedPlans,
      };
    });
  };

  // Shift Management
  const handleAddShift = (shiftData: Omit<Shift, 'id'>) => {
    setState((prevState) => {
      const newShift: Shift = {
        ...shiftData,
        id: `shift-${Date.now()}`,
      };
      addToast(`Shift "${shiftData.name}" added successfully!`);
      return {
        ...prevState,
        shifts: [...prevState.shifts, newShift],
      };
    });
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setState((prevState) => ({
      ...prevState,
      shifts: prevState.shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s)),
    }));
    addToast(`Shift "${updatedShift.name}" updated!`);
  };

  const handleToggleShiftActive = (shiftId: string) => {
    setState((prevState) => {
      const updatedShifts = prevState.shifts.map((s) =>
        s.id === shiftId ? { ...s, active: !s.active } : s
      );
      const shift = prevState.shifts.find((s) => s.id === shiftId);
      addToast(`Shift "${shift?.name}" ${shift?.active ? 'turned off' : 'turned on'}.`);
      return {
        ...prevState,
        shifts: updatedShifts,
      };
    });
  };

  // Business Profile
  const handleUpdateBusiness = (updatedBusiness: Business) => {
    setState((prevState) => ({
      ...prevState,
      business: updatedBusiness,
    }));
    addToast('Library details updated!');
  };

  // Expenses Management
  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    setState((prevState) => {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      addToast(`Expense "₹${expenseData.amount.toLocaleString('en-IN')}" for ${expenseData.category} recorded!`);
      return {
        ...prevState,
        expenses: [newExpense, ...(prevState.expenses || [])],
      };
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setState((prevState) => {
      const updated = (prevState.expenses || []).filter((e) => e.id !== expenseId);
      addToast('Expense removed.', 'info');
      return {
        ...prevState,
        expenses: updated,
      };
    });
  };

  // Reset Data to Clean Start (Remove demo data)
  const handleResetCleanData = () => {
    const fresh = resetAppState();
    setState(fresh);
    addToast('All demo data cleared! Starting completely fresh from scratch.', 'info');
  };

  // Load Sample Demo Data (For testing/preview)
  const handleLoadSampleData = () => {
    const sample = loadSampleDemoState();
    setState(sample);
    addToast('Sample demo data loaded for testing.', 'info');
  };

  return (
    <div id="studyspace-app" className="min-h-screen bg-slate-100/70 text-slate-800 flex">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        business={state.business}
        activeTab={activeTab}
        moreSubView={moreSubView}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'more' && moreSubView === 'menu') {
            setMoreSubView('plans');
          }
        }}
        onMoreSubViewChange={(sub) => {
          setActiveTab('more');
          setMoreSubView(sub);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header business={state.business} onResetData={handleResetCleanData} />

        {/* Dynamic Page Views */}
        <main id="app-main-content" className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.85 }}
              transition={{ duration: 0.08, ease: 'easeOut' }}
              className="transform-gpu"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  state={state}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                  onOpenAddStudent={() => setIsAddStudentOpen(true)}
                  onOpenAssignSeat={handleOpenAssignSeatFromDashboard}
                  onOpenRecordPayment={handleOpenRecordPaymentGeneral}
                  onOpenWhatsAppReminder={handleOpenWhatsAppReminder}
                  onRecordPaymentForStudent={handleRecordPaymentForStudent}
                  onAssignSeatForStudent={(seat, student) => {
                    setAssignInitialSeat(seat || null);
                    setAssignInitialStudent(student || null);
                    setIsAssignSeatOpen(true);
                  }}
                  onSelectStudent={() => {
                    setActiveTab('students');
                    window.scrollTo(0, 0);
                  }}
                />
              )}

              {activeTab === 'seats' && (
                <SeatsView
                  state={state}
                  onAssignStudent={handleAssignStudentFromSeat}
                  onViewStudent={handleViewStudentFromSeat}
                  onRecordPayment={handleRecordPaymentForStudent}
                  onReleaseSeat={handleReleaseSeat}
                  onToggleSeatStatus={handleToggleSeatStatus}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  state={state}
                  onOpenAddStudent={() => setIsAddStudentOpen(true)}
                  onAssignSeat={handleAssignSeatForStudent}
                  onRecordPayment={handleRecordPaymentForStudent}
                  onOpenWhatsAppReminder={handleOpenWhatsAppReminder}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsView
                  state={state}
                  onOpenRecordPayment={handleOpenRecordPaymentGeneral}
                  onRecordPaymentForStudent={handleRecordPaymentForStudent}
                  onOpenWhatsAppReminder={handleOpenWhatsAppReminder}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  state={state}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                  onOpenRecordPayment={handleOpenRecordPaymentGeneral}
                />
              )}

              {activeTab === 'more' && (
                <MoreView
                  state={state}
                  subView={moreSubView}
                  onSubViewChange={(view) => setMoreSubView(view)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo(0, 0);
                  }}
                  onAddPlan={handleAddPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onTogglePlanActive={handleTogglePlanActive}
                  onAddShift={handleAddShift}
                  onUpdateShift={handleUpdateShift}
                  onToggleShiftActive={handleToggleShiftActive}
                  onUpdateBusiness={handleUpdateBusiness}
                  onResetCleanData={handleResetCleanData}
                  onLoadSampleData={handleLoadSampleData}
                  onReplaySplash={() => setShowSplash(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'more') {
            setMoreSubView('menu');
          }
          window.scrollTo(0, 0);
        }}
      />

      {/* Opening Logo Animated Splash Screen in admin's saved theme */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Global Modals & Bottom Sheets */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={handleAddStudent}
      />

      <AssignSeatModal
        isOpen={isAssignSeatOpen}
        onClose={() => setIsAssignSeatOpen(false)}
        state={state}
        initialSeat={assignInitialSeat}
        initialStudent={assignInitialStudent}
        onConfirmAssignment={handleConfirmAssignment}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        state={state}
        initialStudent={paymentInitialStudent}
        initialMembership={paymentInitialMembership}
        onSavePayment={handleSavePayment}
      />

      {/* WhatsApp Reminder Modal (Expiry / Dues / Combined) */}
      <WhatsAppReminderModal
        isOpen={isWhatsAppReminderOpen}
        onClose={() => setIsWhatsAppReminderOpen(false)}
        context={reminderContext}
        initialType={reminderInitialType}
        onSuccessToast={(msg) => addToast(msg, 'success')}
      />

      {/* Gmail / Google Authentication Modal */}
      <LoginModal />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

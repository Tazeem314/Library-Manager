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
import { safeSessionStorage } from './utils/safeStorage';
import { AuthSyncModal } from './components/common/AuthSyncModal';
import { AdminAuthGate } from './components/auth/AdminAuthGate';
import { AuthUser, subscribeToUserState, saveUserStateToFirestore, auth, logOutUser } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [moreSubView, setMoreSubView] = useState<MoreSubView>('menu');

  // Auth & Cloud Sync state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Authorized Owner Email Whitelist check
  const configuredOwnerEmail = (state.business?.ownerEmail || state.business?.email || 'tazeemsiddiqui0786@gmail.com').trim().toLowerCase();
  const currentLoggedInEmail = (authUser?.email || '').trim().toLowerCase();
  const isOwnerAuthorized = authUser ? currentLoggedInEmail === configuredOwnerEmail : false;
  const isUnauthorizedUser = authUser && !isOwnerAuthorized ? authUser : null;

  // Listen to Auth State
  useEffect(() => {
    if (!auth) {
      setAuthChecked(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

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

  // Save to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveAppState(state);
    }, 400);
    return () => clearTimeout(timer);
  }, [state]);

  // Background Auto-Sync to Cloud Vault whenever data changes
  const isInitialSyncMount = useRef(true);
  useEffect(() => {
    if (isInitialSyncMount.current) {
      isInitialSyncMount.current = false;
      return;
    }
    if (!authUser) return;

    const timer = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        await saveUserStateToFirestore(authUser.uid, state);
      } catch (err) {
        console.warn('Background auto-sync to cloud failed:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [state, authUser]);

  // Real-time synchronization listener across devices
  useEffect(() => {
    if (!authUser) return;

    const unsubscribe = subscribeToUserState(
      authUser.uid,
      (remoteState) => {
        setState(remoteState);
      },
      (err) => {
        console.warn('Realtime sync subscriber error:', err);
      }
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

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

  // If Auth check is loading initially, show a smooth minimal loader
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-[1.5px] border-neutral-800 border-t-white rounded-full animate-spin" />
          <span className="text-[11px] font-normal tracking-wider text-neutral-400">StudySpace</span>
        </div>
      </div>
    );
  }

  // Single-Owner Login Gate: If unauthenticated or unauthorized Gmail, show Login Page
  if (!authUser || !isOwnerAuthorized) {
    return (
      <AdminAuthGate
        businessName={state.business?.name || 'Study Space'}
        allowedEmail={state.business?.ownerEmail || state.business?.email || 'tazeemsiddiqui0786@gmail.com'}
        onAuthenticated={(user) => {
          setAuthUser(user);
          addToast(`Welcome back, ${user.displayName || 'Owner'}!`, 'success');
        }}
        unauthorizedUser={isUnauthorizedUser}
        onSignOut={async () => {
          await logOutUser();
          setAuthUser(null);
        }}
      />
    );
  }

  return (
    <div id="studyspace-app" className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 flex">
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
        authUser={authUser}
        isSyncing={isCloudSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          business={state.business}
          onResetData={handleResetCleanData}
          authUser={authUser}
          isSyncing={isCloudSyncing}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main id="app-main-content" className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350, duration: 0.2 }}
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
                  authUser={authUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
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
                  onRestoreState={(restored) => {
                    setState(restored);
                    addToast(`Restored ${restored.students.length} students from backup file`, 'success');
                  }}
                  onReplaySplash={() => setShowSplash(true)}
                  authUser={authUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
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

      {/* Auth & Cloud Sync Modal */}
      <AuthSyncModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentState={state}
        authUser={authUser}
        onSignIn={(user) => setAuthUser(user)}
        onSignOut={() => setAuthUser(null)}
        onToast={(msg, type) => addToast(msg, type)}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

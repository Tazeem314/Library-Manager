export type SeatStatus = 'available' | 'occupied' | 'disabled';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  ownerEmail?: string; // Strict authorized single-owner admin email for login whitelist
  requireAdminAuth?: boolean; // When true (default), forces login gate before revealing library dashboard
  address: string;
  city: string;
  totalSeats: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  active: boolean;
}

export interface Seat {
  id: string;
  seatNumber: string; // e.g. "A01", "B12"
  row: string; // "A", "B", "C", "D"
  status: SeatStatus;
  currentStudentId?: string;
  currentMembershipId?: string;
  currentShiftId?: string;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  studentId?: string; // e.g. "STU-1042"
  notes?: string;
  seatId?: string;
  shiftId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface Membership {
  id: string;
  studentId: string;
  seatId: string;
  shiftId: string;
  planId: string;
  planName: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'active' | 'expiring' | 'expired';
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  membershipId?: string;
  amount: number;
  method: PaymentMethod;
  date: string; // "YYYY-MM-DD"
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity / Power'
  | 'Internet / WiFi'
  | 'Water'
  | 'Cleaning & Hygiene'
  | 'Staff & Maintenance'
  | 'Newspaper & Books'
  | 'Tea & Pantry'
  | 'Air Conditioning / Repair'
  | 'Marketing & Printing'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  paymentMethod: PaymentMethod;
  receiptNo?: string;
  notes?: string;
  createdAt: string;
}

export type TabType = 'dashboard' | 'seats' | 'students' | 'payments' | 'analytics' | 'more';
export type MoreSubView = 'menu' | 'plans' | 'shifts' | 'business';

export interface AppState {
  business: Business;
  shifts: Shift[];
  plans: MembershipPlan[];
  seats: Seat[];
  students: Student[];
  memberships: Membership[];
  payments: Payment[];
  expenses: Expense[];
}

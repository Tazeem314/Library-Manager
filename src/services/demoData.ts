import { Business, Shift, MembershipPlan, Seat, Student, Membership, Payment, Expense } from '../types';

export function getInitialDemoData() {
  const business: Business = {
    id: 'biz-1',
    name: 'FocusPoint Study Hall',
    ownerName: 'Rajesh Sharma',
    phone: '+91 98290 41234',
    email: 'contact@focuspointstudy.com',
    address: 'Plot 42, 2nd Floor, Sai Complex, Near Allen Landmark, Indra Vihar',
    city: 'Kota, Rajasthan',
    totalSeats: 100,
  };

  const shifts: Shift[] = [
    { id: 'shift-1', name: 'Morning', startTime: '06:00 AM', endTime: '12:00 PM', active: true },
    { id: 'shift-2', name: 'Evening', startTime: '12:00 PM', endTime: '06:00 PM', active: true },
    { id: 'shift-3', name: 'Night', startTime: '06:00 PM', endTime: '12:00 AM', active: true },
  ];

  const plans: MembershipPlan[] = [
    { id: 'plan-1', name: 'Monthly', durationDays: 30, price: 1000, active: true },
    { id: 'plan-2', name: '3 Months', durationDays: 90, price: 2700, active: true },
    { id: 'plan-3', name: '6 Months', durationDays: 180, price: 5000, active: true },
    { id: 'plan-4', name: 'Yearly', durationDays: 365, price: 9000, active: true },
  ];

  // 100 seats across rows A, B, C, D (25 seats per row)
  const rows = ['A', 'B', 'C', 'D'];
  const seats: Seat[] = [];

  for (const row of rows) {
    for (let num = 1; num <= 25; num++) {
      const seatNum = `${row}${num.toString().padStart(2, '0')}`;
      seats.push({
        id: `seat-${seatNum}`,
        seatNumber: seatNum,
        row,
        status: 'available',
      });
    }
  }

  // Set 3 disabled seats
  const disabledSeats = ['A13', 'B09', 'D24'];
  for (const seatNum of disabledSeats) {
    const s = seats.find((seat) => seat.seatNumber === seatNum);
    if (s) {
      s.status = 'disabled';
    }
  }

  // Realistic Indian student names for tier 2/3 study centres
  const studentNames = [
    'Rahul Kumar', 'Priya Singh', 'Amit Verma', 'Neha Sharma', 'Ankit Patel',
    'Pooja Yadav', 'Vikram Rao', 'Sneha Gupta', 'Manish Tiwari', 'Kavita Joshi',
    'Deepak Choudhary', 'Ritu Meena', 'Saurabh Mishra', 'Anjali Saxena', 'Rohan Deshmukh',
    'Swati Nair', 'Harsh Vardhan', 'Divya Jain', 'Kunal Soni', 'Shreya Agarwal',
    'Naveen Bishnoi', 'Aakanksha Roy', 'Gaurav Rathore', 'Simran Kaur', 'Mohit Saini',
    'Tanvi Bhatia', 'Yashwant Chauhan', 'Megha Sen', 'Arjun Rawat', 'Preeti Maurya',
    'Vivek Pandey', 'Payal Khandelwal', 'Abhishek Dubey', 'Sonalika Das', 'Akash Tripathi',
    'Kriti Malviya', 'Hemant Nagar', 'Garima Mittal', 'Tarun Gehlot', 'Komal Bhati',
    'Prashant Jha', 'Nisha Solanki', 'Dharmendra Yadav', 'Bhavna Pareek', 'Alok Ranjan',
    'Deepika Shringi', 'Sandeep Kumawat', 'Sheetal Rajput', 'Sachin Baghel', 'Poonam Jangid',
    'Mayank Jangir', 'Kajal Shukla', 'Vishal Dewasi', 'Chhavi Godara', 'Chetan Dhaka',
    'Monika Poonia', 'Kuldeep Gurjar', 'Aarti Kaswan', 'Pradeep Bishnoi', 'Varsha Dudi',
    'Lalit Saharan', 'Anju Sihag', 'Govind Sihote', 'Radha Khileri', 'Pawan Bhakar',
    'Mamta Beniwal', 'Umesh Jakhar'
  ];

  const students: Student[] = [];
  const memberships: Membership[] = [];
  const payments: Payment[] = [];

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Helper to format date
  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  const subtractDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() - days);
    return res.toISOString().split('T')[0];
  };

  // Occupy 67 available seats
  let studentIdx = 0;
  for (const seat of seats) {
    if (seat.status !== 'available') continue;
    if (studentIdx >= studentNames.length) break;

    const name = studentNames[studentIdx];
    const sId = `stu-${studentIdx + 1}`;
    const studentCode = `STU-${1000 + studentIdx + 1}`;
    const phoneNum = `98${Math.floor(10000000 + Math.random() * 89999999)}`;
    const shift = shifts[studentIdx % shifts.length];

    // Start dates: provide realistic distribution with clear upcoming expiries in next 7 days
    let startDate: string;
    let endDate: string;
    let chosenPlan = plans[studentIdx % 3]; // Mostly Monthly, 3M, 6M

    if (studentIdx === 0) {
      // Expires Today (0 days left)
      chosenPlan = plans[0]; // Monthly (30 days)
      startDate = subtractDays(today, 30);
      endDate = todayStr;
    } else if (studentIdx === 1) {
      // Expires Tomorrow (1 day left)
      chosenPlan = plans[0]; // Monthly (30 days)
      startDate = subtractDays(today, 29);
      endDate = addDays(today, 1);
    } else if (studentIdx === 2) {
      // Expires in 2 days (urgent + fee due)
      chosenPlan = plans[0];
      startDate = subtractDays(today, 28);
      endDate = addDays(today, 2);
    } else if (studentIdx === 3) {
      // Expires in 4 days
      chosenPlan = plans[0];
      startDate = subtractDays(today, 26);
      endDate = addDays(today, 4);
    } else if (studentIdx === 4) {
      // Expires in 6 days
      chosenPlan = plans[0];
      startDate = subtractDays(today, 24);
      endDate = addDays(today, 6);
    } else {
      const daysAgo = (studentIdx * 4) % 20 + 2;
      startDate = subtractDays(today, daysAgo);
      endDate = addDays(new Date(startDate), chosenPlan.durationDays);
    }

    const mId = `mem-${studentIdx + 1}`;

    // Some have full payment, some partial
    const isPartial = studentIdx === 1 || studentIdx === 2 || studentIdx % 4 === 0;
    const paidAmount = isPartial ? Math.max(500, chosenPlan.price - 500) : chosenPlan.price;
    const outstandingAmount = chosenPlan.price - paidAmount;

    // Check if expiring soon (within 7 days)
    const daysUntilEnd = Math.ceil((new Date(endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let memStatus: 'active' | 'expiring' | 'expired' = 'active';
    if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
      memStatus = 'expiring';
    } else if (daysUntilEnd < 0) {
      memStatus = 'expired';
    }

    const student: Student = {
      id: sId,
      fullName: name,
      phone: phoneNum,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      studentId: studentCode,
      seatId: seat.id,
      shiftId: shift.id,
      status: 'active',
      createdAt: startDate,
    };

    const membership: Membership = {
      id: mId,
      studentId: sId,
      seatId: seat.id,
      shiftId: shift.id,
      planId: chosenPlan.id,
      planName: chosenPlan.name,
      startDate,
      endDate,
      totalAmount: chosenPlan.price,
      paidAmount,
      outstandingAmount,
      status: memStatus,
      createdAt: startDate,
    };

    // Update seat
    seat.status = 'occupied';
    seat.currentStudentId = sId;
    seat.currentMembershipId = mId;
    seat.currentShiftId = shift.id;

    students.push(student);
    memberships.push(membership);

    // Initial Payment
    const paymentMethods: Array<'UPI' | 'Cash' | 'Bank Transfer'> = ['UPI', 'Cash', 'UPI', 'UPI', 'Bank Transfer'];
    const pMethod = paymentMethods[studentIdx % paymentMethods.length];
    
    // Distribute payment dates: some today, some recent
    let payDate = startDate;
    if (studentIdx === 0) payDate = todayStr; // Rahul Kumar today
    else if (studentIdx === 1) payDate = todayStr; // Priya Singh today
    else if (studentIdx === 2) payDate = todayStr; // Amit Verma today
    else if (studentIdx < 6) payDate = subtractDays(today, 1);

    payments.push({
      id: `pay-${studentIdx + 1}`,
      studentId: sId,
      studentName: name,
      membershipId: mId,
      amount: paidAmount,
      method: pMethod,
      date: payDate,
      referenceNo: pMethod === 'UPI' ? `UPI/${9800000000 + studentIdx}` : undefined,
      notes: isPartial ? 'First installment paid' : 'Full plan payment',
      createdAt: payDate,
    });

    studentIdx++;
  }

  // Add 3 unassigned students (inquiry/newly registered without seat yet)
  const unassigned = [
    { name: 'Sameer Khan', phone: '9829911223', email: 'sameer.k@outlook.com' },
    { name: 'Ananya Deshpande', phone: '9845012399', email: 'ananya.d@gmail.com' },
    { name: 'Karthik Raja', phone: '9944055667', email: 'karthik.raja@yahoo.com' }
  ];

  for (let i = 0; i < unassigned.length; i++) {
    students.push({
      id: `stu-unassigned-${i + 1}`,
      fullName: unassigned[i].name,
      phone: unassigned[i].phone,
      email: unassigned[i].email,
      studentId: `STU-${1100 + i}`,
      status: 'active',
      createdAt: todayStr,
      notes: 'Interested in Morning shift for UPSC preparation'
    });
  }

  // Realistic library operational expenses (this month and previous months)
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      category: 'Rent',
      title: 'Commercial Hall Rent - September 2026',
      amount: 25000,
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RENT/2026/09',
      notes: 'Monthly property lease for 2nd Floor, Sai Complex',
      createdAt: '2026-09-01',
    },
    {
      id: 'exp-2',
      category: 'Electricity / Power',
      title: 'Commercial Electricity & AC Power Bill',
      amount: 7850,
      date: '2026-09-02',
      paymentMethod: 'UPI',
      receiptNo: 'JVVNL-908123',
      notes: 'State electricity board commercial meter bill',
      createdAt: '2026-09-02',
    },
    {
      id: 'exp-3',
      category: 'Internet / WiFi',
      title: 'High-Speed Optical Fiber (300 Mbps Dual Band)',
      amount: 1899,
      date: '2026-09-03',
      paymentMethod: 'UPI',
      receiptNo: 'AIR-992144',
      notes: 'Unlimited commercial library plan with static IP',
      createdAt: '2026-09-03',
    },
    {
      id: 'exp-4',
      category: 'Staff & Maintenance',
      title: 'Front Desk Assistant & Night Attendant Salary',
      amount: 6000,
      date: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'SAL/2026/09',
      notes: 'Half-month advance stipend for assistant',
      createdAt: '2026-09-01',
    },
    {
      id: 'exp-5',
      category: 'Cleaning & Hygiene',
      title: 'Daily Housekeeping & Floor Disinfection Supplies',
      amount: 2200,
      date: '2026-09-02',
      paymentMethod: 'Cash',
      notes: 'Floor cleaner, air freshener, trash liners, sanitizers',
      createdAt: '2026-09-02',
    },
    {
      id: 'exp-6',
      category: 'Water',
      title: '20L Commercial RO Drinking Water Cans (20 Cans)',
      amount: 900,
      date: '2026-09-04',
      paymentMethod: 'Cash',
      notes: 'Bisleri 20L chilled jar refills for water dispenser',
      createdAt: '2026-09-04',
    },
    {
      id: 'exp-7',
      category: 'Newspaper & Books',
      title: 'Daily Newspapers & UPSC/SSC Monthly Magazines',
      amount: 850,
      date: '2026-09-02',
      paymentMethod: 'UPI',
      notes: 'The Hindu, Indian Express, Yojana & Kurukshetra',
      createdAt: '2026-09-02',
    },
    {
      id: 'exp-8',
      category: 'Air Conditioning / Repair',
      title: 'Study Hall AC Gas Refill & Blower Servicing',
      amount: 1500,
      date: '2026-09-05',
      paymentMethod: 'Cash',
      receiptNo: 'VOLT-SVC-44',
      notes: 'Main hall AC 2 filter cleaning and gas top-up',
      createdAt: '2026-09-05',
    },
    {
      id: 'exp-9',
      category: 'Tea & Pantry',
      title: 'Tea Bags, Sugar, Coffee Powder & Disposable Cups',
      amount: 650,
      date: todayStr,
      paymentMethod: 'UPI',
      notes: 'Fresh pantry restock for students studying late night',
      createdAt: todayStr,
    },
    // Previous month (August) for comparison and monthly trends
    {
      id: 'exp-10',
      category: 'Rent',
      title: 'Commercial Hall Rent - August 2026',
      amount: 25000,
      date: '2026-08-01',
      paymentMethod: 'Bank Transfer',
      receiptNo: 'RENT/2026/08',
      createdAt: '2026-08-01',
    },
    {
      id: 'exp-11',
      category: 'Electricity / Power',
      title: 'Commercial Electricity Bill - August',
      amount: 8200,
      date: '2026-08-04',
      paymentMethod: 'UPI',
      createdAt: '2026-08-04',
    },
    {
      id: 'exp-12',
      category: 'Internet / WiFi',
      title: 'Commercial Fiber WiFi - August',
      amount: 1899,
      date: '2026-08-03',
      paymentMethod: 'UPI',
      createdAt: '2026-08-03',
    },
    {
      id: 'exp-13',
      category: 'Staff & Maintenance',
      title: 'Library Assistant Stipend - August',
      amount: 6000,
      date: '2026-08-01',
      paymentMethod: 'Bank Transfer',
      createdAt: '2026-08-01',
    },
    {
      id: 'exp-14',
      category: 'Marketing & Printing',
      title: 'Admission Pamphlets & Road Direction Banners',
      amount: 1400,
      date: '2026-08-15',
      paymentMethod: 'Cash',
      createdAt: '2026-08-15',
    },
  ];

  return {
    business,
    shifts,
    plans,
    seats,
    students,
    memberships,
    payments,
    expenses,
  };
}

export const getSampleDemoData = getInitialDemoData;

export function getCleanInitialData() {
  const business: Business = {
    id: 'biz-1',
    name: 'My Study Library',
    ownerName: 'Library Owner',
    phone: '+91 98000 00000',
    email: 'contact@studylibrary.com',
    ownerEmail: 'tazeemsiddiqui0786@gmail.com',
    requireAdminAuth: true,
    address: 'Near Coaching Circle, Main Road',
    city: 'City, State',
    totalSeats: 100,
  };

  const shifts: Shift[] = [
    { id: 'shift-1', name: 'Morning', startTime: '06:00 AM', endTime: '12:00 PM', active: true },
    { id: 'shift-2', name: 'Evening', startTime: '12:00 PM', endTime: '06:00 PM', active: true },
    { id: 'shift-3', name: 'Night', startTime: '06:00 PM', endTime: '12:00 AM', active: true },
  ];

  const plans: MembershipPlan[] = [
    { id: 'plan-1', name: 'Monthly', durationDays: 30, price: 1000, active: true },
    { id: 'plan-2', name: '3 Months', durationDays: 90, price: 2700, active: true },
    { id: 'plan-3', name: '6 Months', durationDays: 180, price: 5000, active: true },
    { id: 'plan-4', name: 'Yearly', durationDays: 365, price: 9000, active: true },
  ];

  // 100 seats across rows A, B, C, D (25 seats per row) - all fresh and available
  const rows = ['A', 'B', 'C', 'D'];
  const seats: Seat[] = [];

  for (const row of rows) {
    for (let num = 1; num <= 25; num++) {
      const seatNum = `${row}${num.toString().padStart(2, '0')}`;
      seats.push({
        id: `seat-${seatNum}`,
        seatNumber: seatNum,
        row,
        status: 'available',
      });
    }
  }

  return {
    business,
    shifts,
    plans,
    seats,
    students: [],
    memberships: [],
    payments: [],
    expenses: [],
  };
}


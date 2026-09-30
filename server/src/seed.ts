import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import {
  UserRole,
  AttendanceStatus,
  FeeType,
  PaymentMode,
  PaymentStatus,
  ExamType,
  GrievanceCategory,
  InvoiceStatus,
  PaymentOrderStatus,
  PaymentEventType,
  ConcessionCategory,
  ConcessionStatus,
  BudgetStatus,
  ExamCycleStatus,
  ExamStudentCategory,
  ExamApplicationStatus,
  EligibilityStatus,
  CenterVerificationStatus,
  ExamScheduleStatus,
  SeatingAllocationStatus,
  InvigilationDutyStatus,
  MaterialType,
  MaterialBatchStatus,
  MaterialMovementType,
  AppointmentStatus,
  AppointmentRole,
  QuestionDifficulty,
  QuestionType,
  PaperVersionStatus,
  ConfidentialAccessType
} from '@shared/index';
import {
  User,
  Institution,
  Department,
  Student,
  Course,
  Timetable,
  AttendanceRecord,
  Exam,
  MarkSheet,
  FeeStructure,
  FeeTransaction,
  FeeRuleVersion,
  Invoice,
  PaymentOrder,
  PaymentEvent,
  Receipt,
  Refund,
  Concession,
  ReconciliationRun,
  Fund,
  Budget,
  BudgetEntry,
  PayrollRecord,
  HostelRoom,
  GatePass,
  TransportRoute,
  BusPass,
  Book,
  BookLoan,
  PlacementDrive,
  PlacementApplication,
  AlumniProfile,
  Grievance,
  Notice,
  AuditLog,
  OutboxEvent,
  Applicant,
  AdmissionApplication,
  AdmissionDocument,
  ImportBatch,
  ExternalCodeMapping,
  ReviewDecision,
  Enrollment,
  IdentifierSequence,
  EnrollmentHistory,
  ProfileChangeRequest,
  StudentDocument,
  StudentStatusEvent,
  GraduationRecord,
  AttendanceSession,
  AttendanceEntry,
  AttendanceCorrection,
  AttendancePolicyVersion,
  TeachingAssignment,
  Room,
  TimetableEntry,
  TimetableException,
  CalendarEvent,
  Holiday,
  SubjectEnrollment,
  ExamCycle,
  ExamPolicyVersion,
  ExamApplication,
  EligibilityDecision,
  ExamEnrollment,
  RollNumberAssignment,
  HallTicket,
  ExamCenter,
  CenterVerification,
  ExamSchedule,
  SeatingAllocation,
  InvigilationDuty,
  MaterialBatch,
  MaterialMovement,
  SetterAppointment,
  Question,
  PaperVersion,
  PaperReview,
  ConfidentialAccessEvent
} from './models/models';

export async function seedDatabase() {
  console.log('[Seed] Purging existing database collections...');
  await Promise.all([
    User.deleteMany({}),
    Institution.deleteMany({}),
    Department.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    Timetable.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Exam.deleteMany({}),
    MarkSheet.deleteMany({}),
    FeeStructure.deleteMany({}),
    FeeTransaction.deleteMany({}),
    PayrollRecord.deleteMany({}),
    HostelRoom.deleteMany({}),
    GatePass.deleteMany({}),
    TransportRoute.deleteMany({}),
    BusPass.deleteMany({}),
    Book.deleteMany({}),
    BookLoan.deleteMany({}),
    PlacementDrive.deleteMany({}),
    PlacementApplication.deleteMany({}),
    AlumniProfile.deleteMany({}),
    Grievance.deleteMany({}),
    Notice.deleteMany({}),
    AuditLog.deleteMany({}),
    OutboxEvent.deleteMany({}),
    Applicant.deleteMany({}),
    AdmissionApplication.deleteMany({}),
    AdmissionDocument.deleteMany({}),
    ImportBatch.deleteMany({}),
    ExternalCodeMapping.deleteMany({}),
    ReviewDecision.deleteMany({}),
    Enrollment.deleteMany({}),
    IdentifierSequence.deleteMany({}),
    EnrollmentHistory.deleteMany({}),
    ProfileChangeRequest.deleteMany({}),
    StudentDocument.deleteMany({}),
    StudentStatusEvent.deleteMany({}),
    GraduationRecord.deleteMany({}),
    AttendanceSession.deleteMany({}),
    AttendanceEntry.deleteMany({}),
    AttendanceCorrection.deleteMany({}),
    AttendancePolicyVersion.deleteMany({}),
    TeachingAssignment.deleteMany({}),
    Room.deleteMany({}),
    TimetableException.deleteMany({}),
    CalendarEvent.deleteMany({}),
    Holiday.deleteMany({}),
    SubjectEnrollment.deleteMany({}),
    FeeRuleVersion.deleteMany({}),
    Invoice.deleteMany({}),
    PaymentOrder.deleteMany({}),
    PaymentEvent.deleteMany({}),
    Receipt.deleteMany({}),
    Refund.deleteMany({}),
    Concession.deleteMany({}),
    ReconciliationRun.deleteMany({}),
    Fund.deleteMany({}),
    Budget.deleteMany({}),
    BudgetEntry.deleteMany({}),
    ExamCycle.deleteMany({}),
    ExamPolicyVersion.deleteMany({}),
    ExamApplication.deleteMany({}),
    EligibilityDecision.deleteMany({}),
    ExamEnrollment.deleteMany({}),
    RollNumberAssignment.deleteMany({}),
    HallTicket.deleteMany({}),
    ExamCenter.deleteMany({}),
    CenterVerification.deleteMany({}),
    ExamSchedule.deleteMany({}),
    SeatingAllocation.deleteMany({}),
    InvigilationDuty.deleteMany({}),
    MaterialBatch.deleteMany({}),
    MaterialMovement.deleteMany({}),
    SetterAppointment.deleteMany({}),
    Question.deleteMany({}),
    PaperVersion.deleteMany({}),
    PaperReview.deleteMany({}),
    ConfidentialAccessEvent.deleteMany({})
  ]);

  console.log('[Seed] Creating Institution & Departments...');
  const inst = await Institution.create({
    code: 'DITS',
    name: 'Delhi Institute of Technology & Science',
    address: 'Sector 16, Knowledge Park, New Delhi',
    contactEmail: 'contact@dits.edu.in',
    contactPhone: '+91 11 2890 4321'
  });

  const depCse = await Department.create({
    institutionId: inst._id,
    code: 'CSE',
    name: 'Computer Science & Engineering'
  });

  const depEce = await Department.create({
    institutionId: inst._id,
    code: 'ECE',
    name: 'Electronics & Communication'
  });

  console.log('[Seed] Creating External Code Mappings for Admissions...');
  await ExternalCodeMapping.create({
    institutionId: inst._id,
    externalCode: 'CSE',
    mappedDepartmentId: depCse._id,
    mappedProgramCode: 'BTECH_CSE'
  });

  await ExternalCodeMapping.create({
    institutionId: inst._id,
    externalCode: 'ECE',
    mappedDepartmentId: depEce._id,
    mappedProgramCode: 'BTECH_ECE'
  });

  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('[Seed] Creating System Accounts for All Roles...');

  const superAdmin = await User.create({
    email: 'superadmin@campussetu.edu',
    passwordHash,
    name: 'Dr. Vikramaditya (Super Admin)',
    role: UserRole.SUPER_ADMIN
  });

  const admin = await User.create({
    email: 'admin@campussetu.edu',
    passwordHash,
    name: 'Suresh Menon (Campus Admin)',
    role: UserRole.ADMIN,
    institutionId: inst._id
  });

  const facultyCse = await User.create({
    email: 'faculty.cse@campussetu.edu',
    passwordHash,
    name: 'Prof. Rajesh Sharma (HOD CSE)',
    role: UserRole.FACULTY,
    institutionId: inst._id
  });

  const facultyEce = await User.create({
    email: 'faculty.ece@campussetu.edu',
    passwordHash,
    name: 'Dr. Priya Sharma (Associate Prof ECE)',
    role: UserRole.FACULTY,
    institutionId: inst._id
  });

  depCse.headOfDepartmentId = facultyCse._id;
  depEce.headOfDepartmentId = facultyEce._id;
  await depCse.save();
  await depEce.save();

  const financeUser = await User.create({
    email: 'finance@campussetu.edu',
    passwordHash,
    name: 'Priya Verma (Finance Head)',
    role: UserRole.FINANCE,
    institutionId: inst._id
  });

  const wardenUser = await User.create({
    email: 'warden@campussetu.edu',
    passwordHash,
    name: 'Rameshwar Singh (Hostel Warden)',
    role: UserRole.WARDEN,
    institutionId: inst._id
  });

  const placementUser = await User.create({
    email: 'placement@campussetu.edu',
    passwordHash,
    name: 'Anita Kapoor (Placement Director)',
    role: UserRole.PLACEMENT_OFFICER,
    institutionId: inst._id
  });

  // Students & Guardians
  const guardianUser = await User.create({
    email: 'guardian.sharma@campussetu.edu',
    passwordHash,
    name: 'Mr. Ramesh Sharma (Parent)',
    role: UserRole.GUARDIAN,
    institutionId: inst._id,
    phone: '+91 98765 43210'
  });

  const studentUser1 = await User.create({
    email: 'student.aarav@campussetu.edu',
    passwordHash,
    name: 'Aarav Sharma',
    role: UserRole.STUDENT,
    institutionId: inst._id
  });

  const studentUser2 = await User.create({
    email: 'student.ananya@campussetu.edu',
    passwordHash,
    name: 'Ananya Patel',
    role: UserRole.STUDENT,
    institutionId: inst._id
  });

  const student1 = await Student.create({
    userId: studentUser1._id,
    institutionId: inst._id,
    departmentId: depCse._id,
    rollNumber: 'CSE-2024-001',
    enrollmentNumber: 'ENR2024001',
    currentSemester: 4,
    batchYear: 2024,
    guardianUserId: guardianUser._id,
    cgpa: 8.8
  });

  const student2 = await Student.create({
    userId: studentUser2._id,
    institutionId: inst._id,
    departmentId: depEce._id,
    rollNumber: 'ECE-2024-002',
    enrollmentNumber: 'ENR2024002',
    currentSemester: 4,
    batchYear: 2024,
    cgpa: 7.4
  });

  guardianUser.wardStudentIds = [student1._id as any];
  await guardianUser.save();

  console.log('[Seed] Creating Rooms & Course Catalog...');
  const room101 = await Room.create({
    institutionId: inst._id,
    name: 'LH-101',
    building: 'Academic Block A',
    capacity: 60,
    roomType: 'LECTURE_HALL',
    hasProjector: true,
    hasAC: true
  });

  const room102 = await Room.create({
    institutionId: inst._id,
    name: 'LH-102',
    building: 'Academic Block A',
    capacity: 60,
    roomType: 'LECTURE_HALL',
    hasProjector: true,
    hasAC: true
  });

  const courseDsa = await Course.create({
    institutionId: inst._id,
    departmentId: depCse._id,
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    credits: 4,
    semester: 4,
    facultyId: facultyCse._id
  });

  const courseDbms = await Course.create({
    institutionId: inst._id,
    departmentId: depCse._id,
    code: 'CS202',
    name: 'Database Management Systems',
    credits: 3,
    semester: 4,
    facultyId: facultyCse._id
  });

  // Seed Enrolled Courses for Student 1
  await SubjectEnrollment.create({
    institutionId: inst._id,
    studentId: student1._id,
    semester: 4,
    academicYear: '2026-2027',
    courseIds: [courseDsa._id as any, courseDbms._id as any]
  });

  console.log('[Seed] Creating Timetable Entries...');
  const ttDsa = await TimetableEntry.create({
    institutionId: inst._id,
    departmentId: depCse._id,
    semester: 4,
    section: 'A',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    courseId: courseDsa._id,
    roomNumber: 'LH-101',
    roomId: room101._id,
    facultyId: facultyCse._id,
    recurrencePattern: 'WEEKLY',
    academicYear: '2026-2027',
    isPublished: true
  });

  await TimetableEntry.create({
    institutionId: inst._id,
    departmentId: depCse._id,
    semester: 4,
    section: 'A',
    dayOfWeek: 'Wednesday',
    startTime: '10:00',
    endTime: '11:00',
    courseId: courseDbms._id,
    roomNumber: 'LH-102',
    roomId: room102._id,
    facultyId: facultyCse._id,
    recurrencePattern: 'WEEKLY',
    academicYear: '2026-2027',
    isPublished: true
  });

  console.log('[Seed] Creating Academic Calendar Events & Holidays...');
  await CalendarEvent.create({
    institutionId: inst._id,
    title: 'Mahatma Gandhi Jayanti Holiday',
    eventType: 'HOLIDAY',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    description: 'National Academic Holiday',
    isHoliday: true,
    affectsClasses: true
  });

  await Holiday.create({
    institutionId: inst._id,
    name: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    description: 'Mandatory Holiday',
    isMandatory: true
  });

  console.log('[Seed] Creating Teaching Assignments & Attendance Policy...');
  await TeachingAssignment.create({
    institutionId: inst._id,
    courseId: courseDsa._id,
    facultyId: facultyCse._id,
    semester: 4,
    section: 'A',
    academicYear: '2026-2027'
  });

  await AttendancePolicyVersion.create({
    institutionId: inst._id,
    policyName: 'Standard University Academic Regulations 2026',
    minPercentageRequired: 75,
    countExcusedInDenominator: false,
    version: 1,
    isCurrent: true
  });

  console.log('[Seed] Creating Attendance Sessions & Entries...');
  const attSession = await AttendanceSession.create({
    institutionId: inst._id,
    courseId: courseDsa._id,
    facultyId: facultyCse._id,
    date: '2026-09-29',
    startTime: '09:00',
    endTime: '10:00',
    semester: 4,
    section: 'A',
    topicCovered: 'Data Structures: Graph Traversals DFS/BFS',
    status: 'COMPLETED'
  });

  const entry1 = await AttendanceEntry.create({
    institutionId: inst._id,
    sessionId: attSession._id,
    courseId: courseDsa._id,
    studentId: student1._id,
    date: '2026-09-29',
    status: AttendanceStatus.PRESENT,
    remarks: 'Punctual attendance'
  });

  const entry2 = await AttendanceEntry.create({
    institutionId: inst._id,
    sessionId: attSession._id,
    courseId: courseDsa._id,
    studentId: student2._id,
    date: '2026-09-29',
    status: AttendanceStatus.ABSENT,
    remarks: 'Absence recorded - medical note pending'
  });

  await AttendanceCorrection.create({
    institutionId: inst._id,
    sessionId: attSession._id,
    entryId: entry2._id,
    studentId: student2._id,
    priorStatus: AttendanceStatus.ABSENT,
    requestedStatus: AttendanceStatus.EXCUSED,
    reason: 'Submitted medical certificate for 29th Sep class',
    status: 'PENDING'
  });

  await AttendanceRecord.create({
    institutionId: inst._id,
    courseId: courseDsa._id,
    facultyId: facultyCse._id,
    date: '2026-09-29',
    semester: 4,
    section: 'A',
    entries: [
      { studentId: student1._id, status: AttendanceStatus.PRESENT },
      { studentId: student2._id, status: AttendanceStatus.ABSENT, remarks: 'Medical Leave' }
    ]
  });

  const examMid = await Exam.create({
    institutionId: inst._id,
    name: 'Mid-Term Examination 2026',
    examType: ExamType.MID_TERM,
    academicYear: '2025-2026',
    startDate: '2026-10-10',
    endDate: '2026-10-20'
  });

  await MarkSheet.create({
    examId: examMid._id,
    courseId: courseDsa._id,
    studentId: student1._id,
    marksObtained: 88,
    maxMarks: 100,
    grade: 'A',
    isFinalized: true,
    finalizedBy: facultyCse._id,
    finalizedAt: new Date()
  });

  console.log('[Seed] Creating Fee Structures & Transactions (Integer Paise)...');
  await FeeStructure.create({
    institutionId: inst._id,
    departmentId: depCse._id,
    batchYear: 2024,
    semester: 4,
    feeType: FeeType.TUITION,
    amountPaise: 5000000, // ₹50,000.00
    dueDate: '2026-11-15'
  });

  await FeeTransaction.create({
    transactionId: 'TXN-20260930-1001',
    idempotencyKey: 'SEED-IDEMP-FEE-001',
    studentId: student1._id,
    institutionId: inst._id,
    amountPaise: 5000000, // ₹50,000.00
    feeType: FeeType.TUITION,
    paymentMode: PaymentMode.UPI,
    status: PaymentStatus.SUCCESS,
    receiptNumber: 'RCP-20260930-1001',
    gatewayReference: 'PAY-SIM-RAZORPAY-8821'
  });

  console.log('[Seed] Creating M10 Fee Rules, Invoices, Orders, Concessions, Funds & Budgets...');
  const feeRule = await FeeRuleVersion.create({
    institutionId: inst._id,
    name: 'B.Tech CSE Semester 4 Standard Fee Structure',
    version: 1,
    academicYear: '2026-2027',
    departmentId: depCse._id,
    feeCategory: FeeType.TUITION,
    heads: [
      { name: 'Tuition Fee', code: 'TUIT', amountPaise: 4000000, isMandatory: true }, // ₹40,000
      { name: 'Computer Lab & Cloud Computing Fee', code: 'LAB', amountPaise: 1000000, isMandatory: true }, // ₹10,000
      { name: 'Digital Library & IEEE Access', code: 'LIB', amountPaise: 250000, isMandatory: true }, // ₹2,500
      { name: 'Examination & Evaluation Fee', code: 'EXAM', amountPaise: 250000, isMandatory: true } // ₹2,500
    ],
    totalAmountPaise: 5500000, // ₹55,000
    lateFeeRule: { graceDays: 15, dailyLateFeePaise: 5000, maxLateFeePaise: 100000 },
    status: 'ACTIVE'
  });

  const invoice1 = await Invoice.create({
    invoiceNumber: 'INV-2026-0001',
    studentId: student1._id,
    institutionId: inst._id,
    academicYear: '2026-2027',
    semester: 4,
    dueDate: '2026-11-30',
    lines: [
      { head: 'Tuition Fee', category: 'TUITION', amountPaise: 4000000 },
      { head: 'Computer Lab Fee', category: 'LAB', amountPaise: 1000000 },
      { head: 'Digital Library', category: 'LIBRARY', amountPaise: 250000 },
      { head: 'Examination Fee', category: 'EXAM', amountPaise: 250000 }
    ],
    totalAmountPaise: 5500000,
    concessionAmountPaise: 1000000, // ₹10,000 merit concession applied
    payableAmountPaise: 4500000, // ₹45,000
    paidAmountPaise: 0,
    status: InvoiceStatus.ISSUED
  });

  const invoice2 = await Invoice.create({
    invoiceNumber: 'INV-2026-0002',
    studentId: student2._id,
    institutionId: inst._id,
    academicYear: '2026-2027',
    semester: 4,
    dueDate: '2026-11-30',
    lines: [
      { head: 'Tuition Fee', category: 'TUITION', amountPaise: 4000000 },
      { head: 'Computer Lab Fee', category: 'LAB', amountPaise: 1000000 }
    ],
    totalAmountPaise: 5000000,
    concessionAmountPaise: 0,
    payableAmountPaise: 5000000,
    paidAmountPaise: 5000000,
    status: InvoiceStatus.PAID
  });

  const paidOrder2 = await PaymentOrder.create({
    orderId: 'ORD-2026-0002',
    invoiceId: invoice2._id,
    studentId: student2._id,
    institutionId: inst._id,
    amountPaise: 5000000,
    currency: 'INR',
    status: PaymentOrderStatus.PAID,
    idempotencyKey: 'SEED-IDEMP-ORD-002',
    provider: 'RAZORPAY_SIM',
    providerOrderId: 'order_sim_seed002',
    expiresAt: new Date(Date.now() + 86400000),
    paidAt: new Date(),
    receiptNumber: 'RCP-2026-0002'
  });

  await Receipt.create({
    receiptNumber: 'RCP-2026-0002',
    invoiceId: invoice2._id,
    paymentOrderId: 'ORD-2026-0002',
    studentId: student2._id,
    institutionId: inst._id,
    amountPaise: 5000000,
    paymentMode: PaymentMode.UPI,
    issuedAt: new Date(),
    counterfoilData: { providerPaymentId: 'pay_sim_seed002', provider: 'RAZORPAY_SIM' }
  });

  await PaymentEvent.create({
    eventId: 'EVT-SEED-002',
    orderId: 'ORD-2026-0002',
    providerPaymentId: 'pay_sim_seed002',
    eventType: PaymentEventType.PAYMENT_SUCCESS,
    amountPaise: 5000000,
    currency: 'INR',
    signature: 'seed_sim_signature_002',
    verified: true,
    processed: true
  });

  // Deliberately pending payment order for reproducible demonstration & reconciliation gate
  await PaymentOrder.create({
    orderId: 'ORD-PENDING-DEMO',
    invoiceId: invoice1._id,
    studentId: student1._id,
    institutionId: inst._id,
    amountPaise: 4500000,
    currency: 'INR',
    status: PaymentOrderStatus.CREATED,
    idempotencyKey: 'IDEMP-DEMO-PENDING-001',
    provider: 'RAZORPAY_SIM',
    providerOrderId: 'order_sim_pending_demo',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  });

  await Concession.create({
    concessionId: 'CNC-2026-0001',
    studentId: student1._id,
    invoiceId: invoice1._id,
    category: ConcessionCategory.MERIT_SCHOLARSHIP,
    amountPaise: 1000000, // ₹10,000
    reason: 'Top 5% Departmental Academic Standing Award',
    status: ConcessionStatus.APPROVED,
    approvedBy: 'FINANCE_HEAD'
  });

  // Funds & Budgets
  const fund1 = await Fund.create({
    code: 'UGC_INFRA',
    name: 'UGC Infrastructure & Modernization Grant',
    description: 'Central grant for departmental computing laboratories and high-performance clusters',
    totalAllocatedPaise: 500000000, // ₹50 Lakhs
    utilizedPaise: 150000000,
    balancePaise: 350000000
  });

  const fund2 = await Fund.create({
    code: 'STUDENT_WELFARE',
    name: 'Student Welfare & Emergency Aid Fund',
    description: 'Direct institutional financial aid and merit scholarships',
    totalAllocatedPaise: 200000000, // ₹20 Lakhs
    utilizedPaise: 1000000,
    balancePaise: 199000000
  });

  const budget1 = await Budget.create({
    academicYear: '2026-2027',
    departmentId: depCse._id,
    fundId: fund1._id,
    fundCode: 'UGC_INFRA',
    fundName: 'UGC Infrastructure & Modernization Grant',
    allocatedPaise: 150000000, // ₹15 Lakhs
    spentPaise: 50000000,
    status: BudgetStatus.APPROVED
  });

  await BudgetEntry.create({
    budgetId: budget1._id,
    head: 'AI/ML GPU Workstations',
    allocatedPaise: 100000000,
    spentPaise: 50000000,
    approvedAt: new Date(),
    approvedBy: 'FINANCE_CONTROLLER'
  });

  await BudgetEntry.create({
    budgetId: budget1._id,
    head: 'Campus Network Gigabit Upgrade',
    allocatedPaise: 50000000,
    spentPaise: 0,
    approvedAt: new Date(),
    approvedBy: 'FINANCE_CONTROLLER'
  });

  console.log('[Seed] Creating Staff Payroll (Integer Paise)...');
  await PayrollRecord.create({
    institutionId: inst._id,
    monthYear: '2026-09',
    staffId: facultyCse._id,
    baseSalaryPaise: 8500000, // ₹85,000
    hraPaise: 1500000, // ₹15,000
    deductionsPaise: 500000, // ₹5,000
    netSalaryPaise: 9500000, // ₹95,000
    status: 'APPROVED',
    idempotencyKey: 'SEED-IDEMP-PAYROLL-001'
  });

  console.log('[Seed] Creating Hostel, Transport, Library & Placements...');
  await HostelRoom.create({
    institutionId: inst._id,
    buildingName: 'Kalpana Chawla Hall',
    roomNumber: '101',
    capacity: 2,
    currentOccupancy: 1,
    monthlyRentPaise: 600000 // ₹6,000
  });

  await GatePass.create({
    studentId: student1._id,
    reason: 'Weekend Home Visit',
    outDate: '2026-10-02',
    inDate: '2026-10-04',
    status: 'APPROVED',
    approvedBy: wardenUser._id
  });

  await TransportRoute.create({
    institutionId: inst._id,
    routeNumber: 'R-12',
    routeName: 'Connaught Place to Campus Express',
    vehicleNumber: 'DL-01-AB-1234',
    driverName: 'Sohan Lal',
    feePaise: 250000 // ₹2,500
  });

  await Book.create({
    institutionId: inst._id,
    isbn: '978-0262033848',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen',
    totalCopies: 15,
    availableCopies: 12
  });

  const driveGoogle = await PlacementDrive.create({
    institutionId: inst._id,
    companyName: 'Google India',
    jobTitle: 'Software Development Engineer I',
    packageLpaPaise: 240000000, // 24 LPA = ₹24,000,000 = 2,400,000,000 Paise
    eligibilityMinCgpa: 8.0,
    deadline: '2026-11-30',
    status: 'ACTIVE'
  });

  await PlacementApplication.create({
    driveId: driveGoogle._id,
    studentId: student1._id,
    status: 'SHORTLISTED'
  });

  console.log('[Seed] Creating Support Grievances & Notice Board...');
  await Grievance.create({
    institutionId: inst._id,
    userId: studentUser1._id,
    category: GrievanceCategory.HOSTEL,
    subject: 'Wi-Fi connectivity issue in Kalpana Chawla Hall Block B',
    description: 'Signal drops frequently after 10 PM during study hours.',
    status: 'IN_PROGRESS'
  });

  await Notice.create({
    institutionId: inst._id,
    title: 'Mid-Term Exam Timetable Published',
    content: 'All undergraduate students must download their hall tickets from the portal before 5th October.',
    targetRole: 'ALL',
    publishedBy: admin._id
  });

  console.log('[Seed] Creating M11 Exam Cycles, Applications, Exceptions & Hall Tickets...');
  const winterCycle = await ExamCycle.create({
    institutionId: inst._id,
    code: 'WIN2026',
    name: 'Winter 2026 Regular & Backlog Examinations',
    academicYear: '2026-2027',
    semester: 4,
    startDate: '2026-11-20',
    endDate: '2026-12-10',
    applicationStartDate: '2026-09-01',
    applicationEndDate: '2026-10-31',
    status: ExamCycleStatus.APPLICATION_OPEN
  });

  const examPolicy = await ExamPolicyVersion.create({
    cycleId: winterCycle._id,
    version: 1,
    minAttendancePercentage: 75,
    requireFeeClearance: true,
    feePerSubjectPaise: 50000, // ₹500
    lateFeeChargePaise: 20000, // ₹200
    allowBacklog: true,
    allowPrivate: false,
    isActive: true
  });

  // 1. Ineligible case demonstration: Student 1 (Aarav Sharma) has unpaid fees (INV-2026-0001)
  const decStudent1 = await EligibilityDecision.create({
    cycleId: winterCycle._id,
    studentId: student1._id,
    overallStatus: EligibilityStatus.INELIGIBLE,
    attendancePercentage: 100,
    feeCleared: false,
    ineligibilityReasons: ['Outstanding fee arrears must be cleared prior to exam registration'],
    hasException: false
  });

  // 2. Exception & Issuance demonstration: Student 2 (Ananya Patel) had attendance shortage (0%)
  // Exam Controller grants audited exception based on verified medical certification
  const decStudent2 = await EligibilityDecision.create({
    cycleId: winterCycle._id,
    studentId: student2._id,
    overallStatus: EligibilityStatus.CONDITIONAL_EXCEPTION,
    attendancePercentage: 0,
    feeCleared: true,
    ineligibilityReasons: [],
    hasException: true,
    exceptionReason: 'Special medical exemption approved by Academic Council vide Resolution AC-2026/89',
    exceptionGrantedBy: 'CONTROLLER_OF_EXAMINATIONS',
    exceptionGrantedAt: new Date()
  });

  const appStudent2 = await ExamApplication.create({
    applicationNumber: 'EX-WIN2026-000002',
    cycleId: winterCycle._id,
    studentId: student2._id,
    category: ExamStudentCategory.REGULAR,
    subjectIds: [courseDsa._id, courseDbms._id],
    status: ExamApplicationStatus.HALL_TICKET_ISSUED,
    feeAmountPaise: 100000, // ₹1,000 (2 subjects)
    feePaid: true,
    submittedAt: new Date(Date.now() - 86400000),
    approvedAt: new Date(),
    approvedBy: 'CONTROLLER_OF_EXAMINATIONS'
  });

  decStudent2.applicationId = appStudent2._id as any;
  await decStudent2.save();

  await ExamEnrollment.create({
    cycleId: winterCycle._id,
    studentId: student2._id,
    subjectId: courseDsa._id,
    category: ExamStudentCategory.REGULAR,
    status: 'ENROLLED'
  });
  await ExamEnrollment.create({
    cycleId: winterCycle._id,
    studentId: student2._id,
    subjectId: courseDbms._id,
    category: ExamStudentCategory.REGULAR,
    status: 'ENROLLED'
  });

  const rollStudent2 = await RollNumberAssignment.create({
    cycleId: winterCycle._id,
    studentId: student2._id,
    applicationId: appStudent2._id,
    rollNumber: 'WIN2026-ECE-1002',
    assignedAt: new Date()
  });

  await HallTicket.create({
    ticketNumber: 'HT-WIN2026-200002',
    applicationId: appStudent2._id,
    cycleId: winterCycle._id,
    studentId: student2._id,
    rollNumber: rollStudent2.rollNumber,
    centerCode: 'CTR-101',
    centerName: 'Main Academic Complex Exam Hall B',
    reportingTime: '08:30 AM',
    papers: [
      {
        subjectId: courseDsa._id,
        subjectCode: courseDsa.code,
        subjectName: courseDsa.name,
        examDate: '2026-11-20',
        examTime: '09:30 AM - 12:30 PM'
      },
      {
        subjectId: courseDbms._id,
        subjectCode: courseDbms.code,
        subjectName: courseDbms.name,
        examDate: '2026-11-22',
        examTime: '09:30 AM - 12:30 PM'
      }
    ],
    issuedAt: new Date(),
    issuedBy: 'CONTROLLER_OF_EXAMINATIONS'
  });

  // ==========================================
  // 17. M12 EXAM SCHEDULING, CENTERS & MATERIALS FIXTURES
  // ==========================================
  console.log('[Seed] Creating M12 Exam Centers, Verification, Schedule, Allocation, Invigilation & Materials...');

  const examCenterMain = await ExamCenter.create({
    institutionId: inst._id,
    centerCode: 'CTR-MAIN',
    name: 'Main Campus Examination Complex',
    address: 'Block A & B, Knowledge Park, DITS Campus',
    contactPerson: 'Dr. Suresh Menon (Chief Superintendent)',
    contactPhone: '+91 11 2890 4399',
    totalCapacity: 57,
    rooms: [
      {
        roomId: '101',
        roomNumber: '101',
        building: 'Academic Block A',
        floor: 'First Floor',
        capacity: 30,
        hasCCTV: true,
        isAccessible: true
      },
      {
        roomId: '102',
        roomNumber: '102',
        building: 'Academic Block A',
        floor: 'First Floor',
        capacity: 2, // Deliberately small capacity room for over-capacity rejection test
        hasCCTV: true,
        isAccessible: true
      },
      {
        roomId: '103',
        roomNumber: '103',
        building: 'Academic Block B',
        floor: 'Ground Floor',
        capacity: 25,
        hasCCTV: true,
        isAccessible: true
      }
    ],
    status: 'ACTIVE'
  });

  await CenterVerification.create({
    institutionId: inst._id,
    centerId: examCenterMain._id,
    cycleId: winterCycle._id,
    verifiedBy: 'CONTROLLER_OF_EXAMINATIONS',
    verifiedAt: new Date(),
    checklist: {
      cctvFunctional: true,
      secureStorageAvailable: true,
      powerBackupAvailable: true,
      accessibilityCompliant: true,
      drinkingWaterAndWashrooms: true
    },
    remarks: 'Pre-exam inspection completed and approved. CCTV and secure strong-room verified.',
    status: CenterVerificationStatus.VERIFIED
  });

  const schedule1 = await ExamSchedule.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    subjectCode: courseDsa.code,
    subjectName: courseDsa.name,
    examDate: '2026-11-20',
    startTime: '09:30',
    endTime: '12:30',
    session: 'MORNING',
    centerId: examCenterMain._id,
    roomIds: ['101'],
    totalEnrolled: 2,
    status: ExamScheduleStatus.PUBLISHED,
    conflicts: [],
    publishedBy: 'CONTROLLER_OF_EXAMINATIONS',
    publishedAt: new Date()
  });

  const schedule2 = await ExamSchedule.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDbms._id,
    subjectCode: courseDbms.code,
    subjectName: courseDbms.name,
    examDate: '2026-11-22',
    startTime: '09:30',
    endTime: '12:30',
    session: 'MORNING',
    centerId: examCenterMain._id,
    roomIds: ['101'],
    totalEnrolled: 2,
    status: ExamScheduleStatus.PUBLISHED,
    conflicts: [],
    publishedBy: 'CONTROLLER_OF_EXAMINATIONS',
    publishedAt: new Date()
  });

  // Seating Allocation for Student 2
  await SeatingAllocation.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    scheduleId: schedule1._id,
    centerId: examCenterMain._id,
    roomId: '101',
    roomNumber: '101',
    seatNumber: 'R101-S01',
    studentId: student2._id,
    studentRollNumber: 'WIN2026-ECE-1002',
    studentName: 'Ananya Patel',
    subjectId: courseDsa._id,
    allocatedAt: new Date(),
    allocatedBy: 'CONTROLLER_OF_EXAMINATIONS',
    status: SeatingAllocationStatus.ALLOCATED
  });

  // Invigilation Duty: Duty 1 Acknowledged, Duty 2 Assigned (Absent / Pending acknowledgement visible)
  await InvigilationDuty.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    scheduleId: schedule1._id,
    centerId: examCenterMain._id,
    roomId: '101',
    facultyId: facultyCse._id,
    facultyName: facultyCse.name,
    facultyEmail: facultyCse.email,
    dutyDate: '2026-11-20',
    startTime: '09:30',
    endTime: '12:30',
    reportingTime: '08:30 AM',
    status: InvigilationDutyStatus.ACKNOWLEDGED,
    assignedBy: 'CONTROLLER_OF_EXAMINATIONS',
    assignedAt: new Date(),
    acknowledgedAt: new Date()
  });

  await InvigilationDuty.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    scheduleId: schedule2._id,
    centerId: examCenterMain._id,
    roomId: '101',
    facultyId: facultyEce._id,
    facultyName: facultyEce.name,
    facultyEmail: facultyEce.email,
    dutyDate: '2026-11-22',
    startTime: '09:30',
    endTime: '12:30',
    reportingTime: '08:30 AM',
    status: InvigilationDutyStatus.ASSIGNED, // Visible pending acknowledgement / unacknowledged gate
    assignedBy: 'CONTROLLER_OF_EXAMINATIONS',
    assignedAt: new Date()
  });

  // Material Batches
  // Batch 1: Reconciled normal path: 200 dispatched = 180 used + 18 returned + 2 damaged
  const batch1 = await MaterialBatch.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    batchNumber: 'MB-2026-001',
    materialType: MaterialType.MAIN_ANSWER_BOOK,
    prefix: 'AB-',
    startSerial: 100001,
    endSerial: 100500,
    totalCount: 500,
    dispatchedCount: 200,
    usedCount: 180,
    returnedCount: 18,
    damagedCount: 2,
    status: MaterialBatchStatus.RECONCILED,
    securityBagSealNumber: 'SEAL-SEC-9901',
    confidentialNotes: 'High-security 32-page booklet with watermark',
    reconciliationNotes: 'Perfect reconciliation: Dispatched (200) = Used (180) + Returned (18) + Damaged (2)',
    reconciledAt: new Date(),
    reconciledBy: 'CONTROLLER_OF_EXAMINATIONS'
  });

  await MaterialMovement.create({
    institutionId: inst._id,
    batchId: batch1._id,
    movementType: MaterialMovementType.DISPATCH_TO_CENTER,
    centerId: examCenterMain._id,
    scheduleId: schedule1._id,
    startSerial: 100001,
    endSerial: 100200,
    quantity: 200,
    sealNumber: 'SEAL-SEC-9901',
    handledBy: 'CONTROLLER_OF_EXAMINATIONS',
    timestamp: new Date(),
    acknowledgementStatus: 'ACKNOWLEDGED',
    acknowledgedBy: 'Dr. Suresh Menon (Chief Superintendent)',
    acknowledgedAt: new Date(),
    remarks: 'Dispatched to Main Exam Complex under security escort'
  });

  // Batch 2: In-stock / active batch for demo and testing
  await MaterialBatch.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    batchNumber: 'SB-2026-001',
    materialType: MaterialType.SUPPLEMENTARY_SHEET,
    prefix: 'SUP-',
    startSerial: 200001,
    endSerial: 200500,
    totalCount: 500,
    dispatchedCount: 100,
    usedCount: 0,
    returnedCount: 0,
    damagedCount: 0,
    status: MaterialBatchStatus.DISPATCHED,
    securityBagSealNumber: 'SEAL-SEC-9902',
    confidentialNotes: 'Supplementary 8-page ruled sheets'
  });

  //
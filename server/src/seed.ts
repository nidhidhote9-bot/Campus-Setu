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
  ConfidentialAccessType,
  AssessmentBatchStatus,
  MarkAttendanceStatus,
  ResultStatus,
  ProgressionStatus,
  ReviewType,
  ReviewFeeStatus,
  ReviewRequestStatus,
  ReviewOutcomeType,
  ReviewOutcomeStatus,
  TicketPriority,
  HelpdeskTicketStatus,
  EscalationType,
  DevicePlatform
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
  GatePass,
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
  ConfidentialAccessEvent,
  AssessmentBatch,
  MarkEntry,
  MarkImport,
  ModerationDecision,
  AssessmentApproval,
  ResultRun,
  TermResult,
  ResultRevision,
  PublicationEvent,
  TranscriptSnapshot,
  ReviewPolicy,
  ResultReviewRequest,
  ReviewAssignment,
  ReviewOutcome,
  CertificateType,
  CertificateRequest,
  IssuedCertificate,
  CertificateRevocation,
  VerificationToken,
  ServiceCategory,
  SLAPolicy,
  Ticket,
  TicketMessage,
  TicketAssignment,
  EscalationEvent,
  Hostel,
  HostelRoom,
  Bed,
  HostelApplication,
  BedAllocation,
  WaitlistEntry,
  HostelMovement,
  HostelClearance,
  TransportRoute,
  Stop,
  Vehicle,
  DriverAssignment,
  TransportSubscription,
  SeatAllocation,
  TransportPass,
  Trip,
  SimulatedLocation,
  NoticeAudience,
  Notification,
  NotificationPreference,
  OutboxMessage,
  DeliveryAttempt,
  CalendarSubscription,
  GuardianInvitation,
  GuardianLink,
  GuardianPermissionGrant,
  GuardianAccessEvent,
  Committee,
  CommitteeMembership,
  Meeting,
  CommitteeDecision,
  Task,
  Notesheet,
  NotesheetStep,
  RegisterSequence,
  RegisterEntry,
  DocumentMovement,
  DispatchAcknowledgement,
  Employee,
  Appointment,
  ServiceEvent,
  LeavePolicy,
  LeaveBalance,
  LeaveRequest,
  EstablishmentCase,
  SalaryStructureVersion,
  EmployeeSalaryAssignment,
  PayrollRun,
  Payslip,
  DisbursementEvent,
  ExpenseClaim,
  BookTitle,
  BookCopy,
  LibraryMembership,
  Loan,
  Reservation,
  LibraryFinePolicy,
  LibraryClearance,
  InventoryItem,
  Vendor,
  Requisition,
  PurchaseOrder,
  GoodsReceipt,
  StockMovement,
  Asset,
  StockAdjustment,
  ResearchPublication,
  ResearchProject,
  PhDRecord,
  PatentRecord,
  AccreditationEvidence,
  ReportingPeriod,
  ReportSnapshot,
  KnowledgeArticleVersion,
  Conversation,
  AssistantMessage,
  AIEvaluationCase,
  AIEvaluationRun,
  SyntheticDatasetVersion,
  FeatureSnapshot,
  ModelVersion,
  Prediction,
  EvaluationReport,
  AdvisorReview,
  SupportIntervention,
  Topic,
  Resource,
  TopicAssessmentMapping,
  MasterySnapshot,
  Recommendation,
  LearningPlan,
  LearningActivity,
  DeviceRegistration,
  MobileNotificationPreference,
  DemoScenario,
  SimulationEvent,
  IntegrationConfiguration,
  JobRun,
  SeedManifest,
  DemoClock,
  ReleaseManifest,
  AccessibilityAuditReport,
  VerifiedArtifactLink
} from './models/models';
import { HelpdeskService, HostelService, TransportService, CommunicationService, GuardianService, GovernanceService, RegisterService, StaffService, PayrollService, LibraryService, InventoryService, MISService, AssistantService, PredictionService, LearningService, MobileService, DemoOperationsService, ReleaseAuditService } from './services/domainServices';


export async function seedDatabase() {
  console.log('[Seed] Purging existing database collections...');
  try {
    await mongoose.connection.db?.collection('transportroutes').drop();
  } catch (e) {}
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
    Hostel.deleteMany({}),
    HostelRoom.deleteMany({}),
    Bed.deleteMany({}),
    HostelApplication.deleteMany({}),
    BedAllocation.deleteMany({}),
    WaitlistEntry.deleteMany({}),
    HostelMovement.deleteMany({}),
    HostelClearance.deleteMany({}),
    GatePass.deleteMany({}),
    TransportRoute.deleteMany({}),
    Stop.deleteMany({}),
    Vehicle.deleteMany({}),
    DriverAssignment.deleteMany({}),
    TransportSubscription.deleteMany({}),
    SeatAllocation.deleteMany({}),
    TransportPass.deleteMany({}),
    Trip.deleteMany({}),
    SimulatedLocation.deleteMany({}),
    Book.deleteMany({}),
    BookLoan.deleteMany({}),
    PlacementDrive.deleteMany({}),
    PlacementApplication.deleteMany({}),
    AlumniProfile.deleteMany({}),
    Grievance.deleteMany({}),
    Notice.deleteMany({}),
    NoticeAudience.deleteMany({}),
    Notification.deleteMany({}),
    NotificationPreference.deleteMany({}),
    OutboxMessage.deleteMany({}),
    DeliveryAttempt.deleteMany({}),
    CalendarEvent.deleteMany({}),
    CalendarSubscription.deleteMany({}),
    GuardianInvitation.deleteMany({}),
    GuardianLink.deleteMany({}),
    GuardianPermissionGrant.deleteMany({}),
    GuardianAccessEvent.deleteMany({}),
    Committee.deleteMany({}),
    CommitteeMembership.deleteMany({}),
    Meeting.deleteMany({}),
    CommitteeDecision.deleteMany({}),
    Task.deleteMany({}),
    Notesheet.deleteMany({}),
    NotesheetStep.deleteMany({}),
    RegisterSequence.deleteMany({}),
    RegisterEntry.deleteMany({}),
    DocumentMovement.deleteMany({}),
    DispatchAcknowledgement.deleteMany({}),
    Employee.deleteMany({}),
    Appointment.deleteMany({}),
    ServiceEvent.deleteMany({}),
    LeavePolicy.deleteMany({}),
    LeaveBalance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    EstablishmentCase.deleteMany({}),
    SalaryStructureVersion.deleteMany({}),
    EmployeeSalaryAssignment.deleteMany({}),
    PayrollRun.deleteMany({}),
    Payslip.deleteMany({}),
    DisbursementEvent.deleteMany({}),
    ExpenseClaim.deleteMany({}),
    BookTitle.deleteMany({}),
    BookCopy.deleteMany({}),
    LibraryMembership.deleteMany({}),
    Loan.deleteMany({}),
    Reservation.deleteMany({}),
    LibraryFinePolicy.deleteMany({}),
    LibraryClearance.deleteMany({}),
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
    ConfidentialAccessEvent.deleteMany({}),
    AssessmentBatch.deleteMany({}),
    MarkEntry.deleteMany({}),
    MarkImport.deleteMany({}),
    ModerationDecision.deleteMany({}),
    AssessmentApproval.deleteMany({}),
    ResultRun.deleteMany({}),
    TermResult.deleteMany({}),
    ResultRevision.deleteMany({}),
    PublicationEvent.deleteMany({}),
    TranscriptSnapshot.deleteMany({}),
    ReviewPolicy.deleteMany({}),
    ResultReviewRequest.deleteMany({}),
    ReviewAssignment.deleteMany({}),
    ReviewOutcome.deleteMany({}),
    CertificateType.deleteMany({}),
    CertificateRequest.deleteMany({}),
    IssuedCertificate.deleteMany({}),
    CertificateRevocation.deleteMany({}),
    VerificationToken.deleteMany({}),
    InventoryItem.deleteMany({}),
    Vendor.deleteMany({}),
    Requisition.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    GoodsReceipt.deleteMany({}),
    StockMovement.deleteMany({}),
    Asset.deleteMany({}),
    StockAdjustment.deleteMany({}),
    ResearchPublication.deleteMany({}),
    ResearchProject.deleteMany({}),
    PhDRecord.deleteMany({}),
    PatentRecord.deleteMany({}),
    AccreditationEvidence.deleteMany({}),
    ReportingPeriod.deleteMany({}),
    ReportSnapshot.deleteMany({}),
    KnowledgeArticleVersion.deleteMany({}),
    Conversation.deleteMany({}),
    AssistantMessage.deleteMany({}),
    AIEvaluationCase.deleteMany({}),
    AIEvaluationRun.deleteMany({}),
    SyntheticDatasetVersion.deleteMany({}),
    FeatureSnapshot.deleteMany({}),
    ModelVersion.deleteMany({}),
    Prediction.deleteMany({}),
    EvaluationReport.deleteMany({}),
    AdvisorReview.deleteMany({}),
    SupportIntervention.deleteMany({}),
    Topic.deleteMany({}),
    Resource.deleteMany({}),
    TopicAssessmentMapping.deleteMany({}),
    MasterySnapshot.deleteMany({}),
    Recommendation.deleteMany({}),
    LearningPlan.deleteMany({}),
    LearningActivity.deleteMany({}),
    DeviceRegistration.deleteMany({}),
    MobileNotificationPreference.deleteMany({}),
    DemoScenario.deleteMany({}),
    SimulationEvent.deleteMany({}),
    IntegrationConfiguration.deleteMany({}),
    JobRun.deleteMany({}),
    SeedManifest.deleteMany({}),
    DemoClock.deleteMany({}),
    ReleaseManifest.deleteMany({}),
    AccessibilityAuditReport.deleteMany({}),
    VerifiedArtifactLink.deleteMany({})
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


  await GatePass.create({
    studentId: student1._id,
    reason: 'Weekend Home Visit',
    outDate: '2026-10-02',
    inDate: '2026-10-04',
    status: 'APPROVED',
    approvedBy: wardenUser._id
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

  // ==========================================
  // M13: PAPER SETTERS & CONFIDENTIAL QUESTION BANK FIXTURES
  // ==========================================
  console.log('[Seed] Creating M13 Paper Setters, Question Bank, Papers & Controlled Access...');

  // Questions in Question Bank
  const q1 = await Question.create({
    institutionId: inst._id,
    subjectId: courseDsa._id,
    topic: 'Trees and Balanced Search Trees',
    difficulty: QuestionDifficulty.MEDIUM,
    type: QuestionType.SHORT_ANSWER,
    questionText: 'Explain Red-Black Tree rotation mechanisms with balance factor preservation and recoloring rules.',
    marks: 10,
    sampleAnswer: 'Left/Right rotations restore black-height property without altering in-order sequence.',
    rubric: '4 marks for diagrams, 4 marks for recoloring cases, 2 marks for complexity analysis.',
    confidential: true,
    createdBy: facultyCse._id
  });

  const q2 = await Question.create({
    institutionId: inst._id,
    subjectId: courseDsa._id,
    topic: 'Dynamic Programming',
    difficulty: QuestionDifficulty.HARD,
    type: QuestionType.ESSAY,
    questionText: 'Formulate an optimal parenthesization algorithm for Matrix Chain Multiplication. Prove optimal substructure.',
    marks: 15,
    sampleAnswer: 'm[i,j] recurrence with O(n^3) dynamic programming matrix formulation.',
    rubric: '5 marks recurrence formulation, 5 marks DP table trace, 5 marks complexity proof.',
    confidential: true,
    createdBy: facultyCse._id
  });

  const q3 = await Question.create({
    institutionId: inst._id,
    subjectId: courseDbms._id,
    topic: 'Relational Normalization',
    difficulty: QuestionDifficulty.MEDIUM,
    type: QuestionType.SHORT_ANSWER,
    questionText: 'Differentiate between 3NF and Boyce-Codd Normal Form (BCNF) with an example of overlapping candidate keys.',
    marks: 10,
    sampleAnswer: 'BCNF requires every determinant to be a superkey, whereas 3NF allows prime attribute on RHS.',
    rubric: '5 marks for definition, 5 marks for illustrative example.',
    confidential: true,
    createdBy: facultyCse._id
  });

  // Setter Appointment 1: Accepted by facultyCse (Prof. Rajesh Sharma) for DSA
  const setterApp1 = await SetterAppointment.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    facultyId: facultyCse._id,
    role: AppointmentRole.CHIEF_SETTER,
    status: AppointmentStatus.ACCEPTED,
    deadline: new Date('2026-11-10'),
    remunerationPaise: 250000,
    instructions: 'Prepare complete standard paper comprising Section A (Compulsory) and Section B (Electives).',
    invitedAt: new Date(),
    respondedAt: new Date(),
    isNotified: true
  });

  // Setter Appointment 2: OFFERED to facultyCse for DBMS (Ready for acceptance demo!)
  await SetterAppointment.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDbms._id,
    facultyId: facultyCse._id,
    role: AppointmentRole.SETTER,
    status: AppointmentStatus.OFFERED,
    deadline: new Date('2026-11-12'),
    remunerationPaise: 150000,
    instructions: 'Prepare 2 alternate sets for CS202 Database Systems.',
    invitedAt: new Date(),
    isNotified: true
  });

  // Paper Version 1: Submitted & Approved
  const paperV1 = await PaperVersion.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    appointmentId: setterApp1._id,
    setterId: facultyCse._id,
    versionNumber: 1,
    title: 'Autumn/Winter 2026 End-Sem: CS201 Data Structures & Algorithms (Set A)',
    totalMarks: 100,
    instructions: 'Answer all compulsory questions. Scientific non-programmable calculators permitted.',
    contentSummary: 'Standard 3-hour examination paper covering Trees, Graphs, DP and Sorting algorithms.',
    fileStorageKey: `vault://papers/${courseDsa._id}/v1-seeded-sha256`,
    watermarkPolicy: 'CONFIDENTIAL - CONTROLLER OF EXAMINATIONS COPY',
    questions: [
      { questionId: q1._id, questionText: q1.questionText, marks: q1.marks },
      { questionId: q2._id, questionText: q2.questionText, marks: q2.marks }
    ],
    status: PaperVersionStatus.APPROVED,
    declarationAgreed: true,
    submittedAt: new Date('2026-10-05'),
    approvedAt: new Date('2026-10-06'),
    approvedBy: admin._id,
    immutableHash: 'b4a8e29f3152d4889c3f71c905b63e8a4a74288bdf91f9b33a824e8835848d1e'
  });

  // Paper Review Record for Paper Version 1
  await PaperReview.create({
    paperVersionId: paperV1._id,
    reviewerId: admin._id,
    decision: 'APPROVE',
    reviewComments: 'Syllabus coverage verified. Blooms taxonomy distribution is well balanced.',
    suggestedEdits: 'None. Ready for release.',
    reviewedAt: new Date('2026-10-06')
  });

  // Paper Version 2: Sample revised draft for testing and demo
  const paperV2 = await PaperVersion.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    appointmentId: setterApp1._id,
    setterId: facultyCse._id,
    versionNumber: 2,
    title: 'Autumn/Winter 2026 End-Sem: CS201 Data Structures & Algorithms (Set B - Revised)',
    totalMarks: 100,
    instructions: 'Answer all questions. Show working calculations for dynamic programming tables.',
    contentSummary: 'Revised alternate paper addressing moderator comments on complexity proofs.',
    fileStorageKey: `vault://papers/${courseDsa._id}/v2-seeded-sha256`,
    watermarkPolicy: 'CONFIDENTIAL - MODERATION DRAFT',
    questions: [
      { questionId: q1._id, questionText: q1.questionText, marks: q1.marks },
      { questionId: q2._id, questionText: q2.questionText, marks: q2.marks }
    ],
    status: PaperVersionStatus.SUBMITTED,
    declarationAgreed: true,
    submittedAt: new Date('2026-10-07'),
    immutableHash: 'c7d9a11e4281f9538a2e05b918c74d6b5e82194ad02f8a44c7185e9941951f2b'
  });

  // Seed Confidential Access Log
  await ConfidentialAccessEvent.create({
    paperVersionId: paperV1._id,
    userId: admin._id,
    userRole: UserRole.ADMIN,
    accessType: ConfidentialAccessType.VIEW,
    ipAddress: '127.0.0.1',
    purpose: 'Pre-moderation inspection by Examination Office',
    timestamp: new Date('2026-10-06T10:15:00Z'),
    watermarkApplied: `CONFIDENTIAL - AUTHORIZED TO: ${admin.name} (${admin.email})`
  });

  // ==========================================
  // M14: MARKS ENTRY, MODERATION & APPROVAL FIXTURES
  // ==========================================
  console.log('[Seed] Creating M14 Assessment Batches, Marks Entries & Moderation History...');

  // 1. Batch 1: Mid-Term Component (30 Marks) -> APPROVED & LOCKED
  const batchMidSem = await AssessmentBatch.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    componentName: 'Mid-Semester Theory Examination',
    maxMarks: 30,
    facultyId: facultyCse._id,
    status: AssessmentBatchStatus.APPROVED,
    academicTerm: '2026-AUTUMN-SEM3',
    submittedAt: new Date('2026-09-20'),
    approvedAt: new Date('2026-09-22')
  });

  await MarkEntry.create([
    {
      batchId: batchMidSem._id,
      studentId: student1._id,
      marksObtained: 26,
      attendanceStatus: MarkAttendanceStatus.PRESENT,
      remarks: 'Excellent performance in tree algorithms'
    },
    {
      batchId: batchMidSem._id,
      studentId: student2._id,
      marksObtained: 28,
      attendanceStatus: MarkAttendanceStatus.PRESENT,
      remarks: 'Highest score in batch'
    }
  ]);

  await ModerationDecision.create({
    batchId: batchMidSem._id,
    moderatorId: admin._id,
    decision: 'APPROVE',
    comments: 'Component marks verified against evaluated answer sheets.',
    decidedAt: new Date('2026-09-22')
  });

  // 2. Batch 2: End-Term Component (70 Marks) -> SUBMITTED (Ready for moderation)
  const batchEndSem = await AssessmentBatch.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    componentName: 'End-Semester Main Theory',
    maxMarks: 70,
    facultyId: facultyCse._id,
    status: AssessmentBatchStatus.SUBMITTED,
    academicTerm: '2026-AUTUMN-SEM3',
    submittedAt: new Date('2026-10-01')
  });

  await MarkEntry.create([
    {
      batchId: batchEndSem._id,
      studentId: student1._id,
      marksObtained: 62,
      attendanceStatus: MarkAttendanceStatus.PRESENT
    },
    {
      batchId: batchEndSem._id,
      studentId: student2._id,
      marksObtained: 65,
      attendanceStatus: MarkAttendanceStatus.PRESENT
    }
  ]);

  // 3. Batch 3: Practical Component (25 Marks) -> RETURNED (With moderator comments)
  const batchPractical = await AssessmentBatch.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    subjectId: courseDsa._id,
    componentName: 'Data Structures Lab Practical',
    maxMarks: 25,
    facultyId: facultyCse._id,
    status: AssessmentBatchStatus.RETURNED,
    academicTerm: '2026-AUTUMN-SEM3',
    submittedAt: new Date('2026-10-02')
  });

  await MarkEntry.create([
    {
      batchId: batchPractical._id,
      studentId: student1._id,
      marksObtained: 22,
      attendanceStatus: MarkAttendanceStatus.PRESENT
    },
    {
      batchId: batchPractical._id,
      studentId: student2._id,
      marksObtained: 0,
      attendanceStatus: MarkAttendanceStatus.ABSENT,
      remarks: 'Absent for practical lab viva'
    }
  ]);

  await ModerationDecision.create({
    batchId: batchPractical._id,
    moderatorId: admin._id,
    decision: 'RETURN',
    comments: 'Please re-verify attendance status for absent student roll #2026CS102 and check lab logbook.',
    decidedAt: new Date('2026-10-03')
  });

  // Seed sample CSV import log
  await MarkImport.create({
    institutionId: inst._id,
    batchId: batchMidSem._id,
    academicTerm: '2026-AUTUMN-SEM3',
    filename: 'dsa_midsem_marks_v1.csv',
    totalRows: 2,
    validRows: 2,
    errorRows: 0,
    errorDetails: [],
    importedBy: facultyCse._id,
    importedAt: new Date('2026-09-20')
  });

  // ==========================================
  // M15: RESULTS, TRANSCRIPTS & PROGRESSION FIXTURES
  // ==========================================
  console.log('[Seed] Creating M15 Result Runs, Term Grade Cards & Publication History...');

  const resultRunSem3 = await ResultRun.create({
    institutionId: inst._id,
    cycleId: winterCycle._id,
    academicTerm: '2026-AUTUMN-SEM3',
    semester: 3,
    status: ResultStatus.PUBLISHED,
    totalStudents: 2,
    passedCount: 2,
    backlogCount: 0,
    failedCount: 0,
    calculatedAt: new Date('2026-10-04'),
    approvedAt: new Date('2026-10-05'),
    publishedAt: new Date('2026-10-05')
  });

  await PublicationEvent.create({
    runId: resultRunSem3._id,
    academicTerm: '2026-AUTUMN-SEM3',
    publishedBy: admin._id,
    publishTitle: 'Official Autumn/Winter 2026 Semester 3 Main Examination Results',
    publishedAt: new Date('2026-10-05'),
    idempotencyToken: resultRunSem3._id.toString()
  });

  await TermResult.create([
    {
      runId: resultRunSem3._id,
      studentId: student1._id,
      academicTerm: '2026-AUTUMN-SEM3',
      semester: 3,
      subjectResults: [
        {
          subjectId: courseDsa._id,
          subjectCode: 'CS201',
          subjectName: 'Data Structures & Algorithms',
          credits: 4,
          totalMarksObtained: 88,
          totalMaxMarks: 100,
          percentage: 88.0,
          letterGrade: 'A+',
          gradePoint: 9.0,
          isPassed: true
        },
        {
          subjectId: courseDbms._id,
          subjectCode: 'CS202',
          subjectName: 'Database Management Systems',
          credits: 4,
          totalMarksObtained: 82,
          totalMaxMarks: 100,
          percentage: 82.0,
          letterGrade: 'A+',
          gradePoint: 9.0,
          isPassed: true
        }
      ],
      totalCredits: 8,
      earnedCredits: 8,
      sgpa: 9.0,
      cgpa: 9.0,
      progressionStatus: ProgressionStatus.PASS,
      versionNumber: 1,
      isLatest: true
    },
    {
      runId: resultRunSem3._id,
      studentId: student2._id,
      academicTerm: '2026-AUTUMN-SEM3',
      semester: 3,
      subjectResults: [
        {
          subjectId: courseDsa._id,
          subjectCode: 'CS201',
          subjectName: 'Data Structures & Algorithms',
          credits: 4,
          totalMarksObtained: 93,
          totalMaxMarks: 100,
          percentage: 93.0,
          letterGrade: 'O',
          gradePoint: 10.0,
          isPassed: true
        },
        {
          subjectId: courseDbms._id,
          subjectCode: 'CS202',
          subjectName: 'Database Management Systems',
          credits: 4,
          totalMarksObtained: 68,
          totalMaxMarks: 100,
          percentage: 68.0,
          letterGrade: 'B+',
          gradePoint: 7.0,
          isPassed: true
        }
      ],
      totalCredits: 8,
      earnedCredits: 8,
      sgpa: 8.5,
      cgpa: 8.5,
      progressionStatus: ProgressionStatus.PASS,
      versionNumber: 1,
      isLatest: true
    }
  ]);

  // Seed M16: Review Policies & Request Fixture
  const reviewPolicyRetotalling = await ReviewPolicy.create({
    academicTerm: '2026-AUTUMN-SEM3',
    requestType: ReviewType.RETOTALLING,
    feeAmountPaise: 30000,
    applicationWindowDays: 14,
    maxSubjectLimit: 5,
    isActive: true
  });

  const reviewPolicyRevaluation = await ReviewPolicy.create({
    academicTerm: '2026-AUTUMN-SEM3',
    requestType: ReviewType.REVALUATION,
    feeAmountPaise: 75000,
    applicationWindowDays: 14,
    maxSubjectLimit: 3,
    isActive: true
  });

  // Seed M17: Certificate Types Catalog & Initial Requests
  console.log('[Seed] Creating M17 Certificate Types & Seed Requests...');
  const certTypeBonafide = await CertificateType.create({
    code: 'BONAFIDE',
    title: 'Bonafide Student Certificate',
    category: 'BONAFIDE',
    feeAmountPaise: 10000, // ₹100
    processingDays: 2,
    requiresNoDuesClearance: false,
    templateBody: 'This is to certify that {{STUDENT_NAME}} (Roll No: {{ROLL_NUMBER}}, Enrollment: {{ENROLLMENT_NUMBER}}) is a bonafide student of {{INSTITUTION_NAME}} studying in Semester {{SEMESTER}} of {{DEPARTMENT}} program.',
    isActive: true
  });

  const certTypeMigration = await CertificateType.create({
    code: 'DEGREE_TRANSFER',
    title: 'Transfer & Migration Certificate',
    category: 'DEGREE_TRANSFER',
    feeAmountPaise: 50000, // ₹500
    processingDays: 5,
    requiresNoDuesClearance: true,
    templateBody: 'This document certifies the transfer and migration clearance for {{STUDENT_NAME}} (Roll No: {{ROLL_NUMBER}}). All institutional dues and library books are verified as cleared.',
    isActive: true
  });

  const certTypeNoDues = await CertificateType.create({
    code: 'NO_DUES',
    title: 'No Dues & Conduct Certificate',
    category: 'NO_DUES',
    feeAmountPaise: 0,
    processingDays: 3,
    requiresNoDuesClearance: true,
    templateBody: 'Certified that {{STUDENT_NAME}} (Roll No: {{ROLL_NUMBER}}) bears good moral character and has no pending financial or administrative dues.',
    isActive: true
  });

  const seedCertReq1 = await CertificateRequest.create({
    requestNumber: 'CREQ-BONAFIDE-991001',
    studentId: student1._id,
    certificateTypeId: certTypeBonafide._id,
    certificateTypeCode: 'BONAFIDE',
    purpose: 'Passport Application & Official Identity Verification',
    deliveryMode: 'DIGITAL_ONLY',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 86400000 * 2),
    reviewedBy: admin._id,
    reviewedAt: new Date(Date.now() - 86400000)
  });

  // Seed M18: Helpdesk Categories, SLA Policies & Sample Tickets
  console.log('[Seed] Creating M18 Helpdesk Categories, SLA Policies & Seed Tickets...');
  await HelpdeskService.seedInitialHelpdeskData();

  const hostelTicket = await HelpdeskService.createTicket({
    studentId: student1._id.toString(),
    studentRollNumber: student1.rollNumber,
    categoryCode: 'CAT-HOSTEL',
    subCategory: 'Plumbing & Water Supply',
    title: 'Water leakage in Room 304 bathroom',
    description: 'The pipe under the washbasin in Room 304 has been leaking continuously since yesterday evening.',
    priority: TicketPriority.MEDIUM,
    isSensitive: false
  });

  await HelpdeskService.addMessage({
    ticketId: hostelTicket._id.toString(),
    senderId: wardenUser._id.toString(),
    senderName: wardenUser.name,
    senderRole: UserRole.WARDEN,
    message: 'Inspected Room 304. Plumber assigned for repair work today afternoon.',
    isInternalNote: true
  });

  // Seed M19: Hostel Operations
  console.log('[Seed] Creating M19 Hostel Inventory & Sample Allocation...');
  await HostelService.seedInitialHostelData();

  // Seed M20: Transport Operations
  console.log('[Seed] Creating M20 Transport Routes, Vehicles & Stops...');
  await TransportService.seedInitialTransportData();

  // Seed M22: Communications & Outbox Simulator
  console.log('[Seed] Creating M22 Notices, Notifications & Outbox Events...');
  await CommunicationService.seedInitialCommunicationData();

  // Seed M21: Parent & Guardian Portal
  console.log('[Seed] Creating M21 Guardian Links, Invitations & Permission Grants...');
  await GuardianService.seedInitialGuardianData();

  // Seed M23: Governance Committees, Tasks & Notesheets
  console.log('[Seed] Creating M23 Governance Committees, Tasks & Notesheets...');
  await GovernanceService.seedInitialGovernanceData();

  // Seed M24: E-register & Document Movement
  console.log('[Seed] Creating M24 E-Register Sequences & Entries...');
  await RegisterService.seedInitialRegisterData(inst._id.toString());

  // Seed M25: Staff Establishment & Leave
  console.log('[Seed] Creating M25 Staff Profiles, Appointments, Leave Balances & Establishment Registers...');
  await StaffService.seedInitialStaffData(inst._id.toString());

  // Seed M26: Payroll & Expenditure Prototype
  console.log('[Seed] Creating M26 Salary Structures, Assignments, Payroll Runs & Expense Claims...');
  await PayrollService.seedInitialPayrollData(inst._id.toString());

  // Seed M27: Library Services
  console.log('[Seed] Creating M27 Library Catalog, Accessions, Memberships & Fine Policies...');
  await LibraryService.seedInitialLibraryData(inst._id.toString());

  // Seed M28: Inventory, Procurement and Assets
  console.log('[Seed] Creating M28 Inventory Items, Vendors, Procurement & Serialized Assets...');
  await InventoryService.seedInitialInventoryData(inst._id.toString());

  // Seed M29: Research, Accreditation, Establishment & Finance MIS
  console.log('[Seed] Creating M29 Publications, Projects, PhD Records, Patents, Evidence & Reporting Periods...');
  await MISService.seedInitialMISData(inst._id.toString());

  // Seed M31: AI Chat Assistant & Voice Interface
  console.log('[Seed] Creating M31 AI Assistant Knowledge Articles, 32 Evaluation Cases & Initial Run...');
  await AssistantService.seedInitialAssistantData(inst._id.toString());

  // Seed M32: Performance Prediction & Early-Support Analytics
  console.log('[Seed] Creating M32 Synthetic Dataset, Trained Models, Predictions & Interventions...');
  await PredictionService.seedInitialPredictionData(inst._id.toString());

  // Seed M33: Personalized Learning Recommendations
  console.log('[Seed] Creating M33 Course Topics, Curated Multilingual Resources & Baseline Plan...');
  await LearningService.seedInitialLearningData(inst._id.toString());

  // Seed M34: Mobile App & Offline-Safe Access
  console.log('[Seed] Creating M34 Mobile Device Registrations & Offline-Safe Policies...');
  await MobileService.registerDevice({
    institutionId: inst._id.toString(),
    userId: student1.userId.toString(),
    userRole: 'STUDENT',
    deviceId: 'SEED-ANDROID-PIXEL8',
    deviceModel: 'Google Pixel 8 (Android 14)',
    platform: DevicePlatform.ANDROID,
    osVersion: 'Android 14 / API 34',
    appVersion: '1.0.0 (Capacitor)',
    isBiometricEnabled: true
  });

  await MobileService.updateNotificationPreferences(student1.userId.toString(), {
    academicNotices: true,
    feeReminders: true,
    examAlerts: true,
    emergencyAlerts: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    preferredLanguage: 'EN'
  });

  // Seed M35: Demo Operations & Integrations
  console.log('[Seed] Initializing M35 Demo Scenarios, Integration Adapters & Virtual Clock...');
  await DemoOperationsService.listScenarios();
  await DemoOperationsService.listIntegrations(inst._id.toString());
  await DemoOperationsService.getDemoClock();

  // Seed M36: Complete UI Audit, Release Manifest & Verified Artifacts
  console.log('[Seed] Initializing M36 Release Manifest, Accessibility Audit & Verified Artifact Signatures...');
  await ReleaseAuditService.getReleaseManifest();
  await ReleaseAuditService.getAccessibilityAuditReport();
  await ReleaseAuditService.getVerifiedArtifacts();

  await AuditLog.create({
    action: 'SYSTEM_SEED',
    resource: 'Database',
    newState: { status: 'Coherent Synthetic Dataset Initialized' }
  });

  console.log('[Seed] Database successfully seeded!');
}

if (require.main === module) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

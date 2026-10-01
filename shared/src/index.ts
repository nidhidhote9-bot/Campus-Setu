import { z } from 'zod';

// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN',
  FINANCE = 'FINANCE',
  WARDEN = 'WARDEN',
  PLACEMENT_OFFICER = 'PLACEMENT_OFFICER',
  ADMISSIONS_OFFICER = 'ADMISSIONS_OFFICER'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum ExamType {
  MID_TERM = 'MID_TERM',
  END_SEM = 'END_SEM',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT'
}

export enum FeeType {
  TUITION = 'TUITION',
  HOSTEL = 'HOSTEL',
  EXAM = 'EXAM',
  TRANSPORT = 'TRANSPORT',
  LIBRARY = 'LIBRARY',
  OTHER = 'OTHER'
}

export enum PaymentMode {
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  CARD = 'CARD',
  CASH = 'CASH',
  CHQ = 'CHQ'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum GatePassStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum PlacementAppStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWING = 'INTERVIEWING',
  OFFERED = 'OFFERED',
  REJECTED = 'REJECTED'
}

export enum GrievanceCategory {
  ACADEMIC = 'ACADEMIC',
  HOSTEL = 'HOSTEL',
  FINANCIAL = 'FINANCIAL',
  ANTI_RAGGING = 'ANTI_RAGGING',
  FACILITIES = 'FACILITIES',
  OTHER = 'OTHER'
}

export enum GrievanceStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum OutboxStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DISPATCHED = 'DISPATCHED',
  FAILED = 'FAILED',
  RETRIED = 'RETRIED'
}

export enum InvoiceStatus {
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum PaymentOrderStatus {
  CREATED = 'CREATED',
  ATTEMPTED = 'ATTEMPTED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentEventType {
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_PENDING = 'PAYMENT_PENDING'
}

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED'
}

export enum ConcessionCategory {
  MERIT_SCHOLARSHIP = 'MERIT_SCHOLARSHIP',
  NEED_BASED = 'NEED_BASED',
  STAFF_WARD = 'STAFF_WARD',
  SPORTS_QUOTA = 'SPORTS_QUOTA',
  GOVERNMENT_AID = 'GOVERNMENT_AID'
}

export enum ConcessionStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  FROZEN = 'FROZEN'
}

export enum ExamCycleStatus {
  DRAFT = 'DRAFT',
  UPCOMING = 'UPCOMING',
  APPLICATION_OPEN = 'APPLICATION_OPEN',
  REVIEW = 'REVIEW',
  HALL_TICKETS_ISSUED = 'HALL_TICKETS_ISSUED',
  CONCLUDED = 'CONCLUDED'
}

export enum ExamStudentCategory {
  REGULAR = 'REGULAR',
  PRIVATE = 'PRIVATE',
  BACKLOG = 'BACKLOG'
}

export enum ExamApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HALL_TICKET_ISSUED = 'HALL_TICKET_ISSUED'
}

export enum EligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  CONDITIONAL_EXCEPTION = 'CONDITIONAL_EXCEPTION'
}

export enum CenterVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum ExamScheduleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED'
}

export enum SeatingAllocationStatus {
  ALLOCATED = 'ALLOCATED',
  REALLOCATED = 'REALLOCATED',
  CANCELLED = 'CANCELLED'
}

export enum InvigilationDutyStatus {
  ASSIGNED = 'ASSIGNED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  ABSENT = 'ABSENT'
}

export enum MaterialType {
  MAIN_ANSWER_BOOK = 'MAIN_ANSWER_BOOK',
  SUPPLEMENTARY_SHEET = 'SUPPLEMENTARY_SHEET',
  QUESTION_PAPER_PACKET = 'QUESTION_PAPER_PACKET',
  GRAPH_SHEET = 'GRAPH_SHEET'
}

export enum MaterialBatchStatus {
  IN_STOCK = 'IN_STOCK',
  DISPATCHED = 'DISPATCHED',
  RECONCILED = 'RECONCILED',
  DISCREPANCY = 'DISCREPANCY'
}

export enum MaterialMovementType {
  RECEIPT_FROM_PRESS = 'RECEIPT_FROM_PRESS',
  DISPATCH_TO_CENTER = 'DISPATCH_TO_CENTER',
  RETURN_FROM_CENTER = 'RETURN_FROM_CENTER',
  USAGE_REPORT = 'USAGE_REPORT',
  DAMAGE_RECORD = 'DAMAGE_RECORD'
}

// ==========================================
// M14: MARKS ENTRY & MODERATION ENUMS
// ==========================================
export enum AssessmentBatchStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  RETURNED = 'RETURNED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED'
}

export enum MarkAttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  WITHHELD = 'WITHHELD'
}

// ==========================================
// M15: RESULTS, TRANSCRIPTS & PROGRESSION ENUMS
// ==========================================
export enum ResultStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  WITHHELD = 'WITHHELD',
  ARCHIVED = 'ARCHIVED'
}

export enum ProgressionStatus {
  PASS = 'PASS',
  PROMOTED_WITH_BACKLOG = 'PROMOTED_WITH_BACKLOG',
  FAILED = 'FAILED',
  WITHHELD = 'WITHHELD'
}

// ==========================================
// M20: TRANSPORT OPERATIONS ENUMS
// ==========================================

export enum VehicleType {
  BUS = 'BUS',
  MINIBUS = 'MINIBUS',
  VAN = 'VAN'
}

export enum VehicleStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export enum DriverAssignStatus {
  ASSIGNED = 'ASSIGNED',
  UNASSIGNED = 'UNASSIGNED'
}

export enum TransportSubStatus {
  APPLIED = 'APPLIED',
  APPROVED = 'APPROVED',
  WAITLISTED = 'WAITLISTED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SeatAllocationStatus {
  ALLOCATED = 'ALLOCATED',
  RELEASED = 'RELEASED',
  REASSIGNED = 'REASSIGNED'
}

export enum TransportPassStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// ==========================================
// 2. HELPER UTILITIES
// ==========================================

export function formatPaiseToRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(rupees);
}

export function parseRupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// ==========================================
// 3. ZOD VALIDATION SCHEMAS (DTOs)
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  institutionId: z.string().optional(),
  phone: z.string().optional(),
  wardStudentIds: z.array(z.string()).optional()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.nativeEnum(UserRole).optional()
});

export const InstitutionSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(3),
  address: z.string().min(5),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(10)
});

export const DepartmentSchema = z.object({
  institutionId: z.string().min(1),
  code: z.string().min(2).toUpperCase(),
  name: z.string().min(3),
  headOfDepartmentId: z.string().optional()
});

export const StudentCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  rollNumber: z.string().min(2),
  enrollmentNumber: z.string().min(2),
  currentSemester: z.number().min(1).max(10),
  batchYear: z.number().min(2000).max(2100),
  guardianEmail: z.string().email().optional(),
  phone: z.string().optional()
});

export const AttendanceSubmitSchema = z.object({
  institutionId: z.string().min(1),
  courseId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  semester: z.number().min(1),
  section: z.string().min(1),
  entries: z.array(z.object({
    studentId: z.string().min(1),
    status: z.nativeEnum(AttendanceStatus),
    remarks: z.string().optional()
  }))
});

export const MarksEntrySchema = z.object({
  examId: z.string().min(1),
  courseId: z.string().min(1),
  studentMarks: z.array(z.object({
    studentId: z.string().min(1),
    marksObtained: z.number().min(0),
    maxMarks: z.number().gt(0),
    remarks: z.string().optional()
  })),
  isFinalized: z.boolean().default(false)
});

export const FeePaySchema = z.object({
  studentId: z.string().min(1),
  institutionId: z.string().min(1),
  amountPaise: z.number().int().positive('Amount must be positive integer paise'),
  feeType: z.nativeEnum(FeeType),
  paymentMode: z.nativeEnum(PaymentMode),
  idempotencyKey: z.string().min(8, 'Valid Idempotency Key required')
});

export const PayrollApproveSchema = z.object({
  institutionId: z.string().min(1),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  staffId: z.string().min(1),
  baseSalaryPaise: z.number().int().positive(),
  hraPaise: z.number().int().nonnegative(),
  deductionsPaise: z.number().int().nonnegative(),
  remarks: z.string().optional(),
  idempotencyKey: z.string().min(8)
});

export const HostelGatePassSchema = z.object({
  studentId: z.string().min(1),
  reason: z.string().min(5),
  outDate: z.string(),
  inDate: z.string()
});

export const PlacementDriveSchema = z.object({
  institutionId: z.string().min(1),
  companyName: z.string().min(2),
  jobTitle: z.string().min(2),
  packageLpaPaise: z.number().int().positive(),
  eligibilityMinCgpa: z.number().min(0).max(10),
  deadline: z.string()
});

export const GrievanceSubmitSchema = z.object({
  category: z.nativeEnum(GrievanceCategory),
  subject: z.string().min(5),
  description: z.string().min(10),
  isAnonymous: z.boolean().default(false)
});

export const NoticeCreateSimpleSchema = z.object({
  institutionId: z.string().min(1),
  title: z.string().min(3),
  content: z.string().min(5),
  targetRole: z.string().default('ALL'),
  sendSmsNotification: z.boolean().default(true)
});

export const AdmissionApplySchema = z.object({
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  highSchoolScore: z.number().min(0).max(100),
  entranceExamScore: z.number().min(0).max(100),
  documents: z.array(z.object({
    docType: z.string(),
    fileUrl: z.string()
  })).optional(),
  feePaid: z.boolean().default(true)
});

export const AdmissionCorrectionSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  highSchoolScore: z.number().optional(),
  entranceExamScore: z.number().optional()
});

export const AdmissionReviewSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'REQUEST_CORRECTION']),
  reason: z.string().optional(),
  requestedFields: z.array(z.string()).optional()
});

export const CSVImportDryRunSchema = z.object({
  institutionId: z.string().min(1),
  filename: z.string().min(1),
  rows: z.array(z.object({
    row: z.number(),
    name: z.string(),
    email: z.string(),
    externalCode: z.string()
  }))
});

export const CSVImportCommitSchema = z.object({
  institutionId: z.string().min(1),
  batchId: z.string().min(1),
  filename: z.string().min(1),
  rows: z.array(z.object({
    row: z.number(),
    name: z.string(),
    email: z.string(),
    externalCode: z.string()
  }))
});

export const ProfileChangeRequestSchema = z.object({
  studentId: z.string().min(1),
  requestedChanges: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    guardianPhone: z.string().optional()
  }),
  reason: z.string().min(5)
});

export const SubjectEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  semester: z.number().min(1).max(10),
  academicYear: z.string().min(4),
  courseIds: z.array(z.string().min(1))
});

export const StudentTransferSchema = z.object({
  studentId: z.string().min(1),
  transferReason: z.string().min(5),
  targetInstitution: z.string().optional()
});

export const StudentWithdrawSchema = z.object({
  studentId: z.string().min(1),
  withdrawalReason: z.string().min(5)
});

export const AttendanceSessionCaptureSchema = z.object({
  institutionId: z.string().min(1),
  courseId: z.string().min(1),
  section: z.string().default('A'),
  date: z.string().min(1),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  topicCovered: z.string().optional(),
  entries: z.array(z.object({
    studentId: z.string().min(1),
    status: z.nativeEnum(AttendanceStatus),
    remarks: z.string().optional()
  }))
});

export const AttendanceCorrectionRequestSchema = z.object({
  sessionId: z.string().min(1),
  studentId: z.string().min(1),
  requestedStatus: z.nativeEnum(AttendanceStatus),
  reason: z.string().min(5)
});

export const AttendanceCorrectionReviewSchema = z.object({
  correctionId: z.string().min(1),
  decision: z.enum(['APPROVED', 'REJECTED']),
  reviewComments: z.string().optional()
});

export const AttendanceBulkUploadSchema = z.object({
  institutionId: z.string().min(1),
  courseId: z.string().min(1),
  sessionDate: z.string().min(1),
  records: z.array(z.object({
    rollNumber: z.string().min(1),
    status: z.nativeEnum(AttendanceStatus)
  }))
});

export const AttendancePolicySchema = z.object({
  institutionId: z.string().min(1),
  minPercentageRequired: z.number().min(0).max(100).default(75),
  countExcusedInDenominator: z.boolean().default(false),
  policyName: z.string().min(3)
});

export const AlumniServiceToggleSchema = z.object({
  alumniId: z.string().min(1),
  libraryAccessEnabled: z.boolean().optional(),
  transcriptAccessEnabled: z.boolean().optional(),
  careerSupportEnabled: z.boolean().optional()
});

export const RoomSchema = z.object({
  institutionId: z.string().min(1),
  name: z.string().min(1),
  building: z.string().min(1),
  capacity: z.number().int().positive(),
  roomType: z.enum(['LECTURE_HALL', 'LABORATORY', 'SEMINAR_ROOM', 'AUDITORIUM']).default('LECTURE_HALL'),
  hasProjector: z.boolean().default(true),
  hasAC: z.boolean().default(true)
});

export const TimetableEntrySchema = z.object({
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  courseId: z.string().min(1),
  facultyId: z.string().min(1),
  roomId: z.string().min(1),
  semester: z.number().int().min(1).max(10),
  section: z.string().default('A'),
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  recurrencePattern: z.enum(['WEEKLY', 'BIWEEKLY']).default('WEEKLY'),
  academicYear: z.string().default('2026-2027')
});

export const TimetableRescheduleSchema = z.object({
  entryId: z.string().min(1),
  exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newRoomId: z.string().optional(),
  newFacultyId: z.string().optional(),
  newStartTime: z.string().optional(),
  newEndTime: z.string().optional(),
  reason: z.string().min(5),
  sendNotificationNotice: z.boolean().default(true)
});

export const CalendarEventSchema = z.object({
  institutionId: z.string().min(1),
  title: z.string().min(3),
  eventType: z.enum(['HOLIDAY', 'EXAM', 'ACADEMIC_DEADLINE', 'WORKSHOP', 'COLLEGE_FEST']),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  isHoliday: z.boolean().default(false)
});

export const FeeRuleVersionSchema = z.object({
  institutionId: z.string().min(1),
  name: z.string().min(3),
  academicYear: z.string().default('2026-2027'),
  departmentId: z.string().optional(),
  feeCategory: z.nativeEnum(FeeType),
  heads: z.array(z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    amountPaise: z.number().int().positive(),
    isMandatory: z.boolean().default(true)
  })).min(1),
  lateFeeRule: z.object({
    graceDays: z.number().int().nonnegative().default(15),
    dailyLateFeePaise: z.number().int().nonnegative().default(5000),
    maxLateFeePaise: z.number().int().nonnegative().default(100000)
  }).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE')
});

export const AssessFeeInvoiceSchema = z.object({
  institutionId: z.string().min(1),
  studentId: z.string().min(1),
  academicYear: z.string().default('2026-2027'),
  semester: z.number().int().min(1).max(10),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lines: z.array(z.object({
    head: z.string().min(2),
    category: z.string().default('TUITION'),
    amountPaise: z.number().int().positive()
  })).min(1)
});

export const CreatePaymentOrderSchema = z.object({
  invoiceId: z.string().min(1),
  studentId: z.string().min(1),
  institutionId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  idempotencyKey: z.string().min(8),
  provider: z.string().default('RAZORPAY_SIM')
});

export const SimulatorCallbackSchema = z.object({
  orderId: z.string().min(1),
  providerPaymentId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  eventType: z.enum(['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_PENDING']),
  signature: z.string().min(1)
});

export const ConcessionRequestSchema = z.object({
  institutionId: z.string().min(1),
  studentId: z.string().min(1),
  invoiceId: z.string().optional(),
  category: z.nativeEnum(ConcessionCategory),
  amountPaise: z.number().int().positive(),
  reason: z.string().min(5)
});

export const RefundRequestSchema = z.object({
  invoiceId: z.string().min(1),
  receiptId: z.string().optional(),
  studentId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  reason: z.string().min(5)
});

export const BudgetCreateSchema = z.object({
  institutionId: z.string().min(1),
  academicYear: z.string().default('2026-2027'),
  departmentId: z.string().min(1),
  fundCode: z.string().min(2),
  fundName: z.string().min(2),
  allocatedPaise: z.number().int().positive(),
  entries: z.array(z.object({
    head: z.string().min(2),
    allocatedPaise: z.number().int().positive()
  })).optional()
});

export const ExamCycleSchema = z.object({
  institutionId: z.string().min(1),
  code: z.string().min(3),
  name: z.string().min(3),
  academicYear: z.string().default('2026-2027'),
  semester: z.number().int().min(1).max(10),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  applicationStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  applicationEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.nativeEnum(ExamCycleStatus).default(ExamCycleStatus.APPLICATION_OPEN)
});

export const ExamPolicyVersionSchema = z.object({
  cycleId: z.string().min(1),
  version: z.number().default(1),
  minAttendancePercentage: z.number().min(0).max(100).default(75),
  requireFeeClearance: z.boolean().default(true),
  feePerSubjectPaise: z.number().int().nonnegative().default(50000), // ₹500
  lateFeeChargePaise: z.number().int().nonnegative().default(20000), // ₹200
  allowBacklog: z.boolean().default(true),
  allowPrivate: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const ExamApplicationSubmitSchema = z.object({
  cycleId: z.string().min(1),
  studentId: z.string().min(1),
  category: z.nativeEnum(ExamStudentCategory).default(ExamStudentCategory.REGULAR),
  subjectIds: z.array(z.string()).min(1, 'At least one examination paper required')
});

export const ExamExceptionGrantSchema = z.object({
  applicationId: z.string().optional(),
  cycleId: z.string().optional(),
  studentId: z.string().optional(),
  reason: z.string().min(5),
  grantedBy: z.string().min(2),
  overrideAttendance: z.boolean().default(false),
  overrideFee: z.boolean().default(false)
});

export const RollNumberAssignSchema = z.object({
  cycleId: z.string().min(1),
  studentId: z.string().min(1),
  rollNumber: z.string().min(3)
});

export const HallTicketIssueSchema = z.object({
  applicationId: z.string().min(1),
  centerCode: z.string().default('CTR-101'),
  centerName: z.string().default('Main Academic Complex Exam Hall A'),
  reportingTime: z.string().default('08:30 AM')
});

export const ExamCenterCreateSchema = z.object({
  institutionId: z.string().min(1),
  centerCode: z.string().min(2),
  name: z.string().min(3),
  address: z.string().min(5),
  contactPerson: z.string().min(2),
  contactPhone: z.string().min(6),
  totalCapacity: z.number().int().positive(),
  rooms: z.array(z.object({
    roomId: z.string().min(1),
    roomNumber: z.string().min(1),
    building: z.string().min(1),
    floor: z.string().default('Ground Floor'),
    capacity: z.number().int().positive(),
    hasCCTV: z.boolean().default(true),
    isAccessible: z.boolean().default(true)
  })).min(1)
});

export const CenterVerificationSchema = z.object({
  centerId: z.string().min(1),
  cycleId: z.string().min(1),
  checklist: z.object({
    cctvFunctional: z.boolean().default(true),
    secureStorageAvailable: z.boolean().default(true),
    powerBackupAvailable: z.boolean().default(true),
    accessibilityCompliant: z.boolean().default(true),
    drinkingWaterAndWashrooms: z.boolean().default(true)
  }),
  remarks: z.string().min(3),
  status: z.nativeEnum(CenterVerificationStatus).default(CenterVerificationStatus.VERIFIED)
});

export const ExamScheduleCreateSchema = z.object({
  institutionId: z.string().min(1),
  cycleId: z.string().min(1),
  subjectId: z.string().min(1),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  session: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).default('MORNING'),
  centerId: z.string().min(1),
  roomIds: z.array(z.string().min(1)).min(1)
});

export const SeatingAllocationCreateSchema = z.object({
  cycleId: z.string().min(1),
  scheduleId: z.string().min(1),
  centerId: z.string().min(1),
  roomId: z.string().min(1),
  studentIds: z.array(z.string().min(1)).min(1)
});

export const SeatingReallocationSchema = z.object({
  allocationId: z.string().min(1),
  newRoomId: z.string().min(1),
  newSeatNumber: z.string().optional(),
  reason: z.string().min(5)
});

export const InvigilationDutyAssignSchema = z.object({
  cycleId: z.string().min(1),
  scheduleId: z.string().min(1),
  centerId: z.string().min(1),
  roomId: z.string().min(1),
  facultyId: z.string().min(1),
  dutyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  reportingTime: z.string().default('08:30 AM')
});

export const InvigilationAcknowledgeSchema = z.object({
  dutyId: z.string().min(1),
  status: z.enum(['ACKNOWLEDGED', 'DECLINED']),
  declineReason: z.string().optional()
});

export const MaterialBatchCreateSchema = z.object({
  institutionId: z.string().min(1),
  cycleId: z.string().min(1),
  batchNumber: z.string().min(3),
  materialType: z.nativeEnum(MaterialType).default(MaterialType.MAIN_ANSWER_BOOK),
  prefix: z.string().min(1).default('AB-'),
  startSerial: z.number().int().positive(),
  endSerial: z.number().int().positive(),
  securityBagSealNumber: z.string().optional(),
  confidentialNotes: z.string().optional()
});

export const MaterialMovementCreateSchema = z.object({
  batchId: z.string().min(1),
  movementType: z.nativeEnum(MaterialMovementType),
  centerId: z.string().optional(),
  scheduleId: z.string().optional(),
  startSerial: z.number().int().positive(),
  endSerial: z.number().int().positive(),
  quantity: z.number().int().positive(),
  sealNumber: z.string().optional(),
  remarks: z.string().optional()
});

export const MaterialReconcileSchema = z.object({
  batchId: z.string().min(1),
  usedCount: z.number().int().nonnegative(),
  returnedCount: z.number().int().nonnegative(),
  damagedCount: z.number().int().nonnegative().default(0),
  notes: z.string().optional()
});

export type IRegister = z.infer<typeof RegisterSchema>;
export type ILogin = z.infer<typeof LoginSchema>;
export type IFeePay = z.infer<typeof FeePaySchema>;
export type IFeeRuleVersion = z.infer<typeof FeeRuleVersionSchema>;
export type IAssessFeeInvoice = z.infer<typeof AssessFeeInvoiceSchema>;
export type ICreatePaymentOrder = z.infer<typeof CreatePaymentOrderSchema>;
export type ISimulatorCallback = z.infer<typeof SimulatorCallbackSchema>;
export type IConcessionRequest = z.infer<typeof ConcessionRequestSchema>;
export type IRefundRequest = z.infer<typeof RefundRequestSchema>;
export type IBudgetCreate = z.infer<typeof BudgetCreateSchema>;
export type IExamCycle = z.infer<typeof ExamCycleSchema>;
export type IExamPolicyVersion = z.infer<typeof ExamPolicyVersionSchema>;
export type IExamApplicationSubmit = z.infer<typeof ExamApplicationSubmitSchema>;
export type IExamExceptionGrant = z.infer<typeof ExamExceptionGrantSchema>;
export type IRollNumberAssign = z.infer<typeof RollNumberAssignSchema>;
export type IHallTicketIssue = z.infer<typeof HallTicketIssueSchema>;
export type IExamCenterCreate = z.infer<typeof ExamCenterCreateSchema>;
export type ICenterVerification = z.infer<typeof CenterVerificationSchema>;
export type IExamScheduleCreate = z.infer<typeof ExamScheduleCreateSchema>;
export type ISeatingAllocationCreate = z.infer<typeof SeatingAllocationCreateSchema>;
export type ISeatingReallocation = z.infer<typeof SeatingReallocationSchema>;
export type IInvigilationDutyAssign = z.infer<typeof InvigilationDutyAssignSchema>;
export type IInvigilationAcknowledge = z.infer<typeof InvigilationAcknowledgeSchema>;
export type IMaterialBatchCreate = z.infer<typeof MaterialBatchCreateSchema>;
export type IMaterialMovementCreate = z.infer<typeof MaterialMovementCreateSchema>;
export type IMaterialReconcile = z.infer<typeof MaterialReconcileSchema>;

// ==========================================
// M13: QUESTION PAPERS & CONFIDENTIAL QUESTION BANK
// ==========================================

export enum AppointmentStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum AppointmentRole {
  CHIEF_SETTER = 'CHIEF_SETTER',
  SETTER = 'SETTER',
  MODERATOR = 'MODERATOR',
  TRANSLATOR = 'TRANSLATOR'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  NUMERICAL = 'NUMERICAL',
  CASE_STUDY = 'CASE_STUDY'
}

export enum PaperVersionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  NEEDS_REVISION = 'NEEDS_REVISION',
  APPROVED = 'APPROVED',
  RELEASED = 'RELEASED',
  REJECTED = 'REJECTED'
}

export enum ConfidentialAccessType {
  VIEW = 'VIEW',
  PREVIEW_CONTENT = 'PREVIEW_CONTENT',
  DOWNLOAD_WATERMARKED = 'DOWNLOAD_WATERMARKED',
  PRINT_REQUEST = 'PRINT_REQUEST',
  APPROVE_RELEASE = 'APPROVE_RELEASE'
}

export const SetterAppointmentCreateSchema = z.object({
  institutionId: z.string().optional(),
  cycleId: z.string(),
  subjectId: z.string(),
  facultyId: z.string(),
  role: z.nativeEnum(AppointmentRole).default(AppointmentRole.SETTER),
  deadline: z.string(),
  remunerationPaise: z.number().int().nonnegative().default(150000), // e.g. 1500.00 INR
  instructions: z.string().default('Prepare 3 sets of questions complying with university syllabus guidelines.')
});

export const AppointmentResponseSchema = z.object({
  appointmentId: z.string(),
  accept: z.boolean(),
  rejectionReason: z.string().optional()
});

export const QuestionCreateSchema = z.object({
  institutionId: z.string().optional(),
  subjectId: z.string(),
  topic: z.string(),
  difficulty: z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM),
  type: z.nativeEnum(QuestionType).default(QuestionType.SHORT_ANSWER),
  questionText: z.string().min(5),
  marks: z.number().int().positive().default(10),
  sampleAnswer: z.string().optional(),
  rubric: z.string().optional(),
  confidential: z.boolean().default(true)
});

export const PaperVersionSubmitSchema = z.object({
  appointmentId: z.string(),
  subjectId: z.string(),
  cycleId: z.string(),
  title: z.string().min(3),
  totalMarks: z.number().int().positive().default(100),
  instructions: z.string().optional(),
  contentSummary: z.string().optional(),
  questions: z.array(z.any()).optional(),
  declarationAgreed: z.boolean().refine(val => val === true, {
    message: 'Setter must agree to confidentiality and no-conflict declaration'
  })
});

export const PaperReviewSubmitSchema = z.object({
  paperVersionId: z.string(),
  decision: z.enum(['APPROVE', 'REQUEST_REVISION', 'REJECT']),
  reviewComments: z.string().min(3),
  suggestedEdits: z.string().optional()
});

export const PaperReleaseSchema = z.object({
  paperVersionId: z.string(),
  releaseNotes: z.string().optional()
});

export const PaperAccessLogSchema = z.object({
  paperVersionId: z.string(),
  accessType: z.nativeEnum(ConfidentialAccessType).default(ConfidentialAccessType.DOWNLOAD_WATERMARKED),
  purpose: z.string().min(3)
});

export const PaperAssembleSchema = z.object({
  subjectId: z.string(),
  cycleId: z.string(),
  title: z.string(),
  totalMarks: z.number().int().positive().default(100),
  questionIds: z.array(z.string()).min(1)
});

export type ISetterAppointmentCreate = z.infer<typeof SetterAppointmentCreateSchema>;
export type IAppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type IQuestionCreate = z.infer<typeof QuestionCreateSchema>;
export type IPaperVersionSubmit = z.infer<typeof PaperVersionSubmitSchema>;
export type IPaperReviewSubmit = z.infer<typeof PaperReviewSubmitSchema>;
export type IPaperRelease = z.infer<typeof PaperReleaseSchema>;
export type IPaperAccessLog = z.infer<typeof PaperAccessLogSchema>;
export type IPaperAssemble = z.infer<typeof PaperAssembleSchema>;

// ==========================================
// M14: MARKS ENTRY & MODERATION SCHEMAS
// ==========================================

export const AssessmentBatchCreateSchema = z.object({
  institutionId: z.string().optional(),
  cycleId: z.string().min(1, 'Exam cycle required'),
  subjectId: z.string().min(1, 'Subject/course required'),
  componentName: z.string().min(1, 'Component name required'),
  maxMarks: z.number().positive('Max marks must be greater than 0'),
  academicTerm: z.string().min(1, 'Academic term required')
});

export const MarkEntrySaveSchema = z.object({
  batchId: z.string().min(1, 'Batch ID required'),
  entries: z.array(z.object({
    studentId: z.string().min(1, 'Student ID required'),
    marksObtained: z.number().min(0, 'Marks cannot be negative'),
    attendanceStatus: z.nativeEnum(MarkAttendanceStatus).default(MarkAttendanceStatus.PRESENT),
    remarks: z.string().optional(),
    correctionReason: z.string().optional()
  })).min(1, 'At least one mark entry required')
});

export const MarkImportSchema = z.object({
  institutionId: z.string().optional(),
  batchId: z.string().min(1, 'Batch ID required'),
  academicTerm: z.string().min(1, 'Academic term required'),
  filename: z.string().default('marks_import.csv'),
  rows: z.array(z.object({
    rollNumber: z.string().optional(),
    studentId: z.string().optional(),
    marksObtained: z.number(),
    attendanceStatus: z.nativeEnum(MarkAttendanceStatus).default(MarkAttendanceStatus.PRESENT),
    remarks: z.string().optional()
  }))
});

export const ModerationDecisionSchema = z.object({
  batchId: z.string().min(1, 'Batch ID required'),
  decision: z.enum(['APPROVE', 'RETURN']),
  comments: z.string().min(3, 'Comments are required for moderation review')
});

export const AssessmentApprovalSchema = z.object({
  batchId: z.string().min(1, 'Batch ID required'),
  approvalNotes: z.string().optional()
});

export type IAssessmentBatchCreate = z.infer<typeof AssessmentBatchCreateSchema>;
export type IMarkEntrySave = z.infer<typeof MarkEntrySaveSchema>;
export type IMarkImport = z.infer<typeof MarkImportSchema>;
export type IModerationDecision = z.infer<typeof ModerationDecisionSchema>;
export type IAssessmentApproval = z.infer<typeof AssessmentApprovalSchema>;

// ==========================================
// M15: RESULTS, TRANSCRIPTS & PROGRESSION SCHEMAS
// ==========================================

export const ResultRunCreateSchema = z.object({
  institutionId: z.string().optional(),
  cycleId: z.string().min(1, 'Exam cycle required'),
  academicTerm: z.string().min(1, 'Academic term required'),
  semester: z.number().int().min(1).max(10)
});

export const ResultApproveSchema = z.object({
  runId: z.string().min(1, 'Result run ID required'),
  notes: z.string().optional()
});

export const ResultPublishSchema = z.object({
  runId: z.string().min(1, 'Result run ID required'),
  publishTitle: z.string().default('Official Semester Results Announcement'),
  publicationNotes: z.string().optional(),
  idempotencyToken: z.string().optional()
});

export const ResultCorrectionSchema = z.object({
  termResultId: z.string().min(1, 'Term result ID required'),
  subjectCode: z.string().min(1, 'Subject code required'),
  newMarksObtained: z.number().min(0, 'Marks cannot be negative'),
  correctionReason: z.string().min(5, 'Correction reason required for audit trail')
});

export const TranscriptGenerateSchema = z.object({
  studentId: z.string().min(1, 'Student ID required'),
  purpose: z.string().default('Official Transcript Request for Higher Studies / Employment')
});

export type IResultRunCreate = z.infer<typeof ResultRunCreateSchema>;
export type IResultApprove = z.infer<typeof ResultApproveSchema>;
export type IResultPublish = z.infer<typeof ResultPublishSchema>;
export type IResultCorrection = z.infer<typeof ResultCorrectionSchema>;
export type ITranscriptGenerate = z.infer<typeof TranscriptGenerateSchema>;

// ==========================================
// M16: REVALUATION AND RETOTALLING ENUMS & SCHEMAS
// ==========================================
export enum ReviewType {
  RETOTALLING = 'RETOTALLING',
  REVALUATION = 'REVALUATION'
}

export enum ReviewFeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  WAIVED = 'WAIVED'
}

export enum ReviewRequestStatus {
  SUBMITTED = 'SUBMITTED',
  FEE_PAID = 'FEE_PAID',
  ASSIGNED = 'ASSIGNED',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum ReviewOutcomeType {
  NO_CHANGE = 'NO_CHANGE',
  MARKS_INCREASED = 'MARKS_INCREASED',
  MARKS_DECREASED = 'MARKS_DECREASED'
}

export enum ReviewOutcomeStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const ReviewPolicyCreateSchema = z.object({
  institutionId: z.string().optional(),
  academicTerm: z.string().min(1, 'Academic term is required'),
  requestType: z.nativeEnum(ReviewType),
  feeAmountPaise: z.number().int().min(0, 'Fee amount in paise must be non-negative'),
  applicationWindowDays: z.number().int().positive('Window days must be positive'),
  maxSubjectLimit: z.number().int().positive().default(5)
});

export const ReviewRequestSubmitSchema = z.object({
  termResultId: z.string().min(1, 'Term result ID is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
  requestType: z.nativeEnum(ReviewType),
  reason: z.string().min(5, 'Reason for review request is required')
});

export const ReviewAssignmentCreateSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  deadlineDays: z.number().int().positive().default(7),
  remarks: z.string().optional()
});

export const ReviewOutcomeSubmitSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  newMarks: z.number().min(0, 'Marks must be non-negative'),
  reviewerRemarks: z.string().min(5, 'Reviewer remarks are required')
});

export const ReviewOutcomeApproveSchema = z.object({
  outcomeId: z.string().min(1, 'Outcome ID is required'),
  approvalNotes: z.string().min(5, 'Approval notes are required')
});

export const ReviewFeePaySchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.UPI),
  transactionRef: z.string().optional()
});

export type IReviewPolicyCreate = z.infer<typeof ReviewPolicyCreateSchema>;
export type IReviewRequestSubmit = z.infer<typeof ReviewRequestSubmitSchema>;
export type IReviewAssignmentCreate = z.infer<typeof ReviewAssignmentCreateSchema>;
export type IReviewOutcomeSubmit = z.infer<typeof ReviewOutcomeSubmitSchema>;
export type IReviewOutcomeApprove = z.infer<typeof ReviewOutcomeApproveSchema>;
export type IReviewFeePay = z.infer<typeof ReviewFeePaySchema>;

// ==========================================
// M17: CERTIFICATES & DIGITAL VERIFICATION ENUMS & SCHEMAS
// ==========================================

export enum CertificateCategory {
  BONAFIDE = 'BONAFIDE',
  CHARACTER = 'CHARACTER',
  DEGREE_TRANSFER = 'DEGREE_TRANSFER',
  MEDIUM_OF_INSTRUCTION = 'MEDIUM_OF_INSTRUCTION',
  NO_DUES = 'NO_DUES',
  MIGRATION = 'MIGRATION',
  MERIT_SCHOLARSHIP = 'MERIT_SCHOLARSHIP'
}

export enum CertificateRequestStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ISSUED = 'ISSUED'
}

export enum CertificateStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export const CertificateTypeCreateSchema = z.object({
  code: z.string().min(2, 'Certificate code required'),
  title: z.string().min(3, 'Certificate title required'),
  category: z.nativeEnum(CertificateCategory).default(CertificateCategory.BONAFIDE),
  feeAmountPaise: z.number().int().min(0).default(0),
  processingDays: z.number().int().positive().default(3),
  requiresNoDuesClearance: z.boolean().default(false),
  templateBody: z.string().min(10, 'Template body required'),
  isActive: z.boolean().default(true)
});

export const CertificateRequestSubmitSchema = z.object({
  certificateTypeCode: z.string().min(2, 'Certificate type code required'),
  purpose: z.string().min(5, 'Purpose required for certificate issuance'),
  deliveryMode: z.enum(['DIGITAL_ONLY', 'PRINTED_PHYSICAL']).default('DIGITAL_ONLY'),
  supportingNotes: z.string().optional()
});

export const CertificateReviewSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
  comments: z.string().optional()
});

export const CertificateIssueSchema = z.object({
  requestId: z.string().min(1, 'Request ID required'),
  validUntilDays: z.number().int().optional()
});

export const CertificateRevokeSchema = z.object({
  certificateId: z.string().min(1, 'Certificate ID required'),
  revocationReason: z.string().min(5, 'Revocation reason required for audit trail')
});

export type ICertificateTypeCreate = z.infer<typeof CertificateTypeCreateSchema>;
export type ICertificateRequestSubmit = z.infer<typeof CertificateRequestSubmitSchema>;
export type ICertificateReview = z.infer<typeof CertificateReviewSchema>;
export type ICertificateIssue = z.infer<typeof CertificateIssueSchema>;
export type ICertificateRevoke = z.infer<typeof CertificateRevokeSchema>;

// ==========================================
// M18: HELPDESK, GRIEVANCES & SERVICE DESK ENUMS & SCHEMAS
// ==========================================

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum HelpdeskTicketStatus {
  OPEN = 'OPEN',
  TRIAGED = 'TRIAGED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum EscalationType {
  SLA_RESPONSE_BREACH = 'SLA_RESPONSE_BREACH',
  SLA_RESOLUTION_BREACH = 'SLA_RESOLUTION_BREACH',
  MANUAL_ESCALATION = 'MANUAL_ESCALATION'
}

export const ServiceCategoryCreateSchema = z.object({
  code: z.string().min(2, 'Category code required'),
  name: z.string().min(3, 'Category name required'),
  description: z.string().optional(),
  leadStaffId: z.string().optional(),
  defaultSlaHours: z.number().int().positive().default(24),
  isSensitive: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const SLAPolicyCreateSchema = z.object({
  policyCode: z.string().min(2, 'Policy code required'),
  name: z.string().min(3, 'Policy name required'),
  priority: z.nativeEnum(TicketPriority),
  responseTimeHours: z.number().int().positive(),
  resolutionTimeHours: z.number().int().positive(),
  workingHoursOnly: z.boolean().default(true)
});

export const TicketCreateSchema = z.object({
  categoryCode: z.string().min(2, 'Category code required'),
  subCategory: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
  isSensitive: z.boolean().default(false),
  attachments: z.array(z.string()).default([])
});

export const TicketMessageCreateSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  isInternalNote: z.boolean().default(false),
  attachments: z.array(z.string()).default([])
});

export const TicketAssignSchema = z.object({
  assignedToStaffId: z.string().min(1, 'Staff ID required for assignment'),
  notes: z.string().optional()
});

export const TicketStatusUpdateSchema = z.object({
  status: z.nativeEnum(HelpdeskTicketStatus),
  notes: z.string().optional()
});

export const TicketReopenSchema = z.object({
  reason: z.string().min(5, 'Reopen reason is required')
});

export type IServiceCategoryCreate = z.infer<typeof ServiceCategoryCreateSchema>;
export type ISLAPolicyCreate = z.infer<typeof SLAPolicyCreateSchema>;
export type ITicketCreate = z.infer<typeof TicketCreateSchema>;
export type ITicketMessageCreate = z.infer<typeof TicketMessageCreateSchema>;
export type ITicketAssign = z.infer<typeof TicketAssignSchema>;
export type ITicketStatusUpdate = z.infer<typeof TicketStatusUpdateSchema>;
export type ITicketReopen = z.infer<typeof TicketReopenSchema>;

// ==========================================
// M19: HOSTEL OPERATIONS ENUMS & SCHEMAS
// ==========================================

export enum HostelGenderPolicy {
  MALE_ONLY = 'MALE_ONLY',
  FEMALE_ONLY = 'FEMALE_ONLY',
  CO_ED = 'CO_ED'
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  DORMITORY = 'DORMITORY'
}

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export enum HostelAppStatus {
  SUBMITTED = 'SUBMITTED',
  ALLOCATED = 'ALLOCATED',
  WAITLISTED = 'WAITLISTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum BedAllocationStatus {
  ALLOCATED = 'ALLOCATED',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  CHECKED_IN = 'CHECKED_IN',
  TRANSFERRED = 'TRANSFERRED',
  CHECKED_OUT = 'CHECKED_OUT'
}

export enum MovementType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  TRANSFER = 'TRANSFER'
}

export enum WaitlistStatus {
  WAITLISTED = 'WAITLISTED',
  OFFERED = 'OFFERED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export const HostelCreateSchema = z.object({
  code: z.string().min(2, 'Hostel code required'),
  name: z.string().min(3, 'Hostel name required'),
  genderPolicy: z.nativeEnum(HostelGenderPolicy).default(HostelGenderPolicy.MALE_ONLY),
  totalRooms: z.number().int().positive().default(50),
  totalCapacity: z.number().int().positive().default(100),
  wardenId: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const HostelRoomCreateSchema = z.object({
  hostelId: z.string().min(1, 'Hostel ID required'),
  roomNumber: z.string().min(1, 'Room number required'),
  floor: z.number().int().min(0).default(1),
  roomType: z.nativeEnum(RoomType).default(RoomType.DOUBLE),
  capacity: z.number().int().positive().default(2),
  monthlyFeePaise: z.number().int().min(0).default(500000),
  isActive: z.boolean().default(true)
});

export const BedCreateSchema = z.object({
  hostelId: z.string().min(1, 'Hostel ID required'),
  roomId: z.string().min(1, 'Room ID required'),
  bedNumber: z.string().min(1, 'Bed number required')
});

export const HostelAppSubmitSchema = z.object({
  hostelId: z.string().min(1, 'Hostel ID required'),
  preferredRoomType: z.nativeEnum(RoomType).default(RoomType.DOUBLE),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  specialPreferences: z.string().optional(),
  academicTerm: z.string().min(1, 'Academic term required')
});

export const BedAllocateSchema = z.object({
  applicationId: z.string().min(1, 'Application ID required'),
  bedId: z.string().min(1, 'Bed ID required'),
  depositAmountPaise: z.number().int().min(0).default(1000000)
});

export const HostelCheckInSchema = z.object({
  allocationId: z.string().min(1, 'Allocation ID required'),
  remarks: z.string().optional()
});

export const HostelTransferSchema = z.object({
  allocationId: z.string().min(1, 'Allocation ID required'),
  newBedId: z.string().min(1, 'New Bed ID required'),
  reason: z.string().min(5, 'Transfer reason required')
});

export const HostelCheckOutSchema = z.object({
  allocationId: z.string().min(1, 'Allocation ID required'),
  damageChargesPaise: z.number().int().min(0).default(0),
  keysReturned: z.boolean().default(true),
  remarks: z.string().optional()
});

export type IHostelCreate = z.infer<typeof HostelCreateSchema>;
export type IHostelRoomCreate = z.infer<typeof HostelRoomCreateSchema>;
export type IBedCreate = z.infer<typeof BedCreateSchema>;
export type IHostelAppSubmit = z.infer<typeof HostelAppSubmitSchema>;
export type IBedAllocate = z.infer<typeof BedAllocateSchema>;
export type IHostelCheckIn = z.infer<typeof HostelCheckInSchema>;
export type IHostelTransfer = z.infer<typeof HostelTransferSchema>;
export type IHostelCheckOut = z.infer<typeof HostelCheckOutSchema>;



// ==========================================
// M20: TRANSPORT OPERATIONS SCHEMAS
// ==========================================

export const TransportRouteCreateSchema = z.object({
  code: z.string().min(2, 'Route code required'),
  routeName: z.string().min(3, 'Route name required'),
  startPoint: z.string().min(2, 'Start point required'),
  endPoint: z.string().min(2, 'End point required'),
  distanceKm: z.number().positive().default(15),
  operatingStatus: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  serviceTimeSlots: z.array(z.string()).default(['MORNING_PICKUP', 'EVENING_DROP'])
});

export const StopCreateSchema = z.object({
  routeId: z.string().min(1, 'Route ID required'),
  stopName: z.string().min(2, 'Stop name required'),
  sequenceOrder: z.number().int().positive().default(1),
  pickupTime: z.string().default('07:30 AM'),
  dropTime: z.string().default('05:30 PM'),
  farePaise: z.number().int().nonnegative().default(350000), // ₹3,500
  distanceKm: z.number().nonnegative().default(5)
});

export const VehicleCreateSchema = z.object({
  registrationNumber: z.string().min(3, 'Registration number required'),
  vehicleType: z.nativeEnum(VehicleType).default(VehicleType.BUS),
  seatingCapacity: z.number().int().positive().default(40),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.OPERATIONAL),
  manufactureYear: z.number().int().min(2000).default(2022)
});

export const DriverAssignSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID required'),
  driverName: z.string().min(2, 'Driver name required'),
  driverPhone: z.string().min(10, 'Driver phone required'),
  licenseNumber: z.string().min(5, 'License number required'),
  shiftDate: z.string().default('2026-10-01')
});

export const TransportSubSubmitSchema = z.object({
  routeId: z.string().min(1, 'Route ID required'),
  stopId: z.string().min(1, 'Stop ID required'),
  serviceTimeSlot: z.string().default('MORNING_PICKUP'),
  academicTerm: z.string().default('2026-2027')
});

export const TransportSubApproveSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID required'),
  vehicleId: z.string().min(1, 'Vehicle ID required'),
  seatNumber: z.string().optional()
});

export const VehicleSubstituteSchema = z.object({
  routeId: z.string().min(1, 'Route ID required'),
  originalVehicleId: z.string().min(1, 'Original vehicle ID required'),
  replacementVehicleId: z.string().min(1, 'Replacement vehicle ID required'),
  reason: z.string().min(5, 'Reason required')
});

export const TripLogSchema = z.object({
  routeId: z.string().min(1, 'Route ID required'),
  vehicleId: z.string().min(1, 'Vehicle ID required'),
  driverName: z.string().min(2, 'Driver name required'),
  tripDate: z.string().default('2026-10-01'),
  departureTime: z.string().default('07:30 AM'),
  arrivalTime: z.string().default('08:45 AM'),
  totalPassengers: z.number().int().nonnegative().default(35)
});

export const TransportCancelSubSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID required'),
  reason: z.string().min(3, 'Cancellation reason required')
});

export const TransportRenewPassSchema = z.object({
  passId: z.string().min(1, 'Pass ID required'),
  extensionMonths: z.number().int().positive().default(6)
});

export type ITransportRouteCreate = z.infer<typeof TransportRouteCreateSchema>;
export type IStopCreate = z.infer<typeof StopCreateSchema>;
export type IVehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type IDriverAssign = z.infer<typeof DriverAssignSchema>;
export type ITransportSubSubmit = z.infer<typeof TransportSubSubmitSchema>;
export type ITransportSubApprove = z.infer<typeof TransportSubApproveSchema>;
export type IVehicleSubstitute = z.infer<typeof VehicleSubstituteSchema>;
export type ITripLog = z.infer<typeof TripLogSchema>;
export type ITransportCancelSub = z.infer<typeof TransportCancelSubSchema>;
export type ITransportRenewPass = z.infer<typeof TransportRenewPassSchema>;

// ==========================================
// 4. DICTIONARY FOR I18N (ENGLISH & HINDI)
// ==========================================

export const translations = {
  en: {
    appTitle: 'CampusSetu',
    subtitle: 'Higher Education Governance Platform',
    login: 'Log In',
    logout: 'Log Out',
    email: 'Email Address',
    password: 'Password',
    selectRole: 'Select Portal Role',
    dashboard: 'Dashboard',
    institutions: 'Institutions',
    students: 'Students Directory',
    academics: 'Academics & Timetable',
    attendance: 'Attendance',
    exams: 'Examinations & Grades',
    fees: 'Fee Management',
    payroll: 'Finance & Payroll',
    hostel: 'Hostel Facilities',
    transport: 'Transport Services',
    library: 'Library Catalog',
    placement: 'Training & Placements',
    alumni: 'Alumni Network',
    guardian: 'Guardian Portal',
    grievances: 'Grievance Desk',
    notices: 'Notice Board',
    aiRisk: 'AI Early Warning System',
    systemAdmin: 'System Administration',
    resetDemo: 'Reset Disposable Demo Data',
    totalStudents: 'Total Students',
    feeCollected: 'Total Fee Collected',
    activeDrives: 'Active Placement Drives',
    attendanceAvg: 'Average Attendance',
    simulationBadge: 'SIMULATION MODE',
    idempotencyKey: 'Idempotency Key',
    paiseNotice: 'All financial calculations enforced in Integer Paise',
    save: 'Save Changes',
    cancel: 'Cancel',
    success: 'Operation Successful',
    error: 'An error occurred. Please try again.',
    forbidden: 'Access Denied: Insufficient Role Permissions'
  },
  hi: {
    appTitle: 'कैंपससेतु (CampusSetu)',
    subtitle: 'उच्च शिक्षा प्रबंधन एवं शासन मंच',
    login: 'लॉग इन करें',
    logout: 'लॉग आउट',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    selectRole: 'पोर्टल भूमिका चुनें',
    dashboard: 'डैशबोर्ड',
    institutions: 'संस्थान प्रबंधन',
    students: 'छात्र निर्देशिका',
    academics: 'अकादमिक और समय सारणी',
    attendance: 'उपस्थिति प्रबंधन',
    exams: 'परीक्षा एवं ग्रेड',
    fees: 'शुल्क प्रबंधन',
    payroll: 'वित्त एवं वेतनमान',
    hostel: 'छात्रावास सुविधा',
    transport: 'परिवहन सेवाएं',
    library: 'पुस्तकालय सूची',
    placement: 'प्रशिक्षण और प्लेसमेंट',
    alumni: 'एलुमनाई नेटवर्क',
    guardian: 'अभिभावक पोर्टल',
    grievances: 'शिकायत निवारण',
    notices: 'सूचना पट्ट',
    aiRisk: 'एआई प्रारंभिक चेतावनी प्रणाली',
    systemAdmin: 'सिस्टम प्रशासन',
    resetDemo: 'डेमो डेटा रीसेट करें',
    totalStudents: 'कुल छात्र',
    feeCollected: 'कुल एकत्रित शुल्क',
    activeDrives: 'सक्रिय प्लेसमेंट ड्राइव',
    attendanceAvg: 'औसत उपस्थिति',
    simulationBadge: 'सिम्युलेटेड मोड',
    idempotencyKey: 'आइडempotency कुंजी',
    paiseNotice: 'सभी वित्तीय गणना पूर्णांक पैसे (Integer Paise) में सुरक्षित हैं',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    success: 'कार्य सफलतापूर्वक पूरा हुआ',
    error: 'त्रुटि हुई। कृपया पुन: प्रयास करें।',
    forbidden: 'अभिगम अस्वीकृत: पर्याप्त अनुमतियाँ नहीं हैं'
  }
};

// ==========================================
// M22: NOTICES, NOTIFICATIONS & CALENDAR COMMUNICATION
// ==========================================

export enum NoticeStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum NoticeAudienceType {
  ALL_INSTITUTION = 'ALL_INSTITUTION',
  DEPARTMENT = 'DEPARTMENT',
  BATCH = 'BATCH',
  ROLE = 'ROLE',
  SPECIFIC_USERS = 'SPECIFIC_USERS'
}

export enum NoticeCategory {
  ACADEMIC = 'ACADEMIC',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  EXAMINATION = 'EXAMINATION',
  HOSTEL = 'HOSTEL',
  TRANSPORT = 'TRANSPORT',
  EVENT = 'EVENT',
  URGENT = 'URGENT'
}

export enum DeliveryChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}



export enum DeliveryAttemptStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export const NoticeCreateSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(5),
  category: z.nativeEnum(NoticeCategory).default(NoticeCategory.ACADEMIC),
  targetAudience: z.object({
    audienceType: z.nativeEnum(NoticeAudienceType).default(NoticeAudienceType.ALL_INSTITUTION),
    departmentId: z.string().optional(),
    batchYear: z.number().int().optional(),
    targetRole: z.string().optional(),
    specificUserIds: z.array(z.string()).optional()
  }),
  isSensitive: z.boolean().default(false),
  publishImmediately: z.boolean().optional().default(false),
  scheduledPublishAt: z.string().optional(),
  attachments: z.array(z.object({
    title: z.string(),
    url: z.string(),
    fileType: z.string().default('DOCUMENT')
  })).optional().default([])
});

export const NoticePublishSchema = z.object({
  noticeId: z.string().min(1)
});

export const NotificationPreferenceUpdateSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  mutedCategories: z.array(z.string()).optional()
});

export const OutboxRetrySchema = z.object({
  outboxMessageId: z.string().min(1),
  forceSuccess: z.boolean().optional().default(true)
});

export const CalendarEventSubscriptionSchema = z.object({
  calendarEventId: z.string().min(1),
  action: z.enum(['SUBSCRIBE', 'UNSUBSCRIBE'])
});

export type INoticeCreate = z.infer<typeof NoticeCreateSchema>;
export type INoticePublish = z.infer<typeof NoticePublishSchema>;
export type INotificationPreferenceUpdate = z.infer<typeof NotificationPreferenceUpdateSchema>;
export type IOutboxRetry = z.infer<typeof OutboxRetrySchema>;
export type ICalendarEventSubscription = z.infer<typeof CalendarEventSubscriptionSchema>;

// M21 Guardian Contracts & Schemas
export enum GuardianRelationship {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
  SPONSOR = 'SPONSOR'
}

export enum GuardianLinkStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  SUSPENDED = 'SUSPENDED'
}

export enum GuardianInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export const GuardianInviteSchema = z.object({
  studentId: z.string().min(1),
  guardianEmail: z.string().email(),
  guardianName: z.string().min(2),
  guardianPhone: z.string().min(10),
  relationship: z.nativeEnum(GuardianRelationship).default(GuardianRelationship.GUARDIAN)
});

export const GuardianVerifyLinkSchema = z.object({
  invitationCode: z.string().min(4)
});

export const GuardianPermissionUpdateSchema = z.object({
  studentId: z.string().min(1),
  permissions: z.object({
    attendance: z.boolean().optional(),
    fees: z.boolean().optional(),
    results: z.boolean().optional(),
    notices: z.boolean().optional()
  })
});

export const GuardianRevokeSchema = z.object({
  guardianLinkId: z.string().min(1),
  reason: z.string().optional()
});

export type IGuardianInvite = z.infer<typeof GuardianInviteSchema>;
export type IGuardianVerifyLink = z.infer<typeof GuardianVerifyLinkSchema>;
export type IGuardianPermissionUpdate = z.infer<typeof GuardianPermissionUpdateSchema>;
export type IGuardianRevoke = z.infer<typeof GuardianRevokeSchema>;

// M23 Governance Contracts & Schemas
export enum CommitteeType {
  STANDING = 'STANDING',
  AD_HOC = 'AD_HOC',
  ACADEMIC_COUNCIL = 'ACADEMIC_COUNCIL',
  FINANCE_COMMITTEE = 'FINANCE_COMMITTEE',
  EXAM_COMMITTEE = 'EXAM_COMMITTEE',
  DISCIPLINARY = 'DISCIPLINARY'
}

export enum CommitteeMemberRole {
  CHAIRPERSON = 'CHAIRPERSON',
  CONVENER = 'CONVENER',
  MEMBER = 'MEMBER',
  SECRETARY = 'SECRETARY'
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum CommitteeDecisionType {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED',
  ACTION_REQUIRED = 'ACTION_REQUIRED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum NotesheetCategory {
  PURCHASE = 'PURCHASE',
  ACADEMIC = 'ACADEMIC',
  FINANCE = 'FINANCE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  GENERAL = 'GENERAL'
}

export enum NotesheetStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED'
}

export enum NotesheetAction {
  COMPOSE = 'COMPOSE',
  FORWARD = 'FORWARD',
  REVIEW = 'REVIEW',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RETURN = 'RETURN'
}

export const CommitteeCreateSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  description: z.string().optional(),
  committeeType: z.nativeEnum(CommitteeType).default(CommitteeType.STANDING)
});

export const CommitteeMemberSchema = z.object({
  committeeId: z.string().min(1),
  userId: z.string().min(1),
  role: z.nativeEnum(CommitteeMemberRole).default(CommitteeMemberRole.MEMBER),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const MeetingCreateSchema = z.object({
  committeeId: z.string().min(1),
  title: z.string().min(3),
  scheduledAt: z.string().min(5),
  venue: z.string().default('Conference Room 1'),
  agendaItems: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    presenterUserId: z.string().optional()
  })).optional().default([])
});

export const CommitteeDecisionSchema = z.object({
  meetingId: z.string().min(1),
  committeeId: z.string().min(1),
  agendaItemTitle: z.string().min(2),
  decisionText: z.string().min(5),
  decisionType: z.nativeEnum(CommitteeDecisionType).default(CommitteeDecisionType.ACTION_REQUIRED),
  createTaskForUserId: z.string().optional(),
  taskDueDate: z.string().optional()
});

export const TaskCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  assigneeUserId: z.string().min(1),
  dueDate: z.string().min(5),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  committeeId: z.string().optional(),
  meetingId: z.string().optional(),
  notesheetId: z.string().optional()
});

export const TaskStatusUpdateSchema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus)
});

export const NotesheetCreateSchema = z.object({
  subject: z.string().min(3),
  category: z.nativeEnum(NotesheetCategory).default(NotesheetCategory.GENERAL),
  initialRemarks: z.string().min(5),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  nextAssigneeUserId: z.string().optional(),
  requireSeparationOfDuties: z.boolean().optional().default(true),
  attachments: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional().default([])
});

export const NotesheetActionSchema = z.object({
  notesheetId: z.string().min(1),
  action: z.nativeEnum(NotesheetAction),
  remarks: z.string().min(2),
  nextAssigneeUserId: z.string().optional(),
  expectedVersion: z.number().int().optional()
});

export type ICommitteeCreate = z.infer<typeof CommitteeCreateSchema>;
export type ICommitteeMember = z.infer<typeof CommitteeMemberSchema>;
export type IMeetingCreate = z.infer<typeof MeetingCreateSchema>;
export type ICommitteeDecision = z.infer<typeof CommitteeDecisionSchema>;
export type ITaskCreate = z.infer<typeof TaskCreateSchema>;
export type ITaskStatusUpdate = z.infer<typeof TaskStatusUpdateSchema>;
export type INotesheetCreate = z.infer<typeof NotesheetCreateSchema>;
export type INotesheetAction = z.infer<typeof NotesheetActionSchema>;

// M24 E-Register & Document Movement Contracts & Schemas
export enum RegisterType {
  INWARD = 'INWARD',
  OUTWARD = 'OUTWARD'
}

export enum RegisterEntryStatus {
  ACTIVE = 'ACTIVE',
  DISPATCHED = 'DISPATCHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ARCHIVED = 'ARCHIVED',
  VOIDED = 'VOIDED'
}

export enum DocumentMovementStatus {
  DISPATCHED = 'DISPATCHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  REJECTED = 'REJECTED'
}

export const RegisterSequenceConfigSchema = z.object({
  institutionId: z.string().min(1),
  departmentCode: z.string().min(1),
  registerType: z.nativeEnum(RegisterType),
  year: z.number().int().min(2000).max(2100).default(2026),
  prefix: z.string().min(1),
  paddingDigits: z.number().int().min(3).max(8).default(5)
});

export const RegisterEntryCreateSchema = z.object({
  institutionId: z.string().min(1),
  departmentCode: z.string().min(1),
  registerType: z.nativeEnum(RegisterType),
  subject: z.string().min(3),
  senderDetails: z.string().min(2),
  recipientDetails: z.string().min(2),
  documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isPrivate: z.boolean().default(false),
  attachments: z.array(z.object({
    title: z.string().min(1),
    url: z.string().min(1),
    isPrivate: z.boolean().optional().default(false)
  })).optional().default([]),
  metadata: z.string().optional()
});

export const RegisterEntryVoidSchema = z.object({
  entryId: z.string().min(1),
  reason: z.string().min(5)
});

export const DocumentDispatchSchema = z.object({
  entryId: z.string().min(1),
  toDepartmentCode: z.string().min(1),
  remarks: z.string().min(2)
});

export const DocumentAcknowledgeSchema = z.object({
  movementId: z.string().min(1),
  remarks: z.string().optional().default('Received and acknowledged')
});

export type IRegisterSequenceConfig = z.infer<typeof RegisterSequenceConfigSchema>;
export type IRegisterEntryCreate = z.infer<typeof RegisterEntryCreateSchema>;
export type IRegisterEntryVoid = z.infer<typeof RegisterEntryVoidSchema>;
export type IDocumentDispatch = z.infer<typeof DocumentDispatchSchema>;
export type IDocumentAcknowledge = z.infer<typeof DocumentAcknowledgeSchema>;

// M25 Staff Establishment & Leave Contracts & Schemas
export enum LeaveType {
  CASUAL_LEAVE = 'CASUAL_LEAVE',
  EARNED_LEAVE = 'EARNED_LEAVE',
  MEDICAL_LEAVE = 'MEDICAL_LEAVE',
  MATERNITY_LEAVE = 'MATERNITY_LEAVE',
  PATERNITY_LEAVE = 'PATERNITY_LEAVE',
  DUTY_LEAVE = 'DUTY_LEAVE',
  UNPAID_LEAVE = 'UNPAID_LEAVE'
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum EstablishmentCaseType {
  VACANCY_POST = 'VACANCY_POST',
  RETIREMENT_PENSION = 'RETIREMENT_PENSION',
  PROMOTION_CASE = 'PROMOTION_CASE',
  DISCIPLINARY_CASE = 'DISCIPLINARY_CASE'
}

export enum EstablishmentCaseStatus {
  INITIATED = 'INITIATED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMMITTEE_DECISION = 'COMMITTEE_DECISION',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED'
}

export enum ServiceEventType {
  APPOINTMENT = 'APPOINTMENT',
  PROMOTION = 'PROMOTION',
  TRANSFER = 'TRANSFER',
  SUSPENSION = 'SUSPENSION',
  RESIGNATION = 'RESIGNATION',
  RETIREMENT = 'RETIREMENT'
}

export const EmployeeCreateSchema = z.object({
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  userId: z.string().min(1),
  employeeCode: z.string().min(2),
  designation: z.string().min(2),
  dateOfJoining: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  managerUserId: z.string().optional(),
  serviceDocuments: z.array(z.object({
    title: z.string().min(1),
    docType: z.string().min(1),
    url: z.string().min(1),
    isSensitive: z.boolean().optional().default(true)
  })).optional().default([])
});

export const AppointmentAssignSchema = z.object({
  employeeId: z.string().min(1),
  departmentId: z.string().min(1),
  postTitle: z.string().min(2),
  sanctionCode: z.string().min(2),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payScale: z.string().optional().default('LEVEL-10 (₹57,700 - ₹1,82,400)')
});

export const LeaveApplySchema = z.object({
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(5),
  medicalCertificateUrl: z.string().optional()
});

export const LeaveApprovalSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
  remarks: z.string().optional()
});

export const EstablishmentCaseCreateSchema = z.object({
  institutionId: z.string().min(1),
  departmentId: z.string().min(1),
  caseType: z.nativeEnum(EstablishmentCaseType),
  title: z.string().min(3),
  description: z.string().min(5),
  postTitle: z.string().optional(),
  sanctionedSeats: z.number().int().positive().optional().default(1),
  targetEmployeeId: z.string().optional()
});

export type IEmployeeCreate = z.infer<typeof EmployeeCreateSchema>;
export type IAppointmentAssign = z.infer<typeof AppointmentAssignSchema>;
export type ILeaveApply = z.infer<typeof LeaveApplySchema>;
export type ILeaveApproval = z.infer<typeof LeaveApprovalSchema>;
export type IEstablishmentCaseCreate = z.infer<typeof EstablishmentCaseCreateSchema>;

// ==========================================
// M26: PAYROLL AND EXPENDITURE PROTOTYPE ENUMS & SCHEMAS
// ==========================================

export enum SalaryComponentCategory {
  EARNING = 'EARNING',
  DEDUCTION = 'DEDUCTION'
}

export enum SalaryComponentType {
  BASIC = 'BASIC',
  HRA = 'HRA',
  SPECIAL_ALLOWANCE = 'SPECIAL_ALLOWANCE',
  CONVEYANCE = 'CONVEYANCE',
  PF_DEDUCTION = 'PF_DEDUCTION',
  TAX_DEDUCTION = 'TAX_DEDUCTION',
  OTHER_DEDUCTION = 'OTHER_DEDUCTION'
}

export enum PayrollRunStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  CANCELLED = 'CANCELLED'
}

export enum DisbursementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum ExpenseClaimCategory {
  TRAVEL = 'TRAVEL',
  SUPPLIES = 'SUPPLIES',
  EQUIPMENT = 'EQUIPMENT',
  SEMINAR_FEE = 'SEMINAR_FEE',
  OTHER = 'OTHER'
}

export enum ExpenseClaimStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED'
}

export const SalaryStructureSchema = z.object({
  institutionId: z.string().min(1),
  code: z.string().min(2),
  title: z.string().min(2),
  components: z.array(z.object({
    name: z.string().min(1),
    category: z.nativeEnum(SalaryComponentCategory),
    componentType: z.nativeEnum(SalaryComponentType),
    amountPaise: z.number().int().min(0),
    isPercentage: z.boolean().optional().default(false),
    percentageOfComponent: z.string().optional()
  })).min(1)
});

export const EmployeeSalaryAssignmentSchema = z.object({
  employeeId: z.string().min(1),
  salaryStructureId: z.string().min(1),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const PayrollRunCreateSchema = z.object({
  institutionId: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  payPeriod: z.string().min(2)
});

export const ExpenseClaimCreateSchema = z.object({
  institutionId: z.string().min(1),
  category: z.nativeEnum(ExpenseClaimCategory),
  amountPaise: z.number().int().positive(),
  description: z.string().min(5),
  attachmentUrl: z.string().optional()
});

export const ExpenseClaimReviewSchema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
  remarks: z.string().optional()
});

export type ISalaryStructure = z.infer<typeof SalaryStructureSchema>;
export type IEmployeeSalaryAssignment = z.infer<typeof EmployeeSalaryAssignmentSchema>;
export type IPayrollRunCreate = z.infer<typeof PayrollRunCreateSchema>;
export type IExpenseClaimCreate = z.infer<typeof ExpenseClaimCreateSchema>;
export type IExpenseClaimReview = z.infer<typeof ExpenseClaimReviewSchema>;

// ==========================================
// M27: LIBRARY SERVICES TYPES & SCHEMAS
// ==========================================

export enum BookCopyStatus {
  AVAILABLE = 'AVAILABLE',
  ISSUED = 'ISSUED',
  RESERVED = 'RESERVED',
  LOST = 'LOST',
  MAINTENANCE = 'MAINTENANCE'
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  RENEWED = 'RENEWED'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum LibraryClearanceStatus {
  CLEARED = 'CLEARED',
  BLOCKED = 'BLOCKED',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

export const BookTitleSchema = z.object({
  id: z.string().optional(),
  institutionId: z.string().min(1),
  isbn: z.string().min(3),
  title: z.string().min(2),
  authors: z.array(z.string()).min(1),
  publisher: z.string().optional(),
  category: z.string().min(2),
  edition: z.string().optional(),
  totalCopiesCount: z.number().int().min(0).default(0),
  availableCopiesCount: z.number().int().min(0).default(0)
});

export const BookCopySchema = z.object({
  id: z.string().optional(),
  institutionId: z.string().min(1),
  bookTitleId: z.string().min(1),
  accessionNumber: z.string().min(1),
  barcode: z.string().min(1),
  locationRack: z.string().optional(),
  status: z.nativeEnum(BookCopyStatus).default(BookCopyStatus.AVAILABLE),
  condition: z.string().optional().default('GOOD')
});

export const LibraryMembershipSchema = z.object({
  id: z.string().optional(),
  institutionId: z.string().min(1),
  userId: z.string().min(1),
  userRole: z.string().min(1),
  cardBarcode: z.string().min(1),
  maxActiveLoans: z.number().int().min(1).default(3),
  maxLoanDays: z.number().int().min(1).default(14),
  isActive: z.boolean().default(true)
});

export const LoanSchema = z.object({
  id: z.string().optional(),
  institutionId: z.string().min(1),
  copyId: z.string().min(1),
  bookTitleId: z.string().min(1),
  userId: z.string().min(1),
  issuedAt: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  returnedAt: z.string().or(z.date()).optional(),
  renewCount: z.number().int().min(0).default(0),
  status: z.nativeEnum(LoanStatus).default(LoanStatus.ACTIVE),
  overdueFinePaise: z.number().int().min(0).default(0),
  fineInvoiceId: z.string().optional()
});

export const BookTitleCreateSchema = z.object({
  institutionId: z.string().min(1),
  isbn: z.string().min(3),
  title: z.string().min(2),
  authors: z.array(z.string()).min(1),
  publisher: z.string().optional(),
  category: z.string().min(2),
  edition: z.string().optional(),
  initialCopiesCount: z.number().int().min(1).max(50).default(1),
  locationRack: z.string().optional()
});

export const BookCopyAddSchema = z.object({
  institutionId: z.string().min(1),
  bookTitleId: z.string().min(1),
  accessionNumber: z.string().min(1),
  locationRack: z.string().optional()
});

export const BookIssueSchema = z.object({
  institutionId: z.string().min(1),
  accessionNumber: z.string().min(1),
  userId: z.string().min(1),
  overrideDueDate: z.string().optional()
});

export const BookReturnSchema = z.object({
  institutionId: z.string().min(1),
  loanId: z.string().min(1),
  returnDate: z.string().optional() // ISO date or YYYY-MM-DD for simulated testing
});

export const BookRenewSchema = z.object({
  institutionId: z.string().min(1),
  loanId: z.string().min(1),
  simulatedCurrentDate: z.string().optional()
});

export const BookReserveSchema = z.object({
  institutionId: z.string().min(1),
  bookTitleId: z.string().min(1),
  userId: z.string().min(1)
});

export type IBookTitle = z.infer<typeof BookTitleSchema>;
export type IBookCopy = z.infer<typeof BookCopySchema>;
export type ILibraryMembership = z.infer<typeof LibraryMembershipSchema>;
export type ILoan = z.infer<typeof LoanSchema>;
export type IBookTitleCreate = z.infer<typeof BookTitleCreateSchema>;
export type IBookIssue = z.infer<typeof BookIssueSchema>;
export type IBookReturn = z.infer<typeof BookReturnSchema>;

// ==========================================
// M28: INVENTORY, PROCUREMENT AND ASSETS
// ==========================================

export enum StockMovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum RequisitionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PurchaseOrderStatus {
  ISSUED = 'ISSUED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED'
}

export enum AssetStatus {
  IN_SERVICE = 'IN_SERVICE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  DISPOSED = 'DISPOSED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum StockAdjustmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const InventoryItemSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  itemCode: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  unitOfMeasure: z.string().default('units'),
  minStockLevel: z.number().int().nonnegative().default(5),
  currentStock: z.number().int().nonnegative().default(0),
  unitCostPaise: z.number().int().nonnegative().default(0),
  isAssetTracked: z.boolean().default(false),
  storageLocation: z.string().optional(),
  createdAt: z.string().optional()
});

export const VendorSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  vendorCode: z.string().min(1),
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxIdentifierGstin: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const RequisitionItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
  estimatedUnitCostPaise: z.number().int().nonnegative().default(0),
  justification: z.string().optional()
});

export const RequisitionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  requisitionNumber: z.string(),
  departmentId: z.string().optional(),
  requestedBy: z.string(),
  items: z.array(RequisitionItemSchema).min(1),
  status: z.nativeEnum(RequisitionStatus).default(RequisitionStatus.SUBMITTED),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  remarks: z.string().optional(),
  createdAt: z.string().optional()
});

export const POLineItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
  unitCostPaise: z.number().int().positive(),
  totalPaise: z.number().int().positive()
});

export const PurchaseOrderSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  poNumber: z.string(),
  requisitionId: z.string().optional(),
  vendorId: z.string(),
  poDate: z.string(),
  items: z.array(POLineItemSchema).min(1),
  totalAmountPaise: z.number().int().positive(),
  status: z.nativeEnum(PurchaseOrderStatus).default(PurchaseOrderStatus.ISSUED),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional()
});

export const GoodsReceiptItemSchema = z.object({
  itemId: z.string(),
  quantityReceived: z.number().int().positive(),
  condition: z.string().default('GOOD'),
  remarks: z.string().optional()
});

export const GoodsReceiptSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  grnNumber: z.string(),
  purchaseOrderId: z.string(),
  vendorId: z.string(),
  receivedBy: z.string(),
  receivedDate: z.string(),
  items: z.array(GoodsReceiptItemSchema).min(1),
  isStockUpdated: z.boolean().default(false),
  deliveryChallanNumber: z.string().optional(),
  createdAt: z.string().optional()
});

export const StockMovementSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  movementNumber: z.string(),
  itemId: z.string(),
  movementType: z.nativeEnum(StockMovementType),
  quantity: z.number().int().positive(),
  previousStock: z.number().int().nonnegative(),
  newStock: z.number().int().nonnegative(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  performedBy: z.string(),
  notes: z.string().optional(),
  createdAt: z.string().optional()
});

export const AssetMaintenanceLogSchema = z.object({
  date: z.string(),
  description: z.string(),
  costPaise: z.number().int().nonnegative().default(0),
  performedBy: z.string()
});

export const AssetSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  assetTag: z.string(),
  serialNumber: z.string().min(1),
  itemId: z.string(),
  name: z.string(),
  departmentId: z.string().optional(),
  assignedToUserId: z.string().optional(),
  location: z.string().optional(),
  purchaseCostPaise: z.number().int().nonnegative().default(0),
  status: z.nativeEnum(AssetStatus).default(AssetStatus.IN_SERVICE),
  maintenanceHistory: z.array(AssetMaintenanceLogSchema).default([]),
  createdAt: z.string().optional()
});

export const StockAdjustmentSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  adjustmentNumber: z.string(),
  itemId: z.string(),
  systemStock: z.number().int().nonnegative(),
  physicalCount: z.number().int().nonnegative(),
  variance: z.number().int(),
  reason: z.string().min(1),
  status: z.nativeEnum(StockAdjustmentStatus).default(StockAdjustmentStatus.PENDING),
  requestedBy: z.string(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  createdAt: z.string().optional()
});

export type IInventoryItem = z.infer<typeof InventoryItemSchema>;
export type IVendor = z.infer<typeof VendorSchema>;
export type IRequisition = z.infer<typeof RequisitionSchema>;
export type IPurchaseOrder = z.infer<typeof PurchaseOrderSchema>;
export type IGoodsReceipt = z.infer<typeof GoodsReceiptSchema>;
export type IStockMovement = z.infer<typeof StockMovementSchema>;
export type IAsset = z.infer<typeof AssetSchema>;
export type IStockAdjustment = z.infer<typeof StockAdjustmentSchema>;

// ==========================================
// M29: RESEARCH, ACCREDITATION AND MIS
// ==========================================

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum ProjectStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  SUBMITTED = 'SUBMITTED'
}

export enum PhDStatus {
  ENROLLED = 'ENROLLED',
  SYNOPSIS_SUBMITTED = 'SYNOPSIS_SUBMITTED',
  DEFENDED = 'DEFENDED',
  AWARDED = 'AWARDED'
}

export enum PatentStatus {
  FILED = 'FILED',
  PUBLISHED = 'PUBLISHED',
  GRANTED = 'GRANTED'
}

export enum AccreditationStatus {
  DRAFT = 'DRAFT',
  VERIFIED = 'VERIFIED',
  LOCKED = 'LOCKED'
}

export enum MISReportType {
  ENROLLMENT = 'ENROLLMENT',
  FINANCE_COLLECTION = 'FINANCE_COLLECTION',
  ACADEMIC_RESULTS = 'ACADEMIC_RESULTS',
  STAFFING = 'STAFFING',
  COMPREHENSIVE = 'COMPREHENSIVE'
}

export const ResearchPublicationSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  title: z.string().min(3),
  authors: z.array(z.string()).min(1),
  journalConferenceName: z.string().min(2),
  publicationYear: z.number().int().min(1950).max(2050),
  doi: z.string().optional(),
  indexedIn: z.array(z.string()).default(['Scopus']),
  departmentId: z.string().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  isSynthetic: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const ResearchProjectSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  projectTitle: z.string().min(3),
  principalInvestigatorName: z.string().min(2),
  fundingAgency: z.string().min(2),
  grantAmountPaise: z.number().int().nonnegative(),
  durationMonths: z.number().int().positive(),
  startDate: z.string(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ONGOING),
  departmentId: z.string().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
  isSynthetic: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const PhDRecordSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  scholarName: z.string().min(2),
  enrollmentNumber: z.string().min(1),
  departmentId: z.string().optional(),
  supervisorName: z.string().min(2),
  researchTopic: z.string().min(3),
  status: z.nativeEnum(PhDStatus).default(PhDStatus.ENROLLED),
  awardYear: z.number().int().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
  isSynthetic: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const PatentRecordSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  title: z.string().min(3),
  inventors: z.array(z.string()).min(1),
  applicationNumber: z.string().min(1),
  filingDate: z.string(),
  patentOffice: z.string().default('Indian Patent Office (IPO)'),
  status: z.nativeEnum(PatentStatus).default(PatentStatus.FILED),
  grantYear: z.number().int().optional(),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
  isSynthetic: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const AccreditationEvidenceSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  criterionCode: z.string(), // e.g. NAAC_CRITERION_3, NIRF_METRIC_2
  framework: z.string().default('NAAC'), // NAAC, NIRF, NBA
  title: z.string().min(3),
  description: z.string(),
  reportingPeriodId: z.string().optional(),
  evidenceDocumentUrl: z.string().optional(),
  status: z.nativeEnum(AccreditationStatus).default(AccreditationStatus.DRAFT),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().optional(),
  isSynthetic: z.boolean().default(true),
  createdAt: z.string().optional()
});

export const ReportingPeriodSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  academicYear: z.string(), // e.g. '2025-2026'
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isLocked: z.boolean().default(false),
  createdAt: z.string().optional()
});

export const ReportSnapshotSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  snapshotCode: z.string(),
  title: z.string(),
  reportType: z.nativeEnum(MISReportType),
  periodId: z.string().optional(),
  filtersApplied: z.record(z.any()).default({}),
  summaryMetrics: z.record(z.any()).default({}),
  tableData: z.array(z.record(z.any())).default([]),
  formulaDefinitions: z.record(z.string()).default({}),
  isFrozen: z.boolean().default(true),
  publishedBy: z.string(),
  publishedAt: z.string().optional(),
  createdAt: z.string().optional()
});

export type IResearchPublication = z.infer<typeof ResearchPublicationSchema>;
export type IResearchProject = z.infer<typeof ResearchProjectSchema>;
export type IPhDRecord = z.infer<typeof PhDRecordSchema>;
export type IPatentRecord = z.infer<typeof PatentRecordSchema>;
export type IAccreditationEvidence = z.infer<typeof AccreditationEvidenceSchema>;
export type IReportingPeriod = z.infer<typeof ReportingPeriodSchema>;
export type IReportSnapshot = z.infer<typeof ReportSnapshotSchema>;

// ==========================================
// M31: AI CHAT ASSISTANT AND VOICE INTERFACE
// ==========================================

export enum MessageSender {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM'
}

export enum ConversationMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export enum EvaluationCaseCategory {
  FEE_BALANCE = 'FEE_BALANCE',
  NEXT_CLASS = 'NEXT_CLASS',
  HOSTEL_STATUS = 'HOSTEL_STATUS',
  CERTIFICATE_STATUS = 'CERTIFICATE_STATUS',
  UNAUTHORIZED_STUDENT = 'UNAUTHORIZED_STUDENT',
  CONFIDENTIAL_EXAM = 'CONFIDENTIAL_EXAM',
  STAFF_CONFIDENTIAL = 'STAFF_CONFIDENTIAL',
  PROMPT_INJECTION = 'PROMPT_INJECTION',
  FALSE_PREMISE = 'FALSE_PREMISE',
  UNAVAILABLE_DATA = 'UNAVAILABLE_DATA',
  BILINGUAL_HINDI_ENGLISH = 'BILINGUAL_HINDI_ENGLISH',
  TIMEOUT_HANDLING = 'TIMEOUT_HANDLING',
  GENERAL_POLICY = 'GENERAL_POLICY'
}

export enum EvaluationResultStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  REFUSED_PROPERLY = 'REFUSED_PROPERLY'
}

export enum AIProviderMode {
  SIMULATED_DETERMINISTIC = 'SIMULATED_DETERMINISTIC',
  REAL_LLM = 'REAL_LLM'
}

export const SourceCardSchema = z.object({
  title: z.string(),
  module: z.string(),
  recordId: z.string().optional(),
  url: z.string().optional(),
  snippet: z.string()
});

export const LinkedRecordSchema = z.object({
  recordType: z.string(),
  recordId: z.string(),
  label: z.string(),
  url: z.string()
});

export const KnowledgeArticleVersionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  slug: z.string(),
  versionNumber: z.number().int().positive().default(1),
  title: z.string().min(3),
  category: z.string(),
  contentMarkdown: z.string(),
  isPublished: z.boolean().default(true),
  authorizedRoles: z.array(z.string()).default(['STUDENT', 'FACULTY', 'ADMIN']),
  sourceModule: z.string().default('KNOWLEDGE_BASE'),
  createdAt: z.string().optional()
});

export const ConversationSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  userId: z.string(),
  studentId: z.string().optional(),
  title: z.string().default('New Consultation'),
  mode: z.nativeEnum(ConversationMode).default(ConversationMode.TEXT),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const AssistantMessageSchema = z.object({
  _id: z.string().optional(),
  conversationId: z.string(),
  sender: z.nativeEnum(MessageSender),
  text: z.string(),
  sourceCards: z.array(SourceCardSchema).default([]),
  linkedRecords: z.array(LinkedRecordSchema).default([]),
  isRefusal: z.boolean().default(false),
  isSimulated: z.boolean().default(true),
  providerName: z.string().default('CampusSetu Deterministic Grounded Simulator'),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  speechTranscript: z.string().optional(),
  audioDurationSeconds: z.number().optional(),
  createdAt: z.string().optional()
});

export const AIEvaluationCaseSchema = z.object({
  _id: z.string().optional(),
  caseCode: z.string(),
  category: z.nativeEnum(EvaluationCaseCategory),
  prompt: z.string(),
  expectedBehavior: z.string(),
  forbiddenContent: z.array(z.string()).default([]),
  requiredKeywords: z.array(z.string()).default([]),
  personaRole: z.string().default('STUDENT'),
  isSecurityGate: z.boolean().default(false)
});

export const AIEvaluationRunResultSchema = z.object({
  caseCode: z.string(),
  category: z.nativeEnum(EvaluationCaseCategory),
  prompt: z.string(),
  responseText: z.string(),
  sourcesRetrieved: z.array(z.string()).default([]),
  status: z.nativeEnum(EvaluationResultStatus),
  score: z.number().default(1),
  failureReason: z.string().optional()
});

export const AIEvaluationRunSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  runCode: z.string(),
  runDate: z.string(),
  totalCases: z.number().int(),
  passedCases: z.number().int(),
  failedCases: z.number().int(),
  passRatePercentage: z.number(),
  providerMode: z.nativeEnum(AIProviderMode).default(AIProviderMode.SIMULATED_DETERMINISTIC),
  results: z.array(AIEvaluationRunResultSchema),
  evaluatedBy: z.string()
});

export type ISourceCard = z.infer<typeof SourceCardSchema>;
export type ILinkedRecord = z.infer<typeof LinkedRecordSchema>;
export type IKnowledgeArticleVersion = z.infer<typeof KnowledgeArticleVersionSchema>;
export type IConversation = z.infer<typeof ConversationSchema>;
export type IAssistantMessage = z.infer<typeof AssistantMessageSchema>;
export type IAIEvaluationCase = z.infer<typeof AIEvaluationCaseSchema>;
export type IAIEvaluationRunResult = z.infer<typeof AIEvaluationRunResultSchema>;
export type IAIEvaluationRun = z.infer<typeof AIEvaluationRunSchema>;

// ==========================================
// M32: PERFORMANCE PREDICTION & EARLY-SUPPORT ANALYTICS
// ==========================================

export enum RiskBand {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ModelType {
  PERFORMANCE_REGRESSION = 'PERFORMANCE_REGRESSION',
  DROPOUT_LOGISTIC = 'DROPOUT_LOGISTIC',
  DUAL_BASELINE = 'DUAL_BASELINE'
}

export enum ModelStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  TRAINING = 'TRAINING'
}

export enum InterventionType {
  PEER_TUTORING = 'PEER_TUTORING',
  ATTENDANCE_COUNSELING = 'ATTENDANCE_COUNSELING',
  REMEDIAL_CLASS = 'REMEDIAL_CLASS',
  FINANCIAL_COUNSELING = 'FINANCIAL_COUNSELING',
  MENTOR_CHECKIN = 'MENTOR_CHECKIN',
  ACADEMIC_SKILLS = 'ACADEMIC_SKILLS'
}

export enum InterventionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum InterventionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AdvisorReviewDecision {
  MONITOR = 'MONITOR',
  INTERVENTION_REQUIRED = 'INTERVENTION_REQUIRED',
  NO_ACTION = 'NO_ACTION',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export enum DataSufficiency {
  SUFFICIENT = 'SUFFICIENT',
  LOW_DATA = 'LOW_DATA',
  INSUFFICIENT = 'INSUFFICIENT'
}

export const FeatureVectorSchema = z.object({
  attendanceRate: z.number().min(0).max(1), // e.g. 0.82 = 82%
  midSemAverage: z.number().min(0).max(100), // e.g. 68.5%
  assignmentSubmissionRate: z.number().min(0).max(1), // e.g. 0.90
  lmsActivityCount: z.number().nonnegative(), // e.g. 42 interactions
  feeDelayDays: z.number().nonnegative(), // e.g. 0, 15, 45 days
  priorSgpa: z.number().min(0).max(10) // e.g. 7.8
});

export const DriverExplanationSchema = z.object({
  feature: z.string(),
  label: z.string(),
  value: z.number(),
  baselineAverage: z.number(),
  impactWeight: z.number(),
  impactDirection: z.enum(['ELEVATES_RISK', 'PROTECTIVE']),
  explanation: z.string()
});

export const RegressionMetricsSchema = z.object({
  mae: z.number(),
  mse: z.number(),
  rmse: z.number(),
  r2: z.number(),
  sampleCount: z.number().int()
});

export const ClassificationMetricsSchema = z.object({
  accuracy: z.number(),
  precision: z.number(),
  recall: z.number(),
  f1Score: z.number(),
  prAuc: z.number(),
  brierScore: z.number(),
  truePositives: z.number().int(),
  falsePositives: z.number().int(),
  trueNegatives: z.number().int(),
  falseNegatives: z.number().int(),
  supportPositive: z.number().int(),
  supportNegative: z.number().int()
});

export const ThresholdScenarioSchema = z.object({
  threshold: z.number(),
  scenarioLabel: z.string(),
  precision: z.number(),
  recall: z.number(),
  f1Score: z.number(),
  flaggedCount: z.number().int(),
  falseAlertsCount: z.number().int(),
  missedRisksCount: z.number().int(),
  workloadCapacityFeasible: z.boolean(),
  recommendation: z.string()
});

export const CalibrationBinSchema = z.object({
  binIndex: z.number().int(),
  predictedRange: z.string(),
  meanPredictedProbability: z.number(),
  actualPositiveRate: z.number(),
  sampleCount: z.number().int()
});

export const SyntheticDatasetVersionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  versionCode: z.string(),
  academicTerm: z.string(),
  randomSeed: z.number().int(),
  totalRecords: z.number().int(),
  trainCount: z.number().int(),
  holdoutCount: z.number().int(),
  featuresList: z.array(z.string()),
  syntheticLabelNotice: z.string(),
  description: z.string().optional(),
  createdAt: z.string().optional()
});

export const FeatureSnapshotSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  datasetVersionId: z.string().optional(),
  studentId: z.string(),
  studentRollNumber: z.string(),
  studentName: z.string(),
  departmentCode: z.string(),
  academicTerm: z.string(),
  cutoffDate: z.string(),
  partition: z.enum(['TRAIN', 'HOLDOUT', 'PRODUCTION_ACTIVE']),
  features: FeatureVectorSchema,
  targetActualSgpa: z.number().optional(),
  targetDropoutOccurred: z.boolean().optional(),
  dataSufficiency: z.nativeEnum(DataSufficiency).default(DataSufficiency.SUFFICIENT),
  createdAt: z.string().optional()
});

export const ModelVersionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  modelCode: z.string(),
  datasetVersionId: z.string(),
  modelType: z.nativeEnum(ModelType).default(ModelType.DUAL_BASELINE),
  status: z.nativeEnum(ModelStatus).default(ModelStatus.ACTIVE),
  regressionParameters: z.object({
    weights: z.record(z.number()),
    bias: z.number()
  }),
  logisticParameters: z.object({
    weights: z.record(z.number()),
    bias: z.number()
  }),
  preprocessing: z.object({
    featureMeans: z.record(z.number()),
    featureStds: z.record(z.number())
  }),
  holdoutRegressionMetrics: RegressionMetricsSchema,
  holdoutClassificationMetrics: ClassificationMetricsSchema,
  defaultThreshold: z.number().default(0.50),
  syntheticPipelineNotice: z.string(),
  trainedAt: z.string().optional()
});

export const PredictionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  modelVersionId: z.string(),
  studentId: z.string(),
  studentRollNumber: z.string(),
  studentName: z.string(),
  departmentCode: z.string(),
  academicTerm: z.string(),
  predictedSgpa: z.number(),
  predictedSgpaUncertainty: z.object({
    lower: z.number(),
    upper: z.number(),
    confidenceInterval: z.string()
  }),
  dropoutRiskScore: z.number().min(0).max(1),
  riskBand: z.nativeEnum(RiskBand),
  dataSufficiency: z.nativeEnum(DataSufficiency).default(DataSufficiency.SUFFICIENT),
  topDrivers: z.array(DriverExplanationSchema),
  featuresUsed: FeatureVectorSchema,
  isInterventionCreated: z.boolean().default(false),
  generatedAt: z.string().optional()
});

export const EvaluationReportSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  modelVersionId: z.string(),
  datasetVersionId: z.string(),
  regressionMetrics: RegressionMetricsSchema,
  classificationMetrics: ClassificationMetricsSchema,
  thresholdScenarios: z.array(ThresholdScenarioSchema),
  calibrationCurve: z.array(CalibrationBinSchema),
  evaluatedAt: z.string().optional()
});

export const AdvisorReviewSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  predictionId: z.string(),
  reviewerUserId: z.string(),
  reviewerName: z.string(),
  decision: z.nativeEnum(AdvisorReviewDecision),
  reviewNotes: z.string().min(5),
  humanAssessmentScore: z.nativeEnum(RiskBand),
  actionRecommended: z.string().optional(),
  reviewedAt: z.string().optional()
});

export const SupportInterventionSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  studentRollNumber: z.string(),
  studentName: z.string(),
  predictionId: z.string().optional(),
  reviewId: z.string().optional(),
  interventionType: z.nativeEnum(InterventionType),
  priority: z.nativeEnum(InterventionPriority).default(InterventionPriority.MEDIUM),
  status: z.nativeEnum(InterventionStatus).default(InterventionStatus.OPEN),
  assignedStaffUserId: z.string(),
  assignedStaffName: z.string(),
  actionPlan: z.string().min(5),
  outcomeNotes: z.string().optional(),
  targetDueDate: z.string(),
  completedAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type IFeatureVector = z.infer<typeof FeatureVectorSchema>;
export type IDriverExplanation = z.infer<typeof DriverExplanationSchema>;
export type IRegressionMetrics = z.infer<typeof RegressionMetricsSchema>;
export type IClassificationMetrics = z.infer<typeof ClassificationMetricsSchema>;
export type IThresholdScenario = z.infer<typeof ThresholdScenarioSchema>;
export type ICalibrationBin = z.infer<typeof CalibrationBinSchema>;
export type ISyntheticDatasetVersion = z.infer<typeof SyntheticDatasetVersionSchema>;
export type IFeatureSnapshot = z.infer<typeof FeatureSnapshotSchema>;
export type IModelVersion = z.infer<typeof ModelVersionSchema>;
export type IPrediction = z.infer<typeof PredictionSchema>;
export type IEvaluationReport = z.infer<typeof EvaluationReportSchema>;
export type IAdvisorReview = z.infer<typeof AdvisorReviewSchema>;
export type ISupportIntervention = z.infer<typeof SupportInterventionSchema>;

// ==========================================
// M33: PERSONALIZED LEARNING RECOMMENDATIONS
// ==========================================

export enum TopicDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum ResourceFormat {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  PRACTICE_PROBLEMS = 'PRACTICE_PROBLEMS',
  INTERACTIVE_SIM = 'INTERACTIVE_SIM',
  SLIDES = 'SLIDES',
  REFERENCE_NOTES = 'REFERENCE_NOTES'
}

export enum ResourceLanguage {
  EN = 'EN',
  HI = 'HI',
  BOTH = 'BOTH'
}

export enum MasteryLevel {
  NOVICE = 'NOVICE',
  DEVELOPING = 'DEVELOPING',
  PROFICIENT = 'PROFICIENT',
  MASTERY = 'MASTERY'
}

export enum RecommendationStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  DISMISSED = 'DISMISSED'
}

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export enum ActivityType {
  RESOURCE_VIEW = 'RESOURCE_VIEW',
  PRACTICE_COMPLETION = 'PRACTICE_COMPLETION',
  QUIZ_ATTEMPT = 'QUIZ_ATTEMPT',
  SELF_STUDY = 'SELF_STUDY'
}

export enum ActivityStatus {
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export const TopicSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  topicCode: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  moduleNumber: z.number().int().positive().default(1),
  difficulty: z.nativeEnum(TopicDifficulty).default(TopicDifficulty.INTERMEDIATE),
  prerequisiteTopicIds: z.array(z.string()).default([]),
  targetMasteryThreshold: z.number().min(0).max(100).default(70),
  createdAt: z.string().optional()
});

export const ResourceSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  courseId: z.string(),
  topicId: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  url: z.string(),
  durationMinutes: z.number().int().positive().default(15),
  difficulty: z.nativeEnum(TopicDifficulty).default(TopicDifficulty.INTERMEDIATE),
  language: z.nativeEnum(ResourceLanguage).default(ResourceLanguage.EN),
  format: z.nativeEnum(ResourceFormat).default(ResourceFormat.VIDEO),
  provider: z.string().default('CampusSetu Curated Faculty Repository'),
  isVerifiedCatalog: z.boolean().default(true),
  rating: z.number().min(1).max(5).default(4.5),
  createdAt: z.string().optional()
});

export const TopicAssessmentMappingSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  courseId: z.string(),
  assessmentBatchId: z.string(),
  topicId: z.string(),
  componentName: z.string(),
  weightPercentage: z.number().min(0).max(100),
  maxMarks: z.number().positive(),
  createdAt: z.string().optional()
});

export const MasterySnapshotSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  courseId: z.string(),
  topicId: z.string(),
  topicTitle: z.string().optional(),
  topicCode: z.string().optional(),
  masteryScore: z.number().min(0).max(100),
  masteryLevel: z.nativeEnum(MasteryLevel),
  sampleCount: z.number().int().nonnegative().default(0),
  isStarterBaseline: z.boolean().default(false),
  lastEvaluatedAt: z.string().optional()
});

export const RecommendationSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  learningPlanId: z.string(),
  courseId: z.string(),
  topicId: z.string(),
  resourceId: z.string(),
  topicTitle: z.string().optional(),
  resourceTitle: z.string().optional(),
  resourceFormat: z.nativeEnum(ResourceFormat).optional(),
  resourceLanguage: z.nativeEnum(ResourceLanguage).optional(),
  durationMinutes: z.number().optional(),
  rank: z.number().int().positive(),
  matchScore: z.number().min(0).max(100),
  ruleRationale: z.string().min(5),
  groundedFactExplanation: z.string().optional(),
  status: z.nativeEnum(RecommendationStatus).default(RecommendationStatus.ACTIVE),
  facultyEndorsed: z.boolean().default(false),
  endorsedByFacultyId: z.string().optional(),
  endorsedByFacultyName: z.string().optional(),
  generatedAt: z.string().optional()
});

export const LearningPlanSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  studentRollNumber: z.string(),
  studentName: z.string(),
  courseId: z.string(),
  courseCode: z.string(),
  courseName: z.string(),
  academicTerm: z.string(),
  title: z.string(),
  targetCompletionDate: z.string(),
  targetMastery: z.number().min(0).max(100).default(80),
  aggregateMastery: z.number().min(0).max(100).default(0),
  preferredLanguage: z.nativeEnum(ResourceLanguage).default(ResourceLanguage.EN),
  preferredFormat: z.nativeEnum(ResourceFormat).default(ResourceFormat.VIDEO),
  weeklyStudyHours: z.number().positive().default(6),
  status: z.nativeEnum(PlanStatus).default(PlanStatus.ACTIVE),
  isStarterPlan: z.boolean().default(false),
  starterPlanNotice: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const LearningActivitySchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  studentId: z.string(),
  learningPlanId: z.string(),
  topicId: z.string(),
  resourceId: z.string(),
  topicTitle: z.string().optional(),
  resourceTitle: z.string().optional(),
  activityType: z.nativeEnum(ActivityType).default(ActivityType.RESOURCE_VIEW),
  status: z.nativeEnum(ActivityStatus).default(ActivityStatus.STARTED),
  timeSpentMinutes: z.number().int().nonnegative().default(0),
  scoreObtained: z.number().min(0).max(100).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedbackNotes: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string().optional()
});

export type ITopic = z.infer<typeof TopicSchema>;
export type IResource = z.infer<typeof ResourceSchema>;
export type ITopicAssessmentMapping = z.infer<typeof TopicAssessmentMappingSchema>;
export type IMasterySnapshot = z.infer<typeof MasterySnapshotSchema>;
export type IRecommendation = z.infer<typeof RecommendationSchema>;
export type ILearningPlan = z.infer<typeof LearningPlanSchema>;
export type ILearningActivity = z.infer<typeof LearningActivitySchema>;

// ==========================================
// M34: MOBILE APP AND OFFLINE-SAFE ACCESS
// ==========================================

export enum DevicePlatform {
  ANDROID = 'ANDROID',
  PWA = 'PWA',
  WEB = 'WEB'
}

export enum DeviceRegistrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED'
}

export const DeviceRegistrationSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  userId: z.string(),
  userRole: z.string().default('STUDENT'),
  deviceId: z.string().min(3),
  deviceModel: z.string().default('Generic Android / PWA Device'),
  platform: z.nativeEnum(DevicePlatform).default(DevicePlatform.ANDROID),
  osVersion: z.string().default('Android 14 / API 34'),
  appVersion: z.string().default('1.0.0 (Capacitor)'),
  pushToken: z.string().optional(),
  isBiometricEnabled: z.boolean().default(false),
  lastActiveAt: z.string().optional(),
  status: z.nativeEnum(DeviceRegistrationStatus).default(DeviceRegistrationStatus.ACTIVE),
  registeredAt: z.string().optional()
});

export const NotificationPreferenceSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  userId: z.string(),
  academicNotices: z.boolean().default(true),
  feeReminders: z.boolean().default(true),
  examAlerts: z.boolean().default(true),
  emergencyAlerts: z.boolean().default(true),
  pushEnabled: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
  vibrateEnabled: z.boolean().default(true),
  preferredLanguage: z.enum(['EN', 'HI']).default('EN'),
  updatedAt: z.string().optional()
});

export const StoragePolicySchema = z.object({
  cacheStrategy: z.string().default('CACHE_FIRST_STATIC_STRICT_NO_OFFLINE_WRITES'),
  maxCacheAgeHours: z.number().default(24),
  allowOfflinePrivateWrites: z.boolean().default(false),
  offlineWritesWarning: z.string().default('Offline private writes are strictly disabled to protect student records. Please connect to a secure campus network.'),
  clearLocalStateOnLogout: z.boolean().default(true)
});

export const DeepLinkRouteSchema = z.object({
  scheme: z.string().default('campussetu'),
  host: z.string().default('app'),
  path: z.string(),
  requiresAuth: z.boolean().default(true),
  targetUrl: z.string(),
  description: z.string()
});

export type IDeviceRegistration = z.infer<typeof DeviceRegistrationSchema>;
export type INotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
export type IStoragePolicy = z.infer<typeof StoragePolicySchema>;
export type IDeepLinkRoute = z.infer<typeof DeepLinkRouteSchema>;

// ============================================================================
// M35: DEMO CONTROL CENTER, INTEGRATIONS AND OPERATIONS
// ============================================================================

export enum DemoScenarioCategory {
  ADMISSIONS = 'ADMISSIONS',
  EXAMINATIONS = 'EXAMINATIONS',
  FINANCE = 'FINANCE',
  FINANCE_INTEGRATIONS = 'FINANCE_INTEGRATIONS',
  PLACEMENTS = 'PLACEMENTS',
  INCIDENT_RECOVERY = 'INCIDENT_RECOVERY',
  AI_SYSTEMS = 'AI_SYSTEMS',
  ACADEMIC_OPERATIONS = 'ACADEMIC_OPERATIONS'
}

export enum SimulationAdapterId {
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  PAYMENT_GATEWAY_RAZORPAY = 'PAYMENT_GATEWAY_RAZORPAY',
  COMMUNICATION_OUTBOX = 'COMMUNICATION_OUTBOX',
  NOTIFICATION_SMS_MSG91 = 'NOTIFICATION_SMS_MSG91',
  DIGILOCKER_NAD = 'DIGILOCKER_NAD',
  BIOMETRIC_DEVICE = 'BIOMETRIC_DEVICE',
  ML_INFERENCE_ENGINE = 'ML_INFERENCE_ENGINE',
  EMAIL_SMTP = 'EMAIL_SMTP'
}

export enum SimulationEventStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  REPLAYED = 'REPLAYED'
}

export enum IntegrationMode {
  MOCK = 'MOCK',
  SIMULATED = 'SIMULATED',
  SANDBOX = 'SANDBOX',
  LIVE = 'LIVE'
}

export enum IntegrationHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE'
}

export enum JobRunnerType {
  CRON = 'CRON',
  EVENT_DRIVEN = 'EVENT_DRIVEN',
  MANUAL = 'MANUAL'
}

export enum JobRunStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum SeedValidationStatus {
  VALID = 'VALID',
  CORRUPTED = 'CORRUPTED',
  INCOMPLETE = 'INCOMPLETE'
}

export const DemoScenarioSchema = z.object({
  _id: z.string().optional(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.nativeEnum(DemoScenarioCategory),
  affectedModules: z.array(z.string()),
  entityCounts: z.record(z.string(), z.number()).default({}),
  isActive: z.boolean().default(true),
  lastExecutedAt: z.string().optional(),
  executionNotes: z.string().optional(),
  requiredRole: z.nativeEnum(UserRole).default(UserRole.SUPER_ADMIN),
  createdAt: z.string().optional()
});

export const SimulationEventSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  eventId: z.string(),
  adapterId: z.nativeEnum(SimulationAdapterId),
  eventType: z.string(),
  payload: z.record(z.string(), z.any()),
  status: z.nativeEnum(SimulationEventStatus).default(SimulationEventStatus.PENDING),
  errorMessage: z.string().optional(),
  retryCount: z.number().default(0),
  simulatedLatencyMs: z.number().default(150),
  signature: z.string().optional(),
  idempotencyKey: z.string().optional(),
  auditLogged: z.boolean().default(true),
  executedBy: z.string().optional(),
  createdAt: z.string().optional(),
  processedAt: z.string().optional()
});

export const IntegrationConfigurationSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  adapterId: z.nativeEnum(SimulationAdapterId),
  adapterName: z.string(),
  mode: z.nativeEnum(IntegrationMode).default(IntegrationMode.SIMULATED),
  endpointUrl: z.string(),
  healthStatus: z.nativeEnum(IntegrationHealthStatus).default(IntegrationHealthStatus.HEALTHY),
  lastHeartbeatAt: z.string().optional(),
  failureRatePercent: z.number().default(0),
  enabled: z.boolean().default(true),
  configJson: z.record(z.string(), z.any()).default({}),
  updatedAt: z.string().optional()
});

export const JobRunSchema = z.object({
  _id: z.string().optional(),
  institutionId: z.string(),
  jobKey: z.string(),
  jobName: z.string(),
  runnerType: z.nativeEnum(JobRunnerType).default(JobRunnerType.CRON),
  status: z.nativeEnum(JobRunStatus).default(JobRunStatus.IDLE),
  lastRunAt: z.string().optional(),
  durationMs: z.number().default(0),
  itemsProcessed: z.number().default(0),
  itemsFailed: z.number().default(0),
  nextRunAt: z.string().optional(),
  logSnippet: z.string().optional()
});

export const SeedManifestSchema = z.object({
  _id: z.string().optional(),
  version: z.string().default('1.0.0-campussetu-seed'),
  checksum: z.string(),
  totalEntities: z.number(),
  entityCountsByType: z.record(z.string(), z.number()),
  missingReferences: z.array(z.string()).default([]),
  validationStatus: z.nativeEnum(SeedValidationStatus).default(SeedValidationStatus.VALID),
  generatedAt: z.string().optional()
});

export const DemoClockSchema = z.object({
  _id: z.string().optional(),
  isSimulated: z.boolean().default(true),
  referenceDate: z.string().default('2026-10-01T09:00:00.000Z'),
  currentVirtualTime: z.string().default('2026-10-01T09:00:00.000Z'),
  timeOffsetMinutes: z.number().default(0),
  timeScaleFactor: z.number().default(1),
  activeScenarioCode: z.string().optional(),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional()
});

export type IDemoScenario = z.infer<typeof DemoScenarioSchema>;
export type ISimulationEvent = z.infer<typeof SimulationEventSchema>;
export type IIntegrationConfiguration = z.infer<typeof IntegrationConfigurationSchema>;
export type IJobRun = z.infer<typeof JobRunSchema>;
export type ISeedManifest = z.infer<typeof SeedManifestSchema>;
export type IDemoClock = z.infer<typeof DemoClockSchema>;

// ============================================================================
// M36: COMPLETE UI AUDIT, END-TO-END REHEARSAL AND RELEASE CONTRACTS
// ============================================================================

export enum ReleaseReadinessStatus {
  READY = 'READY',
  BLOCKED = 'BLOCKED',
  WARNING = 'WARNING'
}

export enum AuditSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AccessibilityStandard {
  WCAG_2_1_AA = 'WCAG_2_1_AA',
  SECTION_508 = 'SECTION_508',
  MOBILE_ACCESSIBLE = 'MOBILE_ACCESSIBLE'
}

export enum ArtifactKind {
  PACKAGE_ZIP = 'PACKAGE_ZIP',
  ANDROID_APK = 'ANDROID_APK',
  DATABASE_DUMP = 'DATABASE_DUMP',
  API_SPEC = 'API_SPEC',
  RUNBOOK_PDF = 'RUNBOOK_PDF',
  WALKTHROUGH_VIDEO = 'WALKTHROUGH_VIDEO'
}

export const RouteCoverageItemSchema = z.object({
  path: z.string(),
  moduleCode: z.string(),
  moduleName: z.string(),
  allowedRoles: z.array(z.nativeEnum(UserRole)),
  isAccessible: z.boolean().default(true),
  isComingSoon: z.boolean().default(false),
  hasActions: z.boolean().default(true),
  actionCount: z.number().default(1),
  actionsList: z.array(z.string()).default([]),
  evidenceTestId: z.string().optional()
});

export const ReleaseManifestSchema = z.object({
  _id: z.string().optional(),
  version: z.string().default('1.0.0-release'),
  releaseDate: z.string().default('2026-10-01T09:00:00.000Z'),
  gitCommitSha: z.string().default('e8f190c4ab29d331908'),
  status: z.nativeEnum(ReleaseReadinessStatus).default(ReleaseReadinessStatus.READY),
  totalModules: z.number().default(36),
  verifiedModulesCount: z.number().default(36),
  totalRoutesCount: z.number().default(95),
  totalActionsCount: z.number().default(240),
  automatedTestsCount: z.number().default(118),
  allGatesPassed: z.boolean().default(true),
  zeroComingSoonVerified: z.boolean().default(true),
  releaseNotes: z.string(),
  checksums: z.record(z.string(), z.string()).default({}),
  createdAt: z.string().optional()
});

export const ReviewerGuideSectionSchema = z.object({
  sectionKey: z.string(),
  title: z.string(),
  description: z.string(),
  personaRecommendations: z.array(z.string()),
  seedCredentials: z.array(z.object({
    role: z.string(),
    email: z.string(),
    password: z.string(),
    landingUrl: z.string(),
    keyCapability: z.string()
  })),
  keyWorkflows: z.array(z.object({
    order: z.number(),
    name: z.string(),
    moduleCode: z.string(),
    startingPath: z.string(),
    actor: z.string(),
    steps: z.array(z.string())
  })),
  architectureHighlights: z.array(z.string())
});

export const AccessibilityAuditReportSchema = z.object({
  _id: z.string().optional(),
  auditDate: z.string().default('2026-10-01T09:00:00.000Z'),
  standard: z.nativeEnum(AccessibilityStandard).default(AccessibilityStandard.WCAG_2_1_AA),
  totalElementsAudited: z.number().default(420),
  wcagPassRatePercent: z.number().default(100),
  colorContrastPassed: z.boolean().default(true),
  keyboardNavigable: z.boolean().default(true),
  screenReaderLabelsComplete: z.boolean().default(true),
  i18nCoverageHindiPercent: z.number().default(100),
  responsiveViewportsVerified: z.array(z.string()).default(['390px (Mobile)', '768px (Tablet)', '1280px (Laptop)', '1920px (Desktop)']),
  violationsCount: z.number().default(0),
  violations: z.array(z.object({
    elementId: z.string(),
    ruleId: z.string(),
    severity: z.nativeEnum(AuditSeverity),
    recommendation: z.string()
  })).default([])
});

export const VerifiedArtifactLinkSchema = z.object({
  _id: z.string().optional(),
  artifactKey: z.string(),
  name: z.string(),
  kind: z.nativeEnum(ArtifactKind),
  filePath: z.string(),
  downloadUrl: z.string(),
  sha256Checksum: z.string(),
  fileSizeBytes: z.number(),
  fileSizeFormatted: z.string(),
  verifiedAt: z.string().default('2026-10-01T09:00:00.000Z')
});

export type IRouteCoverageItem = z.infer<typeof RouteCoverageItemSchema>;
export type IReleaseManifest = z.infer<typeof ReleaseManifestSchema>;
export type IReviewerGuideSection = z.infer<typeof ReviewerGuideSectionSchema>;
export type IAccessibilityAuditReport = z.infer<typeof AccessibilityAuditReportSchema>;
export type IVerifiedArtifactLink = z.infer<typeof VerifiedArtifactLinkSchema>;













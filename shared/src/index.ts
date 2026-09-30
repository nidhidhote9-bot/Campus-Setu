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
  FAILED = 'FAILED'
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
  role: z.nativeEnum(UserRole)
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

export const NoticePublishSchema = z.object({
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

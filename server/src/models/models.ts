import mongoose, { Schema, Document } from 'mongoose';
import {
  UserRole,
  AttendanceStatus,
  ExamType,
  FeeType,
  PaymentMode,
  PaymentStatus,
  GatePassStatus,
  PlacementAppStatus,
  GrievanceCategory,
  GrievanceStatus,
  OutboxStatus,
  InvoiceStatus,
  PaymentOrderStatus,
  PaymentEventType,
  RefundStatus,
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

// 1. USER MODEL
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  institutionId?: mongoose.Types.ObjectId;
  phone?: string;
  isActive: boolean;
  wardStudentIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  wardStudentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

// 2. INSTITUTION & DEPARTMENT
export interface IInstitution extends Document {
  code: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

const InstitutionSchema = new Schema<IInstitution>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true }
}, { timestamps: true });

export const Institution = mongoose.model<IInstitution>('Institution', InstitutionSchema);

export interface IDepartment extends Document {
  institutionId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  headOfDepartmentId?: mongoose.Types.ObjectId;
}

const DepartmentSchema = new Schema<IDepartment>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  code: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  headOfDepartmentId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

DepartmentSchema.index({ institutionId: 1, code: 1 }, { unique: true });
export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

// 3. STUDENT
export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  rollNumber: string;
  enrollmentNumber: string;
  currentSemester: number;
  batchYear: number;
  guardianUserId?: mongoose.Types.ObjectId;
  cgpa: number;
  status: 'ACTIVE' | 'TRANSFERRED' | 'WITHDRAWN' | 'GRADUATED' | 'ALUMNI';
  totalCreditsEarned: number;
}

const StudentSchema = new Schema<IStudent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  rollNumber: { type: String, required: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  currentSemester: { type: Number, required: true, min: 1, max: 10 },
  batchYear: { type: Number, required: true },
  guardianUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  cgpa: { type: Number, default: 0.0 },
  status: { type: String, enum: ['ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'ALUMNI'], default: 'ACTIVE' },
  totalCreditsEarned: { type: Number, default: 0 }
}, { timestamps: true });

StudentSchema.index({ institutionId: 1, rollNumber: 1 }, { unique: true });
export const Student = mongoose.model<IStudent>('Student', StudentSchema);

// 4. COURSE & TIMETABLE
export interface ICourse extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  credits: number;
  semester: number;
  facultyId?: mongoose.Types.ObjectId;
}

const CourseSchema = new Schema<ICourse>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: Number, required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

CourseSchema.index({ institutionId: 1, code: 1 }, { unique: true });
export const Course = mongoose.model<ICourse>('Course', CourseSchema);

export interface IRoom extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  building: string;
  capacity: number;
  roomType: 'LECTURE_HALL' | 'LABORATORY' | 'SEMINAR_ROOM' | 'AUDITORIUM';
  hasProjector: boolean;
  hasAC: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  building: { type: String, required: true, default: 'Main Academic Building' },
  capacity: { type: Number, required: true, default: 60 },
  roomType: { type: String, enum: ['LECTURE_HALL', 'LABORATORY', 'SEMINAR_ROOM', 'AUDITORIUM'], default: 'LECTURE_HALL' },
  hasProjector: { type: Boolean, default: true },
  hasAC: { type: Boolean, default: true }
}, { timestamps: true });

RoomSchema.index({ institutionId: 1, name: 1 }, { unique: true });
export const Room = mongoose.model<IRoom>('Room', RoomSchema);

export interface ITimetable extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  semester: number;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  courseId: mongoose.Types.ObjectId;
  roomNumber: string;
  roomId?: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  recurrencePattern?: string;
  academicYear?: string;
  isPublished?: boolean;
}

const TimetableSchema = new Schema<ITimetable>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },
  dayOfWeek: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  roomNumber: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recurrencePattern: { type: String, default: 'WEEKLY' },
  academicYear: { type: String, default: '2026-2027' },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Timetable = mongoose.model<ITimetable>('Timetable', TimetableSchema);
export const TimetableEntry = Timetable;

export interface ITimetableException extends Document {
  institutionId: mongoose.Types.ObjectId;
  entryId: mongoose.Types.ObjectId;
  exceptionDate: string;
  exceptionType: 'CANCELLED' | 'RESCHEDULED';
  newRoomId?: mongoose.Types.ObjectId;
  newFacultyId?: mongoose.Types.ObjectId;
  newStartTime?: string;
  newEndTime?: string;
  reason: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableExceptionSchema = new Schema<ITimetableException>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  entryId: { type: Schema.Types.ObjectId, ref: 'Timetable', required: true },
  exceptionDate: { type: String, required: true },
  exceptionType: { type: String, enum: ['CANCELLED', 'RESCHEDULED'], default: 'RESCHEDULED' },
  newRoomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  newFacultyId: { type: Schema.Types.ObjectId, ref: 'User' },
  newStartTime: { type: String },
  newEndTime: { type: String },
  reason: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

TimetableExceptionSchema.index({ entryId: 1, exceptionDate: 1 }, { unique: true });
export const TimetableException = mongoose.model<ITimetableException>('TimetableException', TimetableExceptionSchema);

export interface ICalendarEvent extends Document {
  institutionId: mongoose.Types.ObjectId;
  title: string;
  eventType: 'HOLIDAY' | 'EXAM' | 'ACADEMIC_DEADLINE' | 'WORKSHOP' | 'COLLEGE_FEST';
  startDate: string;
  endDate: string;
  description?: string;
  isHoliday: boolean;
  affectsClasses?: boolean;
}

const CalendarEventSchema = new Schema<ICalendarEvent>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  title: { type: String, required: true },
  eventType: { type: String, enum: ['HOLIDAY', 'EXAM', 'ACADEMIC_DEADLINE', 'WORKSHOP', 'COLLEGE_FEST'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String },
  isHoliday: { type: Boolean, default: false },
  affectsClasses: { type: Boolean, default: true }
}, { timestamps: true });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

export interface IHoliday extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  date: string;
  description?: string;
  isMandatory: boolean;
}

const HolidaySchema = new Schema<IHoliday>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
  isMandatory: { type: Boolean, default: true }
}, { timestamps: true });

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);

export interface ISubjectEnrollment extends Document {
  institutionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  courseIds: mongoose.Types.ObjectId[];
}

const SubjectEnrollmentSchema = new Schema<ISubjectEnrollment>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true, default: '2026-2027' },
  courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

SubjectEnrollmentSchema.index({ studentId: 1, semester: 1 }, { unique: true });
export const SubjectEnrollment = mongoose.model<ISubjectEnrollment>('SubjectEnrollment', SubjectEnrollmentSchema);

// 5. ATTENDANCE RECORD
export interface IAttendanceRecord extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  semester: number;
  section: string;
  entries: Array<{
    studentId: mongoose.Types.ObjectId;
    status: AttendanceStatus;
    remarks?: string;
  }>;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },
  entries: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: Object.values(AttendanceStatus), required: true },
    remarks: { type: String }
  }]
}, { timestamps: true });

AttendanceRecordSchema.index({ courseId: 1, date: 1, section: 1 }, { unique: true });
export const AttendanceRecord = mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);

export interface IAttendanceSession extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  date: string;
  startTime?: string;
  endTime?: string;
  semester: number;
  section: string;
  topicCovered?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  semester: { type: Number, default: 1 },
  section: { type: String, default: 'A' },
  topicCovered: { type: String },
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' }
}, { timestamps: true });

export const AttendanceSession = mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);

export interface IAttendanceEntry extends Document {
  institutionId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: Object.values(AttendanceStatus), required: true },
  remarks: { type: String }
}, { timestamps: true });

// ENFORCE DATABASE CONSTRAINT: Unique student per session
AttendanceEntrySchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
export const AttendanceEntry = mongoose.model<IAttendanceEntry>('AttendanceEntry', AttendanceEntrySchema);

export interface IAttendanceCorrection extends Document {
  institutionId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  entryId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  priorStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewComments?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceCorrectionSchema = new Schema<IAttendanceCorrection>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  entryId: { type: Schema.Types.ObjectId, ref: 'AttendanceEntry', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  priorStatus: { type: String, enum: Object.values(AttendanceStatus), required: true },
  requestedStatus: { type: String, enum: Object.values(AttendanceStatus), required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewComments: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

export const AttendanceCorrection = mongoose.model<IAttendanceCorrection>('AttendanceCorrection', AttendanceCorrectionSchema);

export interface IAttendancePolicyVersion extends Document {
  institutionId: mongoose.Types.ObjectId;
  policyName: string;
  minPercentageRequired: number;
  countExcusedInDenominator: boolean;
  version: number;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendancePolicyVersionSchema = new Schema<IAttendancePolicyVersion>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  policyName: { type: String, required: true },
  minPercentageRequired: { type: Number, default: 75 },
  countExcusedInDenominator: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  isCurrent: { type: Boolean, default: true }
}, { timestamps: true });

export const AttendancePolicyVersion = mongoose.model<IAttendancePolicyVersion>('AttendancePolicyVersion', AttendancePolicyVersionSchema);

export interface ITeachingAssignment extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  semester: number;
  section: string;
  academicYear: string;
}

const TeachingAssignmentSchema = new Schema<ITeachingAssignment>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true, default: 1 },
  section: { type: String, required: true, default: 'A' },
  academicYear: { type: String, required: true, default: '2026-2027' }
}, { timestamps: true });

TeachingAssignmentSchema.index({ courseId: 1, facultyId: 1, section: 1 }, { unique: true });
export const TeachingAssignment = mongoose.model<ITeachingAssignment>('TeachingAssignment', TeachingAssignmentSchema);

// 6. EXAM & MARKSHEET
export interface IExam extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  examType: ExamType;
  academicYear: string;
  startDate: string;
  endDate: string;
}

const ExamSchema = new Schema<IExam>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  examType: { type: String, enum: Object.values(ExamType), required: true },
  academicYear: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true }
}, { timestamps: true });

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);

export interface IMarkSheet extends Document {
  examId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  isFinalized: boolean;
  finalizedBy?: mongoose.Types.ObjectId;
  finalizedAt?: Date;
  revisionHistory: Array<{
    previousMarks: number;
    updatedMarks: number;
    reason: string;
    updatedBy: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
}

const MarkSheetSchema = new Schema<IMarkSheet>({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  maxMarks: { type: Number, required: true, min: 1 },
  grade: { type: String, required: true },
  isFinalized: { type: Boolean, default: false },
  finalizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  finalizedAt: { type: Date },
  revisionHistory: [{
    previousMarks: Number,
    updatedMarks: Number,
    reason: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

MarkSheetSchema.index({ examId: 1, courseId: 1, studentId: 1 }, { unique: true });
export const MarkSheet = mongoose.model<IMarkSheet>('MarkSheet', MarkSheetSchema);

// 7. FEE STRUCTURE & TRANSACTION
export interface IFeeStructure extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  batchYear: number;
  semester: number;
  feeType: FeeType;
  amountPaise: number;
  dueDate: string;
}

const FeeStructureSchema = new Schema<IFeeStructure>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  batchYear: { type: Number, required: true },
  semester: { type: Number, required: true },
  feeType: { type: String, enum: Object.values(FeeType), required: true },
  amountPaise: { type: Number, required: true },
  dueDate: { type: String, required: true }
}, { timestamps: true });

export const FeeStructure = mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);

export interface IFeeTransaction extends Document {
  transactionId: string;
  idempotencyKey: string;
  studentId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  amountPaise: number;
  feeType: FeeType;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  receiptNumber: string;
  gatewayReference: string;
}

const FeeTransactionSchema = new Schema<IFeeTransaction>({
  transactionId: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  amountPaise: { type: Number, required: true },
  feeType: { type: String, enum: Object.values(FeeType), required: true },
  paymentMode: { type: String, enum: Object.values(PaymentMode), required: true },
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  receiptNumber: { type: String, required: true, unique: true },
  gatewayReference: { type: String, required: true }
}, { timestamps: true });

export const FeeTransaction = mongoose.model<IFeeTransaction>('FeeTransaction', FeeTransactionSchema);

// M10: FEES, PAYMENTS, RECONCILIATION & FINANCE
export interface IFeeHead {
  name: string;
  code: string;
  amountPaise: number;
  isMandatory: boolean;
}

export interface IFeeRuleVersion extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  version: number;
  academicYear: string;
  departmentId?: mongoose.Types.ObjectId;
  feeCategory: FeeType;
  heads: IFeeHead[];
  totalAmountPaise: number;
  lateFeeRule: {
    graceDays: number;
    dailyLateFeePaise: number;
    maxLateFeePaise: number;
  };
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
}

const FeeRuleVersionSchema = new Schema<IFeeRuleVersion>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  academicYear: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  feeCategory: { type: String, enum: Object.values(FeeType), required: true },
  heads: [{
    name: { type: String, required: true },
    code: { type: String, required: true },
    amountPaise: { type: Number, required: true },
    isMandatory: { type: Boolean, default: true }
  }],
  totalAmountPaise: { type: Number, required: true },
  lateFeeRule: {
    graceDays: { type: Number, default: 15 },
    dailyLateFeePaise: { type: Number, default: 5000 },
    maxLateFeePaise: { type: Number, default: 100000 }
  },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'ACTIVE' }
}, { timestamps: true });

export const FeeRuleVersion = mongoose.model<IFeeRuleVersion>('FeeRuleVersion', FeeRuleVersionSchema);

export interface IInvoiceLine {
  head: string;
  category: string;
  amountPaise: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  studentId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  academicYear: string;
  semester: number;
  dueDate: string;
  lines: IInvoiceLine[];
  totalAmountPaise: number;
  concessionAmountPaise: number;
  payableAmountPaise: number;
  paidAmountPaise: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  academicYear: { type: String, required: true },
  semester: { type: Number, required: true },
  dueDate: { type: String, required: true },
  lines: [{
    head: { type: String, required: true },
    category: { type: String, default: 'TUITION' },
    amountPaise: { type: Number, required: true }
  }],
  totalAmountPaise: { type: Number, required: true },
  concessionAmountPaise: { type: Number, default: 0 },
  payableAmountPaise: { type: Number, required: true },
  paidAmountPaise: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.ISSUED }
}, { timestamps: true });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export interface IPaymentOrder extends Document {
  orderId: string;
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  amountPaise: number;
  currency: string;
  status: PaymentOrderStatus;
  idempotencyKey: string;
  provider: string;
  providerOrderId: string;
  expiresAt: Date;
  paidAt?: Date;
  receiptNumber?: string;
  createdAt: Date;
}

const PaymentOrderSchema = new Schema<IPaymentOrder>({
  orderId: { type: String, required: true, unique: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  amountPaise: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: Object.values(PaymentOrderStatus), default: PaymentOrderStatus.CREATED },
  idempotencyKey: { type: String, required: true, unique: true },
  provider: { type: String, default: 'RAZORPAY_SIM' },
  providerOrderId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  paidAt: { type: Date },
  receiptNumber: { type: String }
}, { timestamps: true });

export const PaymentOrder = mongoose.model<IPaymentOrder>('PaymentOrder', PaymentOrderSchema);

export interface IPaymentEvent extends Document {
  eventId: string;
  orderId: string;
  providerPaymentId: string;
  eventType: PaymentEventType;
  amountPaise: number;
  currency: string;
  signature: string;
  rawPayload?: any;
  verified: boolean;
  processed: boolean;
  createdAt: Date;
}

const PaymentEventSchema = new Schema<IPaymentEvent>({
  eventId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  providerPaymentId: { type: String, required: true },
  eventType: { type: String, enum: Object.values(PaymentEventType), required: true },
  amountPaise: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  signature: { type: String, required: true },
  rawPayload: { type: Schema.Types.Mixed },
  verified: { type: Boolean, default: false },
  processed: { type: Boolean, default: false }
}, { timestamps: true });

export const PaymentEvent = mongoose.model<IPaymentEvent>('PaymentEvent', PaymentEventSchema);

export interface IReceipt extends Document {
  receiptNumber: string;
  invoiceId: mongoose.Types.ObjectId;
  paymentOrderId: string;
  studentId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  amountPaise: number;
  paymentMode: PaymentMode;
  issuedAt: Date;
  counterfoilData?: any;
}

const ReceiptSchema = new Schema<IReceipt>({
  receiptNumber: { type: String, required: true, unique: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  paymentOrderId: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  amountPaise: { type: Number, required: true },
  paymentMode: { type: String, enum: Object.values(PaymentMode), default: PaymentMode.UPI },
  issuedAt: { type: Date, default: Date.now },
  counterfoilData: { type: Schema.Types.Mixed }
}, { timestamps: true });

export const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);

export interface IRefund extends Document {
  refundId: string;
  receiptId?: mongoose.Types.ObjectId;
  invoiceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amountPaise: number;
  reason: string;
  status: RefundStatus;
  approvedBy?: string;
  providerRefundId?: string;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefund>({
  refundId: { type: String, required: true, unique: true },
  receiptId: { type: Schema.Types.ObjectId, ref: 'Receipt' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  amountPaise: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: Object.values(RefundStatus), default: RefundStatus.REQUESTED },
  approvedBy: { type: String },
  providerRefundId: { type: String }
}, { timestamps: true });

export const Refund = mongoose.model<IRefund>('Refund', RefundSchema);

export interface IConcession extends Document {
  concessionId: string;
  studentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  category: ConcessionCategory;
  amountPaise: number;
  reason: string;
  status: ConcessionStatus;
  approvedBy?: string;
  createdAt: Date;
}

const ConcessionSchema = new Schema<IConcession>({
  concessionId: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  category: { type: String, enum: Object.values(ConcessionCategory), required: true },
  amountPaise: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: Object.values(ConcessionStatus), default: ConcessionStatus.DRAFT },
  approvedBy: { type: String }
}, { timestamps: true });

export const Concession = mongoose.model<IConcession>('Concession', ConcessionSchema);

export interface IReconciliationRun extends Document {
  runId: string;
  runDate: string;
  periodStart: string;
  periodEnd: string;
  totalOrdersChecked: number;
  totalSettledAmountPaise: number;
  matchedCount: number;
  discrepancyCount: number;
  unmatchedOrders: Array<{
    orderId: string;
    expectedPaise: number;
    actualPaise: number;
    status: string;
    reason: string;
  }>;
  status: 'COMPLETED' | 'DISCREPANCY_DETECTED';
  createdAt: Date;
}

const ReconciliationRunSchema = new Schema<IReconciliationRun>({
  runId: { type: String, required: true, unique: true },
  runDate: { type: String, required: true },
  periodStart: { type: String, required: true },
  periodEnd: { type: String, required: true },
  totalOrdersChecked: { type: Number, default: 0 },
  totalSettledAmountPaise: { type: Number, default: 0 },
  matchedCount: { type: Number, default: 0 },
  discrepancyCount: { type: Number, default: 0 },
  unmatchedOrders: [{
    orderId: { type: String, required: true },
    expectedPaise: { type: Number, required: true },
    actualPaise: { type: Number, default: 0 },
    status: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  status: { type: String, enum: ['COMPLETED', 'DISCREPANCY_DETECTED'], default: 'COMPLETED' }
}, { timestamps: true });

export const ReconciliationRun = mongoose.model<IReconciliationRun>('ReconciliationRun', ReconciliationRunSchema);

export interface IFund extends Document {
  code: string;
  name: string;
  description: string;
  totalAllocatedPaise: number;
  utilizedPaise: number;
  balancePaise: number;
}

const FundSchema = new Schema<IFund>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  totalAllocatedPaise: { type: Number, required: true },
  utilizedPaise: { type: Number, default: 0 },
  balancePaise: { type: Number, required: true }
}, { timestamps: true });

export const Fund = mongoose.model<IFund>('Fund', FundSchema);

export interface IBudget extends Document {
  academicYear: string;
  departmentId?: mongoose.Types.ObjectId;
  fundId?: mongoose.Types.ObjectId;
  fundCode: string;
  fundName: string;
  allocatedPaise: number;
  spentPaise: number;
  status: BudgetStatus;
}

const BudgetSchema = new Schema<IBudget>({
  academicYear: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  fundId: { type: Schema.Types.ObjectId, ref: 'Fund' },
  fundCode: { type: String, required: true },
  fundName: { type: String, required: true },
  allocatedPaise: { type: Number, required: true },
  spentPaise: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(BudgetStatus), default: BudgetStatus.DRAFT }
}, { timestamps: true });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);

export interface IBudgetEntry extends Document {
  budgetId: mongoose.Types.ObjectId;
  head: string;
  allocatedPaise: number;
  spentPaise: number;
  approvedAt: Date;
  approvedBy: string;
}

const BudgetEntrySchema = new Schema<IBudgetEntry>({
  budgetId: { type: Schema.Types.ObjectId, ref: 'Budget', required: true },
  head: { type: String, required: true },
  allocatedPaise: { type: Number, required: true },
  spentPaise: { type: Number, default: 0 },
  approvedAt: { type: Date, default: Date.now },
  approvedBy: { type: String, required: true }
}, { timestamps: true });

export const BudgetEntry = mongoose.model<IBudgetEntry>('BudgetEntry', BudgetEntrySchema);

// 8. PAYROLL
export interface IPayrollRecord extends Document {
  institutionId: mongoose.Types.ObjectId;
  monthYear: string;
  staffId: mongoose.Types.ObjectId;
  baseSalaryPaise: number;
  hraPaise: number;
  deductionsPaise: number;
  netSalaryPaise: number;
  status: string;
  idempotencyKey: string;
  approvedAt?: Date;
}

const PayrollRecordSchema = new Schema<IPayrollRecord>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  monthYear: { type: String, required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  baseSalaryPaise: { type: Number, required: true },
  hraPaise: { type: Number, required: true, default: 0 },
  deductionsPaise: { type: Number, required: true, default: 0 },
  netSalaryPaise: { type: Number, required: true },
  status: { type: String, default: 'APPROVED' },
  idempotencyKey: { type: String, required: true, unique: true },
  approvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const PayrollRecord = mongoose.model<IPayrollRecord>('PayrollRecord', PayrollRecordSchema);

// 9. HOSTEL & TRANSPORT & LIBRARY
export interface IHostelRoom extends Document {
  institutionId: mongoose.Types.ObjectId;
  buildingName: string;
  roomNumber: string;
  capacity: number;
  currentOccupancy: number;
  monthlyRentPaise: number;
}

const HostelRoomSchema = new Schema<IHostelRoom>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  buildingName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  monthlyRentPaise: { type: Number, required: true }
});

HostelRoomSchema.index({ institutionId: 1, buildingName: 1, roomNumber: 1 }, { unique: true });
export const HostelRoom = mongoose.model<IHostelRoom>('HostelRoom', HostelRoomSchema);

export interface IGatePass extends Document {
  studentId: mongoose.Types.ObjectId;
  reason: string;
  outDate: string;
  inDate: string;
  status: GatePassStatus;
  approvedBy?: mongoose.Types.ObjectId;
}

const GatePassSchema = new Schema<IGatePass>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  reason: { type: String, required: true },
  outDate: { type: String, required: true },
  inDate: { type: String, required: true },
  status: { type: String, enum: Object.values(GatePassStatus), default: GatePassStatus.PENDING },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const GatePass = mongoose.model<IGatePass>('GatePass', GatePassSchema);

export interface ITransportRoute extends Document {
  institutionId: mongoose.Types.ObjectId;
  routeNumber: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  feePaise: number;
}

const TransportRouteSchema = new Schema<ITransportRoute>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  routeNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  feePaise: { type: Number, required: true }
});

export const TransportRoute = mongoose.model<ITransportRoute>('TransportRoute', TransportRouteSchema);

export interface IBusPass extends Document {
  studentId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  passNumber: string;
  validUntil: string;
  status: string;
}

const BusPassSchema = new Schema<IBusPass>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  routeId: { type: Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
  passNumber: { type: String, required: true, unique: true },
  validUntil: { type: String, required: true },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const BusPass = mongoose.model<IBusPass>('BusPass', BusPassSchema);

export interface IBook extends Document {
  institutionId: mongoose.Types.ObjectId;
  isbn: string;
  title: string;
  author: string;
  totalCopies: number;
  availableCopies: number;
}

const BookSchema = new Schema<IBook>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  totalCopies: { type: Number, required: true },
  availableCopies: { type: Number, required: true }
});

export const Book = mongoose.model<IBook>('Book', BookSchema);

export interface IBookLoan extends Document {
  studentId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  overdueFinePaise: number;
  status: string;
}

const BookLoanSchema = new Schema<IBookLoan>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  issuedDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  returnedDate: { type: String },
  overdueFinePaise: { type: Number, default: 0 },
  status: { type: String, default: 'ISSUED' }
}, { timestamps: true });

export const BookLoan = mongoose.model<IBookLoan>('BookLoan', BookLoanSchema);

// 10. PLACEMENTS & ALUMNI
export interface IPlacementDrive extends Document {
  institutionId: mongoose.Types.ObjectId;
  companyName: string;
  jobTitle: string;
  packageLpaPaise: number;
  eligibilityMinCgpa: number;
  deadline: string;
  status: string;
}

const PlacementDriveSchema = new Schema<IPlacementDrive>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  packageLpaPaise: { type: Number, required: true },
  eligibilityMinCgpa: { type: Number, required: true },
  deadline: { type: String, required: true },
  status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const PlacementDrive = mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);

export interface IPlacementApplication extends Document {
  driveId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: PlacementAppStatus;
  appliedAt: Date;
}

const PlacementApplicationSchema = new Schema<IPlacementApplication>({
  driveId: { type: Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: Object.values(PlacementAppStatus), default: PlacementAppStatus.APPLIED },
  appliedAt: { type: Date, default: Date.now }
});

PlacementApplicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });
export const PlacementApplication = mongoose.model<IPlacementApplication>('PlacementApplication', PlacementApplicationSchema);

export interface IAlumniProfile extends Document {
  userId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  graduationYear: number;
  currentCompany: string;
  designation: string;
  linkedinUrl?: string;
}

const AlumniProfileSchema = new Schema<IAlumniProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  graduationYear: { type: Number, required: true },
  currentCompany: { type: String, required: true },
  designation: { type: String, required: true },
  linkedinUrl: { type: String }
});

export const AlumniProfile = mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema);

// 11. GRIEVANCE & NOTICE
export interface IGrievance extends Document {
  institutionId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  category: GrievanceCategory;
  subject: string;
  description: string;
  isAnonymous: boolean;
  status: GrievanceStatus;
  assignedTo?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
}

const GrievanceSchema = new Schema<IGrievance>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: Object.values(GrievanceCategory), required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(GrievanceStatus), default: GrievanceStatus.OPEN },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: { type: String }
}, { timestamps: true });

export const Grievance = mongoose.model<IGrievance>('Grievance', GrievanceSchema);

export interface INotice extends Document {
  institutionId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  targetRole: string;
  publishedBy: mongoose.Types.ObjectId;
}

const NoticeSchema = new Schema<INotice>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetRole: { type: String, default: 'ALL' },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);

// 12. AUDIT LOG & OUTBOX
export interface IAuditLog extends Document {
  timestamp: Date;
  userId?: mongoose.Types.ObjectId;
  institutionId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  previousState?: any;
  newState?: any;
}

const AuditLogSchema = new Schema<IAuditLog>({
  timestamp: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String },
  ipAddress: { type: String },
  previousState: { type: Schema.Types.Mixed },
  newState: { type: Schema.Types.Mixed }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export interface IOutboxEvent extends Document {
  eventId: string;
  eventType: string;
  payload: any;
  status: OutboxStatus;
  attempts: number;
  createdAt: Date;
}

const OutboxEventSchema = new Schema<IOutboxEvent>({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: Object.values(OutboxStatus), default: OutboxStatus.PENDING },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const OutboxEvent = mongoose.model<IOutboxEvent>('OutboxEvent', OutboxEventSchema);

// ==========================================
// 13. M06 ADMISSIONS DOMAIN MODELS
// ==========================================

export interface IApplicant extends Document {
  name: string;
  email: string;
  phone: string;
  highSchoolScore: number;
  entranceExamScore: number;
  providerVerified: boolean;
  institutionId: mongoose.Types.ObjectId;
}

const ApplicantSchema = new Schema<IApplicant>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  highSchoolScore: { type: Number, required: true },
  entranceExamScore: { type: Number, required: true },
  providerVerified: { type: Boolean, default: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true }
}, { timestamps: true });

ApplicantSchema.index({ institutionId: 1, email: 1 });
export const Applicant = mongoose.model<IApplicant>('Applicant', ApplicantSchema);

export interface IAdmissionApplication extends Document {
  applicationNumber: string;
  applicantId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  status: 'draft' | 'submitted' | 'under_review' | 'correction_required' | 'resubmitted' | 'approved' | 'rejected' | 'enrolled';
  requestedCorrectionFields: string[];
  rejectionReason?: string;
  feePaid: boolean;
  feeTransactionId?: string;
  duplicateFlag: boolean;
  duplicateNotes?: string;
}

const AdmissionApplicationSchema = new Schema<IAdmissionApplication>({
  applicationNumber: { type: String, required: true, unique: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'correction_required', 'resubmitted', 'approved', 'rejected', 'enrolled'],
    default: 'submitted'
  },
  requestedCorrectionFields: [{ type: String }],
  rejectionReason: { type: String },
  feePaid: { type: Boolean, default: true },
  feeTransactionId: { type: String },
  duplicateFlag: { type: Boolean, default: false },
  duplicateNotes: { type: String }
}, { timestamps: true });

export const AdmissionApplication = mongoose.model<IAdmissionApplication>('AdmissionApplication', AdmissionApplicationSchema);

export interface IAdmissionDocument extends Document {
  applicationId: mongoose.Types.ObjectId;
  docType: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

const AdmissionDocumentSchema = new Schema<IAdmissionDocument>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
  docType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String }
}, { timestamps: true });

export const AdmissionDocument = mongoose.model<IAdmissionDocument>('AdmissionDocument', AdmissionDocumentSchema);

export interface IImportBatch extends Document {
  batchId: string;
  institutionId: mongoose.Types.ObjectId;
  filename: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  status: 'DRY_RUN' | 'COMMITTED' | 'FAILED';
  rowErrors: Array<{ row: number; name: string; email: string; externalCode: string; error: string }>;
  createdApplications: mongoose.Types.ObjectId[];
  committedAt?: Date;
}

const ImportBatchSchema = new Schema<IImportBatch>({
  batchId: { type: String, required: true, unique: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  filename: { type: String, required: true },
  totalRows: { type: Number, required: true },
  validRows: { type: Number, required: true },
  invalidRows: { type: Number, required: true },
  status: { type: String, enum: ['DRY_RUN', 'COMMITTED', 'FAILED'], required: true },
  rowErrors: [{
    row: Number,
    name: String,
    email: String,
    externalCode: String,
    error: String
  }],
  createdApplications: [{ type: Schema.Types.ObjectId, ref: 'AdmissionApplication' }],
  committedAt: { type: Date }
}, { timestamps: true });

export const ImportBatch = mongoose.model<IImportBatch>('ImportBatch', ImportBatchSchema);

export interface IExternalCodeMapping extends Document {
  institutionId: mongoose.Types.ObjectId;
  externalCode: string;
  mappedDepartmentId: mongoose.Types.ObjectId;
  mappedProgramCode: string;
}

const ExternalCodeMappingSchema = new Schema<IExternalCodeMapping>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  externalCode: { type: String, required: true, uppercase: true, trim: true },
  mappedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  mappedProgramCode: { type: String, required: true }
}, { timestamps: true });

ExternalCodeMappingSchema.index({ institutionId: 1, externalCode: 1 }, { unique: true });
export const ExternalCodeMapping = mongoose.model<IExternalCodeMapping>('ExternalCodeMapping', ExternalCodeMappingSchema);

export interface IReviewDecision extends Document {
  applicationId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CORRECTION';
  reason?: string;
  requestedFields?: string[];
  timestamp: Date;
}

const ReviewDecisionSchema = new Schema<IReviewDecision>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['APPROVE', 'REJECT', 'REQUEST_CORRECTION'], required: true },
  reason: { type: String },
  requestedFields: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

export const ReviewDecision = mongoose.model<IReviewDecision>('ReviewDecision', ReviewDecisionSchema);

export interface IEnrollment extends Document {
  applicationId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  enrollmentNumber: string;
  rollNumber: string;
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: 'ACTIVE' | 'TRANSFERRED' | 'WITHDRAWN';
  transferReason?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true },
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  enrolledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'TRANSFERRED', 'WITHDRAWN'], default: 'ACTIVE' },
  transferReason: { type: String }
}, { timestamps: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

export interface IIdentifierSequence extends Document {
  context: string;
  currentSeq: number;
}

const IdentifierSequenceSchema = new Schema<IIdentifierSequence>({
  context: { type: String, required: true, unique: true },
  currentSeq: { type: Number, required: true, default: 0 }
});

export const IdentifierSequence = mongoose.model<IIdentifierSequence>('IdentifierSequence', IdentifierSequenceSchema);

// ==========================================
// 14. M07 STUDENT LIFECYCLE & UNIFIED RECORD MODELS
// ==========================================

export interface IEnrollmentHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  academicYear: string;
  semester: number;
  enrolledCourses: mongoose.Types.ObjectId[];
  status: string;
  gpa: number;
}

const EnrollmentHistorySchema = new Schema<IEnrollmentHistory>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  academicYear: { type: String, required: true },
  semester: { type: Number, required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  status: { type: String, default: 'ENROLLED' },
  gpa: { type: Number, default: 0.0 }
}, { timestamps: true });

export const EnrollmentHistory = mongoose.model<IEnrollmentHistory>('EnrollmentHistory', EnrollmentHistorySchema);

export interface IProfileChangeRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  requestedChanges: {
    phone?: string;
    address?: string;
    guardianPhone?: string;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
}

const ProfileChangeRequestSchema = new Schema<IProfileChangeRequest>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requestedChanges: {
    phone: String,
    address: String,
    guardianPhone: String
  },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String }
}, { timestamps: true });

export const ProfileChangeRequest = mongoose.model<IProfileChangeRequest>('ProfileChangeRequest', ProfileChangeRequestSchema);

export interface IStudentDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  docType: string;
  fileUrl: string;
  isPrivate: boolean;
  uploadedBy: mongoose.Types.ObjectId;
}

const StudentDocumentSchema = new Schema<IStudentDocument>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  docType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  isPrivate: { type: Boolean, default: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const StudentDocument = mongoose.model<IStudentDocument>('StudentDocument', StudentDocumentSchema);

export interface IStudentStatusEvent extends Document {
  studentId: mongoose.Types.ObjectId;
  eventType: 'PROGRESSED' | 'TRANSFERRED' | 'WITHDRAWN' | 'GRADUATED' | 'ALUMNI_CONVERTED';
  previousStatus: string;
  newStatus: string;
  reason: string;
  performedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const StudentStatusEventSchema = new Schema<IStudentStatusEvent>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  eventType: {
    type: String,
    enum: ['PROGRESSED', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'ALUMNI_CONVERTED'],
    required: true
  },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  reason: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now }
});

export const StudentStatusEvent = mongoose.model<IStudentStatusEvent>('StudentStatusEvent', StudentStatusEventSchema);

export interface IGraduationRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  totalCredits: number;
  requiredCredits: number;
  feeClearance: boolean;
  libraryClearance: boolean;
  isEligible: boolean;
  status: 'PENDING_CHECK' | 'APPROVED' | 'REJECTED' | 'GRADUATED';
  graduatedAt?: Date;
  degreeCertificateNumber?: string;
}

const GraduationRecordSchema = new Schema<IGraduationRecord>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  totalCredits: { type: Number, required: true },
  requiredCredits: { type: Number, required: true },
  feeClearance: { type: Boolean, required: true },
  libraryClearance: { type: Boolean, required: true },
  isEligible: { type: Boolean, required: true },
  status: { type: String, enum: ['PENDING_CHECK', 'APPROVED', 'REJECTED', 'GRADUATED'], default: 'PENDING_CHECK' },
  graduatedAt: { type: Date },
  degreeCertificateNumber: { type: String }
}, { timestamps: true });

export const GraduationRecord = mongoose.model<IGraduationRecord>('GraduationRecord', GraduationRecordSchema);

// ==========================================
// M11: EXAM APPLICATIONS, ELIGIBILITY & HALL TICKETS
// ==========================================

export interface IExamCycle extends Document {
  institutionId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  academicYear: string;
  semester: number;
  startDate: string;
  endDate: string;
  applicationStartDate: string;
  applicationEndDate: string;
  status: ExamCycleStatus;
  createdAt: Date;
}

const ExamCycleSchema = new Schema<IExamCycle>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  academicYear: { type: String, required: true },
  semester: { type: Number, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  applicationStartDate: { type: String, required: true },
  applicationEndDate: { type: String, required: true },
  status: { type: String, enum: Object.values(ExamCycleStatus), default: ExamCycleStatus.APPLICATION_OPEN }
}, { timestamps: true });

export const ExamCycle = mongoose.model<IExamCycle>('ExamCycle', ExamCycleSchema);

export interface IExamPolicyVersion extends Document {
  cycleId: mongoose.Types.ObjectId;
  version: number;
  minAttendancePercentage: number;
  requireFeeClearance: boolean;
  feePerSubjectPaise: number;
  lateFeeChargePaise: number;
  allowBacklog: boolean;
  allowPrivate: boolean;
  isActive: boolean;
  createdAt: Date;
}

const ExamPolicyVersionSchema = new Schema<IExamPolicyVersion>({
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  version: { type: Number, default: 1 },
  minAttendancePercentage: { type: Number, default: 75 },
  requireFeeClearance: { type: Boolean, default: true },
  feePerSubjectPaise: { type: Number, default: 50000 },
  lateFeeChargePaise: { type: Number, default: 20000 },
  allowBacklog: { type: Boolean, default: true },
  allowPrivate: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ExamPolicyVersion = mongoose.model<IExamPolicyVersion>('ExamPolicyVersion', ExamPolicyVersionSchema);

export interface IExamApplication extends Document {
  applicationNumber: string;
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  category: ExamStudentCategory;
  subjectIds: mongoose.Types.ObjectId[];
  status: ExamApplicationStatus;
  feeAmountPaise: number;
  feePaid: boolean;
  paymentOrderId?: string;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

const ExamApplicationSchema = new Schema<IExamApplication>({
  applicationNumber: { type: String, required: true, unique: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  category: { type: String, enum: Object.values(ExamStudentCategory), default: ExamStudentCategory.REGULAR },
  subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  status: { type: String, enum: Object.values(ExamApplicationStatus), default: ExamApplicationStatus.SUBMITTED },
  feeAmountPaise: { type: Number, required: true },
  feePaid: { type: Boolean, default: false },
  paymentOrderId: { type: String },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String },
  rejectionReason: { type: String }
}, { timestamps: true });

export const ExamApplication = mongoose.model<IExamApplication>('ExamApplication', ExamApplicationSchema);

export interface IEligibilityDecision extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  overallStatus: EligibilityStatus;
  attendancePercentage: number;
  feeCleared: boolean;
  ineligibilityReasons: string[];
  hasException: boolean;
  exceptionReason?: string;
  exceptionGrantedBy?: string;
  exceptionGrantedAt?: Date;
}

const EligibilityDecisionSchema = new Schema<IEligibilityDecision>({
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'ExamApplication' },
  overallStatus: { type: String, enum: Object.values(EligibilityStatus), required: true },
  attendancePercentage: { type: Number, required: true },
  feeCleared: { type: Boolean, required: true },
  ineligibilityReasons: [{ type: String }],
  hasException: { type: Boolean, default: false },
  exceptionReason: { type: String },
  exceptionGrantedBy: { type: String },
  exceptionGrantedAt: { type: Date }
}, { timestamps: true });

export const EligibilityDecision = mongoose.model<IEligibilityDecision>('EligibilityDecision', EligibilityDecisionSchema);

export interface IExamEnrollment extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  category: ExamStudentCategory;
  status: 'ENROLLED' | 'WITHDRAWN';
}

const ExamEnrollmentSchema = new Schema<IExamEnrollment>({
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  category: { type: String, enum: Object.values(ExamStudentCategory), default: ExamStudentCategory.REGULAR },
  status: { type: String, enum: ['ENROLLED', 'WITHDRAWN'], default: 'ENROLLED' }
}, { timestamps: true });

export const ExamEnrollment = mongoose.model<IExamEnrollment>('ExamEnrollment', ExamEnrollmentSchema);

export interface IRollNumberAssignment extends Document {
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  rollNumber: string;
  assignedAt: Date;
}

const RollNumberAssignmentSchema = new Schema<IRollNumberAssignment>({
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'ExamApplication', required: true },
  rollNumber: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });

RollNumberAssignmentSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });
RollNumberAssignmentSchema.index({ cycleId: 1, rollNumber: 1 }, { unique: true });

export const RollNumberAssignment = mongoose.model<IRollNumberAssignment>('RollNumberAssignment', RollNumberAssignmentSchema);

export interface IHallTicketPaper {
  subjectId: mongoose.Types.ObjectId;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  examTime: string;
}

export interface IHallTicket extends Document {
  ticketNumber: string;
  applicationId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  rollNumber: string;
  centerCode: string;
  centerName: string;
  reportingTime: string;
  papers: IHallTicketPaper[];
  issuedAt: Date;
  issuedBy: string;
}

const HallTicketSchema = new Schema<IHallTicket>({
  ticketNumber: { type: String, required: true, unique: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'ExamApplication', required: true, unique: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNumber: { type: String, required: true },
  centerCode: { type: String, required: true },
  centerName: { type: String, required: true },
  reportingTime: { type: String, required: true },
  papers: [{
    subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    examDate: { type: String, default: '2026-11-20' },
    examTime: { type: String, default: '09:30 AM - 12:30 PM' }
  }],
  issuedAt: { type: Date, default: Date.now },
  issuedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' }
}, { timestamps: true });

HallTicketSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });

export const HallTicket = mongoose.model<IHallTicket>('HallTicket', HallTicketSchema);

// ==========================================
// 19. M12 EXAM SCHEDULING, CENTERS & MATERIALS MODELS
// ==========================================

export interface IExamCenterRoom {
  roomId: string;
  roomNumber: string;
  building: string;
  floor: string;
  capacity: number;
  hasCCTV: boolean;
  isAccessible: boolean;
}

export interface IExamCenter extends Document {
  institutionId: mongoose.Types.ObjectId;
  centerCode: string;
  name: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  totalCapacity: number;
  rooms: IExamCenterRoom[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const ExamCenterSchema = new Schema<IExamCenter>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  centerCode: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  totalCapacity: { type: Number, required: true },
  rooms: [{
    roomId: { type: String, required: true },
    roomNumber: { type: String, required: true },
    building: { type: String, required: true },
    floor: { type: String, default: 'Ground Floor' },
    capacity: { type: Number, required: true },
    hasCCTV: { type: Boolean, default: true },
    isAccessible: { type: Boolean, default: true }
  }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
}, { timestamps: true });

ExamCenterSchema.index({ institutionId: 1, centerCode: 1 }, { unique: true });

export const ExamCenter = mongoose.model<IExamCenter>('ExamCenter', ExamCenterSchema);

export interface ICenterVerification extends Document {
  institutionId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  verifiedBy: string;
  verifiedAt: Date;
  checklist: {
    cctvFunctional: boolean;
    secureStorageAvailable: boolean;
    powerBackupAvailable: boolean;
    accessibilityCompliant: boolean;
    drinkingWaterAndWashrooms: boolean;
  };
  remarks: string;
  status: CenterVerificationStatus;
}

const CenterVerificationSchema = new Schema<ICenterVerification>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  centerId: { type: Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  verifiedBy: { type: String, required: true },
  verifiedAt: { type: Date, default: Date.now },
  checklist: {
    cctvFunctional: { type: Boolean, default: true },
    secureStorageAvailable: { type: Boolean, default: true },
    powerBackupAvailable: { type: Boolean, default: true },
    accessibilityCompliant: { type: Boolean, default: true },
    drinkingWaterAndWashrooms: { type: Boolean, default: true }
  },
  remarks: { type: String, default: 'All physical inspection standards met.' },
  status: { type: String, enum: Object.values(CenterVerificationStatus), default: CenterVerificationStatus.VERIFIED }
}, { timestamps: true });

CenterVerificationSchema.index({ centerId: 1, cycleId: 1 }, { unique: true });

export const CenterVerification = mongoose.model<ICenterVerification>('CenterVerification', CenterVerificationSchema);

export interface IExamScheduleConflict {
  type: 'ROOM_CONFLICT' | 'STUDENT_COLLISION' | 'FACULTY_COLLISION';
  description: string;
}

export interface IExamSchedule extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  session: 'MORNING' | 'AFTERNOON' | 'EVENING';
  centerId: mongoose.Types.ObjectId;
  roomIds: string[];
  totalEnrolled: number;
  status: ExamScheduleStatus;
  conflicts: IExamScheduleConflict[];
  publishedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExamScheduleSchema = new Schema<IExamSchedule>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  examDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  session: { type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING'], default: 'MORNING' },
  centerId: { type: Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
  roomIds: [{ type: String, required: true }],
  totalEnrolled: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(ExamScheduleStatus), default: ExamScheduleStatus.DRAFT },
  conflicts: [{
    type: { type: String, enum: ['ROOM_CONFLICT', 'STUDENT_COLLISION', 'FACULTY_COLLISION'] },
    description: { type: String }
  }],
  publishedBy: { type: String },
  publishedAt: { type: Date }
}, { timestamps: true });

ExamScheduleSchema.index({ cycleId: 1, subjectId: 1 });
ExamScheduleSchema.index({ centerId: 1, examDate: 1 });

export const ExamSchedule = mongoose.model<IExamSchedule>('ExamSchedule', ExamScheduleSchema);

export interface ISeatingAllocation extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  roomId: string;
  roomNumber: string;
  seatNumber: string;
  studentId: mongoose.Types.ObjectId;
  studentRollNumber: string;
  studentName: string;
  subjectId: mongoose.Types.ObjectId;
  allocatedAt: Date;
  allocatedBy: string;
  status: SeatingAllocationStatus;
  previousAllocationId?: mongoose.Types.ObjectId;
  reallocationReason?: string;
}

const SeatingAllocationSchema = new Schema<ISeatingAllocation>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
  centerId: { type: Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
  roomId: { type: String, required: true },
  roomNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  studentRollNumber: { type: String, required: true },
  studentName: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  allocatedAt: { type: Date, default: Date.now },
  allocatedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' },
  status: { type: String, enum: Object.values(SeatingAllocationStatus), default: SeatingAllocationStatus.ALLOCATED },
  previousAllocationId: { type: Schema.Types.ObjectId, ref: 'SeatingAllocation' },
  reallocationReason: { type: String }
}, { timestamps: true });

SeatingAllocationSchema.index({ scheduleId: 1, studentId: 1, status: 1 });
SeatingAllocationSchema.index({ scheduleId: 1, roomId: 1, seatNumber: 1, status: 1 });

export const SeatingAllocation = mongoose.model<ISeatingAllocation>('SeatingAllocation', SeatingAllocationSchema);

export interface IInvigilationDuty extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  roomId: string;
  facultyId: mongoose.Types.ObjectId;
  facultyName: string;
  facultyEmail: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  reportingTime: string;
  status: InvigilationDutyStatus;
  assignedBy: string;
  assignedAt: Date;
  acknowledgedAt?: Date;
  declineReason?: string;
  remarks?: string;
}

const InvigilationDutySchema = new Schema<IInvigilationDuty>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
  centerId: { type: Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
  roomId: { type: String, required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  facultyName: { type: String, required: true },
  facultyEmail: { type: String, required: true },
  dutyDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reportingTime: { type: String, default: '08:30 AM' },
  status: { type: String, enum: Object.values(InvigilationDutyStatus), default: InvigilationDutyStatus.ASSIGNED },
  assignedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' },
  assignedAt: { type: Date, default: Date.now },
  acknowledgedAt: { type: Date },
  declineReason: { type: String },
  remarks: { type: String }
}, { timestamps: true });

InvigilationDutySchema.index({ scheduleId: 1, facultyId: 1 });
InvigilationDutySchema.index({ cycleId: 1, facultyId: 1, dutyDate: 1, startTime: 1 });

export const InvigilationDuty = mongoose.model<IInvigilationDuty>('InvigilationDuty', InvigilationDutySchema);

export interface IMaterialBatch extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  batchNumber: string;
  materialType: MaterialType;
  prefix: string;
  startSerial: number;
  endSerial: number;
  totalCount: number;
  dispatchedCount: number;
  usedCount: number;
  returnedCount: number;
  damagedCount: number;
  status: MaterialBatchStatus;
  securityBagSealNumber?: string;
  confidentialNotes?: string;
  reconciliationNotes?: string;
  reconciledAt?: Date;
  reconciledBy?: string;
}

const MaterialBatchSchema = new Schema<IMaterialBatch>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  batchNumber: { type: String, required: true },
  materialType: { type: String, enum: Object.values(MaterialType), default: MaterialType.MAIN_ANSWER_BOOK },
  prefix: { type: String, default: 'AB-' },
  startSerial: { type: Number, required: true },
  endSerial: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  dispatchedCount: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  returnedCount: { type: Number, default: 0 },
  damagedCount: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(MaterialBatchStatus), default: MaterialBatchStatus.IN_STOCK },
  securityBagSealNumber: { type: String },
  confidentialNotes: { type: String },
  reconciliationNotes: { type: String },
  reconciledAt: { type: Date },
  reconciledBy: { type: String }
}, { timestamps: true });

MaterialBatchSchema.index({ cycleId: 1, batchNumber: 1 }, { unique: true });
MaterialBatchSchema.index({ institutionId: 1, materialType: 1, prefix: 1, startSerial: 1, endSerial: 1 });

export const MaterialBatch = mongoose.model<IMaterialBatch>('MaterialBatch', MaterialBatchSchema);

export interface IMaterialMovement extends Document {
  institutionId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  movementType: MaterialMovementType;
  centerId?: mongoose.Types.ObjectId;
  scheduleId?: mongoose.Types.ObjectId;
  startSerial: number;
  endSerial: number;
  quantity: number;
  sealNumber?: string;
  handledBy: string;
  timestamp: Date;
  acknowledgementStatus: 'PENDING' | 'ACKNOWLEDGED';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  remarks?: string;
}

const MaterialMovementSchema = new Schema<IMaterialMovement>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'MaterialBatch', required: true },
  movementType: { type: String, enum: Object.values(MaterialMovementType), required: true },
  centerId: { type: Schema.Types.ObjectId, ref: 'ExamCenter' },
  scheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule' },
  startSerial: { type: Number, required: true },
  endSerial: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sealNumber: { type: String },
  handledBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  acknowledgementStatus: { type: String, enum: ['PENDING', 'ACKNOWLEDGED'], default: 'PENDING' },
  acknowledgedBy: { type: String },
  acknowledgedAt: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

MaterialMovementSchema.index({ batchId: 1, movementType: 1 });

export const MaterialMovement = mongoose.model<IMaterialMovement>('MaterialMovement', MaterialMovementSchema);

// ==========================================
// M13: PAPER SETTERS & CONFIDENTIAL QUESTION BANK
// ==========================================

export interface ISetterAppointment extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  role: AppointmentRole;
  status: AppointmentStatus;
  deadline: Date;
  remunerationPaise: number;
  instructions: string;
  invitedAt: Date;
  respondedAt?: Date;
  rejectionReason?: string;
  isNotified: boolean;
}

const SetterAppointmentSchema = new Schema<ISetterAppointment>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: Object.values(AppointmentRole), default: AppointmentRole.SETTER },
  status: { type: String, enum: Object.values(AppointmentStatus), default: AppointmentStatus.OFFERED },
  deadline: { type: Date, required: true },
  remunerationPaise: { type: Number, default: 150000 },
  instructions: { type: String, default: 'Prepare 3 sets of questions complying with syllabus guidelines.' },
  invitedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  rejectionReason: { type: String },
  isNotified: { type: Boolean, default: true }
}, { timestamps: true });

SetterAppointmentSchema.index({ cycleId: 1, subjectId: 1, facultyId: 1 });

export const SetterAppointment = mongoose.model<ISetterAppointment>('SetterAppointment', SetterAppointmentSchema);

export interface IQuestion extends Document {
  institutionId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  topic: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  questionText: string;
  marks: number;
  sampleAnswer?: string;
  rubric?: string;
  confidential: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const QuestionSchema = new Schema<IQuestion>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: Object.values(QuestionDifficulty), default: QuestionDifficulty.MEDIUM },
  type: { type: String, enum: Object.values(QuestionType), default: QuestionType.SHORT_ANSWER },
  questionText: { type: String, required: true },
  marks: { type: Number, default: 10 },
  sampleAnswer: { type: String },
  rubric: { type: String },
  confidential: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

QuestionSchema.index({ subjectId: 1, topic: 1 });

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);

export interface IPaperVersion extends Document {
  institutionId: mongoose.Types.ObjectId;
  cycleId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  setterId: mongoose.Types.ObjectId;
  versionNumber: number;
  title: string;
  totalMarks: number;
  instructions: string;
  contentSummary?: string;
  fileStorageKey: string;
  watermarkPolicy: string;
  questions: Array<any>;
  status: PaperVersionStatus;
  declarationAgreed: boolean;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  releasedAt?: Date;
  releasedBy?: mongoose.Types.ObjectId;
  immutableHash: string;
}

const PaperVersionSchema = new Schema<IPaperVersion>({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
  cycleId: { type: Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'SetterAppointment', required: true },
  setterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  versionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  totalMarks: { type: Number, default: 100 },
  instructions: { type: String, default: 'Answer all compulsory sections. Scientific calculators allowed.' },
  contentSummary: { type: String },
  fileStorageKey: { type: String, required: true },
  watermarkPolicy: { type: String, default: 'CONFIDENTIAL - CONTROLLED ASSESSMENT REPOSITORY' },
  questions: [{ type: Schema.Types.Mixed }],
  status: { type: String, enum: Object.values(PaperVersionStatus), default: PaperVersionStatus.SUBMITTED },
  declarationAgreed: { type: Boolean, default: true },
  submittedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  releasedAt: { type: Date },
  releasedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  immutableHash: { type: String, required: true }
}, { timestamps: true });

PaperVersionSchema.index({ subjectId: 1, cycleId: 1, versionNumber: 1 }, { unique: true });

export const PaperVersion = mongoose.model<IPaperVersion>('PaperVersion', PaperVersionSchema);

export interface IPaperReview extends Document {
  paperVersionId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  decision: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT';
  reviewComments: string;
  suggestedEdits?: string;
  reviewedAt: Date;
}

const PaperReviewSchema = new Schema<IPaperReview>({
  paperVersionId: { type: Schema.Types.ObjectId, ref: 'PaperVersion', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['APPROVE', 'REQUEST_REVISION', 'REJECT'], required: true },
  reviewComments: { type: String, required: true },
  suggestedEdits: { type: String },
  reviewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

PaperReviewSchema.index({ paperVersionId: 1 });

export const PaperReview = mongoose.model<IPaperReview>('PaperReview', PaperReviewSchema);

export interface IConfidentialAccessEvent extends Document {
  paperVersionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  accessType: ConfidentialAccessType;
  ipAddress: string;
  purpose: string;
  timestamp: Date;
  watermarkApplied: string;
}

const ConfidentialAccessEventSchema = new Schema<IConfidentialAccessEvent>({
  paperVersionId: { type: Schema.Types.ObjectId, ref: 'PaperVersion', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, required: true },
  accessType: { type: String, enum: Object.values(ConfidentialAccessType), required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  purpose: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  watermarkApplied: { type: String, required: true }
}, { timestamps: true });

ConfidentialAccessEventSchema.index({ paperVersionId: 1, timestamp: -1 });

export const ConfidentialAccessEvent = mongoose.model<IConfidentialAccessEvent>('ConfidentialAccessEvent', ConfidentialAccessEventSchema);





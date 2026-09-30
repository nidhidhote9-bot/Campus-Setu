"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmissionDocument = exports.AdmissionApplication = exports.Applicant = exports.OutboxEvent = exports.AuditLog = exports.Notice = exports.Grievance = exports.AlumniProfile = exports.PlacementApplication = exports.PlacementDrive = exports.BookLoan = exports.Book = exports.BusPass = exports.TransportRoute = exports.GatePass = exports.HostelRoom = exports.PayrollRecord = exports.BudgetEntry = exports.Budget = exports.Fund = exports.ReconciliationRun = exports.Concession = exports.Refund = exports.Receipt = exports.PaymentEvent = exports.PaymentOrder = exports.Invoice = exports.FeeRuleVersion = exports.FeeTransaction = exports.FeeStructure = exports.MarkSheet = exports.Exam = exports.TeachingAssignment = exports.AttendancePolicyVersion = exports.AttendanceCorrection = exports.AttendanceEntry = exports.AttendanceSession = exports.AttendanceRecord = exports.SubjectEnrollment = exports.Holiday = exports.CalendarEvent = exports.TimetableException = exports.TimetableEntry = exports.Timetable = exports.Room = exports.Course = exports.Student = exports.Department = exports.Institution = exports.User = void 0;
exports.MaterialMovement = exports.MaterialBatch = exports.InvigilationDuty = exports.SeatingAllocation = exports.ExamSchedule = exports.CenterVerification = exports.ExamCenter = exports.HallTicket = exports.RollNumberAssignment = exports.ExamEnrollment = exports.EligibilityDecision = exports.ExamApplication = exports.ExamPolicyVersion = exports.ExamCycle = exports.GraduationRecord = exports.StudentStatusEvent = exports.StudentDocument = exports.ProfileChangeRequest = exports.EnrollmentHistory = exports.IdentifierSequence = exports.Enrollment = exports.ReviewDecision = exports.ExternalCodeMapping = exports.ImportBatch = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const index_1 = require("@shared/index");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: Object.values(index_1.UserRole), required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution' },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
    wardStudentIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });
exports.User = mongoose_1.default.model('User', UserSchema);
const InstitutionSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true }
}, { timestamps: true });
exports.Institution = mongoose_1.default.model('Institution', InstitutionSchema);
const DepartmentSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    code: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    headOfDepartmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
DepartmentSchema.index({ institutionId: 1, code: 1 }, { unique: true });
exports.Department = mongoose_1.default.model('Department', DepartmentSchema);
const StudentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    rollNumber: { type: String, required: true },
    enrollmentNumber: { type: String, required: true, unique: true },
    currentSemester: { type: Number, required: true, min: 1, max: 10 },
    batchYear: { type: Number, required: true },
    guardianUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    cgpa: { type: Number, default: 0.0 },
    status: { type: String, enum: ['ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'ALUMNI'], default: 'ACTIVE' },
    totalCreditsEarned: { type: Number, default: 0 }
}, { timestamps: true });
StudentSchema.index({ institutionId: 1, rollNumber: 1 }, { unique: true });
exports.Student = mongoose_1.default.model('Student', StudentSchema);
const CourseSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: Number, required: true },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
CourseSchema.index({ institutionId: 1, code: 1 }, { unique: true });
exports.Course = mongoose_1.default.model('Course', CourseSchema);
const RoomSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    building: { type: String, required: true, default: 'Main Academic Building' },
    capacity: { type: Number, required: true, default: 60 },
    roomType: { type: String, enum: ['LECTURE_HALL', 'LABORATORY', 'SEMINAR_ROOM', 'AUDITORIUM'], default: 'LECTURE_HALL' },
    hasProjector: { type: Boolean, default: true },
    hasAC: { type: Boolean, default: true }
}, { timestamps: true });
RoomSchema.index({ institutionId: 1, name: 1 }, { unique: true });
exports.Room = mongoose_1.default.model('Room', RoomSchema);
const TimetableSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    roomNumber: { type: String, required: true },
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Room' },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recurrencePattern: { type: String, default: 'WEEKLY' },
    academicYear: { type: String, default: '2026-2027' },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });
exports.Timetable = mongoose_1.default.model('Timetable', TimetableSchema);
exports.TimetableEntry = exports.Timetable;
const TimetableExceptionSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    entryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Timetable', required: true },
    exceptionDate: { type: String, required: true },
    exceptionType: { type: String, enum: ['CANCELLED', 'RESCHEDULED'], default: 'RESCHEDULED' },
    newRoomId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Room' },
    newFacultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    newStartTime: { type: String },
    newEndTime: { type: String },
    reason: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
TimetableExceptionSchema.index({ entryId: 1, exceptionDate: 1 }, { unique: true });
exports.TimetableException = mongoose_1.default.model('TimetableException', TimetableExceptionSchema);
const CalendarEventSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    title: { type: String, required: true },
    eventType: { type: String, enum: ['HOLIDAY', 'EXAM', 'ACADEMIC_DEADLINE', 'WORKSHOP', 'COLLEGE_FEST'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    description: { type: String },
    isHoliday: { type: Boolean, default: false },
    affectsClasses: { type: Boolean, default: true }
}, { timestamps: true });
exports.CalendarEvent = mongoose_1.default.model('CalendarEvent', CalendarEventSchema);
const HolidaySchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    isMandatory: { type: Boolean, default: true }
}, { timestamps: true });
exports.Holiday = mongoose_1.default.model('Holiday', HolidaySchema);
const SubjectEnrollmentSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true, default: '2026-2027' },
    courseIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });
SubjectEnrollmentSchema.index({ studentId: 1, semester: 1 }, { unique: true });
exports.SubjectEnrollment = mongoose_1.default.model('SubjectEnrollment', SubjectEnrollmentSchema);
const AttendanceRecordSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    entries: [{
            studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
            status: { type: String, enum: Object.values(index_1.AttendanceStatus), required: true },
            remarks: { type: String }
        }]
}, { timestamps: true });
AttendanceRecordSchema.index({ courseId: 1, date: 1, section: 1 }, { unique: true });
exports.AttendanceRecord = mongoose_1.default.model('AttendanceRecord', AttendanceRecordSchema);
const AttendanceSessionSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: String },
    endTime: { type: String },
    semester: { type: Number, default: 1 },
    section: { type: String, default: 'A' },
    topicCovered: { type: String },
    status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'COMPLETED' }
}, { timestamps: true });
exports.AttendanceSession = mongoose_1.default.model('AttendanceSession', AttendanceSessionSchema);
const AttendanceEntrySchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: String, required: true },
    status: { type: String, enum: Object.values(index_1.AttendanceStatus), required: true },
    remarks: { type: String }
}, { timestamps: true });
// ENFORCE DATABASE CONSTRAINT: Unique student per session
AttendanceEntrySchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
exports.AttendanceEntry = mongoose_1.default.model('AttendanceEntry', AttendanceEntrySchema);
const AttendanceCorrectionSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    sessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    entryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AttendanceEntry', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    priorStatus: { type: String, enum: Object.values(index_1.AttendanceStatus), required: true },
    requestedStatus: { type: String, enum: Object.values(index_1.AttendanceStatus), required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewComments: { type: String },
    reviewedAt: { type: Date }
}, { timestamps: true });
exports.AttendanceCorrection = mongoose_1.default.model('AttendanceCorrection', AttendanceCorrectionSchema);
const AttendancePolicyVersionSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    policyName: { type: String, required: true },
    minPercentageRequired: { type: Number, default: 75 },
    countExcusedInDenominator: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    isCurrent: { type: Boolean, default: true }
}, { timestamps: true });
exports.AttendancePolicyVersion = mongoose_1.default.model('AttendancePolicyVersion', AttendancePolicyVersionSchema);
const TeachingAssignmentSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: Number, required: true, default: 1 },
    section: { type: String, required: true, default: 'A' },
    academicYear: { type: String, required: true, default: '2026-2027' }
}, { timestamps: true });
TeachingAssignmentSchema.index({ courseId: 1, facultyId: 1, section: 1 }, { unique: true });
exports.TeachingAssignment = mongoose_1.default.model('TeachingAssignment', TeachingAssignmentSchema);
const ExamSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    examType: { type: String, enum: Object.values(index_1.ExamType), required: true },
    academicYear: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true }
}, { timestamps: true });
exports.Exam = mongoose_1.default.model('Exam', ExamSchema);
const MarkSheetSchema = new mongoose_1.Schema({
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Exam', required: true },
    courseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 },
    grade: { type: String, required: true },
    isFinalized: { type: Boolean, default: false },
    finalizedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    finalizedAt: { type: Date },
    revisionHistory: [{
            previousMarks: Number,
            updatedMarks: Number,
            reason: String,
            updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now }
        }]
}, { timestamps: true });
MarkSheetSchema.index({ examId: 1, courseId: 1, studentId: 1 }, { unique: true });
exports.MarkSheet = mongoose_1.default.model('MarkSheet', MarkSheetSchema);
const FeeStructureSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    batchYear: { type: Number, required: true },
    semester: { type: Number, required: true },
    feeType: { type: String, enum: Object.values(index_1.FeeType), required: true },
    amountPaise: { type: Number, required: true },
    dueDate: { type: String, required: true }
}, { timestamps: true });
exports.FeeStructure = mongoose_1.default.model('FeeStructure', FeeStructureSchema);
const FeeTransactionSchema = new mongoose_1.Schema({
    transactionId: { type: String, required: true, unique: true },
    idempotencyKey: { type: String, required: true, unique: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    amountPaise: { type: Number, required: true },
    feeType: { type: String, enum: Object.values(index_1.FeeType), required: true },
    paymentMode: { type: String, enum: Object.values(index_1.PaymentMode), required: true },
    status: { type: String, enum: Object.values(index_1.PaymentStatus), required: true },
    receiptNumber: { type: String, required: true, unique: true },
    gatewayReference: { type: String, required: true }
}, { timestamps: true });
exports.FeeTransaction = mongoose_1.default.model('FeeTransaction', FeeTransactionSchema);
const FeeRuleVersionSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    academicYear: { type: String, required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    feeCategory: { type: String, enum: Object.values(index_1.FeeType), required: true },
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
exports.FeeRuleVersion = mongoose_1.default.model('FeeRuleVersion', FeeRuleVersionSchema);
const InvoiceSchema = new mongoose_1.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
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
    status: { type: String, enum: Object.values(index_1.InvoiceStatus), default: index_1.InvoiceStatus.ISSUED }
}, { timestamps: true });
exports.Invoice = mongoose_1.default.model('Invoice', InvoiceSchema);
const PaymentOrderSchema = new mongoose_1.Schema({
    orderId: { type: String, required: true, unique: true },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: Object.values(index_1.PaymentOrderStatus), default: index_1.PaymentOrderStatus.CREATED },
    idempotencyKey: { type: String, required: true, unique: true },
    provider: { type: String, default: 'RAZORPAY_SIM' },
    providerOrderId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date },
    receiptNumber: { type: String }
}, { timestamps: true });
exports.PaymentOrder = mongoose_1.default.model('PaymentOrder', PaymentOrderSchema);
const PaymentEventSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    providerPaymentId: { type: String, required: true },
    eventType: { type: String, enum: Object.values(index_1.PaymentEventType), required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    signature: { type: String, required: true },
    rawPayload: { type: mongoose_1.Schema.Types.Mixed },
    verified: { type: Boolean, default: false },
    processed: { type: Boolean, default: false }
}, { timestamps: true });
exports.PaymentEvent = mongoose_1.default.model('PaymentEvent', PaymentEventSchema);
const ReceiptSchema = new mongoose_1.Schema({
    receiptNumber: { type: String, required: true, unique: true },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    paymentOrderId: { type: String, required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    amountPaise: { type: Number, required: true },
    paymentMode: { type: String, enum: Object.values(index_1.PaymentMode), default: index_1.PaymentMode.UPI },
    issuedAt: { type: Date, default: Date.now },
    counterfoilData: { type: mongoose_1.Schema.Types.Mixed }
}, { timestamps: true });
exports.Receipt = mongoose_1.default.model('Receipt', ReceiptSchema);
const RefundSchema = new mongoose_1.Schema({
    refundId: { type: String, required: true, unique: true },
    receiptId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Receipt' },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    amountPaise: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(index_1.RefundStatus), default: index_1.RefundStatus.REQUESTED },
    approvedBy: { type: String },
    providerRefundId: { type: String }
}, { timestamps: true });
exports.Refund = mongoose_1.default.model('Refund', RefundSchema);
const ConcessionSchema = new mongoose_1.Schema({
    concessionId: { type: String, required: true, unique: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    category: { type: String, enum: Object.values(index_1.ConcessionCategory), required: true },
    amountPaise: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(index_1.ConcessionStatus), default: index_1.ConcessionStatus.DRAFT },
    approvedBy: { type: String }
}, { timestamps: true });
exports.Concession = mongoose_1.default.model('Concession', ConcessionSchema);
const ReconciliationRunSchema = new mongoose_1.Schema({
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
exports.ReconciliationRun = mongoose_1.default.model('ReconciliationRun', ReconciliationRunSchema);
const FundSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    totalAllocatedPaise: { type: Number, required: true },
    utilizedPaise: { type: Number, default: 0 },
    balancePaise: { type: Number, required: true }
}, { timestamps: true });
exports.Fund = mongoose_1.default.model('Fund', FundSchema);
const BudgetSchema = new mongoose_1.Schema({
    academicYear: { type: String, required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    fundId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Fund' },
    fundCode: { type: String, required: true },
    fundName: { type: String, required: true },
    allocatedPaise: { type: Number, required: true },
    spentPaise: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(index_1.BudgetStatus), default: index_1.BudgetStatus.DRAFT }
}, { timestamps: true });
exports.Budget = mongoose_1.default.model('Budget', BudgetSchema);
const BudgetEntrySchema = new mongoose_1.Schema({
    budgetId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Budget', required: true },
    head: { type: String, required: true },
    allocatedPaise: { type: Number, required: true },
    spentPaise: { type: Number, default: 0 },
    approvedAt: { type: Date, default: Date.now },
    approvedBy: { type: String, required: true }
}, { timestamps: true });
exports.BudgetEntry = mongoose_1.default.model('BudgetEntry', BudgetEntrySchema);
const PayrollRecordSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    monthYear: { type: String, required: true },
    staffId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    baseSalaryPaise: { type: Number, required: true },
    hraPaise: { type: Number, required: true, default: 0 },
    deductionsPaise: { type: Number, required: true, default: 0 },
    netSalaryPaise: { type: Number, required: true },
    status: { type: String, default: 'APPROVED' },
    idempotencyKey: { type: String, required: true, unique: true },
    approvedAt: { type: Date, default: Date.now }
}, { timestamps: true });
exports.PayrollRecord = mongoose_1.default.model('PayrollRecord', PayrollRecordSchema);
const HostelRoomSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    buildingName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    monthlyRentPaise: { type: Number, required: true }
});
HostelRoomSchema.index({ institutionId: 1, buildingName: 1, roomNumber: 1 }, { unique: true });
exports.HostelRoom = mongoose_1.default.model('HostelRoom', HostelRoomSchema);
const GatePassSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    reason: { type: String, required: true },
    outDate: { type: String, required: true },
    inDate: { type: String, required: true },
    status: { type: String, enum: Object.values(index_1.GatePassStatus), default: index_1.GatePassStatus.PENDING },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.GatePass = mongoose_1.default.model('GatePass', GatePassSchema);
const TransportRouteSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    routeNumber: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    driverName: { type: String, required: true },
    feePaise: { type: Number, required: true }
});
exports.TransportRoute = mongoose_1.default.model('TransportRoute', TransportRouteSchema);
const BusPassSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    routeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
    passNumber: { type: String, required: true, unique: true },
    validUntil: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
exports.BusPass = mongoose_1.default.model('BusPass', BusPassSchema);
const BookSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    isbn: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    totalCopies: { type: Number, required: true },
    availableCopies: { type: Number, required: true }
});
exports.Book = mongoose_1.default.model('Book', BookSchema);
const BookLoanSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    bookId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Book', required: true },
    issuedDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnedDate: { type: String },
    overdueFinePaise: { type: Number, default: 0 },
    status: { type: String, default: 'ISSUED' }
}, { timestamps: true });
exports.BookLoan = mongoose_1.default.model('BookLoan', BookLoanSchema);
const PlacementDriveSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    packageLpaPaise: { type: Number, required: true },
    eligibilityMinCgpa: { type: Number, required: true },
    deadline: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
exports.PlacementDrive = mongoose_1.default.model('PlacementDrive', PlacementDriveSchema);
const PlacementApplicationSchema = new mongoose_1.Schema({
    driveId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: Object.values(index_1.PlacementAppStatus), default: index_1.PlacementAppStatus.APPLIED },
    appliedAt: { type: Date, default: Date.now }
});
PlacementApplicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });
exports.PlacementApplication = mongoose_1.default.model('PlacementApplication', PlacementApplicationSchema);
const AlumniProfileSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    graduationYear: { type: Number, required: true },
    currentCompany: { type: String, required: true },
    designation: { type: String, required: true },
    linkedinUrl: { type: String }
});
exports.AlumniProfile = mongoose_1.default.model('AlumniProfile', AlumniProfileSchema);
const GrievanceSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, enum: Object.values(index_1.GrievanceCategory), required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: Object.values(index_1.GrievanceStatus), default: index_1.GrievanceStatus.OPEN },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String }
}, { timestamps: true });
exports.Grievance = mongoose_1.default.model('Grievance', GrievanceSchema);
const NoticeSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetRole: { type: String, default: 'ALL' },
    publishedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
exports.Notice = mongoose_1.default.model('Notice', NoticeSchema);
const AuditLogSchema = new mongoose_1.Schema({
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    ipAddress: { type: String },
    previousState: { type: mongoose_1.Schema.Types.Mixed },
    newState: { type: mongoose_1.Schema.Types.Mixed }
});
exports.AuditLog = mongoose_1.default.model('AuditLog', AuditLogSchema);
const OutboxEventSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    payload: { type: mongoose_1.Schema.Types.Mixed, required: true },
    status: { type: String, enum: Object.values(index_1.OutboxStatus), default: index_1.OutboxStatus.PENDING },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
exports.OutboxEvent = mongoose_1.default.model('OutboxEvent', OutboxEventSchema);
const ApplicantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    highSchoolScore: { type: Number, required: true },
    entranceExamScore: { type: Number, required: true },
    providerVerified: { type: Boolean, default: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true }
}, { timestamps: true });
ApplicantSchema.index({ institutionId: 1, email: 1 });
exports.Applicant = mongoose_1.default.model('Applicant', ApplicantSchema);
const AdmissionApplicationSchema = new mongoose_1.Schema({
    applicationNumber: { type: String, required: true, unique: true },
    applicantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Applicant', required: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
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
exports.AdmissionApplication = mongoose_1.default.model('AdmissionApplication', AdmissionApplicationSchema);
const AdmissionDocumentSchema = new mongoose_1.Schema({
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
    docType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String }
}, { timestamps: true });
exports.AdmissionDocument = mongoose_1.default.model('AdmissionDocument', AdmissionDocumentSchema);
const ImportBatchSchema = new mongoose_1.Schema({
    batchId: { type: String, required: true, unique: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
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
    createdApplications: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AdmissionApplication' }],
    committedAt: { type: Date }
}, { timestamps: true });
exports.ImportBatch = mongoose_1.default.model('ImportBatch', ImportBatchSchema);
const ExternalCodeMappingSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    externalCode: { type: String, required: true, uppercase: true, trim: true },
    mappedDepartmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    mappedProgramCode: { type: String, required: true }
}, { timestamps: true });
ExternalCodeMappingSchema.index({ institutionId: 1, externalCode: 1 }, { unique: true });
exports.ExternalCodeMapping = mongoose_1.default.model('ExternalCodeMapping', ExternalCodeMappingSchema);
const ReviewDecisionSchema = new mongoose_1.Schema({
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
    reviewerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    decision: { type: String, enum: ['APPROVE', 'REJECT', 'REQUEST_CORRECTION'], required: true },
    reason: { type: String },
    requestedFields: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
});
exports.ReviewDecision = mongoose_1.default.model('ReviewDecision', ReviewDecisionSchema);
const EnrollmentSchema = new mongoose_1.Schema({
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AdmissionApplication', required: true },
    applicantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Applicant', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollmentNumber: { type: String, required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    departmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department', required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'TRANSFERRED', 'WITHDRAWN'], default: 'ACTIVE' },
    transferReason: { type: String }
}, { timestamps: true });
exports.Enrollment = mongoose_1.default.model('Enrollment', EnrollmentSchema);
const IdentifierSequenceSchema = new mongoose_1.Schema({
    context: { type: String, required: true, unique: true },
    currentSeq: { type: Number, required: true, default: 0 }
});
exports.IdentifierSequence = mongoose_1.default.model('IdentifierSequence', IdentifierSequenceSchema);
const EnrollmentHistorySchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    enrolledCourses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, default: 'ENROLLED' },
    gpa: { type: Number, default: 0.0 }
}, { timestamps: true });
exports.EnrollmentHistory = mongoose_1.default.model('EnrollmentHistory', EnrollmentHistorySchema);
const ProfileChangeRequestSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedChanges: {
        phone: String,
        address: String,
        guardianPhone: String
    },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String }
}, { timestamps: true });
exports.ProfileChangeRequest = mongoose_1.default.model('ProfileChangeRequest', ProfileChangeRequestSchema);
const StudentDocumentSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true },
    docType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    isPrivate: { type: Boolean, default: true },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
exports.StudentDocument = mongoose_1.default.model('StudentDocument', StudentDocumentSchema);
const StudentStatusEventSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    eventType: {
        type: String,
        enum: ['PROGRESSED', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'ALUMNI_CONVERTED'],
        required: true
    },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    reason: { type: String, required: true },
    performedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});
exports.StudentStatusEvent = mongoose_1.default.model('StudentStatusEvent', StudentStatusEventSchema);
const GraduationRecordSchema = new mongoose_1.Schema({
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    totalCredits: { type: Number, required: true },
    requiredCredits: { type: Number, required: true },
    feeClearance: { type: Boolean, required: true },
    libraryClearance: { type: Boolean, required: true },
    isEligible: { type: Boolean, required: true },
    status: { type: String, enum: ['PENDING_CHECK', 'APPROVED', 'REJECTED', 'GRADUATED'], default: 'PENDING_CHECK' },
    graduatedAt: { type: Date },
    degreeCertificateNumber: { type: String }
}, { timestamps: true });
exports.GraduationRecord = mongoose_1.default.model('GraduationRecord', GraduationRecordSchema);
const ExamCycleSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    academicYear: { type: String, required: true },
    semester: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    applicationStartDate: { type: String, required: true },
    applicationEndDate: { type: String, required: true },
    status: { type: String, enum: Object.values(index_1.ExamCycleStatus), default: index_1.ExamCycleStatus.APPLICATION_OPEN }
}, { timestamps: true });
exports.ExamCycle = mongoose_1.default.model('ExamCycle', ExamCycleSchema);
const ExamPolicyVersionSchema = new mongoose_1.Schema({
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    version: { type: Number, default: 1 },
    minAttendancePercentage: { type: Number, default: 75 },
    requireFeeClearance: { type: Boolean, default: true },
    feePerSubjectPaise: { type: Number, default: 50000 },
    lateFeeChargePaise: { type: Number, default: 20000 },
    allowBacklog: { type: Boolean, default: true },
    allowPrivate: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
exports.ExamPolicyVersion = mongoose_1.default.model('ExamPolicyVersion', ExamPolicyVersionSchema);
const ExamApplicationSchema = new mongoose_1.Schema({
    applicationNumber: { type: String, required: true, unique: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    category: { type: String, enum: Object.values(index_1.ExamStudentCategory), default: index_1.ExamStudentCategory.REGULAR },
    subjectIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: Object.values(index_1.ExamApplicationStatus), default: index_1.ExamApplicationStatus.SUBMITTED },
    feeAmountPaise: { type: Number, required: true },
    feePaid: { type: Boolean, default: false },
    paymentOrderId: { type: String },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    rejectionReason: { type: String }
}, { timestamps: true });
exports.ExamApplication = mongoose_1.default.model('ExamApplication', ExamApplicationSchema);
const EligibilityDecisionSchema = new mongoose_1.Schema({
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamApplication' },
    overallStatus: { type: String, enum: Object.values(index_1.EligibilityStatus), required: true },
    attendancePercentage: { type: Number, required: true },
    feeCleared: { type: Boolean, required: true },
    ineligibilityReasons: [{ type: String }],
    hasException: { type: Boolean, default: false },
    exceptionReason: { type: String },
    exceptionGrantedBy: { type: String },
    exceptionGrantedAt: { type: Date }
}, { timestamps: true });
exports.EligibilityDecision = mongoose_1.default.model('EligibilityDecision', EligibilityDecisionSchema);
const ExamEnrollmentSchema = new mongoose_1.Schema({
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    category: { type: String, enum: Object.values(index_1.ExamStudentCategory), default: index_1.ExamStudentCategory.REGULAR },
    status: { type: String, enum: ['ENROLLED', 'WITHDRAWN'], default: 'ENROLLED' }
}, { timestamps: true });
exports.ExamEnrollment = mongoose_1.default.model('ExamEnrollment', ExamEnrollmentSchema);
const RollNumberAssignmentSchema = new mongoose_1.Schema({
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamApplication', required: true },
    rollNumber: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });
RollNumberAssignmentSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });
RollNumberAssignmentSchema.index({ cycleId: 1, rollNumber: 1 }, { unique: true });
exports.RollNumberAssignment = mongoose_1.default.model('RollNumberAssignment', RollNumberAssignmentSchema);
const HallTicketSchema = new mongoose_1.Schema({
    ticketNumber: { type: String, required: true, unique: true },
    applicationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamApplication', required: true, unique: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    rollNumber: { type: String, required: true },
    centerCode: { type: String, required: true },
    centerName: { type: String, required: true },
    reportingTime: { type: String, required: true },
    papers: [{
            subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
            subjectCode: { type: String, required: true },
            subjectName: { type: String, required: true },
            examDate: { type: String, default: '2026-11-20' },
            examTime: { type: String, default: '09:30 AM - 12:30 PM' }
        }],
    issuedAt: { type: Date, default: Date.now },
    issuedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' }
}, { timestamps: true });
HallTicketSchema.index({ cycleId: 1, studentId: 1 }, { unique: true });
exports.HallTicket = mongoose_1.default.model('HallTicket', HallTicketSchema);
const ExamCenterSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
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
exports.ExamCenter = mongoose_1.default.model('ExamCenter', ExamCenterSchema);
const CenterVerificationSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    centerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
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
    status: { type: String, enum: Object.values(index_1.CenterVerificationStatus), default: index_1.CenterVerificationStatus.VERIFIED }
}, { timestamps: true });
CenterVerificationSchema.index({ centerId: 1, cycleId: 1 }, { unique: true });
exports.CenterVerification = mongoose_1.default.model('CenterVerification', CenterVerificationSchema);
const ExamScheduleSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    examDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    session: { type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING'], default: 'MORNING' },
    centerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
    roomIds: [{ type: String, required: true }],
    totalEnrolled: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(index_1.ExamScheduleStatus), default: index_1.ExamScheduleStatus.DRAFT },
    conflicts: [{
            type: { type: String, enum: ['ROOM_CONFLICT', 'STUDENT_COLLISION', 'FACULTY_COLLISION'] },
            description: { type: String }
        }],
    publishedBy: { type: String },
    publishedAt: { type: Date }
}, { timestamps: true });
ExamScheduleSchema.index({ cycleId: 1, subjectId: 1 });
ExamScheduleSchema.index({ centerId: 1, examDate: 1 });
exports.ExamSchedule = mongoose_1.default.model('ExamSchedule', ExamScheduleSchema);
const SeatingAllocationSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
    centerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
    roomId: { type: String, required: true },
    roomNumber: { type: String, required: true },
    seatNumber: { type: String, required: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentRollNumber: { type: String, required: true },
    studentName: { type: String, required: true },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Course', required: true },
    allocatedAt: { type: Date, default: Date.now },
    allocatedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' },
    status: { type: String, enum: Object.values(index_1.SeatingAllocationStatus), default: index_1.SeatingAllocationStatus.ALLOCATED },
    previousAllocationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SeatingAllocation' },
    reallocationReason: { type: String }
}, { timestamps: true });
SeatingAllocationSchema.index({ scheduleId: 1, studentId: 1, status: 1 });
SeatingAllocationSchema.index({ scheduleId: 1, roomId: 1, seatNumber: 1, status: 1 });
exports.SeatingAllocation = mongoose_1.default.model('SeatingAllocation', SeatingAllocationSchema);
const InvigilationDutySchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
    centerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCenter', required: true },
    roomId: { type: String, required: true },
    facultyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    dutyDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reportingTime: { type: String, default: '08:30 AM' },
    status: { type: String, enum: Object.values(index_1.InvigilationDutyStatus), default: index_1.InvigilationDutyStatus.ASSIGNED },
    assignedBy: { type: String, default: 'CONTROLLER_OF_EXAMINATIONS' },
    assignedAt: { type: Date, default: Date.now },
    acknowledgedAt: { type: Date },
    declineReason: { type: String },
    remarks: { type: String }
}, { timestamps: true });
InvigilationDutySchema.index({ scheduleId: 1, facultyId: 1 });
InvigilationDutySchema.index({ cycleId: 1, facultyId: 1, dutyDate: 1, startTime: 1 });
exports.InvigilationDuty = mongoose_1.default.model('InvigilationDuty', InvigilationDutySchema);
const MaterialBatchSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    cycleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCycle', required: true },
    batchNumber: { type: String, required: true },
    materialType: { type: String, enum: Object.values(index_1.MaterialType), default: index_1.MaterialType.MAIN_ANSWER_BOOK },
    prefix: { type: String, default: 'AB-' },
    startSerial: { type: Number, required: true },
    endSerial: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    dispatchedCount: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    returnedCount: { type: Number, default: 0 },
    damagedCount: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(index_1.MaterialBatchStatus), default: index_1.MaterialBatchStatus.IN_STOCK },
    securityBagSealNumber: { type: String },
    confidentialNotes: { type: String },
    reconciliationNotes: { type: String },
    reconciledAt: { type: Date },
    reconciledBy: { type: String }
}, { timestamps: true });
MaterialBatchSchema.index({ cycleId: 1, batchNumber: 1 }, { unique: true });
MaterialBatchSchema.index({ institutionId: 1, materialType: 1, prefix: 1, startSerial: 1, endSerial: 1 });
exports.MaterialBatch = mongoose_1.default.model('MaterialBatch', MaterialBatchSchema);
const MaterialMovementSchema = new mongoose_1.Schema({
    institutionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Institution', required: true },
    batchId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MaterialBatch', required: true },
    movementType: { type: String, enum: Object.values(index_1.MaterialMovementType), required: true },
    centerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamCenter' },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ExamSchedule' },
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
exports.MaterialMovement = mongoose_1.default.model('MaterialMovement', MaterialMovementSchema);

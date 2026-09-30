"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentTransferSchema = exports.SubjectEnrollmentSchema = exports.ProfileChangeRequestSchema = exports.CSVImportCommitSchema = exports.CSVImportDryRunSchema = exports.AdmissionReviewSchema = exports.AdmissionCorrectionSchema = exports.AdmissionApplySchema = exports.NoticePublishSchema = exports.GrievanceSubmitSchema = exports.PlacementDriveSchema = exports.HostelGatePassSchema = exports.PayrollApproveSchema = exports.FeePaySchema = exports.MarksEntrySchema = exports.AttendanceSubmitSchema = exports.StudentCreateSchema = exports.DepartmentSchema = exports.InstitutionSchema = exports.LoginSchema = exports.RegisterSchema = exports.MaterialMovementType = exports.MaterialBatchStatus = exports.MaterialType = exports.InvigilationDutyStatus = exports.SeatingAllocationStatus = exports.ExamScheduleStatus = exports.CenterVerificationStatus = exports.EligibilityStatus = exports.ExamApplicationStatus = exports.ExamStudentCategory = exports.ExamCycleStatus = exports.BudgetStatus = exports.ConcessionStatus = exports.ConcessionCategory = exports.RefundStatus = exports.PaymentEventType = exports.PaymentOrderStatus = exports.InvoiceStatus = exports.OutboxStatus = exports.GrievanceStatus = exports.GrievanceCategory = exports.PlacementAppStatus = exports.GatePassStatus = exports.PaymentStatus = exports.PaymentMode = exports.FeeType = exports.ExamType = exports.AttendanceStatus = exports.UserRole = void 0;
exports.translations = exports.MaterialReconcileSchema = exports.MaterialMovementCreateSchema = exports.MaterialBatchCreateSchema = exports.InvigilationAcknowledgeSchema = exports.InvigilationDutyAssignSchema = exports.SeatingReallocationSchema = exports.SeatingAllocationCreateSchema = exports.ExamScheduleCreateSchema = exports.CenterVerificationSchema = exports.ExamCenterCreateSchema = exports.HallTicketIssueSchema = exports.RollNumberAssignSchema = exports.ExamExceptionGrantSchema = exports.ExamApplicationSubmitSchema = exports.ExamPolicyVersionSchema = exports.ExamCycleSchema = exports.BudgetCreateSchema = exports.RefundRequestSchema = exports.ConcessionRequestSchema = exports.SimulatorCallbackSchema = exports.CreatePaymentOrderSchema = exports.AssessFeeInvoiceSchema = exports.FeeRuleVersionSchema = exports.CalendarEventSchema = exports.TimetableRescheduleSchema = exports.TimetableEntrySchema = exports.RoomSchema = exports.AlumniServiceToggleSchema = exports.AttendancePolicySchema = exports.AttendanceBulkUploadSchema = exports.AttendanceCorrectionReviewSchema = exports.AttendanceCorrectionRequestSchema = exports.AttendanceSessionCaptureSchema = exports.StudentWithdrawSchema = void 0;
exports.formatPaiseToRupees = formatPaiseToRupees;
exports.parseRupeesToPaise = parseRupeesToPaise;
const zod_1 = require("zod");
// ==========================================
// 1. ENUMS & CONSTANTS
// ==========================================
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["FACULTY"] = "FACULTY";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["GUARDIAN"] = "GUARDIAN";
    UserRole["FINANCE"] = "FINANCE";
    UserRole["WARDEN"] = "WARDEN";
    UserRole["PLACEMENT_OFFICER"] = "PLACEMENT_OFFICER";
    UserRole["ADMISSIONS_OFFICER"] = "ADMISSIONS_OFFICER";
})(UserRole || (exports.UserRole = UserRole = {}));
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["PRESENT"] = "PRESENT";
    AttendanceStatus["ABSENT"] = "ABSENT";
    AttendanceStatus["LATE"] = "LATE";
    AttendanceStatus["EXCUSED"] = "EXCUSED";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
var ExamType;
(function (ExamType) {
    ExamType["MID_TERM"] = "MID_TERM";
    ExamType["END_SEM"] = "END_SEM";
    ExamType["QUIZ"] = "QUIZ";
    ExamType["ASSIGNMENT"] = "ASSIGNMENT";
})(ExamType || (exports.ExamType = ExamType = {}));
var FeeType;
(function (FeeType) {
    FeeType["TUITION"] = "TUITION";
    FeeType["HOSTEL"] = "HOSTEL";
    FeeType["EXAM"] = "EXAM";
    FeeType["TRANSPORT"] = "TRANSPORT";
    FeeType["LIBRARY"] = "LIBRARY";
    FeeType["OTHER"] = "OTHER";
})(FeeType || (exports.FeeType = FeeType = {}));
var PaymentMode;
(function (PaymentMode) {
    PaymentMode["UPI"] = "UPI";
    PaymentMode["NET_BANKING"] = "NET_BANKING";
    PaymentMode["CARD"] = "CARD";
    PaymentMode["CASH"] = "CASH";
    PaymentMode["CHQ"] = "CHQ";
})(PaymentMode || (exports.PaymentMode = PaymentMode = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var GatePassStatus;
(function (GatePassStatus) {
    GatePassStatus["PENDING"] = "PENDING";
    GatePassStatus["APPROVED"] = "APPROVED";
    GatePassStatus["REJECTED"] = "REJECTED";
    GatePassStatus["EXPIRED"] = "EXPIRED";
})(GatePassStatus || (exports.GatePassStatus = GatePassStatus = {}));
var PlacementAppStatus;
(function (PlacementAppStatus) {
    PlacementAppStatus["APPLIED"] = "APPLIED";
    PlacementAppStatus["SHORTLISTED"] = "SHORTLISTED";
    PlacementAppStatus["INTERVIEWING"] = "INTERVIEWING";
    PlacementAppStatus["OFFERED"] = "OFFERED";
    PlacementAppStatus["REJECTED"] = "REJECTED";
})(PlacementAppStatus || (exports.PlacementAppStatus = PlacementAppStatus = {}));
var GrievanceCategory;
(function (GrievanceCategory) {
    GrievanceCategory["ACADEMIC"] = "ACADEMIC";
    GrievanceCategory["HOSTEL"] = "HOSTEL";
    GrievanceCategory["FINANCIAL"] = "FINANCIAL";
    GrievanceCategory["ANTI_RAGGING"] = "ANTI_RAGGING";
    GrievanceCategory["FACILITIES"] = "FACILITIES";
    GrievanceCategory["OTHER"] = "OTHER";
})(GrievanceCategory || (exports.GrievanceCategory = GrievanceCategory = {}));
var GrievanceStatus;
(function (GrievanceStatus) {
    GrievanceStatus["OPEN"] = "OPEN";
    GrievanceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    GrievanceStatus["RESOLVED"] = "RESOLVED";
    GrievanceStatus["CLOSED"] = "CLOSED";
})(GrievanceStatus || (exports.GrievanceStatus = GrievanceStatus = {}));
var OutboxStatus;
(function (OutboxStatus) {
    OutboxStatus["PENDING"] = "PENDING";
    OutboxStatus["SENT"] = "SENT";
    OutboxStatus["FAILED"] = "FAILED";
})(OutboxStatus || (exports.OutboxStatus = OutboxStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["ISSUED"] = "ISSUED";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentOrderStatus;
(function (PaymentOrderStatus) {
    PaymentOrderStatus["CREATED"] = "CREATED";
    PaymentOrderStatus["ATTEMPTED"] = "ATTEMPTED";
    PaymentOrderStatus["PAID"] = "PAID";
    PaymentOrderStatus["FAILED"] = "FAILED";
    PaymentOrderStatus["EXPIRED"] = "EXPIRED";
})(PaymentOrderStatus || (exports.PaymentOrderStatus = PaymentOrderStatus = {}));
var PaymentEventType;
(function (PaymentEventType) {
    PaymentEventType["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    PaymentEventType["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    PaymentEventType["PAYMENT_PENDING"] = "PAYMENT_PENDING";
})(PaymentEventType || (exports.PaymentEventType = PaymentEventType = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["REQUESTED"] = "REQUESTED";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["REJECTED"] = "REJECTED";
    RefundStatus["PROCESSED"] = "PROCESSED";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
var ConcessionCategory;
(function (ConcessionCategory) {
    ConcessionCategory["MERIT_SCHOLARSHIP"] = "MERIT_SCHOLARSHIP";
    ConcessionCategory["NEED_BASED"] = "NEED_BASED";
    ConcessionCategory["STAFF_WARD"] = "STAFF_WARD";
    ConcessionCategory["SPORTS_QUOTA"] = "SPORTS_QUOTA";
    ConcessionCategory["GOVERNMENT_AID"] = "GOVERNMENT_AID";
})(ConcessionCategory || (exports.ConcessionCategory = ConcessionCategory = {}));
var ConcessionStatus;
(function (ConcessionStatus) {
    ConcessionStatus["DRAFT"] = "DRAFT";
    ConcessionStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ConcessionStatus["APPROVED"] = "APPROVED";
    ConcessionStatus["REJECTED"] = "REJECTED";
})(ConcessionStatus || (exports.ConcessionStatus = ConcessionStatus = {}));
var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "DRAFT";
    BudgetStatus["APPROVED"] = "APPROVED";
    BudgetStatus["FROZEN"] = "FROZEN";
})(BudgetStatus || (exports.BudgetStatus = BudgetStatus = {}));
var ExamCycleStatus;
(function (ExamCycleStatus) {
    ExamCycleStatus["DRAFT"] = "DRAFT";
    ExamCycleStatus["UPCOMING"] = "UPCOMING";
    ExamCycleStatus["APPLICATION_OPEN"] = "APPLICATION_OPEN";
    ExamCycleStatus["REVIEW"] = "REVIEW";
    ExamCycleStatus["HALL_TICKETS_ISSUED"] = "HALL_TICKETS_ISSUED";
    ExamCycleStatus["CONCLUDED"] = "CONCLUDED";
})(ExamCycleStatus || (exports.ExamCycleStatus = ExamCycleStatus = {}));
var ExamStudentCategory;
(function (ExamStudentCategory) {
    ExamStudentCategory["REGULAR"] = "REGULAR";
    ExamStudentCategory["PRIVATE"] = "PRIVATE";
    ExamStudentCategory["BACKLOG"] = "BACKLOG";
})(ExamStudentCategory || (exports.ExamStudentCategory = ExamStudentCategory = {}));
var ExamApplicationStatus;
(function (ExamApplicationStatus) {
    ExamApplicationStatus["DRAFT"] = "DRAFT";
    ExamApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ExamApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ExamApplicationStatus["APPROVED"] = "APPROVED";
    ExamApplicationStatus["REJECTED"] = "REJECTED";
    ExamApplicationStatus["HALL_TICKET_ISSUED"] = "HALL_TICKET_ISSUED";
})(ExamApplicationStatus || (exports.ExamApplicationStatus = ExamApplicationStatus = {}));
var EligibilityStatus;
(function (EligibilityStatus) {
    EligibilityStatus["ELIGIBLE"] = "ELIGIBLE";
    EligibilityStatus["INELIGIBLE"] = "INELIGIBLE";
    EligibilityStatus["CONDITIONAL_EXCEPTION"] = "CONDITIONAL_EXCEPTION";
})(EligibilityStatus || (exports.EligibilityStatus = EligibilityStatus = {}));
var CenterVerificationStatus;
(function (CenterVerificationStatus) {
    CenterVerificationStatus["PENDING"] = "PENDING";
    CenterVerificationStatus["VERIFIED"] = "VERIFIED";
    CenterVerificationStatus["REJECTED"] = "REJECTED";
})(CenterVerificationStatus || (exports.CenterVerificationStatus = CenterVerificationStatus = {}));
var ExamScheduleStatus;
(function (ExamScheduleStatus) {
    ExamScheduleStatus["DRAFT"] = "DRAFT";
    ExamScheduleStatus["PUBLISHED"] = "PUBLISHED";
    ExamScheduleStatus["RESCHEDULED"] = "RESCHEDULED";
    ExamScheduleStatus["CANCELLED"] = "CANCELLED";
})(ExamScheduleStatus || (exports.ExamScheduleStatus = ExamScheduleStatus = {}));
var SeatingAllocationStatus;
(function (SeatingAllocationStatus) {
    SeatingAllocationStatus["ALLOCATED"] = "ALLOCATED";
    SeatingAllocationStatus["REALLOCATED"] = "REALLOCATED";
    SeatingAllocationStatus["CANCELLED"] = "CANCELLED";
})(SeatingAllocationStatus || (exports.SeatingAllocationStatus = SeatingAllocationStatus = {}));
var InvigilationDutyStatus;
(function (InvigilationDutyStatus) {
    InvigilationDutyStatus["ASSIGNED"] = "ASSIGNED";
    InvigilationDutyStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    InvigilationDutyStatus["DECLINED"] = "DECLINED";
    InvigilationDutyStatus["COMPLETED"] = "COMPLETED";
    InvigilationDutyStatus["ABSENT"] = "ABSENT";
})(InvigilationDutyStatus || (exports.InvigilationDutyStatus = InvigilationDutyStatus = {}));
var MaterialType;
(function (MaterialType) {
    MaterialType["MAIN_ANSWER_BOOK"] = "MAIN_ANSWER_BOOK";
    MaterialType["SUPPLEMENTARY_SHEET"] = "SUPPLEMENTARY_SHEET";
    MaterialType["QUESTION_PAPER_PACKET"] = "QUESTION_PAPER_PACKET";
    MaterialType["GRAPH_SHEET"] = "GRAPH_SHEET";
})(MaterialType || (exports.MaterialType = MaterialType = {}));
var MaterialBatchStatus;
(function (MaterialBatchStatus) {
    MaterialBatchStatus["IN_STOCK"] = "IN_STOCK";
    MaterialBatchStatus["DISPATCHED"] = "DISPATCHED";
    MaterialBatchStatus["RECONCILED"] = "RECONCILED";
    MaterialBatchStatus["DISCREPANCY"] = "DISCREPANCY";
})(MaterialBatchStatus || (exports.MaterialBatchStatus = MaterialBatchStatus = {}));
var MaterialMovementType;
(function (MaterialMovementType) {
    MaterialMovementType["RECEIPT_FROM_PRESS"] = "RECEIPT_FROM_PRESS";
    MaterialMovementType["DISPATCH_TO_CENTER"] = "DISPATCH_TO_CENTER";
    MaterialMovementType["RETURN_FROM_CENTER"] = "RETURN_FROM_CENTER";
    MaterialMovementType["USAGE_REPORT"] = "USAGE_REPORT";
    MaterialMovementType["DAMAGE_RECORD"] = "DAMAGE_RECORD";
})(MaterialMovementType || (exports.MaterialMovementType = MaterialMovementType = {}));
// ==========================================
// 2. HELPER UTILITIES
// ==========================================
function formatPaiseToRupees(paise) {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(rupees);
}
function parseRupeesToPaise(rupees) {
    return Math.round(rupees * 100);
}
// ==========================================
// 3. ZOD VALIDATION SCHEMAS (DTOs)
// ==========================================
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    role: zod_1.z.nativeEnum(UserRole),
    institutionId: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    wardStudentIds: zod_1.z.array(zod_1.z.string()).optional()
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    role: zod_1.z.nativeEnum(UserRole)
});
exports.InstitutionSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(10).toUpperCase(),
    name: zod_1.z.string().min(3),
    address: zod_1.z.string().min(5),
    contactEmail: zod_1.z.string().email(),
    contactPhone: zod_1.z.string().min(10)
});
exports.DepartmentSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    code: zod_1.z.string().min(2).toUpperCase(),
    name: zod_1.z.string().min(3),
    headOfDepartmentId: zod_1.z.string().optional()
});
exports.StudentCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2),
    password: zod_1.z.string().min(6),
    institutionId: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1),
    rollNumber: zod_1.z.string().min(2),
    enrollmentNumber: zod_1.z.string().min(2),
    currentSemester: zod_1.z.number().min(1).max(10),
    batchYear: zod_1.z.number().min(2000).max(2100),
    guardianEmail: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional()
});
exports.AttendanceSubmitSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    semester: zod_1.z.number().min(1),
    section: zod_1.z.string().min(1),
    entries: zod_1.z.array(zod_1.z.object({
        studentId: zod_1.z.string().min(1),
        status: zod_1.z.nativeEnum(AttendanceStatus),
        remarks: zod_1.z.string().optional()
    }))
});
exports.MarksEntrySchema = zod_1.z.object({
    examId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    studentMarks: zod_1.z.array(zod_1.z.object({
        studentId: zod_1.z.string().min(1),
        marksObtained: zod_1.z.number().min(0),
        maxMarks: zod_1.z.number().gt(0),
        remarks: zod_1.z.string().optional()
    })),
    isFinalized: zod_1.z.boolean().default(false)
});
exports.FeePaySchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    institutionId: zod_1.z.string().min(1),
    amountPaise: zod_1.z.number().int().positive('Amount must be positive integer paise'),
    feeType: zod_1.z.nativeEnum(FeeType),
    paymentMode: zod_1.z.nativeEnum(PaymentMode),
    idempotencyKey: zod_1.z.string().min(8, 'Valid Idempotency Key required')
});
exports.PayrollApproveSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    monthYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    staffId: zod_1.z.string().min(1),
    baseSalaryPaise: zod_1.z.number().int().positive(),
    hraPaise: zod_1.z.number().int().nonnegative(),
    deductionsPaise: zod_1.z.number().int().nonnegative(),
    remarks: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().min(8)
});
exports.HostelGatePassSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    reason: zod_1.z.string().min(5),
    outDate: zod_1.z.string(),
    inDate: zod_1.z.string()
});
exports.PlacementDriveSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    companyName: zod_1.z.string().min(2),
    jobTitle: zod_1.z.string().min(2),
    packageLpaPaise: zod_1.z.number().int().positive(),
    eligibilityMinCgpa: zod_1.z.number().min(0).max(10),
    deadline: zod_1.z.string()
});
exports.GrievanceSubmitSchema = zod_1.z.object({
    category: zod_1.z.nativeEnum(GrievanceCategory),
    subject: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10),
    isAnonymous: zod_1.z.boolean().default(false)
});
exports.NoticePublishSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3),
    content: zod_1.z.string().min(5),
    targetRole: zod_1.z.string().default('ALL'),
    sendSmsNotification: zod_1.z.boolean().default(true)
});
exports.AdmissionApplySchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10),
    highSchoolScore: zod_1.z.number().min(0).max(100),
    entranceExamScore: zod_1.z.number().min(0).max(100),
    documents: zod_1.z.array(zod_1.z.object({
        docType: zod_1.z.string(),
        fileUrl: zod_1.z.string()
    })).optional(),
    feePaid: zod_1.z.boolean().default(true)
});
exports.AdmissionCorrectionSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    highSchoolScore: zod_1.z.number().optional(),
    entranceExamScore: zod_1.z.number().optional()
});
exports.AdmissionReviewSchema = zod_1.z.object({
    decision: zod_1.z.enum(['APPROVE', 'REJECT', 'REQUEST_CORRECTION']),
    reason: zod_1.z.string().optional(),
    requestedFields: zod_1.z.array(zod_1.z.string()).optional()
});
exports.CSVImportDryRunSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    filename: zod_1.z.string().min(1),
    rows: zod_1.z.array(zod_1.z.object({
        row: zod_1.z.number(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        externalCode: zod_1.z.string()
    }))
});
exports.CSVImportCommitSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    batchId: zod_1.z.string().min(1),
    filename: zod_1.z.string().min(1),
    rows: zod_1.z.array(zod_1.z.object({
        row: zod_1.z.number(),
        name: zod_1.z.string(),
        email: zod_1.z.string(),
        externalCode: zod_1.z.string()
    }))
});
exports.ProfileChangeRequestSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    requestedChanges: zod_1.z.object({
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        guardianPhone: zod_1.z.string().optional()
    }),
    reason: zod_1.z.string().min(5)
});
exports.SubjectEnrollmentSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    semester: zod_1.z.number().min(1).max(10),
    academicYear: zod_1.z.string().min(4),
    courseIds: zod_1.z.array(zod_1.z.string().min(1))
});
exports.StudentTransferSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    transferReason: zod_1.z.string().min(5),
    targetInstitution: zod_1.z.string().optional()
});
exports.StudentWithdrawSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    withdrawalReason: zod_1.z.string().min(5)
});
exports.AttendanceSessionCaptureSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    section: zod_1.z.string().default('A'),
    date: zod_1.z.string().min(1),
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
    topicCovered: zod_1.z.string().optional(),
    entries: zod_1.z.array(zod_1.z.object({
        studentId: zod_1.z.string().min(1),
        status: zod_1.z.nativeEnum(AttendanceStatus),
        remarks: zod_1.z.string().optional()
    }))
});
exports.AttendanceCorrectionRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    requestedStatus: zod_1.z.nativeEnum(AttendanceStatus),
    reason: zod_1.z.string().min(5)
});
exports.AttendanceCorrectionReviewSchema = zod_1.z.object({
    correctionId: zod_1.z.string().min(1),
    decision: zod_1.z.enum(['APPROVED', 'REJECTED']),
    reviewComments: zod_1.z.string().optional()
});
exports.AttendanceBulkUploadSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    sessionDate: zod_1.z.string().min(1),
    records: zod_1.z.array(zod_1.z.object({
        rollNumber: zod_1.z.string().min(1),
        status: zod_1.z.nativeEnum(AttendanceStatus)
    }))
});
exports.AttendancePolicySchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    minPercentageRequired: zod_1.z.number().min(0).max(100).default(75),
    countExcusedInDenominator: zod_1.z.boolean().default(false),
    policyName: zod_1.z.string().min(3)
});
exports.AlumniServiceToggleSchema = zod_1.z.object({
    alumniId: zod_1.z.string().min(1),
    libraryAccessEnabled: zod_1.z.boolean().optional(),
    transcriptAccessEnabled: zod_1.z.boolean().optional(),
    careerSupportEnabled: zod_1.z.boolean().optional()
});
exports.RoomSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    building: zod_1.z.string().min(1),
    capacity: zod_1.z.number().int().positive(),
    roomType: zod_1.z.enum(['LECTURE_HALL', 'LABORATORY', 'SEMINAR_ROOM', 'AUDITORIUM']).default('LECTURE_HALL'),
    hasProjector: zod_1.z.boolean().default(true),
    hasAC: zod_1.z.boolean().default(true)
});
exports.TimetableEntrySchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    facultyId: zod_1.z.string().min(1),
    roomId: zod_1.z.string().min(1),
    semester: zod_1.z.number().int().min(1).max(10),
    section: zod_1.z.string().default('A'),
    dayOfWeek: zod_1.z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    recurrencePattern: zod_1.z.enum(['WEEKLY', 'BIWEEKLY']).default('WEEKLY'),
    academicYear: zod_1.z.string().default('2026-2027')
});
exports.TimetableRescheduleSchema = zod_1.z.object({
    entryId: zod_1.z.string().min(1),
    exceptionDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    newRoomId: zod_1.z.string().optional(),
    newFacultyId: zod_1.z.string().optional(),
    newStartTime: zod_1.z.string().optional(),
    newEndTime: zod_1.z.string().optional(),
    reason: zod_1.z.string().min(5),
    sendNotificationNotice: zod_1.z.boolean().default(true)
});
exports.CalendarEventSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3),
    eventType: zod_1.z.enum(['HOLIDAY', 'EXAM', 'ACADEMIC_DEADLINE', 'WORKSHOP', 'COLLEGE_FEST']),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    isHoliday: zod_1.z.boolean().default(false)
});
exports.FeeRuleVersionSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(3),
    academicYear: zod_1.z.string().default('2026-2027'),
    departmentId: zod_1.z.string().optional(),
    feeCategory: zod_1.z.nativeEnum(FeeType),
    heads: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(2),
        code: zod_1.z.string().min(2),
        amountPaise: zod_1.z.number().int().positive(),
        isMandatory: zod_1.z.boolean().default(true)
    })).min(1),
    lateFeeRule: zod_1.z.object({
        graceDays: zod_1.z.number().int().nonnegative().default(15),
        dailyLateFeePaise: zod_1.z.number().int().nonnegative().default(5000),
        maxLateFeePaise: zod_1.z.number().int().nonnegative().default(100000)
    }).optional(),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE')
});
exports.AssessFeeInvoiceSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    academicYear: zod_1.z.string().default('2026-2027'),
    semester: zod_1.z.number().int().min(1).max(10),
    dueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    lines: zod_1.z.array(zod_1.z.object({
        head: zod_1.z.string().min(2),
        category: zod_1.z.string().default('TUITION'),
        amountPaise: zod_1.z.number().int().positive()
    })).min(1)
});
exports.CreatePaymentOrderSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    institutionId: zod_1.z.string().min(1),
    amountPaise: zod_1.z.number().int().positive(),
    idempotencyKey: zod_1.z.string().min(8),
    provider: zod_1.z.string().default('RAZORPAY_SIM')
});
exports.SimulatorCallbackSchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    providerPaymentId: zod_1.z.string().min(1),
    amountPaise: zod_1.z.number().int().positive(),
    eventType: zod_1.z.enum(['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_PENDING']),
    signature: zod_1.z.string().min(1)
});
exports.ConcessionRequestSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().optional(),
    category: zod_1.z.nativeEnum(ConcessionCategory),
    amountPaise: zod_1.z.number().int().positive(),
    reason: zod_1.z.string().min(5)
});
exports.RefundRequestSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().min(1),
    receiptId: zod_1.z.string().optional(),
    studentId: zod_1.z.string().min(1),
    amountPaise: zod_1.z.number().int().positive(),
    reason: zod_1.z.string().min(5)
});
exports.BudgetCreateSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    academicYear: zod_1.z.string().default('2026-2027'),
    departmentId: zod_1.z.string().min(1),
    fundCode: zod_1.z.string().min(2),
    fundName: zod_1.z.string().min(2),
    allocatedPaise: zod_1.z.number().int().positive(),
    entries: zod_1.z.array(zod_1.z.object({
        head: zod_1.z.string().min(2),
        allocatedPaise: zod_1.z.number().int().positive()
    })).optional()
});
exports.ExamCycleSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    code: zod_1.z.string().min(3),
    name: zod_1.z.string().min(3),
    academicYear: zod_1.z.string().default('2026-2027'),
    semester: zod_1.z.number().int().min(1).max(10),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    applicationStartDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    applicationEndDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: zod_1.z.nativeEnum(ExamCycleStatus).default(ExamCycleStatus.APPLICATION_OPEN)
});
exports.ExamPolicyVersionSchema = zod_1.z.object({
    cycleId: zod_1.z.string().min(1),
    version: zod_1.z.number().default(1),
    minAttendancePercentage: zod_1.z.number().min(0).max(100).default(75),
    requireFeeClearance: zod_1.z.boolean().default(true),
    feePerSubjectPaise: zod_1.z.number().int().nonnegative().default(50000), // ₹500
    lateFeeChargePaise: zod_1.z.number().int().nonnegative().default(20000), // ₹200
    allowBacklog: zod_1.z.boolean().default(true),
    allowPrivate: zod_1.z.boolean().default(false),
    isActive: zod_1.z.boolean().default(true)
});
exports.ExamApplicationSubmitSchema = zod_1.z.object({
    cycleId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    category: zod_1.z.nativeEnum(ExamStudentCategory).default(ExamStudentCategory.REGULAR),
    subjectIds: zod_1.z.array(zod_1.z.string()).min(1, 'At least one examination paper required')
});
exports.ExamExceptionGrantSchema = zod_1.z.object({
    applicationId: zod_1.z.string().optional(),
    cycleId: zod_1.z.string().optional(),
    studentId: zod_1.z.string().optional(),
    reason: zod_1.z.string().min(5),
    grantedBy: zod_1.z.string().min(2),
    overrideAttendance: zod_1.z.boolean().default(false),
    overrideFee: zod_1.z.boolean().default(false)
});
exports.RollNumberAssignSchema = zod_1.z.object({
    cycleId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    rollNumber: zod_1.z.string().min(3)
});
exports.HallTicketIssueSchema = zod_1.z.object({
    applicationId: zod_1.z.string().min(1),
    centerCode: zod_1.z.string().default('CTR-101'),
    centerName: zod_1.z.string().default('Main Academic Complex Exam Hall A'),
    reportingTime: zod_1.z.string().default('08:30 AM')
});
exports.ExamCenterCreateSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    centerCode: zod_1.z.string().min(2),
    name: zod_1.z.string().min(3),
    address: zod_1.z.string().min(5),
    contactPerson: zod_1.z.string().min(2),
    contactPhone: zod_1.z.string().min(6),
    totalCapacity: zod_1.z.number().int().positive(),
    rooms: zod_1.z.array(zod_1.z.object({
        roomId: zod_1.z.string().min(1),
        roomNumber: zod_1.z.string().min(1),
        building: zod_1.z.string().min(1),
        floor: zod_1.z.string().default('Ground Floor'),
        capacity: zod_1.z.number().int().positive(),
        hasCCTV: zod_1.z.boolean().default(true),
        isAccessible: zod_1.z.boolean().default(true)
    })).min(1)
});
exports.CenterVerificationSchema = zod_1.z.object({
    centerId: zod_1.z.string().min(1),
    cycleId: zod_1.z.string().min(1),
    checklist: zod_1.z.object({
        cctvFunctional: zod_1.z.boolean().default(true),
        secureStorageAvailable: zod_1.z.boolean().default(true),
        powerBackupAvailable: zod_1.z.boolean().default(true),
        accessibilityCompliant: zod_1.z.boolean().default(true),
        drinkingWaterAndWashrooms: zod_1.z.boolean().default(true)
    }),
    remarks: zod_1.z.string().min(3),
    status: zod_1.z.nativeEnum(CenterVerificationStatus).default(CenterVerificationStatus.VERIFIED)
});
exports.ExamScheduleCreateSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    cycleId: zod_1.z.string().min(1),
    subjectId: zod_1.z.string().min(1),
    examDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    session: zod_1.z.enum(['MORNING', 'AFTERNOON', 'EVENING']).default('MORNING'),
    centerId: zod_1.z.string().min(1),
    roomIds: zod_1.z.array(zod_1.z.string().min(1)).min(1)
});
exports.SeatingAllocationCreateSchema = zod_1.z.object({
    cycleId: zod_1.z.string().min(1),
    scheduleId: zod_1.z.string().min(1),
    centerId: zod_1.z.string().min(1),
    roomId: zod_1.z.string().min(1),
    studentIds: zod_1.z.array(zod_1.z.string().min(1)).min(1)
});
exports.SeatingReallocationSchema = zod_1.z.object({
    allocationId: zod_1.z.string().min(1),
    newRoomId: zod_1.z.string().min(1),
    newSeatNumber: zod_1.z.string().optional(),
    reason: zod_1.z.string().min(5)
});
exports.InvigilationDutyAssignSchema = zod_1.z.object({
    cycleId: zod_1.z.string().min(1),
    scheduleId: zod_1.z.string().min(1),
    centerId: zod_1.z.string().min(1),
    roomId: zod_1.z.string().min(1),
    facultyId: zod_1.z.string().min(1),
    dutyDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    reportingTime: zod_1.z.string().default('08:30 AM')
});
exports.InvigilationAcknowledgeSchema = zod_1.z.object({
    dutyId: zod_1.z.string().min(1),
    status: zod_1.z.enum(['ACKNOWLEDGED', 'DECLINED']),
    declineReason: zod_1.z.string().optional()
});
exports.MaterialBatchCreateSchema = zod_1.z.object({
    institutionId: zod_1.z.string().min(1),
    cycleId: zod_1.z.string().min(1),
    batchNumber: zod_1.z.string().min(3),
    materialType: zod_1.z.nativeEnum(MaterialType).default(MaterialType.MAIN_ANSWER_BOOK),
    prefix: zod_1.z.string().min(1).default('AB-'),
    startSerial: zod_1.z.number().int().positive(),
    endSerial: zod_1.z.number().int().positive(),
    securityBagSealNumber: zod_1.z.string().optional(),
    confidentialNotes: zod_1.z.string().optional()
});
exports.MaterialMovementCreateSchema = zod_1.z.object({
    batchId: zod_1.z.string().min(1),
    movementType: zod_1.z.nativeEnum(MaterialMovementType),
    centerId: zod_1.z.string().optional(),
    scheduleId: zod_1.z.string().optional(),
    startSerial: zod_1.z.number().int().positive(),
    endSerial: zod_1.z.number().int().positive(),
    quantity: zod_1.z.number().int().positive(),
    sealNumber: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional()
});
exports.MaterialReconcileSchema = zod_1.z.object({
    batchId: zod_1.z.string().min(1),
    usedCount: zod_1.z.number().int().nonnegative(),
    returnedCount: zod_1.z.number().int().nonnegative(),
    damagedCount: zod_1.z.number().int().nonnegative().default(0),
    notes: zod_1.z.string().optional()
});
// ==========================================
// 4. DICTIONARY FOR I18N (ENGLISH & HINDI)
// ==========================================
exports.translations = {
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

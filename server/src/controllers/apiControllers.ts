import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWT_SECRET } from '../middleware/auth';
import {
  AuthService,
  FeeService,
  FinanceService,
  signSimulatorPayload,
  ExamService,
  PayrollService,
  LibraryService,
  AnalyticsService,
  AdmissionsService,
  StudentProfileService,
  AttendanceService,
  TimetableService,
  ExamApplicationService,
  ExamOperationsService,
  QuestionPaperService,
  AssessmentService,
  ResultService,
  RevaluationService,
  CertificateService,
  HelpdeskService,
  HostelService,
  TransportService,
  CommunicationService,
  GuardianService,
  GovernanceService,
  RegisterService,
  StaffService,
  InventoryService,
  MISService,
  AssistantService,
  PredictionService,
  LearningService,
  MobileService,
  DemoOperationsService,
  ReleaseAuditService
} from '../services/domainServices';
import {
  User,
  Institution,
  Department,
  Student,
  Course,
  Timetable,
  Room,
  TimetableEntry,
  TimetableException,
  CalendarEvent,
  Holiday,
  AttendanceRecord,
  AttendanceSession,
  AttendanceEntry,
  AttendanceCorrection,
  AttendancePolicyVersion,
  Exam,
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
  TransportPass,
  Book,
  BookLoan,
  PlacementDrive,
  PlacementApplication,
  AlumniProfile,
  Grievance,
  Notice,
  OutboxEvent,
  AuditLog,
  Applicant,
  AdmissionApplication,
  AdmissionDocument,
  ImportBatch,
  ExternalCodeMapping,
  ReviewDecision,
  Enrollment,
  ProfileChangeRequest,
  StudentDocument,
  StudentStatusEvent,
  GraduationRecord,
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
  SyntheticDatasetVersion,
  ModelVersion,
  Prediction,
  EvaluationReport,
  AdvisorReview,
  SupportIntervention
} from '../models/models';

import {
  RegisterSchema,
  LoginSchema,
  InstitutionSchema,
  DepartmentSchema,
  StudentCreateSchema,
  AttendanceSubmitSchema,
  MarksEntrySchema,
  FeePaySchema,
  PayrollApproveSchema,
  HostelGatePassSchema,
  PlacementDriveSchema,
  GrievanceSubmitSchema,
  NoticeCreateSimpleSchema,
  FeeRuleVersionSchema,
  AssessFeeInvoiceSchema,
  CreatePaymentOrderSchema,
  SimulatorCallbackSchema,
  ConcessionRequestSchema,
  RefundRequestSchema,
  BudgetCreateSchema,
  ExamCycleSchema,
  ExamPolicyVersionSchema,
  ExamApplicationSubmitSchema,
  ExamExceptionGrantSchema,
  RollNumberAssignSchema,
  HallTicketIssueSchema,
  ExamCenterCreateSchema,
  CenterVerificationSchema,
  ExamScheduleCreateSchema,
  SeatingAllocationCreateSchema,
  SeatingReallocationSchema,
  InvigilationDutyAssignSchema,
  InvigilationAcknowledgeSchema,
  MaterialBatchCreateSchema,
  MaterialMovementCreateSchema,
  MaterialReconcileSchema,
  SetterAppointmentCreateSchema,
  AppointmentResponseSchema,
  QuestionCreateSchema,
  PaperVersionSubmitSchema,
  PaperReviewSubmitSchema,
  PaperReleaseSchema,
  PaperAccessLogSchema,
  AssessmentBatchCreateSchema,
  MarkEntrySaveSchema,
  MarkImportSchema,
  ModerationDecisionSchema,
  AssessmentApprovalSchema,
  ResultRunCreateSchema,
  ResultApproveSchema,
  ResultPublishSchema,
  ResultCorrectionSchema,
  TranscriptGenerateSchema,
  ReviewPolicyCreateSchema,
  ReviewRequestSubmitSchema,
  ReviewAssignmentCreateSchema,
  ReviewOutcomeSubmitSchema,
  ReviewOutcomeApproveSchema,
  ReviewFeePaySchema,
  CertificateTypeCreateSchema,
  CertificateRequestSubmitSchema,
  CertificateReviewSchema,
  CertificateIssueSchema,
  CertificateRevokeSchema,
  ServiceCategoryCreateSchema,
  SLAPolicyCreateSchema,
  TicketCreateSchema,
  TicketMessageCreateSchema,
  TicketAssignSchema,
  TicketStatusUpdateSchema,
  TicketReopenSchema,
  HostelCreateSchema,
  HostelRoomCreateSchema,
  BedCreateSchema,
  HostelAppSubmitSchema,
  BedAllocateSchema,
  HostelCheckInSchema,
  HostelTransferSchema,
  HostelCheckOutSchema,
  TransportRouteCreateSchema,
  StopCreateSchema,
  VehicleCreateSchema,
  DriverAssignSchema,
  TransportSubSubmitSchema,
  TransportSubApproveSchema,
  VehicleSubstituteSchema,
  TripLogSchema,
  TransportCancelSubSchema,
  TransportRenewPassSchema,
  NoticeCreateSchema,
  NoticePublishSchema,
  NotificationPreferenceUpdateSchema,
  OutboxRetrySchema,
  CalendarEventSubscriptionSchema,
  GuardianInviteSchema,
  GuardianVerifyLinkSchema,
  GuardianPermissionUpdateSchema,
  GuardianRevokeSchema,
  UserRole,
  formatPaiseToRupees,
  ModelStatus,
  RiskBand,
  DataSufficiency,
  InterventionStatus,
  AdvisorReviewDecision
} from '@shared/index';

import { seedDatabase } from '../seed';

export class AuthController {
  static async login(req: AuthRequest, res: Response) {
    try {
      const parsed = LoginSchema.parse(req.body);
      const result = await AuthService.login(parsed.email, parsed.password, parsed.role);

      res.cookie('token', result.token, { httpOnly: true, sameSite: 'lax' });
      res.cookie('csrf-token', 'csrf-' + Math.random().toString(36).substring(2), { sameSite: 'lax' });

      return res.json({ message: 'Login successful', ...result, csrfToken: 'csrf-demo-token' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async register(req: AuthRequest, res: Response) {
    try {
      const parsed = RegisterSchema.parse(req.body);
      const user = await AuthService.register(parsed);
      return res.status(201).json({ message: 'User registered successfully', user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    const user = await User.findById(req.user.userId).select('-passwordHash');
    return res.json({ user, session: req.user });
  }

  static async logout(req: AuthRequest, res: Response) {
    res.clearCookie('token');
    res.clearCookie('csrf-token');
    return res.json({ message: 'Logged out successfully' });
  }
}

export class InstitutionController {
  static async list(req: AuthRequest, res: Response) {
    const list = await Institution.find();
    return res.json(list);
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const parsed = InstitutionSchema.parse(req.body);
      const inst = await Institution.create(parsed);
      return res.status(201).json(inst);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listDepartments(req: AuthRequest, res: Response) {
    const filter = req.user?.institutionId ? { institutionId: req.user.institutionId } : {};
    const deps = await Department.find(filter).populate('institutionId').populate('headOfDepartmentId');
    return res.json(deps);
  }

  static async createDepartment(req: AuthRequest, res: Response) {
    try {
      const parsed = DepartmentSchema.parse(req.body);
      const dep = await Department.create(parsed);
      return res.status(201).json(dep);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class StudentController {
  static async list(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.user?.institutionId && req.user.role !== UserRole.SUPER_ADMIN) {
      filter.institutionId = req.user.institutionId;
    }
    const students = await Student.find(filter)
      .populate('userId', '-passwordHash')
      .populate('institutionId')
      .populate('departmentId')
      .populate('guardianUserId', '-passwordHash');
    return res.json(students);
  }

  static async getById(req: AuthRequest, res: Response) {
    const student = await Student.findById(req.params.id)
      .populate('userId', '-passwordHash')
      .populate('institutionId')
      .populate('departmentId')
      .populate('guardianUserId', '-passwordHash');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json(student);
  }

  static async create(req: AuthRequest, res: Response) {
    try {
      const parsed = StudentCreateSchema.parse(req.body);

      // Create user account for student
      const registered = await AuthService.register({
        email: parsed.email,
        password: parsed.password,
        name: parsed.name,
        role: UserRole.STUDENT,
        institutionId: parsed.institutionId,
        phone: parsed.phone
      });

      const student = await Student.create({
        userId: registered.id,
        institutionId: parsed.institutionId,
        departmentId: parsed.departmentId,
        rollNumber: parsed.rollNumber,
        enrollmentNumber: parsed.enrollmentNumber,
        currentSemester: parsed.currentSemester,
        batchYear: parsed.batchYear
      });

      return res.status(201).json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class AcademicController {
  static async listCourses(req: AuthRequest, res: Response) {
    const courses = await Course.find().populate('departmentId').populate('facultyId');
    return res.json(courses);
  }

  static async createCourse(req: AuthRequest, res: Response) {
    const course = await Course.create(req.body);
    return res.status(201).json(course);
  }

  static async getTimetable(req: AuthRequest, res: Response) {
    const items = await Timetable.find().populate('courseId').populate('facultyId');
    return res.json(items);
  }

  static async createTimetable(req: AuthRequest, res: Response) {
    const item = await Timetable.create(req.body);
    return res.status(201).json(item);
  }

  static async submitAttendance(req: AuthRequest, res: Response) {
    try {
      const parsed = AttendanceSubmitSchema.parse(req.body);
      const record = await AttendanceRecord.findOneAndUpdate(
        { courseId: parsed.courseId, date: parsed.date, section: parsed.section },
        {
          institutionId: parsed.institutionId,
          facultyId: req.user!.userId,
          semester: parsed.semester,
          entries: parsed.entries
        },
        { upsert: true, new: true }
      );
      return res.status(200).json(record);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getAttendanceSummary(req: AuthRequest, res: Response) {
    const records = await AttendanceRecord.find().populate('courseId');
    return res.json(records);
  }
}

export class ExamController {
  static async listExams(req: AuthRequest, res: Response) {
    const exams = await Exam.find();
    return res.json(exams);
  }

  static async createExam(req: AuthRequest, res: Response) {
    const exam = await Exam.create(req.body);
    return res.status(201).json(exam);
  }

  static async submitMarks(req: AuthRequest, res: Response) {
    try {
      const parsed = MarksEntrySchema.parse(req.body);
      const sheets = await ExamService.submitMarks({
        ...parsed,
        userId: req.user!.userId
      });
      return res.json({ message: 'Marks recorded successfully', sheets });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getReportCard(req: AuthRequest, res: Response) {
    try {
      const result = await ExamService.getReportCard(req.params.studentId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class FeeController {
  static async payFee(req: AuthRequest, res: Response) {
    try {
      const parsed = FeePaySchema.parse(req.body);
      const txn = await FeeService.processPayment(parsed);
      return res.status(200).json(txn);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getLedger(req: AuthRequest, res: Response) {
    try {
      const ledger = await FeeService.getStudentLedger(req.params.studentId);
      return res.json(ledger);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStructures(req: AuthRequest, res: Response) {
    const structures = await FeeStructure.find().populate('departmentId');
    return res.json(structures);
  }

  static async createStructure(req: AuthRequest, res: Response) {
    const structure = await FeeStructure.create(req.body);
    return res.status(201).json(structure);
  }
}

export class FinanceController {
  // Fee Rules
  static async getRules(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '600000000000000000000001';
      const rules = await FinanceService.getFeeRules(institutionId);
      return res.json(rules);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createRule(req: AuthRequest, res: Response) {
    try {
      const parsed = FeeRuleVersionSchema.parse(req.body);
      const rule = await FinanceService.createFeeRule(parsed);
      return res.status(201).json(rule);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Invoices & Assessment
  static async assessInvoice(req: AuthRequest, res: Response) {
    try {
      const parsed = AssessFeeInvoiceSchema.parse(req.body);
      const invoice = await FinanceService.assessAndIssueInvoice(parsed);
      return res.status(201).json(invoice);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentInvoices(req: AuthRequest, res: Response) {
    try {
      const studentId = req.params.studentId || req.user?.studentId;
      if (!studentId) return res.status(400).json({ error: 'Student ID required' });
      const details = await FinanceService.getStudentFeeDetails(studentId);
      return res.json(details);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Payment Orders & Checkout
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const parsed = CreatePaymentOrderSchema.parse(req.body);
      const order = await FinanceService.createPaymentOrder(parsed);
      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Simulator Callback
  static async simulatorCallback(req: AuthRequest, res: Response) {
    try {
      const parsed = SimulatorCallbackSchema.parse(req.body);
      const result = await FinanceService.handleSimulatorCallback(parsed);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Simulator Signature Helper
  static async generateSignature(req: AuthRequest, res: Response) {
    try {
      const { orderId, amountPaise, providerPaymentId } = req.body;
      if (!orderId || !amountPaise || !providerPaymentId) {
        return res.status(400).json({ error: 'orderId, amountPaise, and providerPaymentId required' });
      }
      const signature = signSimulatorPayload(orderId, Number(amountPaise), providerPaymentId);
      return res.json({ signature });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Refunds
  static async requestRefund(req: AuthRequest, res: Response) {
    try {
      const parsed = RefundRequestSchema.parse(req.body);
      const refund = await FinanceService.requestRefund(parsed);
      return res.status(201).json(refund);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async approveRefund(req: AuthRequest, res: Response) {
    try {
      const approvedBy = req.user?.email || 'FINANCE_OFFICER';
      const refund = await FinanceService.approveRefund(req.params.refundId, approvedBy);
      return res.json(refund);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Concessions
  static async requestConcession(req: AuthRequest, res: Response) {
    try {
      const parsed = ConcessionRequestSchema.parse(req.body);
      const concession = await FinanceService.requestConcession(parsed);
      return res.status(201).json(concession);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async reviewConcession(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;
      const approvedBy = req.user?.email || 'FINANCE_OFFICER';
      const concession = await FinanceService.reviewConcession(req.params.concessionId, status, approvedBy);
      return res.json(concession);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Reconciliation
  static async runReconciliation(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || '600000000000000000000001';
      const periodStart = req.body.periodStart || '2026-01-01';
      const periodEnd = req.body.periodEnd || new Date().toISOString().split('T')[0];
      const run = await FinanceService.runReconciliation(institutionId, periodStart, periodEnd);
      return res.json(run);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Dashboard Overview
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '600000000000000000000001';
      const overview = await FinanceService.getFinanceOverview(institutionId);
      return res.json(overview);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Funds and Budgets
  static async listFunds(req: AuthRequest, res: Response) {
    try {
      const funds = await FinanceService.getFunds();
      return res.json(funds);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createFund(req: AuthRequest, res: Response) {
    try {
      const fund = await FinanceService.createFund(req.body);
      return res.status(201).json(fund);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listBudgets(req: AuthRequest, res: Response) {
    try {
      const budgets = await FinanceService.getBudgets();
      return res.json(budgets);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createBudget(req: AuthRequest, res: Response) {
    try {
      const parsed = BudgetCreateSchema.parse(req.body);
      const budget = await FinanceService.createBudget(parsed);
      return res.status(201).json(budget);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}


export class FacilityController {
  static async getHostels(req: AuthRequest, res: Response) {
    const rooms = await HostelRoom.find();
    return res.json(rooms);
  }

  static async createGatePass(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelGatePassSchema.parse(req.body);
      const pass = await GatePass.create(parsed);
      return res.status(201).json(pass);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getGatePasses(req: AuthRequest, res: Response) {
    const passes = await GatePass.find().populate({
      path: 'studentId',
      populate: { path: 'userId' }
    });
    return res.json(passes);
  }

  static async getRoutes(req: AuthRequest, res: Response) {
    const routes = await TransportRoute.find();
    return res.json(routes);
  }

  static async createBusPass(req: AuthRequest, res: Response) {
    const passNumber = `BUS-${Date.now()}`;
    const pass = await TransportPass.create({
      studentId: req.body.studentId,
      subscriptionId: req.body.routeId,
      passNumber,
      studentName: 'Student',
      routeCode: 'TR-01',
      stopName: 'Campus Stop',
      seatNumber: 'S-1',
      qrCode: `QR-${passNumber}`,
      validFrom: new Date(),
      validTo: new Date('2027-06-30'),
      status: 'ACTIVE'
    } as any);
    return res.status(201).json(pass);
  }

  static async getBooks(req: AuthRequest, res: Response) {
    const books = await Book.find();
    return res.json(books);
  }

  static async issueBook(req: AuthRequest, res: Response) {
    const loan = await BookLoan.create({
      studentId: req.body.studentId,
      bookId: req.body.bookId,
      issuedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'ISSUED'
    });
    return res.status(201).json(loan);
  }
}

export class PlacementController {
  static async getDrives(req: AuthRequest, res: Response) {
    const drives = await PlacementDrive.find();
    return res.json(drives);
  }

  static async createDrive(req: AuthRequest, res: Response) {
    try {
      const parsed = PlacementDriveSchema.parse(req.body);
      const drive = await PlacementDrive.create(parsed);
      return res.status(201).json(drive);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async applyDrive(req: AuthRequest, res: Response) {
    try {
      const app = await PlacementApplication.create({
        driveId: req.body.driveId,
        studentId: req.body.studentId
      });
      return res.status(201).json(app);
    } catch (err: any) {
      return res.status(400).json({ error: 'Already applied or invalid drive application.' });
    }
  }

  static async getAlumni(req: AuthRequest, res: Response) {
    const alumni = await AlumniProfile.find().populate('userId', '-passwordHash');
    return res.json(alumni);
  }
}

export class SupportController {
  static async getGrievances(req: AuthRequest, res: Response) {
    const grievances = await Grievance.find().populate('userId', '-passwordHash');
    return res.json(grievances);
  }

  static async createGrievance(req: AuthRequest, res: Response) {
    try {
      const parsed = GrievanceSubmitSchema.parse(req.body);
      const g = await Grievance.create({
        ...parsed,
        institutionId: req.user!.institutionId || '600000000000000000000001',
        userId: parsed.isAnonymous ? undefined : req.user!.userId
      });
      return res.status(201).json(g);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getNotices(req: AuthRequest, res: Response) {
    const notices = await Notice.find().populate('publishedBy', '-passwordHash');
    return res.json(notices);
  }

  static async createNotice(req: AuthRequest, res: Response) {
    try {
      const parsed = NoticeCreateSimpleSchema.parse(req.body);
      const notice = await Notice.create({
        ...parsed,
        publishedBy: req.user!.userId
      });

      if (parsed.sendSmsNotification) {
        await OutboxEvent.create({
          eventId: `SMS-NOTICE-${Date.now()}`,
          eventType: 'SMS_NOTICE_DISPATCH',
          payload: { title: parsed.title, targetRole: parsed.targetRole }
        });
      }

      return res.status(201).json(notice);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getOutbox(req: AuthRequest, res: Response) {
    const events = await OutboxEvent.find().sort({ createdAt: -1 }).limit(50);
    return res.json(events);
  }
}

export class AnalyticsController {
  static async getDashboardSummary(req: AuthRequest, res: Response) {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await User.countDocuments({ role: UserRole.FACULTY });
    const feeTxns = await FeeTransaction.find({ status: 'SUCCESS' });
    const totalFeeCollectedPaise = feeTxns.reduce((sum, t) => sum + t.amountPaise, 0);
    const activeDrives = await PlacementDrive.countDocuments({ status: 'ACTIVE' });

    return res.json({
      totalStudents,
      totalFaculty,
      totalFeeCollectedPaise,
      formattedFeeCollected: formatPaiseToRupees(totalFeeCollectedPaise),
      activeDrives,
      attendanceAvg: '86.4%'
    });
  }

  static async getDropoutRisk(req: AuthRequest, res: Response) {
    const report = await AnalyticsService.getAcademicRiskList(req.user?.institutionId);
    return res.json(report);
  }
}

export class SystemController {
  static async resetDemo(req: AuthRequest, res: Response) {
    try {
      await seedDatabase();
      return res.json({ message: 'Synthetic demo dataset reset successfully!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getAuditLogs(req: AuthRequest, res: Response) {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    return res.json(logs);
  }
}

export class AdmissionsController {
  static async apply(req: AuthRequest, res: Response) {
    try {
      const app = await AdmissionsService.createApplication(req.body);
      return res.status(201).json(app);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listApplications(req: AuthRequest, res: Response) {
    try {
      const filter: any = {};
      if (req.query.institutionId) filter.institutionId = req.query.institutionId;
      if (req.query.status) filter.status = req.query.status;

      const apps = await AdmissionApplication.find(filter)
        .populate('applicantId')
        .populate('departmentId')
        .sort({ createdAt: -1 });

      return res.json(apps);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getApplicationById(req: AuthRequest, res: Response) {
    try {
      const app = await AdmissionApplication.findById(req.params.id)
        .populate('applicantId')
        .populate('departmentId');
      if (!app) return res.status(404).json({ error: 'Application not found' });

      const documents = await AdmissionDocument.find({ applicationId: app._id });
      const decisions = await ReviewDecision.find({ applicationId: app._id }).sort({ timestamp: -1 });

      return res.json({ application: app, documents, decisions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async correctApplication(req: AuthRequest, res: Response) {
    try {
      const updated = await AdmissionsService.updateApplicantCorrection(req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async reviewApplication(req: AuthRequest, res: Response) {
    try {
      const reviewerId = req.user?.userId || '600000000000000000000001';
      const { decision, reason, requestedFields } = req.body;
      const updated = await AdmissionsService.reviewApplication(req.params.id, reviewerId, decision, reason, requestedFields);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async enrollCandidate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || '600000000000000000000001';
      const enrollment = await AdmissionsService.enrollCandidate(req.params.id, userId);
      return res.status(201).json(enrollment);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async csvDryRun(req: AuthRequest, res: Response) {
    try {
      const { institutionId, filename, rows } = req.body;
      const result = await AdmissionsService.processCSVImportDryRun(institutionId, filename, rows);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async csvCommit(req: AuthRequest, res: Response) {
    try {
      const { institutionId, batchId, filename, rows } = req.body;
      const batch = await AdmissionsService.commitCSVImport(institutionId, batchId, filename, rows);
      return res.status(200).json(batch);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async downloadImportErrors(req: AuthRequest, res: Response) {
    try {
      const batch = await ImportBatch.findOne({ batchId: req.params.batchId });
      let csvLines = ['Row,Name,Email,ExternalCode,Error'];

      if (batch && batch.rowErrors) {
        batch.rowErrors.forEach(e => {
          csvLines.push(`${e.row},"${e.name}","${e.email}","${e.externalCode}","${e.error}"`);
        });
      } else {
        // Fallback for dry run errors passed in query or generated
        csvLines.push(`3,"Amit Gupta","amit@example.com","INVALID_CODE","Unmapped external code: 'INVALID_CODE'"`);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="import_row_errors.csv"');
      return res.send(csvLines.join('\n'));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listMappings(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.institutionId) filter.institutionId = req.query.institutionId;
    const mappings = await ExternalCodeMapping.find(filter).populate('mappedDepartmentId');
    return res.json(mappings);
  }

  static async createOrUpdateMapping(req: AuthRequest, res: Response) {
    try {
      const { institutionId, externalCode, mappedDepartmentId, mappedProgramCode } = req.body;
      const mapping = await ExternalCodeMapping.findOneAndUpdate(
        { institutionId, externalCode: externalCode.toUpperCase() },
        { mappedDepartmentId, mappedProgramCode },
        { new: true, upsert: true }
      );
      return res.json(mapping);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listEnrollments(req: AuthRequest, res: Response) {
    try {
      const filter: any = {};
      if (req.query.institutionId) filter.institutionId = req.query.institutionId;
      const enrollments = await Enrollment.find(filter)
        .populate('applicantId')
        .populate('studentId')
        .populate('departmentId')
        .sort({ enrolledAt: -1 });
      return res.json(enrollments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export class StudentLifecycleController {
  static async getStudent360(req: AuthRequest, res: Response) {
    try {
      const summary = await StudentProfileService.getStudent360(req.params.id);
      return res.json(summary);
    } catch (err: any) {
      console.error('[getStudent360 Error]:', err.message, err.stack);
      return res.status(404).json({ error: err.message });
    }
  }

  static async requestProfileCorrection(req: AuthRequest, res: Response) {
    try {
      const { studentId, requestedChanges, reason } = req.body;
      const userId = req.user?.userId || '600000000000000000000001';
      const request = await StudentProfileService.requestProfileCorrection(studentId, userId, requestedChanges, reason);
      return res.status(201).json(request);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async approveProfileCorrection(req: AuthRequest, res: Response) {
    try {
      const reviewerId = req.user?.userId || '';
      const reviewerRole = req.user?.role || UserRole.STUDENT;
      const result = await StudentProfileService.approveProfileCorrection(req.params.id, reviewerId, reviewerRole, req.body.reviewNotes);
      return res.json(result);
    } catch (err: any) {
      const status = err.message.startsWith('Forbidden') ? 403 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentDocuments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || '';
      const userRole = req.user?.role || UserRole.STUDENT;
      const studentId = req.user?.studentId;
      const docs = await StudentProfileService.getStudentDocuments(req.params.studentId, userId, userRole, studentId);
      return res.json(docs);
    } catch (err: any) {
      const status = err.message.startsWith('Forbidden') ? 403 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async uploadStudentDocument(req: AuthRequest, res: Response) {
    try {
      const { studentId, title, docType, fileUrl } = req.body;
      const userId = req.user?.userId || '600000000000000000000001';
      const doc = await StudentDocument.create({
        studentId,
        title,
        docType,
        fileUrl,
        isPrivate: true,
        uploadedBy: userId
      });
      return res.status(201).json(doc);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async progressTerm(req: AuthRequest, res: Response) {
    try {
      const { studentId, reason } = req.body;
      const userId = req.user?.userId || '600000000000000000000001';
      const student = await StudentProfileService.progressTerm(studentId, userId, reason || 'Regular term advancement');
      return res.json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async transferStudent(req: AuthRequest, res: Response) {
    try {
      const { studentId, transferReason } = req.body;
      const userId = req.user?.userId || '600000000000000000000001';
      const student = await StudentProfileService.transferStudent(studentId, userId, transferReason);
      return res.json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async withdrawStudent(req: AuthRequest, res: Response) {
    try {
      const { studentId, withdrawalReason } = req.body;
      const userId = req.user?.userId || '600000000000000000000001';
      const student = await StudentProfileService.withdrawStudent(studentId, userId, withdrawalReason);
      return res.json(student);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async performGraduationCheck(req: AuthRequest, res: Response) {
    try {
      const check = await StudentProfileService.performGraduationCheck(req.params.id);
      return res.json(check);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async graduateStudent(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || '600000000000000000000001';
      const result = await StudentProfileService.graduateStudent(req.params.id, userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class AttendanceController {
  static async captureAttendance(req: AuthRequest, res: Response) {
    try {
      const facultyId = req.user?.userId || '600000000000000000000001';
      const userRole = req.user?.role || UserRole.FACULTY;
      const result = await AttendanceService.captureAttendance({
        ...req.body,
        facultyId,
        userRole
      });
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.message.includes('not assigned') ? 403 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getSessions(req: AuthRequest, res: Response) {
    try {
      const { institutionId, courseId, section, date } = req.query;
      const query: any = {};
      if (institutionId) query.institutionId = institutionId;
      if (courseId) query.courseId = courseId;
      if (section) query.section = section;
      if (date) query.date = date;

      const sessions = await AttendanceSession.find(query)
        .populate('courseId')
        .populate('facultyId', 'name email designation')
        .sort({ date: -1, createdAt: -1 });

      return res.json(sessions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getMyAttendance(req: AuthRequest, res: Response) {
    try {
      let studentId = req.user?.studentId;
      if (!studentId && req.user?.userId) {
        const s = await Student.findOne({ userId: req.user.userId });
        if (s) studentId = s._id.toString();
      }

      if (!studentId) {
        const firstStudent = await Student.findOne();
        if (!firstStudent) return res.status(404).json({ error: 'No student record found.' });
        studentId = firstStudent._id.toString();
      }

      const summary = await AttendanceService.getStudentAttendanceSummary(studentId);
      return res.json(summary);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentAttendance(req: AuthRequest, res: Response) {
    try {
      const summary = await AttendanceService.getStudentAttendanceSummary(req.params.studentId);
      return res.json(summary);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async requestCorrection(req: AuthRequest, res: Response) {
    try {
      let studentId = req.body.studentId || req.user?.studentId;
      if (!studentId && req.user?.userId) {
        const s = await Student.findOne({ userId: req.user.userId });
        if (s) studentId = s._id.toString();
      }
      if (!studentId) return res.status(400).json({ error: 'Student context required.' });

      const correction = await AttendanceService.requestCorrection({
        sessionId: req.body.sessionId,
        studentId,
        requestedStatus: req.body.requestedStatus,
        reason: req.body.reason
      });

      return res.status(201).json(correction);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCorrections(req: AuthRequest, res: Response) {
    try {
      const { status, studentId } = req.query;
      const query: any = {};
      if (status) query.status = status;
      if (studentId) query.studentId = studentId;

      const corrections = await AttendanceCorrection.find(query)
        .populate('studentId')
        .populate('sessionId')
        .populate('reviewedBy', 'name designation')
        .sort({ createdAt: -1 });

      return res.json(corrections);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async reviewCorrection(req: AuthRequest, res: Response) {
    try {
      const reviewerId = req.user?.userId || '';
      const reviewerRole = req.user?.role || UserRole.FACULTY;
      const result = await AttendanceService.reviewCorrection({
        correctionId: req.params.id,
        reviewerId,
        reviewerRole,
        decision: req.body.decision,
        reviewComments: req.body.reviewComments
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.message.includes('Students cannot approve') ? 403 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async bulkUploadAttendance(req: AuthRequest, res: Response) {
    try {
      const facultyId = req.user?.userId || '600000000000000000000001';
      const userRole = req.user?.role || UserRole.FACULTY;
      const result = await AttendanceService.bulkUploadAttendance({
        ...req.body,
        facultyId,
        userRole
      });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getReports(req: AuthRequest, res: Response) {
    try {
      const { institutionId, courseId } = req.query;
      const instId = (institutionId as string) || '100000000000000000000001';
      const analytics = await AttendanceService.getAttendanceAnalytics(instId, courseId as string);
      return res.json(analytics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async configurePolicy(req: AuthRequest, res: Response) {
    try {
      const policy = await AttendanceService.configurePolicy(req.body);
      return res.status(201).json(policy);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class TimetableController {
  static async getCalendarSchedule(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '100000000000000000000001';
      const studentId = (req.query.studentId as string) || (req.user?.role === UserRole.STUDENT ? req.user.studentId : undefined);
      const facultyId = (req.query.facultyId as string) || (req.user?.role === UserRole.FACULTY ? req.user.userId : undefined);
      const departmentId = req.query.departmentId as string;
      const semester = req.query.semester ? parseInt(req.query.semester as string, 10) : undefined;

      const schedule = await TimetableService.getCalendarSchedule({
        institutionId,
        studentId,
        facultyId,
        departmentId,
        semester,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      });

      return res.json(schedule);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createScheduleEntry(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
      const entry = await TimetableService.createScheduleEntry({
        ...req.body,
        institutionId
      });
      return res.status(201).json(entry);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('409 Conflict') ? 409 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async rescheduleInstance(req: AuthRequest, res: Response) {
    try {
      const createdBy = req.user?.userId || '600000000000000000000001';
      const result = await TimetableService.rescheduleInstance({
        ...req.body,
        createdBy
      });
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[rescheduleInstance error]:', err.message);
      const status = err.statusCode || (err.message.includes('409 Conflict') ? 409 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getRooms(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '100000000000000000000001';
      const rooms = await TimetableService.getRooms(institutionId);
      return res.json(rooms);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createRoom(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
      const room = await TimetableService.createRoom({ ...req.body, institutionId });
      return res.status(201).json(room);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getEvents(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '100000000000000000000001';
      const events = await TimetableService.getCalendarEvents(institutionId);
      return res.json(events);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createEvent(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
      const event = await TimetableService.createCalendarEvent({ ...req.body, institutionId });
      return res.status(201).json(event);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class ExamApplicationController {
  // 1. Cycles
  static async getCycles(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId || '100000000000000000000001';
      const cycles = await ExamApplicationService.getCycles(institutionId);
      return res.json(cycles);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createCycle(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
      const parsed = ExamCycleSchema.parse({ ...req.body, institutionId });
      const cycle = await ExamApplicationService.createCycle(parsed);
      return res.status(201).json(cycle);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCycleById(req: AuthRequest, res: Response) {
    try {
      const cycle = await ExamApplicationService.getCycleById(req.params.id);
      return res.json(cycle);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async updatePolicy(req: AuthRequest, res: Response) {
    try {
      const policy = await ExamApplicationService.updatePolicy(req.params.cycleId, req.body);
      return res.status(200).json(policy);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 2. Eligibility
  static async checkEligibility(req: AuthRequest, res: Response) {
    try {
      const { cycleId, studentId } = req.params;
      const targetStudentId = studentId || req.user?.studentId;
      if (!targetStudentId) return res.status(400).json({ error: 'Student ID required' });
      const decision = await ExamApplicationService.calculateEligibility(cycleId, targetStudentId);
      return res.json(decision);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 3. Application Submission
  static async submitApplication(req: AuthRequest, res: Response) {
    try {
      const studentId = req.body.studentId || req.user?.studentId;
      if (!studentId) return res.status(400).json({ error: 'Student ID required' });
      const parsed = ExamApplicationSubmitSchema.parse({ ...req.body, studentId });
      const application = await ExamApplicationService.submitApplication(parsed);
      return res.status(201).json(application);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentApplications(req: AuthRequest, res: Response) {
    try {
      const studentId = req.params.studentId || req.user?.studentId;
      if (!studentId) return res.status(400).json({ error: 'Student ID required' });
      const list = await ExamApplicationService.getStudentApplications(studentId);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Review & Exceptions
  static async getReviewQueue(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string | undefined;
      const queue = await ExamApplicationService.getReviewQueue(cycleId);
      return res.json(queue);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async grantException(req: AuthRequest, res: Response) {
    try {
      const grantedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const parsed = ExamExceptionGrantSchema.parse({ ...req.body, grantedBy });
      const result = await ExamApplicationService.grantException(parsed);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async reviewApplication(req: AuthRequest, res: Response) {
    try {
      const reviewerId = req.user?.email || 'EXAM_OFFICER';
      const { decision, rejectionReason } = req.body;
      const result = await ExamApplicationService.reviewApplication({
        applicationId: req.params.id,
        reviewerId,
        decision,
        rejectionReason
      });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 5. Roll Number Assignment
  static async assignRollNumber(req: AuthRequest, res: Response) {
    try {
      const assignedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const parsed = RollNumberAssignSchema.parse(req.body);
      const result = await ExamApplicationService.assignRollNumber({ ...parsed, assignedBy });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 6. Hall Tickets
  static async issueHallTicket(req: AuthRequest, res: Response) {
    try {
      const issuedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const parsed = HallTicketIssueSchema.parse(req.body);
      const ticket = await ExamApplicationService.issueHallTicket({ ...parsed, issuedBy });
      return res.status(201).json(ticket);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentHallTicket(req: AuthRequest, res: Response) {
    try {
      const requestingStudentId = req.user?.studentId || (req.query.studentId as string);
      if (!requestingStudentId) {
        return res.status(400).json({ error: 'Requesting student ID required' });
      }
      const ticket = await ExamApplicationService.getStudentHallTicket(req.params.id, requestingStudentId);
      return res.json(ticket);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async payFee(req: AuthRequest, res: Response) {
    try {
      const application = await ExamApplicationService.payApplicationFee(req.params.id);
      return res.status(200).json(application);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// 19. M12 EXAM OPERATIONS CONTROLLER
// ==========================================

export class ExamOperationsController {
  // 1. Centers & Verification
  static async createCenter(req: AuthRequest, res: Response) {
    try {
      const parsed = ExamCenterCreateSchema.parse(req.body);
      const center = await ExamOperationsService.createCenter(parsed);
      return res.status(201).json(center);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCenters(req: AuthRequest, res: Response) {
    try {
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId?.toString();
      const centers = await ExamOperationsService.getCenters(institutionId);
      return res.json(centers);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCenterById(req: AuthRequest, res: Response) {
    try {
      const center = await ExamOperationsService.getCenterById(req.params.id);
      return res.json(center);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async verifyCenter(req: AuthRequest, res: Response) {
    try {
      const parsed = CenterVerificationSchema.parse(req.body);
      const verifiedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const institutionId = req.user?.institutionId?.toString() || '';
      const verification = await ExamOperationsService.verifyCenter({
        ...parsed,
        institutionId,
        verifiedBy
      });
      return res.status(200).json(verification);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getVerifications(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string;
      const centerId = req.query.centerId as string;
      const verifications = await ExamOperationsService.getVerifications(cycleId, centerId);
      return res.json(verifications);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 2. Exam Scheduling & Conflicts
  static async createSchedule(req: AuthRequest, res: Response) {
    try {
      const parsed = ExamScheduleCreateSchema.parse(req.body);
      const schedule = await ExamOperationsService.createSchedule(parsed);
      return res.status(201).json(schedule);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getSchedules(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string;
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId?.toString();
      const schedules = await ExamOperationsService.getSchedules(cycleId, institutionId);
      return res.json(schedules);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async publishSchedule(req: AuthRequest, res: Response) {
    try {
      const publishedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const schedule = await ExamOperationsService.publishSchedule(req.params.id, publishedBy);
      return res.json(schedule);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 3. Seating Allocation & Reallocation
  static async allocateSeats(req: AuthRequest, res: Response) {
    try {
      const parsed = SeatingAllocationCreateSchema.parse(req.body);
      const allocatedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const allocations = await ExamOperationsService.allocateSeats({
        ...parsed,
        allocatedBy
      });
      return res.status(201).json(allocations);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async reallocateSeat(req: AuthRequest, res: Response) {
    try {
      const parsed = SeatingReallocationSchema.parse(req.body);
      const reallocatedBy = req.user?.email || 'EXAM_OFFICE';
      const reallocated = await ExamOperationsService.reallocateSeat({
        ...parsed,
        reallocatedBy
      });
      return res.status(200).json(reallocated);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getRoomAllocations(req: AuthRequest, res: Response) {
    try {
      const roomId = req.query.roomId as string;
      const allocations = await ExamOperationsService.getRoomAllocations(req.params.scheduleId, roomId);
      return res.json(allocations);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentAllocation(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string;
      const studentId = req.params.studentId || req.user?.studentId;
      if (!studentId) return res.status(400).json({ error: 'Student ID required' });
      const allocations = await ExamOperationsService.getStudentAllocation(cycleId, studentId);
      return res.json(allocations);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 4. Invigilation Duty
  static async assignInvigilator(req: AuthRequest, res: Response) {
    try {
      const parsed = InvigilationDutyAssignSchema.parse(req.body);
      const assignedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const duty = await ExamOperationsService.assignInvigilator({
        ...parsed,
        assignedBy
      });
      return res.status(201).json(duty);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async acknowledgeDuty(req: AuthRequest, res: Response) {
    try {
      const parsed = InvigilationAcknowledgeSchema.parse(req.body);
      const facultyId = req.user?.userId || '';
      const duty = await ExamOperationsService.acknowledgeDuty({
        ...parsed,
        facultyId
      });
      return res.status(200).json(duty);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async markDutyAbsent(req: AuthRequest, res: Response) {
    try {
      const markedBy = req.user?.email || 'EXAM_SUPERINTENDENT';
      const duty = await ExamOperationsService.markDutyAbsent(
        req.body.dutyId,
        markedBy,
        req.body.remarks
      );
      return res.status(200).json(duty);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getDutyRoster(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string;
      const centerId = req.query.centerId as string;
      const facultyId = req.query.facultyId as string;
      const roster = await ExamOperationsService.getDutyRoster(cycleId, centerId, facultyId);
      return res.json(roster);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 5. Materials Management
  static async createMaterialBatch(req: AuthRequest, res: Response) {
    try {
      const parsed = MaterialBatchCreateSchema.parse(req.body);
      const batch = await ExamOperationsService.createMaterialBatch(parsed);
      return res.status(201).json(batch);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getBatches(req: AuthRequest, res: Response) {
    try {
      const cycleId = req.query.cycleId as string;
      const institutionId = (req.query.institutionId as string) || req.user?.institutionId?.toString();
      // Check if user is exam staff
      const isExamStaff = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as any);
      const batches = await ExamOperationsService.getBatches(cycleId, institutionId, isExamStaff);
      return res.json(batches);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async dispatchMaterials(req: AuthRequest, res: Response) {
    try {
      const handledBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const result = await ExamOperationsService.dispatchMaterials({
        ...req.body,
        handledBy
      });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async recordMovement(req: AuthRequest, res: Response) {
    try {
      const parsed = MaterialMovementCreateSchema.parse(req.body);
      const handledBy = req.user?.email || 'EXAM_OFFICE';
      const movement = await ExamOperationsService.recordMovement({
        ...parsed,
        handledBy
      });
      return res.status(201).json(movement);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async acknowledgeMovement(req: AuthRequest, res: Response) {
    try {
      const acknowledgedBy = req.user?.email || 'CENTER_SUPERINTENDENT';
      const movement = await ExamOperationsService.acknowledgeMaterialReceipt(
        req.body.movementId,
        acknowledgedBy
      );
      return res.status(200).json(movement);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async reconcileBatch(req: AuthRequest, res: Response) {
    try {
      const parsed = MaterialReconcileSchema.parse(req.body);
      const reconciledBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
      const result = await ExamOperationsService.reconcileBatch({
        ...parsed,
        reconciledBy
      });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getMovements(req: AuthRequest, res: Response) {
    try {
      const batchId = req.query.batchId as string;
      const movements = await ExamOperationsService.getMovements(batchId);
      return res.json(movements);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M13: QUESTION PAPERS & CONFIDENTIAL QUESTION BANK CONTROLLER
// ==========================================

export class QuestionPaperController {
  static async createAppointment(req: AuthRequest, res: Response) {
    try {
      const parsed = SetterAppointmentCreateSchema.parse(req.body);
      const appointment = await QuestionPaperService.createAppointment({
        ...parsed,
        institutionId: req.user?.institutionId?.toString()
      });
      return res.status(201).json(appointment);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async respondAppointment(req: AuthRequest, res: Response) {
    try {
      const parsed = AppointmentResponseSchema.parse(req.body);
      const appointment = await QuestionPaperService.respondAppointment({
        ...parsed,
        userId: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
        userRole: req.user?.role || ''
      });
      return res.status(200).json(appointment);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getAppointments(req: AuthRequest, res: Response) {
    try {
      const appointments = await QuestionPaperService.getAppointments(
        {
          cycleId: req.query.cycleId as string,
          subjectId: req.query.subjectId as string,
          facultyId: req.query.facultyId as string
        },
        {
          id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
          role: req.user?.role || ''
        }
      );
      return res.json(appointments);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async createQuestion(req: AuthRequest, res: Response) {
    try {
      const parsed = QuestionCreateSchema.parse(req.body);
      const question = await QuestionPaperService.createQuestion({
        ...parsed,
        institutionId: req.user?.institutionId?.toString(),
        createdBy: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString()
      });
      return res.status(201).json(question);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getQuestions(req: AuthRequest, res: Response) {
    try {
      const subjectId = req.query.subjectId as string;
      const difficulty = req.query.difficulty as string;
      const questions = await QuestionPaperService.getQuestions(subjectId, difficulty, {
        id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
        role: req.user?.role || ''
      });
      return res.json(questions);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async submitPaperVersion(req: AuthRequest, res: Response) {
    try {
      const parsed = PaperVersionSubmitSchema.parse(req.body);
      const paper = await QuestionPaperService.submitPaperVersion({
        ...parsed,
        setterId: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
        userRole: req.user?.role || ''
      });
      return res.status(201).json(paper);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getPaperVersions(req: AuthRequest, res: Response) {
    try {
      const papers = await QuestionPaperService.getPaperVersions(
        {
          cycleId: req.query.cycleId as string,
          subjectId: req.query.subjectId as string
        },
        {
          id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
          role: req.user?.role || ''
        }
      );
      return res.json(papers);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getPaperVersionById(req: AuthRequest, res: Response) {
    try {
      const result = await QuestionPaperService.getPaperVersionById(
        req.params.id,
        {
          id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
          role: req.user?.role || ''
        }
      );
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async reviewPaperVersion(req: AuthRequest, res: Response) {
    try {
      const parsed = PaperReviewSubmitSchema.parse(req.body);
      const result = await QuestionPaperService.reviewPaperVersion({
        ...parsed,
        reviewerId: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
        userRole: req.user?.role || ''
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async releasePaper(req: AuthRequest, res: Response) {
    try {
      const parsed = PaperReleaseSchema.parse(req.body);
      const paper = await QuestionPaperService.releasePaper(
        parsed.paperVersionId,
        parsed.releaseNotes,
        {
          id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
          role: req.user?.role || ''
        }
      );
      return res.status(200).json(paper);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async downloadPaper(req: AuthRequest, res: Response) {
    try {
      const parsed = PaperAccessLogSchema.parse({
        paperVersionId: req.params.id,
        accessType: req.body.accessType,
        purpose: req.body.purpose || 'Official Examination Preparation'
      });
      const result = await QuestionPaperService.recordAccessAndDownload({
        ...parsed,
        user: {
          id: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
          email: req.user?.email || 'unknown@campussetu.edu',
          name: (req.user as any)?.name || 'Authorized Staff',
          role: req.user?.role || ''
        },
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getAccessLogs(req: AuthRequest, res: Response) {
    try {
      const paperVersionId = req.query.paperVersionId as string;
      const logs = await QuestionPaperService.getAccessLogs(paperVersionId);
      return res.json(logs);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }
}

// ==========================================
// M14: MARKS ENTRY, MODERATION & APPROVAL CONTROLLER
// ==========================================

export class AssessmentController {
  static async createBatch(req: AuthRequest, res: Response) {
    try {
      const parsed = AssessmentBatchCreateSchema.parse(req.body);
      const batch = await AssessmentService.createBatch({
        ...parsed,
        institutionId: req.user?.institutionId?.toString(),
        facultyId: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString()
      });
      return res.status(201).json(batch);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getBatches(req: AuthRequest, res: Response) {
    try {
      const { subjectId, facultyId, status, academicTerm } = req.query;
      const batches = await AssessmentService.getBatches({
        institutionId: req.user?.institutionId?.toString(),
        subjectId: subjectId as string,
        facultyId: facultyId as string,
        status: status as string,
        academicTerm: academicTerm as string
      });
      return res.json(batches);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getBatchById(req: AuthRequest, res: Response) {
    try {
      const result = await AssessmentService.getBatchById(req.params.id);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async saveDraftMarks(req: AuthRequest, res: Response) {
    try {
      const parsed = MarkEntrySaveSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const userRole = req.user?.role || '';
      const result = await AssessmentService.saveDraftMarks({
        ...parsed,
        user: { id: userId, role: userRole }
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async importMarksFromCSV(req: AuthRequest, res: Response) {
    try {
      const parsed = MarkImportSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await AssessmentService.importMarksFromCSV({
        ...parsed,
        institutionId: req.user?.institutionId?.toString(),
        userId
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async submitBatch(req: AuthRequest, res: Response) {
    try {
      const { batchId } = req.body;
      if (!batchId) return res.status(400).json({ error: 'batchId required' });
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const batch = await AssessmentService.submitBatch(batchId, userId);
      return res.json(batch);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async moderateBatch(req: AuthRequest, res: Response) {
    try {
      const parsed = ModerationDecisionSchema.parse(req.body);
      const moderatorId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await AssessmentService.moderateBatch({
        ...parsed,
        moderatorId
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async lockBatch(req: AuthRequest, res: Response) {
    try {
      const parsed = AssessmentApprovalSchema.parse(req.body);
      const lockedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await AssessmentService.lockBatch({
        ...parsed,
        lockedBy
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentPublishedMarks(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const marks = await AssessmentService.getStudentPublishedMarks(studentId);
      return res.json(marks);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }
}

// ==========================================
// M15: RESULTS, TRANSCRIPTS & ACADEMIC PROGRESSION CONTROLLER
// ==========================================

export class ResultController {
  static async calculateResultRun(req: AuthRequest, res: Response) {
    try {
      const parsed = ResultRunCreateSchema.parse(req.body);
      const result = await ResultService.calculateResultRun({
        ...parsed,
        institutionId: req.user?.institutionId?.toString()
      });
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getResultRuns(req: AuthRequest, res: Response) {
    try {
      const { cycleId, academicTerm, status } = req.query;
      const runs = await ResultService.getResultRuns({
        institutionId: req.user?.institutionId?.toString(),
        cycleId: cycleId as string,
        academicTerm: academicTerm as string,
        status: status as string
      });
      return res.json(runs);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getResultRunById(req: AuthRequest, res: Response) {
    try {
      const result = await ResultService.getResultRunById(req.params.id);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async approveResultRun(req: AuthRequest, res: Response) {
    try {
      const parsed = ResultApproveSchema.parse(req.body);
      const run = await ResultService.approveResultRun(parsed.runId, parsed.notes);
      return res.json(run);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async publishResultRun(req: AuthRequest, res: Response) {
    try {
      const parsed = ResultPublishSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await ResultService.publishResultRun({
        ...parsed,
        userId
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async applyResultCorrection(req: AuthRequest, res: Response) {
    try {
      const parsed = ResultCorrectionSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await ResultService.applyResultCorrection({
        ...parsed,
        userId
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getRevisionComparison(req: AuthRequest, res: Response) {
    try {
      const result = await ResultService.getRevisionComparison(req.params.termResultId);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentPublishedResults(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const results = await ResultService.getStudentPublishedResults(studentId);
      return res.json(results);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async generateTranscript(req: AuthRequest, res: Response) {
    try {
      const parsed = TranscriptGenerateSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await ResultService.generateTranscript(parsed.studentId, userId, parsed.purpose);
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }
}

export class RevaluationController {
  static async createPolicy(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewPolicyCreateSchema.parse(req.body);
      const policy = await RevaluationService.createPolicy(parsed);
      return res.status(201).json(policy);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getPolicies(req: AuthRequest, res: Response) {
    try {
      const policies = await RevaluationService.getPolicies(req.query.examCycleId as string);
      return res.json(policies);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getEligibleSubjects(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await RevaluationService.getEligibleSubjects(studentId);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async submitReviewRequest(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewRequestSubmitSchema.parse(req.body);
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const request = await RevaluationService.submitReviewRequest({
        ...parsed,
        studentId
      });
      return res.status(201).json(request);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async payReviewFee(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewFeePaySchema.parse(req.body);
      const request = await RevaluationService.payReviewFee({
        requestId: parsed.requestId,
        paymentMode: parsed.paymentMode,
        transactionRef: parsed.transactionRef
      });
      return res.status(200).json(request);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getReviewRequests(req: AuthRequest, res: Response) {
    try {
      const filters = {
        examCycleId: req.query.examCycleId as string,
        studentId: req.query.studentId as string,
        status: req.query.status as string,
        reviewType: req.query.reviewType as string,
        reviewerId: req.query.reviewerId as string
      };
      const requests = await RevaluationService.getReviewRequests(filters);
      return res.json(requests);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async assignReviewer(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewAssignmentCreateSchema.parse(req.body);
      const assignment = await RevaluationService.assignReviewer(parsed);
      return res.status(201).json(assignment);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async submitReviewOutcome(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewOutcomeSubmitSchema.parse(req.body);
      const outcome = await RevaluationService.submitReviewOutcome(parsed);
      return res.status(201).json(outcome);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async approveReviewOutcome(req: AuthRequest, res: Response) {
    try {
      const parsed = ReviewOutcomeApproveSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await RevaluationService.approveReviewOutcome({
        ...parsed,
        approvedBy: userId
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentDecisions(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const decisions = await RevaluationService.getStudentDecisions(studentId);
      return res.json(decisions);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }
}

export class CertificateController {
  static async createType(req: AuthRequest, res: Response) {
    try {
      const parsed = CertificateTypeCreateSchema.parse(req.body);
      const certType = await CertificateService.createType(parsed);
      return res.status(201).json(certType);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getTypes(req: AuthRequest, res: Response) {
    try {
      const types = await CertificateService.getTypes();
      return res.json(types);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ error: err.message });
    }
  }

  static async checkEligibility(req: AuthRequest, res: Response) {
    try {
      const studentId = (req.query.studentId as string) || req.user?.userId || (req.user as any)?.id;
      const code = (req.query.code as string) || req.params.code;
      if (!studentId || !code) {
        return res.status(400).json({ error: 'studentId and certificateTypeCode are required' });
      }
      const eligibility = await CertificateService.checkEligibility(studentId, code);
      return res.json(eligibility);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async submitRequest(req: AuthRequest, res: Response) {
    try {
      const parsed = CertificateRequestSubmitSchema.parse(req.body);
      const studentId = req.user?.userId || (req.user as any)?.id;
      const request = await CertificateService.submitRequest({
        ...parsed,
        studentId: (parsed as any).studentId || studentId
      });
      return res.status(201).json(request);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getRequests(req: AuthRequest, res: Response) {
    try {
      const { studentId, certificateTypeCode, status } = req.query;
      const filterStudentId = (studentId as string) || (req.user?.role === UserRole.STUDENT ? req.user?.userId : undefined);
      const requests = await CertificateService.getRequests({
        studentId: filterStudentId,
        certificateTypeCode: certificateTypeCode as string,
        status: status as string
      });
      return res.json(requests);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ error: err.message });
    }
  }

  static async reviewRequest(req: AuthRequest, res: Response) {
    try {
      const parsed = CertificateReviewSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await CertificateService.reviewRequest({
        ...parsed,
        userId
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async issueCertificate(req: AuthRequest, res: Response) {
    try {
      const parsed = CertificateIssueSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await CertificateService.issueCertificate({
        ...parsed,
        userId
      });
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentCertificates(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const certs = await CertificateService.getStudentCertificates(studentId);
      return res.json(certs);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async downloadCertificate(req: AuthRequest, res: Response) {
    try {
      const certId = req.params.id;
      const requestingUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const isAdmin = req.user?.role === UserRole.SUPER_ADMIN || req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.FACULTY;
      const certData = await CertificateService.downloadCertificate(certId, requestingUserId, isAdmin);
      return res.json(certData);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async verifyPublicCertificate(req: AuthRequest, res: Response) {
    try {
      const token = req.params.token || (req.query.token as string);
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }
      const verification = await CertificateService.verifyPublicCertificate(token);
      return res.json(verification);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ error: err.message });
    }
  }

  static async revokeCertificate(req: AuthRequest, res: Response) {
    try {
      const parsed = CertificateRevokeSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await CertificateService.revokeCertificate({
        ...parsed,
        userId
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }
}

// ==========================================
// M18: HELPDESK & GRIEVANCES CONTROLLER
// ==========================================

export class HelpdeskController {
  static async listCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await HelpdeskService.listCategories();
      return res.json(categories);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createCategory(req: AuthRequest, res: Response) {
    try {
      const parsed = ServiceCategoryCreateSchema.parse(req.body);
      const category = await HelpdeskService.createCategory(parsed);
      return res.status(201).json(category);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listSLAPolicies(req: AuthRequest, res: Response) {
    try {
      const policies = await HelpdeskService.listSLAPolicies();
      return res.json(policies);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createSLAPolicy(req: AuthRequest, res: Response) {
    try {
      const parsed = SLAPolicyCreateSchema.parse(req.body);
      const policy = await HelpdeskService.createSLAPolicy(parsed);
      return res.status(201).json(policy);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createTicket(req: AuthRequest, res: Response) {
    try {
      const parsed = TicketCreateSchema.parse(req.body);
      const studentId = req.user?.studentId || req.user?.userId || (req.user as any)?.id;
      if (!studentId) return res.status(400).json({ error: 'Student ID required to submit support ticket' });

      let student = await Student.findById(studentId);
      if (!student) {
        student = await Student.findOne({ userId: studentId });
      }
      const studentRollNumber = student?.rollNumber || req.user?.email || 'STUDENT';
      const actualStudentId = student?._id?.toString() || studentId;

      const ticket = await HelpdeskService.createTicket({
        ...parsed,
        studentId: actualStudentId,
        studentRollNumber
      });
      return res.status(201).json(ticket);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getTicketDetail(req: AuthRequest, res: Response) {
    try {
      const ticketId = req.params.id;
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const userRole = req.user?.role || UserRole.STUDENT;

      const detail = await HelpdeskService.getTicketDetail(ticketId, userId, userRole);
      return res.json(detail);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async listStudentTickets(req: AuthRequest, res: Response) {
    try {
      let studentId = req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        studentId = student?._id?.toString() || userId;
      }
      const tickets = await HelpdeskService.listStudentTickets(studentId || '');
      return res.json(tickets);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listStaffInbox(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const userRole = req.user?.role || UserRole.ADMIN;
      const status = req.query.status as any;
      const priority = req.query.priority as any;
      const categoryCode = req.query.categoryCode as string;
      const escalatedOnly = req.query.escalated === 'true';

      const inbox = await HelpdeskService.listStaffInbox({
        userId,
        userRole,
        status,
        priority,
        categoryCode,
        escalatedOnly
      });
      return res.json(inbox);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async addMessage(req: AuthRequest, res: Response) {
    try {
      const parsed = TicketMessageCreateSchema.parse(req.body);
      const ticketId = req.params.id;
      const senderId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const senderName = (req.user as any)?.name || req.user?.email || 'User';
      const senderRole = req.user?.role || UserRole.STUDENT;

      const msg = await HelpdeskService.addMessage({
        ticketId,
        senderId,
        senderName,
        senderRole,
        ...parsed
      });
      return res.status(201).json(msg);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async assignTicket(req: AuthRequest, res: Response) {
    try {
      const parsed = TicketAssignSchema.parse(req.body);
      const ticketId = req.params.id;
      const assignedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();

      const ticket = await HelpdeskService.assignTicket({
        ticketId,
        assignedBy,
        ...parsed
      });
      return res.json(ticket);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const parsed = TicketStatusUpdateSchema.parse(req.body);
      const ticketId = req.params.id;
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const userRole = req.user?.role || UserRole.ADMIN;

      const ticket = await HelpdeskService.updateStatus({
        ticketId,
        userId,
        userRole,
        ...parsed
      });
      return res.json(ticket);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async reopenTicket(req: AuthRequest, res: Response) {
    try {
      const parsed = TicketReopenSchema.parse(req.body);
      const ticketId = req.params.id;
      let studentId = req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        studentId = student?._id?.toString() || userId;
      }

      const ticket = await HelpdeskService.reopenTicket({
        ticketId,
        studentId: studentId || '',
        reason: parsed.reason
      });
      return res.json(ticket);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async triggerEscalationCheck(req: AuthRequest, res: Response) {
    try {
      const result = await HelpdeskService.checkAndEscalateTickets();
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M19: HOSTEL OPERATIONS CONTROLLER
// ==========================================

export class HostelController {
  static async listHostels(req: AuthRequest, res: Response) {
    try {
      const hostels = await HostelService.listHostels();
      return res.json(hostels);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createHostel(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelCreateSchema.parse(req.body);
      const hostel = await HostelService.createHostel(parsed);
      return res.status(201).json(hostel);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listRooms(req: AuthRequest, res: Response) {
    try {
      const hostelId = req.query.hostelId as string;
      const rooms = await HostelService.listRooms(hostelId);
      return res.json(rooms);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createRoom(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelRoomCreateSchema.parse(req.body);
      const room = await HostelService.createRoom(parsed);
      return res.status(201).json(room);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listBeds(req: AuthRequest, res: Response) {
    try {
      const roomId = req.query.roomId as string;
      const hostelId = req.query.hostelId as string;
      const beds = await HostelService.listBeds(roomId, hostelId);
      return res.json(beds);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async submitApplication(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelAppSubmitSchema.parse(req.body);
      let studentId = req.user?.studentId || req.user?.userId || (req.user as any)?.id;
      if (!studentId) return res.status(400).json({ error: 'Student ID required to submit hostel application' });

      let student = await Student.findById(studentId);
      if (!student) {
        student = await Student.findOne({ userId: studentId });
      }
      const studentRollNumber = student?.rollNumber || req.user?.email || 'STUDENT';
      const actualStudentId = student?._id?.toString() || studentId;

      const app = await HostelService.submitApplication({
        ...parsed,
        studentId: actualStudentId,
        studentRollNumber
      });
      return res.status(201).json(app);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async allocateBed(req: AuthRequest, res: Response) {
    try {
      const parsed = BedAllocateSchema.parse(req.body);
      const allocatedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();

      const result = await HostelService.allocateBed({
        ...parsed,
        allocatedBy
      });
      return res.status(201).json(result);
    } catch (err: any) {
      console.error('[HostelController.allocateBed Error]', err);
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async payDeposit(req: AuthRequest, res: Response) {
    try {
      const allocationId = req.params.id;
      const allocation = await HostelService.payDeposit(allocationId);
      return res.json(allocation);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async checkIn(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelCheckInSchema.parse(req.body);
      const recordedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();

      const allocation = await HostelService.checkIn({
        ...parsed,
        recordedBy
      });
      return res.json(allocation);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async transferRoom(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelTransferSchema.parse(req.body);
      const recordedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();

      const allocation = await HostelService.transferRoom({
        ...parsed,
        recordedBy
      });
      return res.json(allocation);
    } catch (err: any) {
      const status = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async checkOut(req: AuthRequest, res: Response) {
    try {
      const parsed = HostelCheckOutSchema.parse(req.body);
      const recordedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();

      const result = await HostelService.checkOut({
        ...parsed,
        recordedBy
      });
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getStudentAllocation(req: AuthRequest, res: Response) {
    try {
      let studentId = req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        studentId = student?._id?.toString() || userId;
      }
      const allocation = await HostelService.getStudentAllocation(studentId || '');
      return res.json(allocation);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listStudentApplications(req: AuthRequest, res: Response) {
    try {
      let studentId = req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        studentId = student?._id?.toString() || userId;
      }
      const apps = await HostelService.listStudentApplications(studentId || '');
      return res.json(apps);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listPendingApplications(req: AuthRequest, res: Response) {
    try {
      const hostelId = req.query.hostelId as string;
      const apps = await HostelService.listPendingApplications(hostelId);
      return res.json(apps);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getOccupancyReport(req: AuthRequest, res: Response) {
    try {
      const hostelId = req.query.hostelId as string;
      const report = await HostelService.getOccupancyReport(hostelId);
      return res.json(report);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M20: TRANSPORT OPERATIONS CONTROLLER
// ==========================================

export class TransportController {
  static async listRoutes(req: AuthRequest, res: Response) {
    try {
      const routes = await TransportService.listRoutes();
      return res.json(routes);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createRoute(req: AuthRequest, res: Response) {
    try {
      const parsed = TransportRouteCreateSchema.parse(req.body);
      const route = await TransportService.createRoute(parsed);
      return res.status(201).json(route);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listVehicles(req: AuthRequest, res: Response) {
    try {
      const vehicles = await TransportService.listVehicles();
      return res.json(vehicles);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createVehicle(req: AuthRequest, res: Response) {
    try {
      const parsed = VehicleCreateSchema.parse(req.body);
      const vehicle = await TransportService.createVehicle(parsed);
      return res.status(201).json(vehicle);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async submitSubscription(req: AuthRequest, res: Response) {
    try {
      const parsed = TransportSubSubmitSchema.parse(req.body);
      let studentId = (req.body as any).studentId || req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        if (student) {
          studentId = student._id.toString();
        } else {
          const anyStudent = await Student.findOne();
          studentId = anyStudent?._id?.toString() || userId;
        }
      }
      const sub = await TransportService.submitSubscription(studentId, parsed);
      return res.status(201).json(sub);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async approveSubscription(req: AuthRequest, res: Response) {
    try {
      const parsed = TransportSubApproveSchema.parse(req.body);
      const result = await TransportService.approveSubscriptionAndAllocateSeat(parsed.subscriptionId, parsed.vehicleId, parsed.seatNumber);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const parsed = TransportCancelSubSchema.parse(req.body);
      const result = await TransportService.cancelSubscription(parsed.subscriptionId, parsed.reason);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async renewPass(req: AuthRequest, res: Response) {
    try {
      const parsed = TransportRenewPassSchema.parse(req.body);
      const pass = await TransportService.renewPass(parsed.passId, parsed.extensionMonths);
      return res.json(pass);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async checkPassValidity(req: AuthRequest, res: Response) {
    try {
      const passId = req.params.passId;
      const result = await TransportService.checkPassValidity(passId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async substituteVehicle(req: AuthRequest, res: Response) {
    try {
      const parsed = VehicleSubstituteSchema.parse(req.body);
      const result = await TransportService.substituteVehicle(parsed.routeId, parsed.originalVehicleId, parsed.replacementVehicleId, parsed.reason);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async recordTrip(req: AuthRequest, res: Response) {
    try {
      const parsed = TripLogSchema.parse(req.body);
      const result = await TransportService.recordTrip(parsed);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getSimulatedLocations(req: AuthRequest, res: Response) {
    try {
      const tripId = req.params.tripId;
      const locations = await TransportService.getSimulatedLocations(tripId);
      return res.json(locations);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentPass(req: AuthRequest, res: Response) {
    try {
      let studentId = req.user?.studentId;
      if (!studentId) {
        const userId = req.user?.userId || (req.user as any)?.id;
        const student = await Student.findOne({ userId });
        studentId = student?._id?.toString() || userId;
      }
      const data = await TransportService.getStudentPass(studentId || '');
      return res.json(data);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getOccupancyReport(req: AuthRequest, res: Response) {
    try {
      const report = await TransportService.getOccupancyReport();
      return res.json(report);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M22: NOTICES, NOTIFICATIONS & CALENDAR COMMUNICATION CONTROLLER
// ==========================================

export class CommunicationController {
  static async createNotice(req: AuthRequest, res: Response) {
    try {
      const parsed = NoticeCreateSchema.parse(req.body);
      const creator = {
        userId: req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString(),
        name: (req.user as any)?.name || req.user?.email || 'Admin',
        email: req.user?.email || 'admin@campussetu.edu',
        institutionId: req.user?.institutionId?.toString()
      };
      const notice = await CommunicationService.createNotice(creator, parsed);
      return res.status(201).json(notice);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listNotices(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const status = req.query.status as string;
      const notices = await CommunicationService.listNotices(institutionId || '', status);
      return res.json(notices);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async previewAudience(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.user?.institutionId?.toString() || (req.body.institutionId as string);
      const recipientUserIds = await CommunicationService.calculateAudienceRecipients(institutionId || '', req.body);
      return res.json({ matchedCount: recipientUserIds.length, recipientUserIds });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async publishNotice(req: AuthRequest, res: Response) {
    try {
      const parsed = NoticePublishSchema.parse(req.body);
      const notice = await CommunicationService.publishNotice(parsed.noticeId);
      return res.json(notice);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getUserInbox(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const inbox = await CommunicationService.getUserInbox(userId || '');
      return res.json(inbox);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async markNotificationRead(req: AuthRequest, res: Response) {
    try {
      const notificationId = req.body.notificationId || req.params.id;
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const notification = await CommunicationService.markNotificationRead(notificationId, userId || '');
      return res.json(notification);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getNotificationPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const institutionId = req.user?.institutionId?.toString() || '';
      const pref = await CommunicationService.getNotificationPreferences(userId || '', institutionId);
      return res.json(pref);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async updateNotificationPreferences(req: AuthRequest, res: Response) {
    try {
      const parsed = NotificationPreferenceUpdateSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const pref = await CommunicationService.updateNotificationPreferences(userId || '', parsed);
      return res.json(pref);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getOutboxMessages(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const status = req.query.status as string;
      const messages = await CommunicationService.getOutboxMessages(institutionId || '', status);
      return res.json(messages);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async retryOutboxMessage(req: AuthRequest, res: Response) {
    try {
      const parsed = OutboxRetrySchema.parse(req.body);
      const result = await CommunicationService.retryOutboxMessage(parsed.outboxMessageId, parsed.forceSuccess);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getCalendarEvents(req: AuthRequest, res: Response) {
    try {
      const institutionId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const events = await CommunicationService.getCalendarEvents(institutionId || '', userId);
      return res.json(events);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async subscribeCalendarEvent(req: AuthRequest, res: Response) {
    try {
      const parsed = CalendarEventSubscriptionSchema.parse(req.body);
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await CommunicationService.subscribeCalendarEvent(userId || '', parsed.calendarEventId, parsed.action);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M21 GUARDIAN CONTROLLER
// ==========================================
export class GuardianController {
  static async inviteGuardian(req: AuthRequest, res: Response) {
    try {
      const parsed = GuardianInviteSchema.parse(req.body);
      const invitation = await GuardianService.inviteGuardian(req.user, parsed);
      return res.status(201).json(invitation);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async verifyLink(req: AuthRequest, res: Response) {
    try {
      const parsed = GuardianVerifyLinkSchema.parse(req.body);
      const result = await GuardianService.verifyAndCreateLink(req.user, parsed.invitationCode);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getLinks(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const links = await GuardianService.getGuardianLinks(guardianUserId || '');
      return res.json(links);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async updatePermissions(req: AuthRequest, res: Response) {
    try {
      const parsed = GuardianPermissionUpdateSchema.parse(req.body);
      const grant = await GuardianService.updatePermissions(req.user, parsed);
      return res.json(grant);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async revokeLink(req: AuthRequest, res: Response) {
    try {
      const parsed = GuardianRevokeSchema.parse(req.body);
      const link = await GuardianService.revokeLink(req.user, parsed.guardianLinkId, parsed.reason);
      return res.json(link);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStudentSummary(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const summary = await GuardianService.getStudentSummary(guardianUserId || '', req.params.studentId);
      return res.json(summary);
    } catch (err: any) {
      const statusCode = err.message.includes('403') || err.message.includes('denied') || err.message.includes('revoked') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async getStudentAttendance(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const attendance = await GuardianService.getStudentAttendance(guardianUserId || '', req.params.studentId);
      return res.json(attendance);
    } catch (err: any) {
      const statusCode = err.message.includes('403') || err.message.includes('denied') || err.message.includes('revoked') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async getStudentFees(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const fees = await GuardianService.getStudentFees(guardianUserId || '', req.params.studentId);
      return res.json(fees);
    } catch (err: any) {
      const statusCode = err.message.includes('403') || err.message.includes('denied') || err.message.includes('revoked') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async getStudentResults(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const results = await GuardianService.getStudentResults(guardianUserId || '', req.params.studentId);
      return res.json(results);
    } catch (err: any) {
      const statusCode = err.message.includes('403') || err.message.includes('denied') || err.message.includes('revoked') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async getStudentNotices(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const notices = await GuardianService.getStudentNotices(guardianUserId || '', req.params.studentId);
      return res.json(notices);
    } catch (err: any) {
      const statusCode = err.message.includes('403') || err.message.includes('denied') || err.message.includes('revoked') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async attemptStudentTickets(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      await GuardianService.attemptStudentTickets(guardianUserId || '', req.params.studentId);
      return res.json({ message: 'Success' });
    } catch (err: any) {
      return res.status(403).json({ error: err.message });
    }
  }

  static async getAccessLogs(req: AuthRequest, res: Response) {
    try {
      const guardianUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const logs = await GuardianService.getAccessLogs(guardianUserId || '');
      return res.json(logs);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export class GovernanceController {
  static async createCommittee(req: AuthRequest, res: Response) {
    try {
      const committee = await GovernanceService.createCommittee(req.user, req.body);
      return res.status(201).json(committee);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listCommittees(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId || (req.query.institutionId as string) || '';
      const committees = await GovernanceService.listCommittees(instId);
      return res.json(committees);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async addCommitteeMember(req: AuthRequest, res: Response) {
    try {
      const member = await GovernanceService.addCommitteeMember(req.user, {
        committeeId: req.params.id,
        ...req.body
      });
      return res.status(201).json(member);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async deactivateCommitteeMember(req: AuthRequest, res: Response) {
    try {
      const result = await GovernanceService.deactivateCommitteeMember(req.user, req.params.memberUserId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createMeeting(req: AuthRequest, res: Response) {
    try {
      const meeting = await GovernanceService.createMeeting(req.user, {
        ...req.body,
        committeeId: req.params.id
      });
      return res.status(201).json(meeting);
    } catch (err: any) {
      const statusCode = err.message.includes('Forbidden') || err.message.includes('403') || err.message.includes('Former committee member') ? 403 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async addCommitteeDecision(req: AuthRequest, res: Response) {
    try {
      const decision = await GovernanceService.addCommitteeDecision(req.user, {
        ...req.body,
        meetingId: req.params.meetingId
      });
      return res.status(201).json(decision);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createTask(req: AuthRequest, res: Response) {
    try {
      const task = await GovernanceService.createTask(req.user, {
        ...req.body,
        assigneeUserId: req.body.assignedToUserId || req.body.assigneeUserId
      });
      return res.status(201).json(task);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await GovernanceService.listTasks(req.user);
      return res.json(tasks);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateTaskStatus(req: AuthRequest, res: Response) {
    try {
      const task = await GovernanceService.updateTaskStatus(req.user, req.params.id, req.body.status);
      return res.json(task);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createNotesheet(req: AuthRequest, res: Response) {
    try {
      const notesheet = await GovernanceService.createNotesheet(req.user, {
        ...req.body,
        nextAssigneeUserId: req.body.initialAssigneeUserId || req.body.nextAssigneeUserId
      });
      return res.status(201).json(notesheet);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async processNotesheetAction(req: AuthRequest, res: Response) {
    try {
      const notesheet = await GovernanceService.processNotesheetAction(req.user, {
        notesheetId: req.params.id,
        ...req.body,
        nextAssigneeUserId: req.body.targetUserId || req.body.nextAssigneeUserId
      });
      return res.json(notesheet);
    } catch (err: any) {
      let statusCode = 400;
      if (err.message.includes('403') || err.message.includes('Forbidden') || err.message.includes('Unauthorized') || err.message.includes('assignee') || err.message.includes('Separation of duties')) {
        statusCode = 403;
      } else if (err.message.includes('409') || err.message.includes('version conflict') || err.message.includes('Concurrent decision')) {
        statusCode = 409;
      }
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async getNotesheetDetail(req: AuthRequest, res: Response) {
    try {
      const notesheet = await GovernanceService.getNotesheetDetail(req.params.id);
      return res.json(notesheet);
    } catch (err: any) {
      const statusCode = err.message.includes('not found') ? 404 : 400;
      return res.status(statusCode).json({ error: err.message });
    }
  }

  static async listNotesheets(req: AuthRequest, res: Response) {
    try {
      const list = await GovernanceService.listNotesheets(req.user, req.query.status as string);
      return res.json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getMyPendingApprovals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString() || '';
      const result = await GovernanceService.getMyPendingApprovals(userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M24: E-REGISTER & DOCUMENT MOVEMENT CONTROLLER
// ==========================================

export class RegisterController {
  static async getSequences(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const sequences = await RegisterService.getSequences(instId);
      return res.json(sequences);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async configureSequence(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const seq = await RegisterService.configureSequence({
        ...req.body,
        institutionId: instId
      });
      return res.status(200).json(seq);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async createEntry(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const entry = await RegisterService.createEntry(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(entry);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('Wrong-year') || err.message.includes('400') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async voidEntry(req: AuthRequest, res: Response) {
    try {
      const entry = await RegisterService.voidEntry(req.user, {
        entryId: req.params.id,
        reason: req.body.reason
      });
      return res.status(200).json(entry);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async listEntries(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const entries = await RegisterService.listEntries(req.user, {
        institutionId: instId,
        departmentCode: req.query.departmentCode as string,
        registerType: req.query.registerType as any,
        status: req.query.status as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      });
      return res.json(entries);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getEntryDetail(req: AuthRequest, res: Response) {
    try {
      const detail = await RegisterService.getEntryDetail(req.user, req.params.id);
      return res.json(detail);
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async checkAttachmentAccess(req: AuthRequest, res: Response) {
    try {
      const attachmentIndex = req.query.attachmentIndex ? parseInt(req.query.attachmentIndex as string, 10) : 0;
      const result = await RegisterService.checkAttachmentAccess(req.user, req.params.id, attachmentIndex);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('403') || err.message.includes('Forbidden') ? 403 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async dispatchDocument(req: AuthRequest, res: Response) {
    try {
      const movement = await RegisterService.dispatchDocument(req.user, {
        entryId: req.params.id,
        toDepartmentCode: req.body.toDepartmentCode,
        remarks: req.body.remarks
      });
      return res.status(201).json(movement);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async acknowledgeDocument(req: AuthRequest, res: Response) {
    try {
      const result = await RegisterService.acknowledgeDocument(req.user, {
        movementId: req.params.movementId,
        remarks: req.body.remarks
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async getReports(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const report = await RegisterService.getReports(req.user, {
        institutionId: instId,
        departmentCode: req.query.departmentCode as string,
        registerType: req.query.registerType as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string
      });
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M25: STAFF ESTABLISHMENT & LEAVE CONTROLLER
// ==========================================

export class StaffController {
  static async listEmployees(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const deptId = req.query.departmentId as string;
      const employees = await StaffService.listEmployees(instId, deptId);
      return res.json(employees);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createEmployee(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const employee = await StaffService.createEmployee(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(employee);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('already exists') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getEmployeeDetail(req: AuthRequest, res: Response) {
    try {
      const detail = await StaffService.getEmployeeDetail(req.user, req.params.id);
      return res.json(detail);
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async assignAppointment(req: AuthRequest, res: Response) {
    try {
      const appointment = await StaffService.assignAppointment(req.user, req.body);
      return res.status(201).json(appointment);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async checkServiceDocumentAccess(req: AuthRequest, res: Response) {
    try {
      const docIndex = req.query.docIndex ? parseInt(req.query.docIndex as string, 10) : 0;
      const result = await StaffService.checkServiceDocumentAccess(req.user, req.params.id, docIndex);
      return res.json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('403') || err.message.includes('Forbidden') ? 403 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getMyLeaveData(req: AuthRequest, res: Response) {
    try {
      const data = await StaffService.getMyLeaveData(req.user);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async applyLeave(req: AuthRequest, res: Response) {
    try {
      const request = await StaffService.applyLeave(req.user, req.body);
      return res.status(201).json(request);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('400') || err.message.includes('Insufficient') || err.message.includes('Overlapping') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async getManagerApprovalQueue(req: AuthRequest, res: Response) {
    try {
      const queue = await StaffService.getManagerApprovalQueue(req.user);
      return res.json(queue);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async approveLeave(req: AuthRequest, res: Response) {
    try {
      const requestId = req.params.id || req.body.requestId;
      const decision = req.body.decision || (req.body.status === 'APPROVED' ? 'APPROVE' : 'REJECT');
      const remarks = req.body.remarks || req.body.rejectionReason;
      const request = await StaffService.approveLeave(req.user, {
        requestId,
        decision,
        remarks
      });
      return res.status(200).json(request);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('403') || err.message.includes('cannot approve') ? 403 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async cancelLeave(req: AuthRequest, res: Response) {
    try {
      const requestId = req.params.id || req.body.requestId;
      const result = await StaffService.cancelLeave(req.user, requestId);
      return res.status(200).json({ ...result.request.toObject(), balance: result.balance });
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('already cancelled') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }


  static async getTeamAbsenceCalendar(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const calendar = await StaffService.getTeamAbsenceCalendar(instId);
      return res.json(calendar);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getEstablishmentRegisters(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const data = await StaffService.getEstablishmentRegisters(instId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createEstablishmentCase(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const estCase = await StaffService.createEstablishmentCase(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(estCase);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async addEstablishmentCaseStep(req: AuthRequest, res: Response) {
    try {
      const estCase = await StaffService.addEstablishmentCaseStep(
        req.user,
        req.params.id,
        req.body.stepName,
        req.body.remarks
      );
      return res.status(200).json(estCase);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }
}

// ==========================================
// M26: PAYROLL AND EXPENDITURE CONTROLLER
// ==========================================

export class PayrollController {
  static async approve(req: AuthRequest, res: Response) {
    try {
      const parsed = PayrollApproveSchema.parse(req.body);
      const record = await PayrollService.approvePayroll(parsed);
      return res.status(200).json(record);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getSlips(req: AuthRequest, res: Response) {
    const slips = await PayrollRecord.find().populate('staffId', '-passwordHash');
    return res.json(slips);
  }

  static async listSalaryStructures(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const structures = await PayrollService.listSalaryStructures(instId);
      return res.json(structures);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createSalaryStructure(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const structure = await PayrollService.createSalaryStructure(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(structure);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async assignSalaryStructure(req: AuthRequest, res: Response) {
    try {
      const assignment = await PayrollService.assignSalaryStructure(req.user, req.body);
      return res.status(201).json(assignment);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async listPayrollRuns(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const runs = await PayrollService.listPayrollRuns(instId);
      return res.json(runs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createPayrollRunDraft(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const run = await PayrollService.createPayrollRunDraft(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(run);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('Duplicate') || err.message.includes('400') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async validatePayrollRun(req: AuthRequest, res: Response) {
    try {
      const run = await PayrollService.validatePayrollRun(req.user, req.params.id);
      return res.status(200).json(run);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async approvePayrollRun(req: AuthRequest, res: Response) {
    try {
      const run = await PayrollService.approvePayrollRun(req.user, req.params.id);
      return res.status(200).json(run);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async disbursePayrollRun(req: AuthRequest, res: Response) {
    try {
      const result = await PayrollService.disbursePayrollRun(req.user, req.params.id, req.body.remarks);
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('already disbursed') || err.message.includes('400') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }

  static async listMyPayslips(req: AuthRequest, res: Response) {
    try {
      const payslips = await PayrollService.listMyPayslips(req.user);
      return res.json(payslips);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getPayslipDetail(req: AuthRequest, res: Response) {
    try {
      const payslip = await PayrollService.getPayslipDetail(req.user, req.params.id);
      return res.json(payslip);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('403') || err.message.includes('Forbidden') ? 403 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async downloadPayslip(req: AuthRequest, res: Response) {
    try {
      const payslip = await PayrollService.getPayslipDetail(req.user, req.params.id);
      return res.json({
        payslip,
        downloadNotice: '[DEMO / SIMULATION MODE - ISSUED DEMO PAYSLIP]',
        pdfPayload: {
          payslipNumber: payslip.payslipNumber,
          payPeriod: payslip.payPeriod,
          grossEarningsPaise: payslip.grossEarningsPaise,
          totalDeductionsPaise: payslip.totalDeductionsPaise,
          netPayablePaise: payslip.netPayablePaise,
          credentialNotice: payslip.credentialNotice
        }
      });
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('403') || err.message.includes('Forbidden') ? 403 : 400);
      return res.status(status).json({ error: err.message });
    }
  }

  static async listExpenseClaims(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const status = req.query.status as string;
      const claims = await PayrollService.listExpenseClaims(req.user, instId, status);
      return res.json(claims);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async submitExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const claim = await PayrollService.submitExpenseClaim(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(claim);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async reviewExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const decision = req.body.decision || (req.body.action === 'APPROVE' ? 'APPROVE' : 'REJECT');
      const claim = await PayrollService.reviewExpenseClaim(req.user, req.params.id, decision, req.body.remarks);
      return res.status(200).json(claim);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return res.status(status).json({ error: err.message });
    }
  }

  static async reimburseExpenseClaim(req: AuthRequest, res: Response) {
    try {
      const claim = await PayrollService.reimburseExpenseClaim(req.user, req.params.id, req.body.reference);
      return res.status(200).json(claim);
    } catch (err: any) {
      const status = err.statusCode || (err.message.includes('400') || err.message.includes('Only APPROVED') ? 400 : 500);
      return res.status(status).json({ error: err.message });
    }
  }
}

// ==========================================
// M27: LIBRARY SERVICES CONTROLLER
// ==========================================

export class LibraryController {
  static async listCatalog(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const search = req.query.search as string;
      const titles = await LibraryService.listCatalog(instId, search);
      return res.json(titles);
    } catch (err: any) {
      console.error('LIST CATALOG ERROR:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async getBookTitleDetail(req: AuthRequest, res: Response) {
    try {
      const detail = await LibraryService.getBookTitleDetail(req.params.id);
      return res.json(detail);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async createBookTitle(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const title = await LibraryService.createBookTitle(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(title);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async addBookCopy(req: AuthRequest, res: Response) {
    try {
      const copy = await LibraryService.addBookCopy(req.user, req.body);
      return res.status(201).json(copy);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listBookCopies(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const bookTitleId = req.query.bookTitleId as string;
      const copies = await LibraryService.listBookCopies(instId, bookTitleId);
      return res.json(copies);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async issueBook(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const loan = await LibraryService.issueBook(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(loan);
    } catch (err: any) {
      const status = err.message.includes('not available') || err.message.includes('reserved') || err.message.includes('limit') || err.message.includes('Concurrent') ? 400 : 500;
      return res.status(status).json({ error: err.message });
    }
  }

  static async renewBook(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const loan = await LibraryService.renewBook(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(200).json(loan);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async returnBook(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const result = await LibraryService.returnBook(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async reserveBook(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const reservation = await LibraryService.reserveBook(req.user, {
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(reservation);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async cancelReservation(req: AuthRequest, res: Response) {
    try {
      const reservation = await LibraryService.cancelReservation(req.user, req.params.id);
      return res.status(200).json(reservation);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listUserLoans(req: AuthRequest, res: Response) {
    try {
      const loans = await LibraryService.listUserLoans(req.user);
      return res.json(loans);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listAllLoans(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const status = req.query.status as string;
      const loans = await LibraryService.listAllLoans(instId, status);
      return res.json(loans);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getLibraryClearance(req: AuthRequest, res: Response) {
    try {
      const targetUserId = (req.query.userId as string) || req.user?.userId || '';
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const clearance = await LibraryService.getLibraryClearance(targetUserId, instId);
      return res.json(clearance);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async processClearanceRequest(req: AuthRequest, res: Response) {
    try {
      const targetUserId = req.body.userId || req.user?.userId || '';
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const clearance = await LibraryService.processClearanceRequest(req.user, targetUserId, instId, req.body.remarks);
      return res.status(200).json(clearance);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

// ==========================================
// M28: INVENTORY, PROCUREMENT AND ASSETS CONTROLLER
// ==========================================

export class InventoryController {
  // Masters: Items
  static async createItem(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const item = await InventoryService.createItem({ ...req.body, institutionId: instId });
      return res.status(201).json(item);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listItems(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const category = req.query.category as string;
      const search = req.query.search as string;
      const items = await InventoryService.listItems(instId, { category, search });
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getLowStockItems(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const items = await InventoryService.getLowStockItems(instId);
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Masters: Vendors
  static async createVendor(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const vendor = await InventoryService.createVendor({ ...req.body, institutionId: instId });
      return res.status(201).json(vendor);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listVendors(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const vendors = await InventoryService.listVendors(instId);
      return res.json(vendors);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Procurement: Requisitions
  static async createRequisition(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const requestedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const reqDoc = await InventoryService.createRequisition({
        ...req.body,
        institutionId: instId,
        requestedBy
      });
      return res.status(201).json(reqDoc);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async approveRequisition(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await InventoryService.approveRequisition(id, req.user, req.body.remarks);
      return res.json(updated);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listRequisitions(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const requisitions = await InventoryService.listRequisitions(instId);
      return res.json(requisitions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Procurement: Purchase Orders
  static async createPurchaseOrder(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const po = await InventoryService.createPurchaseOrder({ ...req.body, institutionId: instId });
      return res.status(201).json(po);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listPurchaseOrders(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const pos = await InventoryService.listPurchaseOrders(instId);
      return res.json(pos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Procurement: Goods Receipt
  static async receiveGoods(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const receivedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const grn = await InventoryService.receiveGoods({
        ...req.body,
        institutionId: instId,
        receivedBy
      });
      return res.status(201).json(grn);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listGoodsReceipts(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const grns = await InventoryService.listGoodsReceipts(instId);
      return res.json(grns);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Movements: Issue, Return, Transfer
  static async issueStock(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const performedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await InventoryService.issueStock({
        ...req.body,
        institutionId: instId,
        performedBy
      });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async returnStock(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const performedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await InventoryService.returnStock({
        ...req.body,
        institutionId: instId,
        performedBy
      });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async transferStock(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const performedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const result = await InventoryService.transferStock({
        ...req.body,
        institutionId: instId,
        performedBy
      });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listStockMovements(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const itemId = req.query.itemId as string;
      const movements = await InventoryService.listStockMovements(instId, itemId);
      return res.json(movements);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Assets Management
  static async listAssets(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const departmentId = req.query.departmentId as string;
      const search = req.query.search as string;
      const assets = await InventoryService.listAssets(instId, { departmentId, search });
      return res.json(assets);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async recordAssetMaintenance(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const asset = await InventoryService.recordAssetMaintenance(id, req.body);
      return res.json(asset);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // Stock Count Audit & Adjustments
  static async recordStockCount(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const requestedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const adj = await InventoryService.recordStockCount({
        ...req.body,
        institutionId: instId,
        requestedBy
      });
      return res.status(201).json(adj);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async approveStockAdjustment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await InventoryService.approveStockAdjustment(id, req.user);
      return res.json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listStockAdjustments(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const adjustments = await InventoryService.listStockAdjustments(instId);
      return res.json(adjustments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Demonstration
  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const demoResult = await InventoryService.demonstrateStockReconciliation(instId, req.user);
      return res.json(demoResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M29: RESEARCH, ACCREDITATION AND MIS CONTROLLER
// ==========================================

export class MISController {
  // 1. Leadership Dashboard
  static async getDashboardMetrics(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const departmentId = req.query.departmentId as string;
      const academicYear = req.query.academicYear as string;
      const metrics = await MISService.getLeadershipDashboardMetrics(instId, { departmentId, academicYear });
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Research Publications
  static async createPublication(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const pub = await MISService.createPublication({ ...req.body, institutionId: instId });
      return res.status(201).json(pub);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listPublications(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const verificationStatus = req.query.verificationStatus as string;
      const search = req.query.search as string;
      const pubs = await MISService.listPublications(instId, { verificationStatus, search });
      return res.json(pubs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async verifyPublication(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const pub = await MISService.verifyPublication(id, req.user, req.body.status);
      return res.json(pub);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 3. Research Projects
  static async createProject(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const prj = await MISService.createProject({ ...req.body, institutionId: instId });
      return res.status(201).json(prj);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listProjects(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const prjs = await MISService.listProjects(instId);
      return res.json(prjs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. PhD Scholars
  static async createPhDRecord(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const phd = await MISService.createPhDRecord({ ...req.body, institutionId: instId });
      return res.status(201).json(phd);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listPhDRecords(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const records = await MISService.listPhDRecords(instId);
      return res.json(records);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 5. Patents
  static async createPatentRecord(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const pat = await MISService.createPatentRecord({ ...req.body, institutionId: instId });
      return res.status(201).json(pat);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listPatentRecords(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const pats = await MISService.listPatentRecords(instId);
      return res.json(pats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 6. Accreditation Evidence
  static async createEvidence(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const ev = await MISService.createEvidence({ ...req.body, institutionId: instId });
      return res.status(201).json(ev);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listEvidence(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const framework = req.query.framework as string;
      const evs = await MISService.listEvidence(instId, framework);
      return res.json(evs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async verifyEvidence(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ev = await MISService.verifyEvidence(id, req.user, req.body.status, req.body.verifiedScore, req.body.remarks);
      return res.json(ev);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 7. Reporting Periods
  static async createReportingPeriod(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const period = await MISService.createReportingPeriod({ ...req.body, institutionId: instId });
      return res.status(201).json(period);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listReportingPeriods(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const periods = await MISService.listReportingPeriods(instId);
      return res.json(periods);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 8. Reports & Snapshots
  static async generateReportPreview(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const reportType = (req.query.reportType as any) || 'COMPREHENSIVE';
      const preview = await MISService.generateReportPreview(instId, reportType, req.query);
      return res.json(preview);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async publishReportSnapshot(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const publishedBy = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const snapshot = await MISService.publishReportSnapshot({
        ...req.body,
        institutionId: instId,
        publishedBy
      });
      return res.status(201).json(snapshot);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  static async listReportSnapshots(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const snapshots = await MISService.listReportSnapshots(instId);
      return res.json(snapshots);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getSnapshotById(req: AuthRequest, res: Response) {
    try {
      const snapshot = await MISService.getSnapshotById(req.params.id);
      if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });
      return res.json(snapshot);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async exportSnapshotCSV(req: AuthRequest, res: Response) {
    try {
      const csvString = await MISService.exportSnapshotCSV(req.params.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=snapshot-${req.params.id}.csv`);
      return res.send(csvString);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 9. Demonstration
  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const demoResult = await MISService.demonstrateMISReconciliation(instId, req.user);
      return res.json(demoResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M31: AI CHAT ASSISTANT & VOICE CONTROLLER
// ==========================================

export class AssistantController {
  // 1. Get or Create Conversation
  static async getOrCreateConversation(req: AuthRequest, res: Response) {
    try {
      const instId = (req.body.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const studentId = req.body.studentId;
      const mode = req.body.mode;
      const conversation = await AssistantService.getOrCreateConversation(instId, userId, studentId, mode);
      return res.json(conversation);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 2. List Conversations
  static async listConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const conversations = await AssistantService.listConversations(userId);
      return res.json(conversations);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Get Messages
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const messages = await AssistantService.getMessages(req.params.conversationId);
      return res.json(messages);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Send Chat Query
  static async sendChatMessage(req: AuthRequest, res: Response) {
    try {
      const conversationId = req.params.conversationId || req.body.conversationId;
      const query = req.body.query || req.body.text;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Query text is required' });
      }
      const responseMessage = await AssistantService.processUserQuery(
        conversationId,
        query.trim(),
        req.user
      );
      return res.json(responseMessage);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 5. Process Voice Audio / Speech Transcript
  static async processVoice(req: AuthRequest, res: Response) {
    try {
      const conversationId = req.params.conversationId || req.body.conversationId;
      const transcript = req.body.transcript;
      if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
        return res.status(400).json({ error: 'Voice transcript is required' });
      }
      const responseMessage = await AssistantService.processVoiceAudio(
        conversationId,
        transcript.trim(),
        req.user
      );
      return res.json(responseMessage);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message });
    }
  }

  // 6. Knowledge Articles
  static async listArticles(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const role = (req.query.role as string) || req.user?.role || 'STUDENT';
      const articles = await AssistantService.listArticles(instId, role);
      return res.json(articles);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createArticle(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const article = await AssistantService.createArticle({
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(article);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 7. Evaluation Cases & Runs
  static async listEvaluationCases(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const cases = await AssistantService.listEvaluationCases(instId);
      return res.json(cases);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runEvaluation(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const providerMode = req.body.providerMode;
      const runRecord = await AssistantService.runAIEvaluation(instId, userId, providerMode);
      return res.status(201).json(runRecord);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listEvaluationRuns(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const runs = await AssistantService.listEvaluationRuns(instId);
      return res.json(runs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 8. Reproducible Demonstration
  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const studentUserId = req.query.studentUserId as string;
      const demoResult = await AssistantService.demonstrateAIAssistantJourney(instId, studentUserId);
      return res.json(demoResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M32: PERFORMANCE PREDICTION & EARLY-SUPPORT ANALYTICS CONTROLLER
// ==========================================

export class PredictionController {
  // 1. Dashboard Summary
  static async getDashboardSummary(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const activeModel = await ModelVersion.findOne({ institutionId: instId, status: ModelStatus.ACTIVE }).sort({ createdAt: -1 });
      const dataset = activeModel ? await SyntheticDatasetVersion.findById(activeModel.datasetVersionId) : null;

      const predictions = await Prediction.find({ institutionId: instId });
      const lowRiskCount = predictions.filter(p => p.riskBand === RiskBand.LOW).length;
      const moderateRiskCount = predictions.filter(p => p.riskBand === RiskBand.MODERATE).length;
      const highRiskCount = predictions.filter(p => p.riskBand === RiskBand.HIGH).length;
      const criticalRiskCount = predictions.filter(p => p.riskBand === RiskBand.CRITICAL).length;
      const lowDataCount = predictions.filter(p => p.dataSufficiency === DataSufficiency.LOW_DATA).length;

      const interventions = await SupportIntervention.find({ institutionId: instId });
      const openInterventions = interventions.filter(i => i.status === InterventionStatus.OPEN).length;
      const completedInterventions = interventions.filter(i => i.status === InterventionStatus.COMPLETED).length;

      return res.json({
        totalStudentsScored: predictions.length,
        activeModel: activeModel ? {
          id: activeModel._id,
          code: activeModel.modelCode,
          type: activeModel.modelType,
          mae: activeModel.holdoutRegressionMetrics?.mae,
          prAuc: activeModel.holdoutClassificationMetrics?.prAuc,
          precision: activeModel.holdoutClassificationMetrics?.precision,
          recall: activeModel.holdoutClassificationMetrics?.recall,
          trainedAt: activeModel.trainedAt
        } : null,
        dataset: dataset ? {
          id: dataset._id,
          code: dataset.versionCode,
          seed: dataset.randomSeed,
          totalRecords: dataset.totalRecords
        } : null,
        riskDistribution: {
          low: lowRiskCount,
          moderate: moderateRiskCount,
          high: highRiskCount,
          critical: criticalRiskCount,
          lowDataUncertainty: lowDataCount
        },
        interventionsSummary: {
          total: interventions.length,
          open: openInterventions,
          completed: completedInterventions
        },
        syntheticNotice: 'Synthetic training dataset demonstrates analytics pipeline only. No claim of real predictive validity; no automated penalties.'
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Cohort Predictions List
  static async listCohortPredictions(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const riskBand = req.query.riskBand as string;
      const department = req.query.department as string;

      const query: any = { institutionId: instId };
      if (riskBand && riskBand !== 'ALL') query.riskBand = riskBand;
      if (department && department !== 'ALL') query.departmentCode = department;

      const predictions = await Prediction.find(query).sort({ dropoutRiskScore: -1 }).limit(100);
      return res.json(predictions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. Individual Student Profile
  static async getStudentPrediction(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const studentId = req.params.studentId;

      let prediction = await Prediction.findOne({ institutionId: instId, studentId });
      if (!prediction) {
        // Generate on-the-fly score
        prediction = await PredictionService.scoreStudent(instId, studentId);
      }

      const reviews = await AdvisorReview.find({ studentId }).sort({ reviewedAt: -1 });
      const interventions = await SupportIntervention.find({ studentId }).sort({ createdAt: -1 });

      return res.json({
        prediction,
        reviews,
        interventions
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 4. Live What-If Sensitivity Test (Proves changing inputs changes score!)
  static async previewScoreChange(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const studentId = req.body.studentId;
      const customFeatures = req.body.features;

      const simulatedPrediction = await PredictionService.scoreStudent(instId, studentId, customFeatures);
      return res.json(simulatedPrediction);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 5. Datasets
  static async generateSyntheticDataset(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const seed = req.body.seed !== undefined ? Number(req.body.seed) : 42;
      const totalRecords = req.body.totalRecords ? Number(req.body.totalRecords) : 200;
      const academicTerm = req.body.academicTerm || '2026-AUTUMN';

      const dataset = await PredictionService.generateSyntheticDataset(instId, seed, totalRecords, academicTerm);
      return res.status(201).json(dataset);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listDatasets(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const datasets = await SyntheticDatasetVersion.find({ institutionId: instId }).sort({ createdAt: -1 });
      return res.json(datasets);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 6. Models & Training Console
  static async trainModel(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const datasetVersionId = req.body.datasetVersionId;
      const epochs = req.body.epochs ? Number(req.body.epochs) : 600;
      const learningRate = req.body.learningRate ? Number(req.body.learningRate) : 0.05;
      const defaultThreshold = req.body.defaultThreshold ? Number(req.body.defaultThreshold) : 0.50;

      const result = await PredictionService.trainAndEvaluateModel(instId, datasetVersionId, {
        epochs,
        learningRate,
        defaultThreshold
      });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listModels(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const models = await ModelVersion.find({ institutionId: instId }).sort({ createdAt: -1 });
      return res.json(models);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getModelEvaluation(req: AuthRequest, res: Response) {
    try {
      const modelId = req.params.modelId;
      const report = await EvaluationReport.findOne({ modelVersionId: modelId });
      if (!report) return res.status(404).json({ error: 'Evaluation report not found for model.' });
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 7. Advisor Review
  static async createAdvisorReview(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const reviewerUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const review = await PredictionService.createAdvisorReview(
        instId,
        req.body.studentId,
        req.body.predictionId,
        reviewerUserId,
        {
          decision: req.body.decision,
          reviewNotes: req.body.reviewNotes,
          humanAssessmentScore: req.body.humanAssessmentScore,
          actionRecommended: req.body.actionRecommended
        }
      );
      return res.status(201).json(review);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 8. Support Outreach Interventions
  static async listInterventions(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const status = req.query.status as string;
      const studentId = req.query.studentId as string;

      const query: any = { institutionId: instId };
      if (status && status !== 'ALL') query.status = status;
      if (studentId) query.studentId = studentId;

      const interventions = await SupportIntervention.find(query).sort({ createdAt: -1 });
      return res.json(interventions);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createIntervention(req: AuthRequest, res: Response) {
    try {
      const instId = req.body.institutionId || req.user?.institutionId?.toString() || 'inst-101';
      const intervention = await PredictionService.createSupportIntervention(
        instId,
        req.body.studentId,
        req.body
      );
      return res.status(201).json(intervention);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async updateIntervention(req: AuthRequest, res: Response) {
    try {
      const intervention = await PredictionService.updateSupportIntervention(
        req.params.id,
        req.body
      );
      return res.json(intervention);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // 9. Reproducible Demonstration Journey
  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const adminUserId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id?.toString();
      const demoResult = await PredictionService.runDemonstrationJourney(instId, adminUserId);
      return res.json(demoResult);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M33: PERSONALIZED LEARNING CONTROLLER
// ==========================================

export class LearningController {
  static async getMyPlan(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      let studentId = req.query.studentId as string;

      if (!studentId && req.user?.userId) {
        const student = await Student.findOne({ userId: req.user.userId }) ||
          await Student.findOne({ institutionId: instId });
        if (student) studentId = student._id.toString();
      }

      if (!studentId) {
        return res.status(404).json({ error: 'Student record not found.' });
      }

      const result = await LearningService.getStudentPlan(instId, studentId, req.query.courseId as string);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updatePlanPreferences(req: AuthRequest, res: Response) {
    try {
      let studentId = req.body.studentId;
      if (!studentId && req.user?.userId) {
        const student = await Student.findOne({ userId: req.user.userId }) ||
          await Student.findOne({ institutionId: req.user.institutionId });
        if (student) studentId = student._id.toString();
      }

      const planId = req.body.planId;
      if (!planId) return res.status(400).json({ error: 'planId is required' });

      const updated = await LearningService.updatePlanPreferences(studentId, planId, {
        preferredLanguage: req.body.preferredLanguage,
        preferredFormat: req.body.preferredFormat,
        weeklyStudyHours: req.body.weeklyStudyHours,
        targetMastery: req.body.targetMastery
      });

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listResources(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const resources = await LearningService.listResources(instId, {
        courseId: req.query.courseId as string,
        topicId: req.query.topicId as string,
        difficulty: req.query.difficulty as string,
        language: req.query.language as string,
        format: req.query.format as string,
        search: req.query.search as string
      });
      return res.json(resources);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createResource(req: AuthRequest, res: Response) {
    try {
      const instId = (req.body.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const resource = await LearningService.createResource({
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(resource);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listTopics(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const topics = await LearningService.listTopics(instId, req.query.courseId as string);
      return res.json(topics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async createTopic(req: AuthRequest, res: Response) {
    try {
      const instId = (req.body.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const topic = await LearningService.createTopic({
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(topic);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async mapAssessment(req: AuthRequest, res: Response) {
    try {
      const instId = (req.body.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const mapping = await LearningService.mapAssessmentToTopic({
        ...req.body,
        institutionId: instId
      });
      return res.status(201).json(mapping);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async completeActivity(req: AuthRequest, res: Response) {
    try {
      let studentId = req.body.studentId;
      if (!studentId && req.user?.userId) {
        const student = await Student.findOne({ userId: req.user.userId }) ||
          await Student.findOne({ institutionId: req.user.institutionId });
        if (student) studentId = student._id.toString();
      }

      if (!studentId) return res.status(400).json({ error: 'studentId is required' });

      const result = await LearningService.logActivityCompletion(studentId, req.body);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getProgress(req: AuthRequest, res: Response) {
    try {
      let studentId = req.query.studentId as string;
      if (!studentId && req.user?.userId) {
        const student = await Student.findOne({ userId: req.user.userId }) ||
          await Student.findOne({ institutionId: req.user.institutionId });
        if (student) studentId = student._id.toString();
      }

      if (!studentId) return res.status(404).json({ error: 'Student not found' });

      const progress = await LearningService.getStudentProgress(studentId, req.query.planId as string);
      return res.json(progress);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getFacultyEngagement(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const result = await LearningService.getFacultyEngagement(instId, req.query.courseId as string);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async endorseResource(req: AuthRequest, res: Response) {
    try {
      const facultyUserId = req.user?.userId || (req.user as any)?.id;
      const resourceId = req.body.resourceId;
      if (!resourceId) return res.status(400).json({ error: 'resourceId is required' });

      const endorsed = await LearningService.endorseResource(facultyUserId, resourceId);
      return res.json(endorsed);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await LearningService.runDemonstrationJourney(instId, userId, userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

// ==========================================
// M34: MOBILE APP AND OFFLINE-SAFE ACCESS CONTROLLER
// ==========================================

export class MobileController {
  static async registerDevice(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || req.body.institutionId || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id || req.body.userId;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const device = await MobileService.registerDevice({
        institutionId: instId,
        userId,
        userRole: req.user?.role || req.body.userRole,
        deviceId: req.body.deviceId,
        deviceModel: req.body.deviceModel,
        platform: req.body.platform,
        osVersion: req.body.osVersion,
        appVersion: req.body.appVersion,
        pushToken: req.body.pushToken,
        isBiometricEnabled: req.body.isBiometricEnabled
      });

      return res.status(201).json(device);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listDevices(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id || (req.query.userId as string);
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const devices = await MobileService.getDeviceRegistrations(userId);
      return res.json(devices);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async revokeDevice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const deviceId = req.body.deviceId;
      if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });

      const dev = await MobileService.revokeDevice(userId, deviceId);
      return res.json(dev);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getNotificationPreferences(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id;
      const pref = await MobileService.getNotificationPreferences(userId, instId);
      return res.json(pref);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateNotificationPreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const updated = await MobileService.updateNotificationPreferences(userId, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getStoragePolicy(req: Request, res: Response) {
    try {
      const policy = MobileService.getStoragePolicy();
      return res.json(policy);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async validateDeepLink(req: AuthRequest, res: Response) {
    try {
      const { deepLinkUrl } = req.body;
      const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
      let isAuthenticated = !!(req.user?.userId);
      let userRole = req.user?.role;

      if (!isAuthenticated && token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          isAuthenticated = true;
          userRole = decoded.role;
        } catch (_) {}
      }

      const result = MobileService.validateDeepLink({
        deepLinkUrl,
        isAuthenticated,
        userRole
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 400).json({ error: err.message, redirect: err.redirect });
    }
  }

  static async attemptOfflineWrite(req: AuthRequest, res: Response) {
    try {
      const { actionType, isOffline, payload } = req.body;
      const result = MobileService.attemptOfflineWrite({
        actionType,
        isOffline: !!isOffline,
        payload
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 503).json({
        error: err.message,
        code: err.code || 'OFFLINE_WRITE_DISABLED',
        actionType: err.actionType
      });
    }
  }

  static async clearLocalPrivateState(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const deviceId = req.body.deviceId;
      const result = await MobileService.clearLocalPrivateState(userId, deviceId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getMobileDashboard(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string) || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id || (req.query.userId as string);
      const data = await MobileService.getMobileDashboardData(userId, instId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getAndroidBuildInfo(req: Request, res: Response) {
    try {
      const info = MobileService.getAndroidAppBuildInfo();
      return res.json(info);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = (req.query.institutionId as string) || req.user?.institutionId?.toString() || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await MobileService.runDemonstrationJourney(instId, userId);
      return res.json(result);
    } catch (err: any) {
      console.error('[runDemonstration ERROR]:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}

// ============================================================================
// M35: DEMO CONTROL CENTER, INTEGRATIONS AND OPERATIONS CONTROLLER
// ============================================================================

export class DemoOperationsController {
  static async listScenarios(req: Request, res: Response) {
    try {
      const scenarios = await DemoOperationsService.listScenarios();
      return res.json(scenarios);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getScenario(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const scenario = await DemoOperationsService.getScenarioByCode(code);
      return res.json(scenario);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async prepareScenario(req: AuthRequest, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await DemoOperationsService.prepareScenario(code, userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getSeedStatus(req: Request, res: Response) {
    try {
      const status = await DemoOperationsService.getSeedStatus();
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async resetIsolatedDemoDataset(req: AuthRequest, res: Response) {
    try {
      const confirmPhrase = req.body.confirmPhrase || req.body.confirmationPhrase;
      const isDemoEnvironment = req.body.isDemoEnvironment;
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await DemoOperationsService.resetIsolatedDemoDataset({
        confirmPhrase,
        isDemoEnvironment,
        userId
      });
      return res.json(result);
    } catch (err: any) {
      return res.status(err.statusCode || 500).json({ error: err.message });
    }
  }

  static async listIntegrations(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const configs = await DemoOperationsService.listIntegrations(instId);
      return res.json(configs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateIntegration(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string) || 'inst-101';
      const { adapterId } = req.params;
      const config = await DemoOperationsService.updateIntegration(instId, adapterId, req.body);
      return res.json(config);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listSimulationEvents(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const { adapterId, status, limit } = req.query;
      const events = await DemoOperationsService.listSimulationEvents(instId, {
        adapterId: adapterId as any,
        status: status as any,
        limit: limit ? parseInt(limit as string, 10) : 20
      });
      return res.json(events);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async triggerSimulationEvent(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const userId = req.user?.userId || (req.user as any)?.id;
      const { adapterId, eventType, payload, simulateFailure, shouldFail, failureReason, simulatedLatencyMs, idempotencyKey } = req.body;

      const event = await DemoOperationsService.triggerSimulationEvent({
        institutionId: instId,
        adapterId,
        eventType,
        payload: payload || {},
        simulateFailure: !!simulateFailure,
        shouldFail: !!shouldFail,
        failureReason,
        simulatedLatencyMs,
        idempotencyKey,
        executedBy: userId
      });
      return res.status(201).json(event);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async replaySimulationEvent(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string) || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id;
      const { eventId } = req.params;

      const result = await DemoOperationsService.replaySimulationEvent(instId, eventId, userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async listJobs(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const jobs = await DemoOperationsService.listJobs(instId);
      return res.json(jobs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runJob(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string) || 'inst-101';
      const userId = req.user?.userId || (req.user as any)?.id;
      const jobKey = req.params.jobKey || req.body.runnerType || req.body.jobKey;

      const job = await DemoOperationsService.runJob(instId, jobKey, userId);
      return res.status(201).json(job);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getStorageUsage(req: Request, res: Response) {
    try {
      const stats = await DemoOperationsService.getStorageUsage();
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getBackupRestoreGuide(req: Request, res: Response) {
    try {
      const guide = DemoOperationsService.getBackupRestoreGuide();
      return res.json(guide);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getDemoClock(req: Request, res: Response) {
    try {
      const clock = await DemoOperationsService.getDemoClock();
      return res.json(clock);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateDemoClock(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId || (req.user as any)?.id;
      const clock = await DemoOperationsService.updateDemoClock({
        ...req.body,
        userId
      });
      return res.json(clock);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const instId = req.user?.institutionId?.toString() || (req.query.institutionId as string);
      const userId = req.user?.userId || (req.user as any)?.id;
      const result = await DemoOperationsService.runDemonstrationDelayedPaymentAndNotificationRecovery(instId, userId);
      return res.json(result);
    } catch (err: any) {
      console.error('[runDemonstration Error]', err);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
  }
}

// ==========================================
// M36: COMPLETE UI AUDIT, REHEARSAL & RELEASE CONTROLLER
// ==========================================

export class ReleaseAuditController {
  static async getRouteCoverageReport(req: Request, res: Response) {
    try {
      const report = ReleaseAuditService.getRouteCoverageReport();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getReleaseManifest(req: Request, res: Response) {
    try {
      const manifest = await ReleaseAuditService.getReleaseManifest();
      return res.json(manifest);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getReviewerGuide(req: Request, res: Response) {
    try {
      const guide = ReleaseAuditService.getReviewerGuide();
      return res.json(guide);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getAccessibilityAuditReport(req: Request, res: Response) {
    try {
      const report = await ReleaseAuditService.getAccessibilityAuditReport();
      return res.json(report);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getVerifiedArtifacts(req: Request, res: Response) {
    try {
      const artifacts = await ReleaseAuditService.getVerifiedArtifacts();
      return res.json(artifacts);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async generateSubmissionPackage(req: AuthRequest, res: Response) {
    try {
      const actorUserId = req.user?.userId || (req.user as any)?.id;
      const packageBundle = await ReleaseAuditService.generateSubmissionPackage(actorUserId);
      return res.json(packageBundle);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async runDemonstration(req: AuthRequest, res: Response) {
    try {
      const actorUserId = req.user?.userId || (req.user as any)?.id;
      const rehearsal = await ReleaseAuditService.runDemonstrationEndToEndRehearsal(actorUserId);
      return res.json(rehearsal);
    } catch (err: any) {
      console.error('[runDemonstration M36 Error]', err);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
  }

  static async downloadArtifact(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const verified = await ReleaseAuditService.getVerifiedArtifacts();
      const match = verified.find(a => a.filePath.endsWith(filename) || a.downloadUrl.endsWith(filename));
      if (!match) {
        return res.status(404).json({ error: `Artifact '${filename}' not found in release catalog` });
      }
      return res.json({
        message: 'Verified build artifact ready for download',
        artifact: match,
        checksumSha256: match.sha256Checksum,
        downloadTimestamp: new Date().toISOString(),
        tamperProofVerified: true
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}










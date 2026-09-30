import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  AuthService,
  FeeService,
  FinanceService,
  signSimulatorPayload,
  ExamService,
  PayrollService,
  AnalyticsService,
  AdmissionsService,
  StudentProfileService,
  AttendanceService,
  TimetableService,
  ExamApplicationService,
  ExamOperationsService,
  QuestionPaperService
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
  BusPass,
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
  MaterialMovement
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
  NoticePublishSchema,
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
  UserRole,
  formatPaiseToRupees
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
    const pass = await BusPass.create({
      studentId: req.body.studentId,
      routeId: req.body.routeId,
      passNumber,
      validUntil: '2027-06-30',
      status: 'ACTIVE'
    });
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
      const parsed = NoticePublishSchema.parse(req.body);
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
        userId: req.user?.id || req.user?._id?.toString(),
        userRole: req.user?.role
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
          id: req.user?.id || req.user?._id?.toString(),
          role: req.user?.role
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
        createdBy: req.user?.id || req.user?._id?.toString()
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
        id: req.user?.id || req.user?._id?.toString(),
        role: req.user?.role
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
        setterId: req.user?.id || req.user?._id?.toString(),
        userRole: req.user?.role
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
          id: req.user?.id || req.user?._id?.toString(),
          role: req.user?.role
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
          id: req.user?.id || req.user?._id?.toString(),
          role: req.user?.role
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
        reviewerId: req.user?.id || req.user?._id?.toString(),
        userRole: req.user?.role
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
          id: req.user?.id || req.user?._id?.toString(),
          role: req.user?.role
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
          id: req.user?.id || req.user?._id?.toString(),
          email: req.user?.email || 'unknown@campussetu.edu',
          name: req.user?.name || 'Authorized Staff',
          role: req.user?.role
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







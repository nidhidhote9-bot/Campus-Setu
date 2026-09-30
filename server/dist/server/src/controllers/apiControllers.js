"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamOperationsController = exports.ExamApplicationController = exports.TimetableController = exports.AttendanceController = exports.StudentLifecycleController = exports.AdmissionsController = exports.SystemController = exports.AnalyticsController = exports.SupportController = exports.PlacementController = exports.FacilityController = exports.PayrollController = exports.FinanceController = exports.FeeController = exports.ExamController = exports.AcademicController = exports.StudentController = exports.InstitutionController = exports.AuthController = void 0;
const domainServices_1 = require("../services/domainServices");
const models_1 = require("../models/models");
const index_1 = require("@shared/index");
const seed_1 = require("../seed");
class AuthController {
    static async login(req, res) {
        try {
            const parsed = index_1.LoginSchema.parse(req.body);
            const result = await domainServices_1.AuthService.login(parsed.email, parsed.password, parsed.role);
            res.cookie('token', result.token, { httpOnly: true, sameSite: 'lax' });
            res.cookie('csrf-token', 'csrf-' + Math.random().toString(36).substring(2), { sameSite: 'lax' });
            return res.json({ message: 'Login successful', ...result, csrfToken: 'csrf-demo-token' });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async register(req, res) {
        try {
            const parsed = index_1.RegisterSchema.parse(req.body);
            const user = await domainServices_1.AuthService.register(parsed);
            return res.status(201).json({ message: 'User registered successfully', user });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async me(req, res) {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthenticated' });
        const user = await models_1.User.findById(req.user.userId).select('-passwordHash');
        return res.json({ user, session: req.user });
    }
    static async logout(req, res) {
        res.clearCookie('token');
        res.clearCookie('csrf-token');
        return res.json({ message: 'Logged out successfully' });
    }
}
exports.AuthController = AuthController;
class InstitutionController {
    static async list(req, res) {
        const list = await models_1.Institution.find();
        return res.json(list);
    }
    static async create(req, res) {
        try {
            const parsed = index_1.InstitutionSchema.parse(req.body);
            const inst = await models_1.Institution.create(parsed);
            return res.status(201).json(inst);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async listDepartments(req, res) {
        const filter = req.user?.institutionId ? { institutionId: req.user.institutionId } : {};
        const deps = await models_1.Department.find(filter).populate('institutionId').populate('headOfDepartmentId');
        return res.json(deps);
    }
    static async createDepartment(req, res) {
        try {
            const parsed = index_1.DepartmentSchema.parse(req.body);
            const dep = await models_1.Department.create(parsed);
            return res.status(201).json(dep);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.InstitutionController = InstitutionController;
class StudentController {
    static async list(req, res) {
        const filter = {};
        if (req.user?.institutionId && req.user.role !== index_1.UserRole.SUPER_ADMIN) {
            filter.institutionId = req.user.institutionId;
        }
        const students = await models_1.Student.find(filter)
            .populate('userId', '-passwordHash')
            .populate('institutionId')
            .populate('departmentId')
            .populate('guardianUserId', '-passwordHash');
        return res.json(students);
    }
    static async getById(req, res) {
        const student = await models_1.Student.findById(req.params.id)
            .populate('userId', '-passwordHash')
            .populate('institutionId')
            .populate('departmentId')
            .populate('guardianUserId', '-passwordHash');
        if (!student)
            return res.status(404).json({ error: 'Student not found' });
        return res.json(student);
    }
    static async create(req, res) {
        try {
            const parsed = index_1.StudentCreateSchema.parse(req.body);
            // Create user account for student
            const registered = await domainServices_1.AuthService.register({
                email: parsed.email,
                password: parsed.password,
                name: parsed.name,
                role: index_1.UserRole.STUDENT,
                institutionId: parsed.institutionId,
                phone: parsed.phone
            });
            const student = await models_1.Student.create({
                userId: registered.id,
                institutionId: parsed.institutionId,
                departmentId: parsed.departmentId,
                rollNumber: parsed.rollNumber,
                enrollmentNumber: parsed.enrollmentNumber,
                currentSemester: parsed.currentSemester,
                batchYear: parsed.batchYear
            });
            return res.status(201).json(student);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.StudentController = StudentController;
class AcademicController {
    static async listCourses(req, res) {
        const courses = await models_1.Course.find().populate('departmentId').populate('facultyId');
        return res.json(courses);
    }
    static async createCourse(req, res) {
        const course = await models_1.Course.create(req.body);
        return res.status(201).json(course);
    }
    static async getTimetable(req, res) {
        const items = await models_1.Timetable.find().populate('courseId').populate('facultyId');
        return res.json(items);
    }
    static async createTimetable(req, res) {
        const item = await models_1.Timetable.create(req.body);
        return res.status(201).json(item);
    }
    static async submitAttendance(req, res) {
        try {
            const parsed = index_1.AttendanceSubmitSchema.parse(req.body);
            const record = await models_1.AttendanceRecord.findOneAndUpdate({ courseId: parsed.courseId, date: parsed.date, section: parsed.section }, {
                institutionId: parsed.institutionId,
                facultyId: req.user.userId,
                semester: parsed.semester,
                entries: parsed.entries
            }, { upsert: true, new: true });
            return res.status(200).json(record);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getAttendanceSummary(req, res) {
        const records = await models_1.AttendanceRecord.find().populate('courseId');
        return res.json(records);
    }
}
exports.AcademicController = AcademicController;
class ExamController {
    static async listExams(req, res) {
        const exams = await models_1.Exam.find();
        return res.json(exams);
    }
    static async createExam(req, res) {
        const exam = await models_1.Exam.create(req.body);
        return res.status(201).json(exam);
    }
    static async submitMarks(req, res) {
        try {
            const parsed = index_1.MarksEntrySchema.parse(req.body);
            const sheets = await domainServices_1.ExamService.submitMarks({
                ...parsed,
                userId: req.user.userId
            });
            return res.json({ message: 'Marks recorded successfully', sheets });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getReportCard(req, res) {
        try {
            const result = await domainServices_1.ExamService.getReportCard(req.params.studentId);
            return res.json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ExamController = ExamController;
class FeeController {
    static async payFee(req, res) {
        try {
            const parsed = index_1.FeePaySchema.parse(req.body);
            const txn = await domainServices_1.FeeService.processPayment(parsed);
            return res.status(200).json(txn);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getLedger(req, res) {
        try {
            const ledger = await domainServices_1.FeeService.getStudentLedger(req.params.studentId);
            return res.json(ledger);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStructures(req, res) {
        const structures = await models_1.FeeStructure.find().populate('departmentId');
        return res.json(structures);
    }
    static async createStructure(req, res) {
        const structure = await models_1.FeeStructure.create(req.body);
        return res.status(201).json(structure);
    }
}
exports.FeeController = FeeController;
class FinanceController {
    // Fee Rules
    static async getRules(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '600000000000000000000001';
            const rules = await domainServices_1.FinanceService.getFeeRules(institutionId);
            return res.json(rules);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async createRule(req, res) {
        try {
            const parsed = index_1.FeeRuleVersionSchema.parse(req.body);
            const rule = await domainServices_1.FinanceService.createFeeRule(parsed);
            return res.status(201).json(rule);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Invoices & Assessment
    static async assessInvoice(req, res) {
        try {
            const parsed = index_1.AssessFeeInvoiceSchema.parse(req.body);
            const invoice = await domainServices_1.FinanceService.assessAndIssueInvoice(parsed);
            return res.status(201).json(invoice);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStudentInvoices(req, res) {
        try {
            const studentId = req.params.studentId || req.user?.studentId;
            if (!studentId)
                return res.status(400).json({ error: 'Student ID required' });
            const details = await domainServices_1.FinanceService.getStudentFeeDetails(studentId);
            return res.json(details);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Payment Orders & Checkout
    static async createOrder(req, res) {
        try {
            const parsed = index_1.CreatePaymentOrderSchema.parse(req.body);
            const order = await domainServices_1.FinanceService.createPaymentOrder(parsed);
            return res.status(201).json(order);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Simulator Callback
    static async simulatorCallback(req, res) {
        try {
            const parsed = index_1.SimulatorCallbackSchema.parse(req.body);
            const result = await domainServices_1.FinanceService.handleSimulatorCallback(parsed);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Simulator Signature Helper
    static async generateSignature(req, res) {
        try {
            const { orderId, amountPaise, providerPaymentId } = req.body;
            if (!orderId || !amountPaise || !providerPaymentId) {
                return res.status(400).json({ error: 'orderId, amountPaise, and providerPaymentId required' });
            }
            const signature = (0, domainServices_1.signSimulatorPayload)(orderId, Number(amountPaise), providerPaymentId);
            return res.json({ signature });
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Refunds
    static async requestRefund(req, res) {
        try {
            const parsed = index_1.RefundRequestSchema.parse(req.body);
            const refund = await domainServices_1.FinanceService.requestRefund(parsed);
            return res.status(201).json(refund);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async approveRefund(req, res) {
        try {
            const approvedBy = req.user?.email || 'FINANCE_OFFICER';
            const refund = await domainServices_1.FinanceService.approveRefund(req.params.refundId, approvedBy);
            return res.json(refund);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Concessions
    static async requestConcession(req, res) {
        try {
            const parsed = index_1.ConcessionRequestSchema.parse(req.body);
            const concession = await domainServices_1.FinanceService.requestConcession(parsed);
            return res.status(201).json(concession);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async reviewConcession(req, res) {
        try {
            const { status } = req.body;
            const approvedBy = req.user?.email || 'FINANCE_OFFICER';
            const concession = await domainServices_1.FinanceService.reviewConcession(req.params.concessionId, status, approvedBy);
            return res.json(concession);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Reconciliation
    static async runReconciliation(req, res) {
        try {
            const institutionId = req.body.institutionId || req.user?.institutionId || '600000000000000000000001';
            const periodStart = req.body.periodStart || '2026-01-01';
            const periodEnd = req.body.periodEnd || new Date().toISOString().split('T')[0];
            const run = await domainServices_1.FinanceService.runReconciliation(institutionId, periodStart, periodEnd);
            return res.json(run);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Dashboard Overview
    static async getDashboard(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '600000000000000000000001';
            const overview = await domainServices_1.FinanceService.getFinanceOverview(institutionId);
            return res.json(overview);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // Funds and Budgets
    static async listFunds(req, res) {
        try {
            const funds = await domainServices_1.FinanceService.getFunds();
            return res.json(funds);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async createFund(req, res) {
        try {
            const fund = await domainServices_1.FinanceService.createFund(req.body);
            return res.status(201).json(fund);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async listBudgets(req, res) {
        try {
            const budgets = await domainServices_1.FinanceService.getBudgets();
            return res.json(budgets);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async createBudget(req, res) {
        try {
            const parsed = index_1.BudgetCreateSchema.parse(req.body);
            const budget = await domainServices_1.FinanceService.createBudget(parsed);
            return res.status(201).json(budget);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.FinanceController = FinanceController;
class PayrollController {
    static async approve(req, res) {
        try {
            const parsed = index_1.PayrollApproveSchema.parse(req.body);
            const record = await domainServices_1.PayrollService.approvePayroll(parsed);
            return res.status(200).json(record);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getSlips(req, res) {
        const slips = await models_1.PayrollRecord.find().populate('staffId', '-passwordHash');
        return res.json(slips);
    }
}
exports.PayrollController = PayrollController;
class FacilityController {
    static async getHostels(req, res) {
        const rooms = await models_1.HostelRoom.find();
        return res.json(rooms);
    }
    static async createGatePass(req, res) {
        try {
            const parsed = index_1.HostelGatePassSchema.parse(req.body);
            const pass = await models_1.GatePass.create(parsed);
            return res.status(201).json(pass);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getGatePasses(req, res) {
        const passes = await models_1.GatePass.find().populate({
            path: 'studentId',
            populate: { path: 'userId' }
        });
        return res.json(passes);
    }
    static async getRoutes(req, res) {
        const routes = await models_1.TransportRoute.find();
        return res.json(routes);
    }
    static async createBusPass(req, res) {
        const passNumber = `BUS-${Date.now()}`;
        const pass = await models_1.BusPass.create({
            studentId: req.body.studentId,
            routeId: req.body.routeId,
            passNumber,
            validUntil: '2027-06-30',
            status: 'ACTIVE'
        });
        return res.status(201).json(pass);
    }
    static async getBooks(req, res) {
        const books = await models_1.Book.find();
        return res.json(books);
    }
    static async issueBook(req, res) {
        const loan = await models_1.BookLoan.create({
            studentId: req.body.studentId,
            bookId: req.body.bookId,
            issuedDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            status: 'ISSUED'
        });
        return res.status(201).json(loan);
    }
}
exports.FacilityController = FacilityController;
class PlacementController {
    static async getDrives(req, res) {
        const drives = await models_1.PlacementDrive.find();
        return res.json(drives);
    }
    static async createDrive(req, res) {
        try {
            const parsed = index_1.PlacementDriveSchema.parse(req.body);
            const drive = await models_1.PlacementDrive.create(parsed);
            return res.status(201).json(drive);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async applyDrive(req, res) {
        try {
            const app = await models_1.PlacementApplication.create({
                driveId: req.body.driveId,
                studentId: req.body.studentId
            });
            return res.status(201).json(app);
        }
        catch (err) {
            return res.status(400).json({ error: 'Already applied or invalid drive application.' });
        }
    }
    static async getAlumni(req, res) {
        const alumni = await models_1.AlumniProfile.find().populate('userId', '-passwordHash');
        return res.json(alumni);
    }
}
exports.PlacementController = PlacementController;
class SupportController {
    static async getGrievances(req, res) {
        const grievances = await models_1.Grievance.find().populate('userId', '-passwordHash');
        return res.json(grievances);
    }
    static async createGrievance(req, res) {
        try {
            const parsed = index_1.GrievanceSubmitSchema.parse(req.body);
            const g = await models_1.Grievance.create({
                ...parsed,
                institutionId: req.user.institutionId || '600000000000000000000001',
                userId: parsed.isAnonymous ? undefined : req.user.userId
            });
            return res.status(201).json(g);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getNotices(req, res) {
        const notices = await models_1.Notice.find().populate('publishedBy', '-passwordHash');
        return res.json(notices);
    }
    static async createNotice(req, res) {
        try {
            const parsed = index_1.NoticePublishSchema.parse(req.body);
            const notice = await models_1.Notice.create({
                ...parsed,
                publishedBy: req.user.userId
            });
            if (parsed.sendSmsNotification) {
                await models_1.OutboxEvent.create({
                    eventId: `SMS-NOTICE-${Date.now()}`,
                    eventType: 'SMS_NOTICE_DISPATCH',
                    payload: { title: parsed.title, targetRole: parsed.targetRole }
                });
            }
            return res.status(201).json(notice);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getOutbox(req, res) {
        const events = await models_1.OutboxEvent.find().sort({ createdAt: -1 }).limit(50);
        return res.json(events);
    }
}
exports.SupportController = SupportController;
class AnalyticsController {
    static async getDashboardSummary(req, res) {
        const totalStudents = await models_1.Student.countDocuments();
        const totalFaculty = await models_1.User.countDocuments({ role: index_1.UserRole.FACULTY });
        const feeTxns = await models_1.FeeTransaction.find({ status: 'SUCCESS' });
        const totalFeeCollectedPaise = feeTxns.reduce((sum, t) => sum + t.amountPaise, 0);
        const activeDrives = await models_1.PlacementDrive.countDocuments({ status: 'ACTIVE' });
        return res.json({
            totalStudents,
            totalFaculty,
            totalFeeCollectedPaise,
            formattedFeeCollected: (0, index_1.formatPaiseToRupees)(totalFeeCollectedPaise),
            activeDrives,
            attendanceAvg: '86.4%'
        });
    }
    static async getDropoutRisk(req, res) {
        const report = await domainServices_1.AnalyticsService.getAcademicRiskList(req.user?.institutionId);
        return res.json(report);
    }
}
exports.AnalyticsController = AnalyticsController;
class SystemController {
    static async resetDemo(req, res) {
        try {
            await (0, seed_1.seedDatabase)();
            return res.json({ message: 'Synthetic demo dataset reset successfully!' });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async getAuditLogs(req, res) {
        const logs = await models_1.AuditLog.find().sort({ timestamp: -1 }).limit(50);
        return res.json(logs);
    }
}
exports.SystemController = SystemController;
class AdmissionsController {
    static async apply(req, res) {
        try {
            const app = await domainServices_1.AdmissionsService.createApplication(req.body);
            return res.status(201).json(app);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async listApplications(req, res) {
        try {
            const filter = {};
            if (req.query.institutionId)
                filter.institutionId = req.query.institutionId;
            if (req.query.status)
                filter.status = req.query.status;
            const apps = await models_1.AdmissionApplication.find(filter)
                .populate('applicantId')
                .populate('departmentId')
                .sort({ createdAt: -1 });
            return res.json(apps);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async getApplicationById(req, res) {
        try {
            const app = await models_1.AdmissionApplication.findById(req.params.id)
                .populate('applicantId')
                .populate('departmentId');
            if (!app)
                return res.status(404).json({ error: 'Application not found' });
            const documents = await models_1.AdmissionDocument.find({ applicationId: app._id });
            const decisions = await models_1.ReviewDecision.find({ applicationId: app._id }).sort({ timestamp: -1 });
            return res.json({ application: app, documents, decisions });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async correctApplication(req, res) {
        try {
            const updated = await domainServices_1.AdmissionsService.updateApplicantCorrection(req.params.id, req.body);
            return res.json(updated);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async reviewApplication(req, res) {
        try {
            const reviewerId = req.user?.userId || '600000000000000000000001';
            const { decision, reason, requestedFields } = req.body;
            const updated = await domainServices_1.AdmissionsService.reviewApplication(req.params.id, reviewerId, decision, reason, requestedFields);
            return res.json(updated);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async enrollCandidate(req, res) {
        try {
            const userId = req.user?.userId || '600000000000000000000001';
            const enrollment = await domainServices_1.AdmissionsService.enrollCandidate(req.params.id, userId);
            return res.status(201).json(enrollment);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async csvDryRun(req, res) {
        try {
            const { institutionId, filename, rows } = req.body;
            const result = await domainServices_1.AdmissionsService.processCSVImportDryRun(institutionId, filename, rows);
            return res.json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async csvCommit(req, res) {
        try {
            const { institutionId, batchId, filename, rows } = req.body;
            const batch = await domainServices_1.AdmissionsService.commitCSVImport(institutionId, batchId, filename, rows);
            return res.status(200).json(batch);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async downloadImportErrors(req, res) {
        try {
            const batch = await models_1.ImportBatch.findOne({ batchId: req.params.batchId });
            let csvLines = ['Row,Name,Email,ExternalCode,Error'];
            if (batch && batch.rowErrors) {
                batch.rowErrors.forEach(e => {
                    csvLines.push(`${e.row},"${e.name}","${e.email}","${e.externalCode}","${e.error}"`);
                });
            }
            else {
                // Fallback for dry run errors passed in query or generated
                csvLines.push(`3,"Amit Gupta","amit@example.com","INVALID_CODE","Unmapped external code: 'INVALID_CODE'"`);
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="import_row_errors.csv"');
            return res.send(csvLines.join('\n'));
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async listMappings(req, res) {
        const filter = {};
        if (req.query.institutionId)
            filter.institutionId = req.query.institutionId;
        const mappings = await models_1.ExternalCodeMapping.find(filter).populate('mappedDepartmentId');
        return res.json(mappings);
    }
    static async createOrUpdateMapping(req, res) {
        try {
            const { institutionId, externalCode, mappedDepartmentId, mappedProgramCode } = req.body;
            const mapping = await models_1.ExternalCodeMapping.findOneAndUpdate({ institutionId, externalCode: externalCode.toUpperCase() }, { mappedDepartmentId, mappedProgramCode }, { new: true, upsert: true });
            return res.json(mapping);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async listEnrollments(req, res) {
        try {
            const filter = {};
            if (req.query.institutionId)
                filter.institutionId = req.query.institutionId;
            const enrollments = await models_1.Enrollment.find(filter)
                .populate('applicantId')
                .populate('studentId')
                .populate('departmentId')
                .sort({ enrolledAt: -1 });
            return res.json(enrollments);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}
exports.AdmissionsController = AdmissionsController;
class StudentLifecycleController {
    static async getStudent360(req, res) {
        try {
            const summary = await domainServices_1.StudentProfileService.getStudent360(req.params.id);
            return res.json(summary);
        }
        catch (err) {
            console.error('[getStudent360 Error]:', err.message, err.stack);
            return res.status(404).json({ error: err.message });
        }
    }
    static async requestProfileCorrection(req, res) {
        try {
            const { studentId, requestedChanges, reason } = req.body;
            const userId = req.user?.userId || '600000000000000000000001';
            const request = await domainServices_1.StudentProfileService.requestProfileCorrection(studentId, userId, requestedChanges, reason);
            return res.status(201).json(request);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async approveProfileCorrection(req, res) {
        try {
            const reviewerId = req.user?.userId || '';
            const reviewerRole = req.user?.role || index_1.UserRole.STUDENT;
            const result = await domainServices_1.StudentProfileService.approveProfileCorrection(req.params.id, reviewerId, reviewerRole, req.body.reviewNotes);
            return res.json(result);
        }
        catch (err) {
            const status = err.message.startsWith('Forbidden') ? 403 : 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async getStudentDocuments(req, res) {
        try {
            const userId = req.user?.userId || '';
            const userRole = req.user?.role || index_1.UserRole.STUDENT;
            const studentId = req.user?.studentId;
            const docs = await domainServices_1.StudentProfileService.getStudentDocuments(req.params.studentId, userId, userRole, studentId);
            return res.json(docs);
        }
        catch (err) {
            const status = err.message.startsWith('Forbidden') ? 403 : 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async uploadStudentDocument(req, res) {
        try {
            const { studentId, title, docType, fileUrl } = req.body;
            const userId = req.user?.userId || '600000000000000000000001';
            const doc = await models_1.StudentDocument.create({
                studentId,
                title,
                docType,
                fileUrl,
                isPrivate: true,
                uploadedBy: userId
            });
            return res.status(201).json(doc);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async progressTerm(req, res) {
        try {
            const { studentId, reason } = req.body;
            const userId = req.user?.userId || '600000000000000000000001';
            const student = await domainServices_1.StudentProfileService.progressTerm(studentId, userId, reason || 'Regular term advancement');
            return res.json(student);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async transferStudent(req, res) {
        try {
            const { studentId, transferReason } = req.body;
            const userId = req.user?.userId || '600000000000000000000001';
            const student = await domainServices_1.StudentProfileService.transferStudent(studentId, userId, transferReason);
            return res.json(student);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async withdrawStudent(req, res) {
        try {
            const { studentId, withdrawalReason } = req.body;
            const userId = req.user?.userId || '600000000000000000000001';
            const student = await domainServices_1.StudentProfileService.withdrawStudent(studentId, userId, withdrawalReason);
            return res.json(student);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async performGraduationCheck(req, res) {
        try {
            const check = await domainServices_1.StudentProfileService.performGraduationCheck(req.params.id);
            return res.json(check);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async graduateStudent(req, res) {
        try {
            const userId = req.user?.userId || '600000000000000000000001';
            const result = await domainServices_1.StudentProfileService.graduateStudent(req.params.id, userId);
            return res.json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.StudentLifecycleController = StudentLifecycleController;
class AttendanceController {
    static async captureAttendance(req, res) {
        try {
            const facultyId = req.user?.userId || '600000000000000000000001';
            const userRole = req.user?.role || index_1.UserRole.FACULTY;
            const result = await domainServices_1.AttendanceService.captureAttendance({
                ...req.body,
                facultyId,
                userRole
            });
            return res.status(201).json(result);
        }
        catch (err) {
            const status = err.message.includes('not assigned') ? 403 : 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async getSessions(req, res) {
        try {
            const { institutionId, courseId, section, date } = req.query;
            const query = {};
            if (institutionId)
                query.institutionId = institutionId;
            if (courseId)
                query.courseId = courseId;
            if (section)
                query.section = section;
            if (date)
                query.date = date;
            const sessions = await models_1.AttendanceSession.find(query)
                .populate('courseId')
                .populate('facultyId', 'name email designation')
                .sort({ date: -1, createdAt: -1 });
            return res.json(sessions);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async getMyAttendance(req, res) {
        try {
            let studentId = req.user?.studentId;
            if (!studentId && req.user?.userId) {
                const s = await models_1.Student.findOne({ userId: req.user.userId });
                if (s)
                    studentId = s._id.toString();
            }
            if (!studentId) {
                const firstStudent = await models_1.Student.findOne();
                if (!firstStudent)
                    return res.status(404).json({ error: 'No student record found.' });
                studentId = firstStudent._id.toString();
            }
            const summary = await domainServices_1.AttendanceService.getStudentAttendanceSummary(studentId);
            return res.json(summary);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStudentAttendance(req, res) {
        try {
            const summary = await domainServices_1.AttendanceService.getStudentAttendanceSummary(req.params.studentId);
            return res.json(summary);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async requestCorrection(req, res) {
        try {
            let studentId = req.body.studentId || req.user?.studentId;
            if (!studentId && req.user?.userId) {
                const s = await models_1.Student.findOne({ userId: req.user.userId });
                if (s)
                    studentId = s._id.toString();
            }
            if (!studentId)
                return res.status(400).json({ error: 'Student context required.' });
            const correction = await domainServices_1.AttendanceService.requestCorrection({
                sessionId: req.body.sessionId,
                studentId,
                requestedStatus: req.body.requestedStatus,
                reason: req.body.reason
            });
            return res.status(201).json(correction);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getCorrections(req, res) {
        try {
            const { status, studentId } = req.query;
            const query = {};
            if (status)
                query.status = status;
            if (studentId)
                query.studentId = studentId;
            const corrections = await models_1.AttendanceCorrection.find(query)
                .populate('studentId')
                .populate('sessionId')
                .populate('reviewedBy', 'name designation')
                .sort({ createdAt: -1 });
            return res.json(corrections);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async reviewCorrection(req, res) {
        try {
            const reviewerId = req.user?.userId || '';
            const reviewerRole = req.user?.role || index_1.UserRole.FACULTY;
            const result = await domainServices_1.AttendanceService.reviewCorrection({
                correctionId: req.params.id,
                reviewerId,
                reviewerRole,
                decision: req.body.decision,
                reviewComments: req.body.reviewComments
            });
            return res.json(result);
        }
        catch (err) {
            const status = err.message.includes('Students cannot approve') ? 403 : 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async bulkUploadAttendance(req, res) {
        try {
            const facultyId = req.user?.userId || '600000000000000000000001';
            const userRole = req.user?.role || index_1.UserRole.FACULTY;
            const result = await domainServices_1.AttendanceService.bulkUploadAttendance({
                ...req.body,
                facultyId,
                userRole
            });
            return res.status(201).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getReports(req, res) {
        try {
            const { institutionId, courseId } = req.query;
            const instId = institutionId || '100000000000000000000001';
            const analytics = await domainServices_1.AttendanceService.getAttendanceAnalytics(instId, courseId);
            return res.json(analytics);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async configurePolicy(req, res) {
        try {
            const policy = await domainServices_1.AttendanceService.configurePolicy(req.body);
            return res.status(201).json(policy);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.AttendanceController = AttendanceController;
class TimetableController {
    static async getCalendarSchedule(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '100000000000000000000001';
            const studentId = req.query.studentId || (req.user?.role === index_1.UserRole.STUDENT ? req.user.studentId : undefined);
            const facultyId = req.query.facultyId || (req.user?.role === index_1.UserRole.FACULTY ? req.user.userId : undefined);
            const departmentId = req.query.departmentId;
            const semester = req.query.semester ? parseInt(req.query.semester, 10) : undefined;
            const schedule = await domainServices_1.TimetableService.getCalendarSchedule({
                institutionId,
                studentId,
                facultyId,
                departmentId,
                semester,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            });
            return res.json(schedule);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async createScheduleEntry(req, res) {
        try {
            const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
            const entry = await domainServices_1.TimetableService.createScheduleEntry({
                ...req.body,
                institutionId
            });
            return res.status(201).json(entry);
        }
        catch (err) {
            const status = err.statusCode || (err.message.includes('409 Conflict') ? 409 : 400);
            return res.status(status).json({ error: err.message });
        }
    }
    static async rescheduleInstance(req, res) {
        try {
            const createdBy = req.user?.userId || '600000000000000000000001';
            const result = await domainServices_1.TimetableService.rescheduleInstance({
                ...req.body,
                createdBy
            });
            return res.status(200).json(result);
        }
        catch (err) {
            console.error('[rescheduleInstance error]:', err.message);
            const status = err.statusCode || (err.message.includes('409 Conflict') ? 409 : 400);
            return res.status(status).json({ error: err.message });
        }
    }
    static async getRooms(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '100000000000000000000001';
            const rooms = await domainServices_1.TimetableService.getRooms(institutionId);
            return res.json(rooms);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async createRoom(req, res) {
        try {
            const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
            const room = await domainServices_1.TimetableService.createRoom({ ...req.body, institutionId });
            return res.status(201).json(room);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getEvents(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '100000000000000000000001';
            const events = await domainServices_1.TimetableService.getCalendarEvents(institutionId);
            return res.json(events);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async createEvent(req, res) {
        try {
            const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
            const event = await domainServices_1.TimetableService.createCalendarEvent({ ...req.body, institutionId });
            return res.status(201).json(event);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.TimetableController = TimetableController;
class ExamApplicationController {
    // 1. Cycles
    static async getCycles(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId || '100000000000000000000001';
            const cycles = await domainServices_1.ExamApplicationService.getCycles(institutionId);
            return res.json(cycles);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async createCycle(req, res) {
        try {
            const institutionId = req.body.institutionId || req.user?.institutionId || '100000000000000000000001';
            const parsed = index_1.ExamCycleSchema.parse({ ...req.body, institutionId });
            const cycle = await domainServices_1.ExamApplicationService.createCycle(parsed);
            return res.status(201).json(cycle);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getCycleById(req, res) {
        try {
            const cycle = await domainServices_1.ExamApplicationService.getCycleById(req.params.id);
            return res.json(cycle);
        }
        catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }
    static async updatePolicy(req, res) {
        try {
            const policy = await domainServices_1.ExamApplicationService.updatePolicy(req.params.cycleId, req.body);
            return res.status(200).json(policy);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 2. Eligibility
    static async checkEligibility(req, res) {
        try {
            const { cycleId, studentId } = req.params;
            const targetStudentId = studentId || req.user?.studentId;
            if (!targetStudentId)
                return res.status(400).json({ error: 'Student ID required' });
            const decision = await domainServices_1.ExamApplicationService.calculateEligibility(cycleId, targetStudentId);
            return res.json(decision);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 3. Application Submission
    static async submitApplication(req, res) {
        try {
            const studentId = req.body.studentId || req.user?.studentId;
            if (!studentId)
                return res.status(400).json({ error: 'Student ID required' });
            const parsed = index_1.ExamApplicationSubmitSchema.parse({ ...req.body, studentId });
            const application = await domainServices_1.ExamApplicationService.submitApplication(parsed);
            return res.status(201).json(application);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStudentApplications(req, res) {
        try {
            const studentId = req.params.studentId || req.user?.studentId;
            if (!studentId)
                return res.status(400).json({ error: 'Student ID required' });
            const list = await domainServices_1.ExamApplicationService.getStudentApplications(studentId);
            return res.json(list);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    // 4. Review & Exceptions
    static async getReviewQueue(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const queue = await domainServices_1.ExamApplicationService.getReviewQueue(cycleId);
            return res.json(queue);
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
    static async grantException(req, res) {
        try {
            const grantedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const parsed = index_1.ExamExceptionGrantSchema.parse({ ...req.body, grantedBy });
            const result = await domainServices_1.ExamApplicationService.grantException(parsed);
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async reviewApplication(req, res) {
        try {
            const reviewerId = req.user?.email || 'EXAM_OFFICER';
            const { decision, rejectionReason } = req.body;
            const result = await domainServices_1.ExamApplicationService.reviewApplication({
                applicationId: req.params.id,
                reviewerId,
                decision,
                rejectionReason
            });
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 5. Roll Number Assignment
    static async assignRollNumber(req, res) {
        try {
            const assignedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const parsed = index_1.RollNumberAssignSchema.parse(req.body);
            const result = await domainServices_1.ExamApplicationService.assignRollNumber({ ...parsed, assignedBy });
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 6. Hall Tickets
    static async issueHallTicket(req, res) {
        try {
            const issuedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const parsed = index_1.HallTicketIssueSchema.parse(req.body);
            const ticket = await domainServices_1.ExamApplicationService.issueHallTicket({ ...parsed, issuedBy });
            return res.status(201).json(ticket);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStudentHallTicket(req, res) {
        try {
            const requestingStudentId = req.user?.studentId || req.query.studentId;
            if (!requestingStudentId) {
                return res.status(400).json({ error: 'Requesting student ID required' });
            }
            const ticket = await domainServices_1.ExamApplicationService.getStudentHallTicket(req.params.id, requestingStudentId);
            return res.json(ticket);
        }
        catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async payFee(req, res) {
        try {
            const application = await domainServices_1.ExamApplicationService.payApplicationFee(req.params.id);
            return res.status(200).json(application);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ExamApplicationController = ExamApplicationController;
// ==========================================
// 19. M12 EXAM OPERATIONS CONTROLLER
// ==========================================
class ExamOperationsController {
    // 1. Centers & Verification
    static async createCenter(req, res) {
        try {
            const parsed = index_1.ExamCenterCreateSchema.parse(req.body);
            const center = await domainServices_1.ExamOperationsService.createCenter(parsed);
            return res.status(201).json(center);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getCenters(req, res) {
        try {
            const institutionId = req.query.institutionId || req.user?.institutionId?.toString();
            const centers = await domainServices_1.ExamOperationsService.getCenters(institutionId);
            return res.json(centers);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getCenterById(req, res) {
        try {
            const center = await domainServices_1.ExamOperationsService.getCenterById(req.params.id);
            return res.json(center);
        }
        catch (err) {
            return res.status(404).json({ error: err.message });
        }
    }
    static async verifyCenter(req, res) {
        try {
            const parsed = index_1.CenterVerificationSchema.parse(req.body);
            const verifiedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const institutionId = req.user?.institutionId?.toString() || '';
            const verification = await domainServices_1.ExamOperationsService.verifyCenter({
                ...parsed,
                institutionId,
                verifiedBy
            });
            return res.status(200).json(verification);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getVerifications(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const centerId = req.query.centerId;
            const verifications = await domainServices_1.ExamOperationsService.getVerifications(cycleId, centerId);
            return res.json(verifications);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 2. Exam Scheduling & Conflicts
    static async createSchedule(req, res) {
        try {
            const parsed = index_1.ExamScheduleCreateSchema.parse(req.body);
            const schedule = await domainServices_1.ExamOperationsService.createSchedule(parsed);
            return res.status(201).json(schedule);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getSchedules(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const institutionId = req.query.institutionId || req.user?.institutionId?.toString();
            const schedules = await domainServices_1.ExamOperationsService.getSchedules(cycleId, institutionId);
            return res.json(schedules);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async publishSchedule(req, res) {
        try {
            const publishedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const schedule = await domainServices_1.ExamOperationsService.publishSchedule(req.params.id, publishedBy);
            return res.json(schedule);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 3. Seating Allocation & Reallocation
    static async allocateSeats(req, res) {
        try {
            const parsed = index_1.SeatingAllocationCreateSchema.parse(req.body);
            const allocatedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const allocations = await domainServices_1.ExamOperationsService.allocateSeats({
                ...parsed,
                allocatedBy
            });
            return res.status(201).json(allocations);
        }
        catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async reallocateSeat(req, res) {
        try {
            const parsed = index_1.SeatingReallocationSchema.parse(req.body);
            const reallocatedBy = req.user?.email || 'EXAM_OFFICE';
            const reallocated = await domainServices_1.ExamOperationsService.reallocateSeat({
                ...parsed,
                reallocatedBy
            });
            return res.status(200).json(reallocated);
        }
        catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async getRoomAllocations(req, res) {
        try {
            const roomId = req.query.roomId;
            const allocations = await domainServices_1.ExamOperationsService.getRoomAllocations(req.params.scheduleId, roomId);
            return res.json(allocations);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getStudentAllocation(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const studentId = req.params.studentId || req.user?.studentId;
            if (!studentId)
                return res.status(400).json({ error: 'Student ID required' });
            const allocations = await domainServices_1.ExamOperationsService.getStudentAllocation(cycleId, studentId);
            return res.json(allocations);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 4. Invigilation Duty
    static async assignInvigilator(req, res) {
        try {
            const parsed = index_1.InvigilationDutyAssignSchema.parse(req.body);
            const assignedBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const duty = await domainServices_1.ExamOperationsService.assignInvigilator({
                ...parsed,
                assignedBy
            });
            return res.status(201).json(duty);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async acknowledgeDuty(req, res) {
        try {
            const parsed = index_1.InvigilationAcknowledgeSchema.parse(req.body);
            const facultyId = req.user?.userId || '';
            const duty = await domainServices_1.ExamOperationsService.acknowledgeDuty({
                ...parsed,
                facultyId
            });
            return res.status(200).json(duty);
        }
        catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async markDutyAbsent(req, res) {
        try {
            const markedBy = req.user?.email || 'EXAM_SUPERINTENDENT';
            const duty = await domainServices_1.ExamOperationsService.markDutyAbsent(req.body.dutyId, markedBy, req.body.remarks);
            return res.status(200).json(duty);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getDutyRoster(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const centerId = req.query.centerId;
            const facultyId = req.query.facultyId;
            const roster = await domainServices_1.ExamOperationsService.getDutyRoster(cycleId, centerId, facultyId);
            return res.json(roster);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    // 5. Materials Management
    static async createMaterialBatch(req, res) {
        try {
            const parsed = index_1.MaterialBatchCreateSchema.parse(req.body);
            const batch = await domainServices_1.ExamOperationsService.createMaterialBatch(parsed);
            return res.status(201).json(batch);
        }
        catch (err) {
            const status = err.statusCode || 400;
            return res.status(status).json({ error: err.message });
        }
    }
    static async getBatches(req, res) {
        try {
            const cycleId = req.query.cycleId;
            const institutionId = req.query.institutionId || req.user?.institutionId?.toString();
            // Check if user is exam staff
            const isExamStaff = [index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN].includes(req.user?.role);
            const batches = await domainServices_1.ExamOperationsService.getBatches(cycleId, institutionId, isExamStaff);
            return res.json(batches);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async dispatchMaterials(req, res) {
        try {
            const handledBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const result = await domainServices_1.ExamOperationsService.dispatchMaterials({
                ...req.body,
                handledBy
            });
            return res.status(201).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async recordMovement(req, res) {
        try {
            const parsed = index_1.MaterialMovementCreateSchema.parse(req.body);
            const handledBy = req.user?.email || 'EXAM_OFFICE';
            const movement = await domainServices_1.ExamOperationsService.recordMovement({
                ...parsed,
                handledBy
            });
            return res.status(201).json(movement);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async acknowledgeMovement(req, res) {
        try {
            const acknowledgedBy = req.user?.email || 'CENTER_SUPERINTENDENT';
            const movement = await domainServices_1.ExamOperationsService.acknowledgeMaterialReceipt(req.body.movementId, acknowledgedBy);
            return res.status(200).json(movement);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async reconcileBatch(req, res) {
        try {
            const parsed = index_1.MaterialReconcileSchema.parse(req.body);
            const reconciledBy = req.user?.email || 'CONTROLLER_OF_EXAMINATIONS';
            const result = await domainServices_1.ExamOperationsService.reconcileBatch({
                ...parsed,
                reconciledBy
            });
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
    static async getMovements(req, res) {
        try {
            const batchId = req.query.batchId;
            const movements = await domainServices_1.ExamOperationsService.getMovements(batchId);
            return res.json(movements);
        }
        catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}
exports.ExamOperationsController = ExamOperationsController;

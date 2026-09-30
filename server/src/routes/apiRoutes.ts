import { Router } from 'express';
import { authenticate, validateCSRF } from '../middleware/auth';
import { requireRole, enforceScope } from '../middleware/rbac';
import { UserRole } from '@shared/index';

import {
  AuthController,
  InstitutionController,
  StudentController,
  AcademicController,
  ExamController,
  FeeController,
  PayrollController,
  FacilityController,
  PlacementController,
  SupportController,
  AnalyticsController,
  SystemController,
  AdmissionsController,
  StudentLifecycleController,
  AttendanceController,
  TimetableController,
  FinanceController,
  ExamApplicationController,
  ExamOperationsController,
  QuestionPaperController
} from '../controllers/apiControllers';

const router = Router();

// Apply CSRF validation to all non-GET mutating routes
router.use(validateCSRF);

// 1. AUTH ROUTES
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/logout', authenticate, AuthController.logout);
router.get('/auth/me', authenticate, AuthController.me);

// 2. INSTITUTION & DEPARTMENT ROUTES
router.get('/institutions', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), InstitutionController.list);
router.post('/institutions', authenticate, requireRole(UserRole.SUPER_ADMIN), InstitutionController.create);
router.get('/departments', authenticate, InstitutionController.listDepartments);
router.post('/departments', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), InstitutionController.createDepartment);

// 3. STUDENT ROUTES
router.get('/students', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY, UserRole.FINANCE), StudentController.list);
router.get('/students/:id', authenticate, enforceScope, StudentController.getById);
router.post('/students', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), StudentController.create);

// 4. ACADEMICS & ATTENDANCE
router.get('/courses', authenticate, AcademicController.listCourses);
router.post('/courses', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), AcademicController.createCourse);
router.get('/timetable', authenticate, AcademicController.getTimetable);
router.post('/timetable', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), AcademicController.createTimetable);
router.post('/attendance', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN), AcademicController.submitAttendance);
router.get('/attendance/summary', authenticate, AcademicController.getAttendanceSummary);

// 5. EXAMS & MARKS
router.get('/exams', authenticate, ExamController.listExams);
router.post('/exams', authenticate, requireRole(UserRole.ADMIN, UserRole.FACULTY), ExamController.createExam);
router.post('/exams/marks', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN), ExamController.submitMarks);
router.get('/exams/report-card/:studentId', authenticate, enforceScope, ExamController.getReportCard);

// 6. FEES & PAYROLL
router.post('/fees/pay', authenticate, enforceScope, FeeController.payFee);
router.get('/fees/ledger/:studentId', authenticate, enforceScope, FeeController.getLedger);
router.get('/fees/structures', authenticate, FeeController.getStructures);
router.post('/fees/structures', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FeeController.createStructure);
router.post('/payroll/approve', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), PayrollController.approve);
router.get('/payroll/slips', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), PayrollController.getSlips);

// M10: FINANCE, PAYMENTS & RECONCILIATION
router.get('/finance/rules', authenticate, FinanceController.getRules);
router.post('/finance/rules', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.createRule);
router.post('/finance/invoices/assess', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.assessInvoice);
router.get('/finance/invoices/student/:studentId', authenticate, enforceScope, FinanceController.getStudentInvoices);
router.post('/finance/orders/create', authenticate, enforceScope, FinanceController.createOrder);
router.post('/finance/orders/simulate-callback', authenticate, FinanceController.simulatorCallback);
router.post('/finance/simulator/sign', authenticate, FinanceController.generateSignature);
router.post('/finance/refunds/request', authenticate, enforceScope, FinanceController.requestRefund);
router.post('/finance/refunds/:refundId/approve', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.approveRefund);
router.post('/finance/concessions/request', authenticate, enforceScope, FinanceController.requestConcession);
router.post('/finance/concessions/:concessionId/review', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.reviewConcession);
router.post('/finance/reconciliation/run', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.runReconciliation);
router.get('/finance/dashboard', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.getDashboard);
router.get('/finance/funds', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.listFunds);
router.post('/finance/funds', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.createFund);
router.get('/finance/budgets', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.listBudgets);
router.post('/finance/budgets', authenticate, requireRole(UserRole.FINANCE, UserRole.ADMIN), FinanceController.createBudget);

// 7. FACILITIES (HOSTEL, TRANSPORT, LIBRARY)
router.get('/hostels', authenticate, FacilityController.getHostels);
router.post('/hostels/gatepass', authenticate, FacilityController.createGatePass);
router.get('/hostels/gatepasses', authenticate, requireRole(UserRole.WARDEN, UserRole.ADMIN), FacilityController.getGatePasses);
router.get('/transport/routes', authenticate, FacilityController.getRoutes);
router.post('/transport/buspass', authenticate, FacilityController.createBusPass);
router.get('/library/books', authenticate, FacilityController.getBooks);
router.post('/library/issue', authenticate, FacilityController.issueBook);

// 8. PLACEMENT & ALUMNI
router.get('/placement/drives', authenticate, PlacementController.getDrives);
router.post('/placement/drives', authenticate, requireRole(UserRole.PLACEMENT_OFFICER, UserRole.ADMIN), PlacementController.createDrive);
router.post('/placement/apply', authenticate, requireRole(UserRole.STUDENT), PlacementController.applyDrive);
router.get('/alumni', authenticate, PlacementController.getAlumni);

// 9. SUPPORT & COMMUNICATIONS
router.get('/support/grievances', authenticate, SupportController.getGrievances);
router.post('/support/grievances', authenticate, SupportController.createGrievance);
router.get('/notices', authenticate, SupportController.getNotices);
router.post('/notices', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), SupportController.createNotice);
router.get('/system/outbox', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), SupportController.getOutbox);

// 10. ANALYTICS & SYSTEM DEMO RESET
router.get('/analytics/dashboard-summary', authenticate, AnalyticsController.getDashboardSummary);
router.get('/analytics/dropout-risk', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY), AnalyticsController.getDropoutRisk);
router.post('/system/reset-demo', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), SystemController.resetDemo);
router.get('/system/audit-logs', authenticate, requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN), SystemController.getAuditLogs);

// 11. M06 ADMISSIONS & ENROLLMENT
router.post('/admissions/apply', AdmissionsController.apply);
router.get('/admissions/applications', authenticate, AdmissionsController.listApplications);
router.get('/admissions/applications/:id', authenticate, AdmissionsController.getApplicationById);
router.post('/admissions/applications/:id/correct', AdmissionsController.correctApplication);
router.post('/admissions/applications/:id/review', authenticate, AdmissionsController.reviewApplication);
router.post('/admissions/applications/:id/enroll', authenticate, AdmissionsController.enrollCandidate);
router.post('/admissions/imports/dry-run', authenticate, AdmissionsController.csvDryRun);
router.post('/admissions/imports/commit', authenticate, AdmissionsController.csvCommit);
router.get('/admissions/imports/errors/:batchId/download', AdmissionsController.downloadImportErrors);
router.get('/admissions/mappings', authenticate, AdmissionsController.listMappings);
router.post('/admissions/mappings', authenticate, AdmissionsController.createOrUpdateMapping);
router.get('/admissions/enrollments', authenticate, AdmissionsController.listEnrollments);

// 12. M07 STUDENT LIFECYCLE & UNIFIED RECORD (STUDENT 360)
router.get('/students/360/:id', authenticate, StudentLifecycleController.getStudent360);
router.post('/students/profile-change-requests', authenticate, StudentLifecycleController.requestProfileCorrection);
router.post('/students/profile-change-requests/:id/approve', authenticate, StudentLifecycleController.approveProfileCorrection);
router.get('/students/documents/:studentId', authenticate, StudentLifecycleController.getStudentDocuments);
router.post('/students/documents', authenticate, StudentLifecycleController.uploadStudentDocument);
router.post('/students/progress', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentLifecycleController.progressTerm);
router.post('/students/transfer', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentLifecycleController.transferStudent);
router.post('/students/withdraw', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentLifecycleController.withdrawStudent);
router.post('/students/graduation-check/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentLifecycleController.performGraduationCheck);
router.post('/students/graduate/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StudentLifecycleController.graduateStudent);

// 13. M08 ATTENDANCE & ACADEMIC ENGAGEMENT
router.post('/attendance/capture', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN, UserRole.SUPER_ADMIN), AttendanceController.captureAttendance);
router.get('/attendance/sessions', authenticate, AttendanceController.getSessions);
router.get('/attendance/my-attendance', authenticate, AttendanceController.getMyAttendance);
router.get('/attendance/student/:studentId', authenticate, AttendanceController.getStudentAttendance);
router.post('/attendance/corrections', authenticate, AttendanceController.requestCorrection);
router.get('/attendance/corrections', authenticate, AttendanceController.getCorrections);
router.post('/attendance/corrections/:id/review', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN, UserRole.SUPER_ADMIN), AttendanceController.reviewCorrection);
router.post('/attendance/bulk-upload', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN, UserRole.SUPER_ADMIN), AttendanceController.bulkUploadAttendance);
router.get('/attendance/reports', authenticate, AttendanceController.getReports);
router.post('/attendance/policy', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), AttendanceController.configurePolicy);

// 14. M09 TIMETABLE, ROOMS & ACADEMIC CALENDAR
router.get('/timetable/calendar', authenticate, TimetableController.getCalendarSchedule);
router.post('/timetable/entries', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TimetableController.createScheduleEntry);
router.post('/timetable/reschedule', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN, UserRole.SUPER_ADMIN), TimetableController.rescheduleInstance);
router.get('/timetable/rooms', authenticate, TimetableController.getRooms);
router.post('/timetable/rooms', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TimetableController.createRoom);
router.get('/timetable/events', authenticate, TimetableController.getEvents);
router.post('/timetable/events', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TimetableController.createEvent);

// 15. M11 EXAM APPLICATIONS, ELIGIBILITY & HALL TICKETS
router.get('/exam-applications/cycles', authenticate, ExamApplicationController.getCycles);
router.post('/exam-applications/cycles', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.createCycle);
router.get('/exam-applications/cycles/:id', authenticate, ExamApplicationController.getCycleById);
router.post('/exam-applications/cycles/:cycleId/policy', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.updatePolicy);

router.get('/exam-applications/eligibility/:cycleId/:studentId', authenticate, ExamApplicationController.checkEligibility);
router.post('/exam-applications/apply', authenticate, ExamApplicationController.submitApplication);
router.get('/exam-applications/student/:studentId', authenticate, ExamApplicationController.getStudentApplications);

router.get('/exam-applications/review', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), ExamApplicationController.getReviewQueue);
router.post('/exam-applications/exceptions/grant', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.grantException);
router.post('/exam-applications/review/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.reviewApplication);

router.post('/exam-applications/roll-numbers/assign', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.assignRollNumber);
router.post('/exam-applications/hall-tickets/issue', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamApplicationController.issueHallTicket);
router.get('/exam-applications/hall-tickets/:id', authenticate, ExamApplicationController.getStudentHallTicket);
router.post('/exam-applications/:id/pay', authenticate, ExamApplicationController.payFee);

// 16. M12 EXAM SCHEDULING, CENTERS & MATERIALS
// Centers & Verifications
router.get('/exam-operations/centers', authenticate, ExamOperationsController.getCenters);
router.post('/exam-operations/centers', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.createCenter);
router.get('/exam-operations/centers/:id', authenticate, ExamOperationsController.getCenterById);
router.post('/exam-operations/centers/verify', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.verifyCenter);
router.get('/exam-operations/verifications', authenticate, ExamOperationsController.getVerifications);

// Schedule & Conflicts
router.get('/exam-operations/schedule', authenticate, ExamOperationsController.getSchedules);
router.post('/exam-operations/schedule', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.createSchedule);
router.post('/exam-operations/schedule/:id/publish', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.publishSchedule);

// Seating Allocations
router.post('/exam-operations/seating/allocate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.allocateSeats);
router.post('/exam-operations/seating/reallocate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.reallocateSeat);
router.get('/exam-operations/seating/schedule/:scheduleId', authenticate, ExamOperationsController.getRoomAllocations);
router.get('/exam-operations/seating/student/:studentId', authenticate, ExamOperationsController.getStudentAllocation);

// Invigilation Duty
router.post('/exam-operations/invigilators/assign', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.assignInvigilator);
router.post('/exam-operations/invigilators/acknowledge', authenticate, ExamOperationsController.acknowledgeDuty);
router.post('/exam-operations/invigilators/mark-absent', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.markDutyAbsent);
router.get('/exam-operations/invigilators/roster', authenticate, ExamOperationsController.getDutyRoster);

// Materials Management
router.post('/exam-operations/materials/batches', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.createMaterialBatch);
router.get('/exam-operations/materials/batches', authenticate, ExamOperationsController.getBatches);
router.post('/exam-operations/materials/dispatch', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.dispatchMaterials);
router.post('/exam-operations/materials/movement', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.recordMovement);
router.post('/exam-operations/materials/acknowledge', authenticate, ExamOperationsController.acknowledgeMovement);
router.post('/exam-operations/materials/reconcile', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ExamOperationsController.reconcileBatch);
router.get('/exam-operations/materials/movements', authenticate, ExamOperationsController.getMovements);

// ==========================================
// M13: QUESTION PAPERS & CONFIDENTIAL QUESTION BANK
// ==========================================

// Appointments
router.post('/question-papers/appointments', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), QuestionPaperController.createAppointment);
router.get('/question-papers/appointments', authenticate, QuestionPaperController.getAppointments);
router.post('/question-papers/appointments/respond', authenticate, QuestionPaperController.respondAppointment);

// Question Bank
router.post('/question-papers/question-bank', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), QuestionPaperController.createQuestion);
router.get('/question-papers/question-bank', authenticate, QuestionPaperController.getQuestions);

// Paper Versions & Workflow
router.post('/question-papers/papers/submit', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), QuestionPaperController.submitPaperVersion);
router.get('/question-papers/papers', authenticate, QuestionPaperController.getPaperVersions);
router.get('/question-papers/papers/:id', authenticate, QuestionPaperController.getPaperVersionById);
router.post('/question-papers/papers/review', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), QuestionPaperController.reviewPaperVersion);
router.post('/question-papers/papers/release', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), QuestionPaperController.releasePaper);

// Controlled Access & Downloads
router.post('/question-papers/papers/:id/download', authenticate, QuestionPaperController.downloadPaper);
router.get('/question-papers/access-logs', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), QuestionPaperController.getAccessLogs);

export default router;


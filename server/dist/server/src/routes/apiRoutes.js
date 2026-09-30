"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const index_1 = require("@shared/index");
const apiControllers_1 = require("../controllers/apiControllers");
const router = (0, express_1.Router)();
// Apply CSRF validation to all non-GET mutating routes
router.use(auth_1.validateCSRF);
// 1. AUTH ROUTES
router.post('/auth/login', apiControllers_1.AuthController.login);
router.post('/auth/register', apiControllers_1.AuthController.register);
router.post('/auth/logout', auth_1.authenticate, apiControllers_1.AuthController.logout);
router.get('/auth/me', auth_1.authenticate, apiControllers_1.AuthController.me);
// 2. INSTITUTION & DEPARTMENT ROUTES
router.get('/institutions', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.InstitutionController.list);
router.post('/institutions', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN), apiControllers_1.InstitutionController.create);
router.get('/departments', auth_1.authenticate, apiControllers_1.InstitutionController.listDepartments);
router.post('/departments', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.InstitutionController.createDepartment);
// 3. STUDENT ROUTES
router.get('/students', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.FACULTY, index_1.UserRole.FINANCE), apiControllers_1.StudentController.list);
router.get('/students/:id', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.StudentController.getById);
router.post('/students', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.StudentController.create);
// 4. ACADEMICS & ATTENDANCE
router.get('/courses', auth_1.authenticate, apiControllers_1.AcademicController.listCourses);
router.post('/courses', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.AcademicController.createCourse);
router.get('/timetable', auth_1.authenticate, apiControllers_1.AcademicController.getTimetable);
router.post('/timetable', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.AcademicController.createTimetable);
router.post('/attendance', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN), apiControllers_1.AcademicController.submitAttendance);
router.get('/attendance/summary', auth_1.authenticate, apiControllers_1.AcademicController.getAttendanceSummary);
// 5. EXAMS & MARKS
router.get('/exams', auth_1.authenticate, apiControllers_1.ExamController.listExams);
router.post('/exams', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.FACULTY), apiControllers_1.ExamController.createExam);
router.post('/exams/marks', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN), apiControllers_1.ExamController.submitMarks);
router.get('/exams/report-card/:studentId', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.ExamController.getReportCard);
// 6. FEES & PAYROLL
router.post('/fees/pay', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FeeController.payFee);
router.get('/fees/ledger/:studentId', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FeeController.getLedger);
router.get('/fees/structures', auth_1.authenticate, apiControllers_1.FeeController.getStructures);
router.post('/fees/structures', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FeeController.createStructure);
router.post('/payroll/approve', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.PayrollController.approve);
router.get('/payroll/slips', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.PayrollController.getSlips);
// M10: FINANCE, PAYMENTS & RECONCILIATION
router.get('/finance/rules', auth_1.authenticate, apiControllers_1.FinanceController.getRules);
router.post('/finance/rules', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.createRule);
router.post('/finance/invoices/assess', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.assessInvoice);
router.get('/finance/invoices/student/:studentId', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FinanceController.getStudentInvoices);
router.post('/finance/orders/create', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FinanceController.createOrder);
router.post('/finance/orders/simulate-callback', auth_1.authenticate, apiControllers_1.FinanceController.simulatorCallback);
router.post('/finance/simulator/sign', auth_1.authenticate, apiControllers_1.FinanceController.generateSignature);
router.post('/finance/refunds/request', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FinanceController.requestRefund);
router.post('/finance/refunds/:refundId/approve', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.approveRefund);
router.post('/finance/concessions/request', auth_1.authenticate, rbac_1.enforceScope, apiControllers_1.FinanceController.requestConcession);
router.post('/finance/concessions/:concessionId/review', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.reviewConcession);
router.post('/finance/reconciliation/run', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.runReconciliation);
router.get('/finance/dashboard', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.getDashboard);
router.get('/finance/funds', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.listFunds);
router.post('/finance/funds', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.createFund);
router.get('/finance/budgets', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.listBudgets);
router.post('/finance/budgets', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FINANCE, index_1.UserRole.ADMIN), apiControllers_1.FinanceController.createBudget);
// 7. FACILITIES (HOSTEL, TRANSPORT, LIBRARY)
router.get('/hostels', auth_1.authenticate, apiControllers_1.FacilityController.getHostels);
router.post('/hostels/gatepass', auth_1.authenticate, apiControllers_1.FacilityController.createGatePass);
router.get('/hostels/gatepasses', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.WARDEN, index_1.UserRole.ADMIN), apiControllers_1.FacilityController.getGatePasses);
router.get('/transport/routes', auth_1.authenticate, apiControllers_1.FacilityController.getRoutes);
router.post('/transport/buspass', auth_1.authenticate, apiControllers_1.FacilityController.createBusPass);
router.get('/library/books', auth_1.authenticate, apiControllers_1.FacilityController.getBooks);
router.post('/library/issue', auth_1.authenticate, apiControllers_1.FacilityController.issueBook);
// 8. PLACEMENT & ALUMNI
router.get('/placement/drives', auth_1.authenticate, apiControllers_1.PlacementController.getDrives);
router.post('/placement/drives', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.PLACEMENT_OFFICER, index_1.UserRole.ADMIN), apiControllers_1.PlacementController.createDrive);
router.post('/placement/apply', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.STUDENT), apiControllers_1.PlacementController.applyDrive);
router.get('/alumni', auth_1.authenticate, apiControllers_1.PlacementController.getAlumni);
// 9. SUPPORT & COMMUNICATIONS
router.get('/support/grievances', auth_1.authenticate, apiControllers_1.SupportController.getGrievances);
router.post('/support/grievances', auth_1.authenticate, apiControllers_1.SupportController.createGrievance);
router.get('/notices', auth_1.authenticate, apiControllers_1.SupportController.getNotices);
router.post('/notices', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.SupportController.createNotice);
router.get('/system/outbox', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.SupportController.getOutbox);
// 10. ANALYTICS & SYSTEM DEMO RESET
router.get('/analytics/dashboard-summary', auth_1.authenticate, apiControllers_1.AnalyticsController.getDashboardSummary);
router.get('/analytics/dropout-risk', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN, index_1.UserRole.FACULTY), apiControllers_1.AnalyticsController.getDropoutRisk);
router.post('/system/reset-demo', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.SystemController.resetDemo);
router.get('/system/audit-logs', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.SUPER_ADMIN, index_1.UserRole.ADMIN), apiControllers_1.SystemController.getAuditLogs);
// 11. M06 ADMISSIONS & ENROLLMENT
router.post('/admissions/apply', apiControllers_1.AdmissionsController.apply);
router.get('/admissions/applications', auth_1.authenticate, apiControllers_1.AdmissionsController.listApplications);
router.get('/admissions/applications/:id', auth_1.authenticate, apiControllers_1.AdmissionsController.getApplicationById);
router.post('/admissions/applications/:id/correct', apiControllers_1.AdmissionsController.correctApplication);
router.post('/admissions/applications/:id/review', auth_1.authenticate, apiControllers_1.AdmissionsController.reviewApplication);
router.post('/admissions/applications/:id/enroll', auth_1.authenticate, apiControllers_1.AdmissionsController.enrollCandidate);
router.post('/admissions/imports/dry-run', auth_1.authenticate, apiControllers_1.AdmissionsController.csvDryRun);
router.post('/admissions/imports/commit', auth_1.authenticate, apiControllers_1.AdmissionsController.csvCommit);
router.get('/admissions/imports/errors/:batchId/download', apiControllers_1.AdmissionsController.downloadImportErrors);
router.get('/admissions/mappings', auth_1.authenticate, apiControllers_1.AdmissionsController.listMappings);
router.post('/admissions/mappings', auth_1.authenticate, apiControllers_1.AdmissionsController.createOrUpdateMapping);
router.get('/admissions/enrollments', auth_1.authenticate, apiControllers_1.AdmissionsController.listEnrollments);
// 12. M07 STUDENT LIFECYCLE & UNIFIED RECORD (STUDENT 360)
router.get('/students/360/:id', auth_1.authenticate, apiControllers_1.StudentLifecycleController.getStudent360);
router.post('/students/profile-change-requests', auth_1.authenticate, apiControllers_1.StudentLifecycleController.requestProfileCorrection);
router.post('/students/profile-change-requests/:id/approve', auth_1.authenticate, apiControllers_1.StudentLifecycleController.approveProfileCorrection);
router.get('/students/documents/:studentId', auth_1.authenticate, apiControllers_1.StudentLifecycleController.getStudentDocuments);
router.post('/students/documents', auth_1.authenticate, apiControllers_1.StudentLifecycleController.uploadStudentDocument);
router.post('/students/progress', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.StudentLifecycleController.progressTerm);
router.post('/students/transfer', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.StudentLifecycleController.transferStudent);
router.post('/students/withdraw', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.StudentLifecycleController.withdrawStudent);
router.post('/students/graduation-check/:id', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.StudentLifecycleController.performGraduationCheck);
router.post('/students/graduate/:id', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.StudentLifecycleController.graduateStudent);
// 13. M08 ATTENDANCE & ACADEMIC ENGAGEMENT
router.post('/attendance/capture', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.AttendanceController.captureAttendance);
router.get('/attendance/sessions', auth_1.authenticate, apiControllers_1.AttendanceController.getSessions);
router.get('/attendance/my-attendance', auth_1.authenticate, apiControllers_1.AttendanceController.getMyAttendance);
router.get('/attendance/student/:studentId', auth_1.authenticate, apiControllers_1.AttendanceController.getStudentAttendance);
router.post('/attendance/corrections', auth_1.authenticate, apiControllers_1.AttendanceController.requestCorrection);
router.get('/attendance/corrections', auth_1.authenticate, apiControllers_1.AttendanceController.getCorrections);
router.post('/attendance/corrections/:id/review', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.AttendanceController.reviewCorrection);
router.post('/attendance/bulk-upload', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.AttendanceController.bulkUploadAttendance);
router.get('/attendance/reports', auth_1.authenticate, apiControllers_1.AttendanceController.getReports);
router.post('/attendance/policy', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.AttendanceController.configurePolicy);
// 14. M09 TIMETABLE, ROOMS & ACADEMIC CALENDAR
router.get('/timetable/calendar', auth_1.authenticate, apiControllers_1.TimetableController.getCalendarSchedule);
router.post('/timetable/entries', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.TimetableController.createScheduleEntry);
router.post('/timetable/reschedule', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.FACULTY, index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.TimetableController.rescheduleInstance);
router.get('/timetable/rooms', auth_1.authenticate, apiControllers_1.TimetableController.getRooms);
router.post('/timetable/rooms', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.TimetableController.createRoom);
router.get('/timetable/events', auth_1.authenticate, apiControllers_1.TimetableController.getEvents);
router.post('/timetable/events', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.TimetableController.createEvent);
// 15. M11 EXAM APPLICATIONS, ELIGIBILITY & HALL TICKETS
router.get('/exam-applications/cycles', auth_1.authenticate, apiControllers_1.ExamApplicationController.getCycles);
router.post('/exam-applications/cycles', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.createCycle);
router.get('/exam-applications/cycles/:id', auth_1.authenticate, apiControllers_1.ExamApplicationController.getCycleById);
router.post('/exam-applications/cycles/:cycleId/policy', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.updatePolicy);
router.get('/exam-applications/eligibility/:cycleId/:studentId', auth_1.authenticate, apiControllers_1.ExamApplicationController.checkEligibility);
router.post('/exam-applications/apply', auth_1.authenticate, apiControllers_1.ExamApplicationController.submitApplication);
router.get('/exam-applications/student/:studentId', auth_1.authenticate, apiControllers_1.ExamApplicationController.getStudentApplications);
router.get('/exam-applications/review', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN, index_1.UserRole.FACULTY), apiControllers_1.ExamApplicationController.getReviewQueue);
router.post('/exam-applications/exceptions/grant', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.grantException);
router.post('/exam-applications/review/:id', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.reviewApplication);
router.post('/exam-applications/roll-numbers/assign', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.assignRollNumber);
router.post('/exam-applications/hall-tickets/issue', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamApplicationController.issueHallTicket);
router.get('/exam-applications/hall-tickets/:id', auth_1.authenticate, apiControllers_1.ExamApplicationController.getStudentHallTicket);
router.post('/exam-applications/:id/pay', auth_1.authenticate, apiControllers_1.ExamApplicationController.payFee);
// 16. M12 EXAM SCHEDULING, CENTERS & MATERIALS
// Centers & Verifications
router.get('/exam-operations/centers', auth_1.authenticate, apiControllers_1.ExamOperationsController.getCenters);
router.post('/exam-operations/centers', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.createCenter);
router.get('/exam-operations/centers/:id', auth_1.authenticate, apiControllers_1.ExamOperationsController.getCenterById);
router.post('/exam-operations/centers/verify', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.verifyCenter);
router.get('/exam-operations/verifications', auth_1.authenticate, apiControllers_1.ExamOperationsController.getVerifications);
// Schedule & Conflicts
router.get('/exam-operations/schedule', auth_1.authenticate, apiControllers_1.ExamOperationsController.getSchedules);
router.post('/exam-operations/schedule', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.createSchedule);
router.post('/exam-operations/schedule/:id/publish', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.publishSchedule);
// Seating Allocations
router.post('/exam-operations/seating/allocate', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.allocateSeats);
router.post('/exam-operations/seating/reallocate', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.reallocateSeat);
router.get('/exam-operations/seating/schedule/:scheduleId', auth_1.authenticate, apiControllers_1.ExamOperationsController.getRoomAllocations);
router.get('/exam-operations/seating/student/:studentId', auth_1.authenticate, apiControllers_1.ExamOperationsController.getStudentAllocation);
// Invigilation Duty
router.post('/exam-operations/invigilators/assign', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.assignInvigilator);
router.post('/exam-operations/invigilators/acknowledge', auth_1.authenticate, apiControllers_1.ExamOperationsController.acknowledgeDuty);
router.post('/exam-operations/invigilators/mark-absent', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.markDutyAbsent);
router.get('/exam-operations/invigilators/roster', auth_1.authenticate, apiControllers_1.ExamOperationsController.getDutyRoster);
// Materials Management
router.post('/exam-operations/materials/batches', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.createMaterialBatch);
router.get('/exam-operations/materials/batches', auth_1.authenticate, apiControllers_1.ExamOperationsController.getBatches);
router.post('/exam-operations/materials/dispatch', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.dispatchMaterials);
router.post('/exam-operations/materials/movement', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.recordMovement);
router.post('/exam-operations/materials/acknowledge', auth_1.authenticate, apiControllers_1.ExamOperationsController.acknowledgeMovement);
router.post('/exam-operations/materials/reconcile', auth_1.authenticate, (0, rbac_1.requireRole)(index_1.UserRole.ADMIN, index_1.UserRole.SUPER_ADMIN), apiControllers_1.ExamOperationsController.reconcileBatch);
router.get('/exam-operations/materials/movements', auth_1.authenticate, apiControllers_1.ExamOperationsController.getMovements);
exports.default = router;

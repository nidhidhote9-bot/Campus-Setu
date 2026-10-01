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
  QuestionPaperController,
  AssessmentController,
  ResultController,
  RevaluationController,
  CertificateController,
  HelpdeskController,
  HostelController,
  TransportController,
  CommunicationController,
  GuardianController,
  GovernanceController,
  RegisterController,
  StaffController,
  LibraryController,
  InventoryController,
  MISController,
  AssistantController,
  PredictionController,
  LearningController,
  MobileController,
  DemoOperationsController,
  ReleaseAuditController
} from '../controllers/apiControllers';

const router = Router();

// Apply CSRF validation to all non-GET mutating routes
router.use(validateCSRF);

// ==========================================
// M21: PARENT AND GUARDIAN PORTAL
// ==========================================
router.post('/guardians/invitations', authenticate, GuardianController.inviteGuardian);
router.post('/guardians/linking/verify', authenticate, GuardianController.verifyLink);
router.get('/guardians/links', authenticate, GuardianController.getLinks);
router.put('/guardians/permissions', authenticate, GuardianController.updatePermissions);
router.post('/guardians/linking/revoke', authenticate, GuardianController.revokeLink);
router.get('/guardians/student/:studentId/summary', authenticate, GuardianController.getStudentSummary);
router.get('/guardians/student/:studentId/attendance', authenticate, GuardianController.getStudentAttendance);
router.get('/guardians/student/:studentId/fees', authenticate, GuardianController.getStudentFees);
router.get('/guardians/student/:studentId/results', authenticate, GuardianController.getStudentResults);
router.get('/guardians/student/:studentId/notices', authenticate, GuardianController.getStudentNotices);
router.get('/guardians/student/:studentId/tickets', authenticate, GuardianController.attemptStudentTickets);
router.get('/guardians/access-logs', authenticate, GuardianController.getAccessLogs);

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
router.post('/transport/buspass', authenticate, FacilityController.createBusPass);


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

// ==========================================
// M14: MARKS ENTRY, MODERATION AND APPROVAL
// ==========================================

router.post('/assessment/batches', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), AssessmentController.createBatch);
router.get('/assessment/batches', authenticate, AssessmentController.getBatches);
router.get('/assessment/batches/:id', authenticate, AssessmentController.getBatchById);
router.post('/assessment/marks/draft', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), AssessmentController.saveDraftMarks);
router.post('/assessment/marks/import', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), AssessmentController.importMarksFromCSV);
router.post('/assessment/batches/submit', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), AssessmentController.submitBatch);
router.post('/assessment/batches/moderate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), AssessmentController.moderateBatch);
router.post('/assessment/batches/lock', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), AssessmentController.lockBatch);
router.get('/assessment/my-marks', authenticate, AssessmentController.getStudentPublishedMarks);

// ==========================================
// M15: RESULTS, TRANSCRIPTS & ACADEMIC PROGRESSION
// ==========================================

router.post('/results/calculate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.calculateResultRun);
router.post('/results/runs/calculate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.calculateResultRun);
router.get('/results/runs', authenticate, ResultController.getResultRuns);
router.get('/results/runs/:id', authenticate, ResultController.getResultRunById);
router.post('/results/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.approveResultRun);
router.post('/results/runs/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.approveResultRun);
router.post('/results/publish', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.publishResultRun);
router.post('/results/runs/publish', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.publishResultRun);
router.post('/results/correction', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ResultController.applyResultCorrection);
router.get('/results/revision/:termResultId', authenticate, ResultController.getRevisionComparison);
router.get('/results/comparison/:termResultId', authenticate, ResultController.getRevisionComparison);
router.get('/results/my-results', authenticate, ResultController.getStudentPublishedResults);
router.post('/results/transcripts/generate', authenticate, ResultController.generateTranscript);
router.post('/results/transcript', authenticate, ResultController.generateTranscript);

// ==========================================
// M16: REVALUATION AND RETOTALLING
// ==========================================

router.post('/revaluation/policies', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), RevaluationController.createPolicy);
router.get('/revaluation/policies', authenticate, RevaluationController.getPolicies);
router.get('/revaluation/eligible-subjects', authenticate, RevaluationController.getEligibleSubjects);
router.post('/revaluation/requests', authenticate, RevaluationController.submitReviewRequest);
router.post('/revaluation/requests/pay', authenticate, RevaluationController.payReviewFee);
router.get('/revaluation/requests', authenticate, RevaluationController.getReviewRequests);
router.post('/revaluation/assignments', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), RevaluationController.assignReviewer);
router.post('/revaluation/outcomes/submit', authenticate, requireRole(UserRole.FACULTY, UserRole.ADMIN, UserRole.SUPER_ADMIN), RevaluationController.submitReviewOutcome);
router.post('/revaluation/outcomes/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), RevaluationController.approveReviewOutcome);
router.get('/revaluation/my-decisions', authenticate, RevaluationController.getStudentDecisions);

// ==========================================
// M17: CERTIFICATES & DIGITAL DOCUMENT VERIFICATION
// ==========================================

router.post('/certificates/types', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), CertificateController.createType);
router.get('/certificates/types', authenticate, CertificateController.getTypes);
router.get('/certificates/eligibility', authenticate, CertificateController.checkEligibility);
router.post('/certificates/requests', authenticate, CertificateController.submitRequest);
router.get('/certificates/requests', authenticate, CertificateController.getRequests);
router.post('/certificates/requests/review', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CertificateController.reviewRequest);
router.post('/certificates/requests/issue', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CertificateController.issueCertificate);
router.get('/certificates/my-certificates', authenticate, CertificateController.getStudentCertificates);
router.get('/certificates/verify/:token', CertificateController.verifyPublicCertificate);
router.get('/certificates/verify', CertificateController.verifyPublicCertificate);
router.get('/certificates/:id/download', authenticate, CertificateController.downloadCertificate);
router.post('/certificates/revoke', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CertificateController.revokeCertificate);

// ==========================================
// M18: STUDENT HELPDESK, GRIEVANCES & SERVICE DESK
// ==========================================

router.get('/helpdesk/categories', authenticate, HelpdeskController.listCategories);
router.post('/helpdesk/categories', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), HelpdeskController.createCategory);
router.get('/helpdesk/sla-policies', authenticate, HelpdeskController.listSLAPolicies);
router.post('/helpdesk/sla-policies', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), HelpdeskController.createSLAPolicy);
router.post('/helpdesk/tickets', authenticate, HelpdeskController.createTicket);
router.get('/helpdesk/tickets/my-tickets', authenticate, HelpdeskController.listStudentTickets);
router.get('/helpdesk/tickets/staff-inbox', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY, UserRole.WARDEN, UserRole.FINANCE, UserRole.PLACEMENT_OFFICER, UserRole.ADMISSIONS_OFFICER), HelpdeskController.listStaffInbox);
router.get('/helpdesk/tickets/:id', authenticate, HelpdeskController.getTicketDetail);
router.post('/helpdesk/tickets/:id/messages', authenticate, HelpdeskController.addMessage);
router.post('/helpdesk/tickets/:id/assign', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.FACULTY), HelpdeskController.assignTicket);
router.post('/helpdesk/tickets/:id/status', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY, UserRole.WARDEN, UserRole.FINANCE), HelpdeskController.updateStatus);
router.post('/helpdesk/tickets/:id/reopen', authenticate, HelpdeskController.reopenTicket);
router.post('/helpdesk/tickets/escalate-check', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), HelpdeskController.triggerEscalationCheck);

// ==========================================
// M19: HOSTEL OPERATIONS
// ==========================================

router.get('/hostel/hostels', authenticate, HostelController.listHostels);
router.post('/hostel/hostels', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.createHostel);
router.get('/hostel/rooms', authenticate, HostelController.listRooms);
router.post('/hostel/rooms', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.createRoom);
router.get('/hostel/beds', authenticate, HostelController.listBeds);
router.post('/hostel/applications', authenticate, HostelController.submitApplication);
router.get('/hostel/applications/my-applications', authenticate, HostelController.listStudentApplications);
router.get('/hostel/applications/pending', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.listPendingApplications);
router.post('/hostel/allocations/allocate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.allocateBed);
router.post('/hostel/allocations/:id/pay-deposit', authenticate, HostelController.payDeposit);
router.post('/hostel/allocations/check-in', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.checkIn);
router.post('/hostel/allocations/transfer', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.transferRoom);
router.post('/hostel/allocations/check-out', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN), HostelController.checkOut);
router.get('/hostel/allocations/my-allocation', authenticate, HostelController.getStudentAllocation);
router.get('/hostel/reports/occupancy', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.WARDEN, UserRole.FINANCE), HostelController.getOccupancyReport);

// ==========================================
// M20: TRANSPORT OPERATIONS
// ==========================================

router.get('/transport/routes', authenticate, TransportController.listRoutes);
router.post('/transport/routes', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TransportController.createRoute);
router.get('/transport/vehicles', authenticate, TransportController.listVehicles);
router.post('/transport/vehicles', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TransportController.createVehicle);
router.post('/transport/subscriptions/apply', authenticate, TransportController.submitSubscription);
router.post('/transport/subscriptions/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TransportController.approveSubscription);
router.post('/transport/subscriptions/cancel', authenticate, TransportController.cancelSubscription);
router.post('/transport/passes/renew', authenticate, TransportController.renewPass);
router.get('/transport/passes/validity/:passId', authenticate, TransportController.checkPassValidity);
router.get('/transport/passes/my-pass', authenticate, TransportController.getStudentPass);
router.post('/transport/vehicles/substitute', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TransportController.substituteVehicle);
router.post('/transport/trips', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), TransportController.recordTrip);
router.get('/transport/trips/:tripId/simulated-locations', authenticate, TransportController.getSimulatedLocations);
router.get('/transport/reports/occupancy', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), TransportController.getOccupancyReport);

// ==========================================
// M22: NOTICES, NOTIFICATIONS & CALENDAR COMMUNICATION
// ==========================================

router.post('/communications/notices', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CommunicationController.createNotice);
router.get('/communications/notices', authenticate, CommunicationController.listNotices);
router.post('/communications/notices/preview-audience', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CommunicationController.previewAudience);
router.post('/communications/notices/publish', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), CommunicationController.publishNotice);
router.get('/communications/inbox', authenticate, CommunicationController.getUserInbox);
router.post('/communications/inbox/mark-read', authenticate, CommunicationController.markNotificationRead);
router.get('/communications/preferences', authenticate, CommunicationController.getNotificationPreferences);
router.put('/communications/preferences', authenticate, CommunicationController.updateNotificationPreferences);
router.get('/communications/outbox', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), CommunicationController.getOutboxMessages);
router.post('/communications/outbox/retry', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), CommunicationController.retryOutboxMessage);
router.get('/communications/calendar', authenticate, CommunicationController.getCalendarEvents);
router.post('/communications/calendar/subscribe', authenticate, CommunicationController.subscribeCalendarEvent);

// ==========================================
// M21: PARENT AND GUARDIAN PORTAL
// ==========================================

router.post('/guardians/linking/invite', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), GuardianController.inviteGuardian);
router.post('/guardians/linking/verify', authenticate, GuardianController.verifyLink);
router.get('/guardians/links', authenticate, GuardianController.getLinks);
router.get('/guardians/student/:studentId/summary', authenticate, GuardianController.getStudentSummary);
router.get('/guardians/student/:studentId/attendance', authenticate, GuardianController.getStudentAttendance);
router.get('/guardians/student/:studentId/fees', authenticate, GuardianController.getStudentFees);
router.get('/guardians/student/:studentId/results', authenticate, GuardianController.getStudentResults);
router.get('/guardians/student/:studentId/notices', authenticate, GuardianController.getStudentNotices);
router.get('/guardians/student/:studentId/tickets', authenticate, GuardianController.attemptStudentTickets);
router.post('/guardians/linking/permissions', authenticate, GuardianController.updatePermissions);
router.post('/guardians/linking/revoke', authenticate, GuardianController.revokeLink);
router.get('/guardians/access-logs', authenticate, GuardianController.getAccessLogs);

// ==========================================
// M23: COMMITTEES, TASKS AND NOTESHEETS
// ==========================================

router.get('/governance/committees', authenticate, GovernanceController.listCommittees);
router.post('/governance/committees', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), GovernanceController.createCommittee);
router.post('/governance/committees/:id/members', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), GovernanceController.addCommitteeMember);
router.delete('/governance/committees/:id/members/:memberUserId', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), GovernanceController.deactivateCommitteeMember);
router.post('/governance/committees/:id/meetings', authenticate, GovernanceController.createMeeting);
router.post('/governance/meetings/:meetingId/decisions', authenticate, GovernanceController.addCommitteeDecision);
router.get('/governance/tasks', authenticate, GovernanceController.listTasks);
router.post('/governance/tasks', authenticate, GovernanceController.createTask);
router.patch('/governance/tasks/:id/status', authenticate, GovernanceController.updateTaskStatus);
router.get('/governance/notesheets', authenticate, GovernanceController.listNotesheets);
router.post('/governance/notesheets', authenticate, GovernanceController.createNotesheet);
router.get('/governance/notesheets/:id', authenticate, GovernanceController.getNotesheetDetail);
router.post('/governance/notesheets/:id/action', authenticate, GovernanceController.processNotesheetAction);
router.get('/governance/approvals/my-pending', authenticate, GovernanceController.getMyPendingApprovals);

// ==========================================
// M24: E-REGISTER AND DOCUMENT MOVEMENT
// ==========================================

router.get('/registers/numbering', authenticate, RegisterController.getSequences);
router.post('/registers/numbering', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), RegisterController.configureSequence);

router.get('/registers/entries', authenticate, RegisterController.listEntries);
router.post('/registers/entries', authenticate, RegisterController.createEntry);
router.get('/registers/entries/:id', authenticate, RegisterController.getEntryDetail);
router.post('/registers/entries/:id/void', authenticate, RegisterController.voidEntry);
router.get('/registers/entries/:id/attachment-access', authenticate, RegisterController.checkAttachmentAccess);

router.post('/registers/entries/:id/dispatch', authenticate, RegisterController.dispatchDocument);
router.post('/registers/movement/:movementId/acknowledge', authenticate, RegisterController.acknowledgeDocument);

router.get('/registers/reports', authenticate, RegisterController.getReports);

// ==========================================
// M25: STAFF ESTABLISHMENT AND LEAVE
// ==========================================

router.get('/hr/employees', authenticate, StaffController.listEmployees);
router.post('/hr/employees', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StaffController.createEmployee);
router.get('/hr/employees/:id', authenticate, StaffController.getEmployeeDetail);
router.post('/hr/appointments', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StaffController.assignAppointment);
router.get('/hr/employees/:id/document-access', authenticate, StaffController.checkServiceDocumentAccess);

router.get('/hr/my-leave', authenticate, StaffController.getMyLeaveData);
router.get('/hr/leave/policies', authenticate, StaffController.getMyLeaveData);
router.get('/hr/leave/balances', authenticate, StaffController.getMyLeaveData);
router.get('/hr/leave/requests', authenticate, StaffController.getMyLeaveData);
router.post('/hr/leave/apply', authenticate, StaffController.applyLeave);
router.post('/hr/leave/approve', authenticate, StaffController.approveLeave);
router.post('/hr/leave/:id/approve', authenticate, StaffController.approveLeave);
router.post('/hr/leave/cancel', authenticate, StaffController.cancelLeave);
router.post('/hr/leave/:id/cancel', authenticate, StaffController.cancelLeave);

router.get('/hr/approvals/queue', authenticate, StaffController.getManagerApprovalQueue);
router.get('/hr/team-calendar', authenticate, StaffController.getTeamAbsenceCalendar);

router.get('/hr/establishment/registers', authenticate, StaffController.getEstablishmentRegisters);
router.get('/hr/establishment/vacancies', authenticate, StaffController.getEstablishmentRegisters);
router.get('/hr/establishment/cases', authenticate, StaffController.getEstablishmentRegisters);
router.post('/hr/establishment/cases', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StaffController.createEstablishmentCase);
router.post('/hr/establishment/cases/:id/steps', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), StaffController.addEstablishmentCaseStep);

// ==========================================
// M26: PAYROLL AND EXPENDITURE PROTOTYPE
// ==========================================

router.get('/payroll/structures', authenticate, PayrollController.listSalaryStructures);
router.post('/payroll/structures', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.createSalaryStructure);
router.post('/payroll/assignments', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.assignSalaryStructure);

router.get('/payroll/runs', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.listPayrollRuns);
router.post('/payroll/runs/draft', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.createPayrollRunDraft);
router.post('/payroll/runs/:id/validate', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.validatePayrollRun);
router.post('/payroll/runs/:id/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.approvePayrollRun);
router.post('/payroll/runs/:id/disburse', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.disbursePayrollRun);

router.get('/payroll/my-payslips', authenticate, PayrollController.listMyPayslips);
router.get('/payroll/payslips/:id', authenticate, PayrollController.getPayslipDetail);
router.get('/payroll/payslips/:id/download', authenticate, PayrollController.downloadPayslip);

router.get('/payroll/claims', authenticate, PayrollController.listExpenseClaims);
router.post('/payroll/claims', authenticate, PayrollController.submitExpenseClaim);
router.post('/payroll/claims/:id/review', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.reviewExpenseClaim);
router.post('/payroll/claims/:id/reimburse', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), PayrollController.reimburseExpenseClaim);

// ==========================================
// M27: LIBRARY SERVICES PROTOTYPE
// ==========================================

router.get('/library/catalog', authenticate, LibraryController.listCatalog);
router.get('/library/catalog/:id', authenticate, LibraryController.getBookTitleDetail);
router.post('/library/catalog', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.createBookTitle);

router.get('/library/copies', authenticate, LibraryController.listBookCopies);
router.post('/library/copies', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.addBookCopy);

router.post('/library/issue', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.issueBook);
router.post('/library/renew', authenticate, LibraryController.renewBook);
router.post('/library/return', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.returnBook);

router.post('/library/reserve', authenticate, LibraryController.reserveBook);
router.post('/library/reservations/:id/cancel', authenticate, LibraryController.cancelReservation);

router.get('/library/my-loans', authenticate, LibraryController.listUserLoans);
router.get('/library/loans', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.listAllLoans);

router.get('/library/clearance', authenticate, LibraryController.getLibraryClearance);
router.post('/library/clearance/verify', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), LibraryController.processClearanceRequest);

// ==========================================
// M28: INVENTORY, PROCUREMENT AND ASSETS
// ==========================================

// Masters: Items & Vendors
router.get('/inventory/items', authenticate, InventoryController.listItems);
router.get('/inventory/items/low-stock', authenticate, InventoryController.getLowStockItems);
router.post('/inventory/items', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), InventoryController.createItem);

router.get('/inventory/vendors', authenticate, InventoryController.listVendors);
router.post('/inventory/vendors', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.createVendor);

// Procurement: Requisitions & Purchase Orders
router.get('/inventory/requisitions', authenticate, InventoryController.listRequisitions);
router.post('/inventory/requisitions', authenticate, InventoryController.createRequisition);
router.post('/inventory/requisitions/:id/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), InventoryController.approveRequisition);

router.get('/inventory/purchase-orders', authenticate, InventoryController.listPurchaseOrders);
router.post('/inventory/purchase-orders', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), InventoryController.createPurchaseOrder);

// Procurement: Goods Receipt
router.get('/inventory/receipts', authenticate, InventoryController.listGoodsReceipts);
router.post('/inventory/receipts', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.receiveGoods);

// Movements: Issue, Return, Transfer & Ledger
router.post('/inventory/movements/issue', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.issueStock);
router.post('/inventory/movements/return', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.returnStock);
router.post('/inventory/movements/transfer', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.transferStock);
router.get('/inventory/movements', authenticate, InventoryController.listStockMovements);

// Assets
router.get('/inventory/assets', authenticate, InventoryController.listAssets);
router.post('/inventory/assets/:id/maintenance', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.recordAssetMaintenance);

// Stock Count & Adjustment
router.post('/inventory/adjustments/count', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), InventoryController.recordStockCount);
router.get('/inventory/adjustments', authenticate, InventoryController.listStockAdjustments);
router.post('/inventory/adjustments/:id/approve', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE), InventoryController.approveStockAdjustment);

// Demonstration
router.post('/inventory/demo/reconcile', authenticate, InventoryController.runDemonstration);

// ==========================================
// M29: RESEARCH, ACCREDITATION, ESTABLISHMENT & FINANCE MIS
// ==========================================

// Dashboard metrics (with formulas, scopes, and source derivations)
router.get('/mis/dashboard', authenticate, MISController.getDashboardMetrics);

// Research: Publications, Projects, PhD records, Patents
router.get('/mis/publications', authenticate, MISController.listPublications);
router.post('/mis/publications', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), MISController.createPublication);
router.post('/mis/publications/:id/verify', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), MISController.verifyPublication);

router.get('/mis/projects', authenticate, MISController.listProjects);
router.post('/mis/projects', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), MISController.createProject);

router.get('/mis/phd-records', authenticate, MISController.listPhDRecords);
router.post('/mis/phd-records', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), MISController.createPhDRecord);

router.get('/mis/patents', authenticate, MISController.listPatentRecords);
router.post('/mis/patents', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), MISController.createPatentRecord);

// Accreditation & Evidence Register
router.get('/mis/evidence', authenticate, MISController.listEvidence);
router.post('/mis/evidence', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), MISController.createEvidence);
router.post('/mis/evidence/:id/verify', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), MISController.verifyEvidence);

// Reporting Periods & Reports / Snapshots
router.get('/mis/reporting-periods', authenticate, MISController.listReportingPeriods);
router.post('/mis/reporting-periods', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), MISController.createReportingPeriod);

router.get('/mis/reports/preview', authenticate, MISController.generateReportPreview);
router.get('/mis/reports/snapshots', authenticate, MISController.listReportSnapshots);
router.post('/mis/reports/snapshots', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), MISController.publishReportSnapshot);
router.get('/mis/reports/snapshots/:id', authenticate, MISController.getSnapshotById);
router.get('/mis/reports/snapshots/:id/export', authenticate, MISController.exportSnapshotCSV);

// Reproducible Demonstration
router.post('/mis/demo/reconcile', authenticate, MISController.runDemonstration);

// ==========================================
// M31: AI CHAT ASSISTANT AND VOICE INTERFACE
// ==========================================
router.post('/assistant/conversations', authenticate, AssistantController.getOrCreateConversation);
router.get('/assistant/conversations', authenticate, AssistantController.listConversations);
router.get('/assistant/conversations/:conversationId/messages', authenticate, AssistantController.getMessages);
router.post('/assistant/conversations/:conversationId/chat', authenticate, AssistantController.sendChatMessage);
router.post('/assistant/conversations/:conversationId/voice', authenticate, AssistantController.processVoice);

router.get('/assistant/articles', authenticate, AssistantController.listArticles);
router.post('/assistant/articles', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), AssistantController.createArticle);

router.get('/assistant/evaluation/cases', authenticate, AssistantController.listEvaluationCases);
router.post('/assistant/evaluation/run', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), AssistantController.runEvaluation);
router.get('/assistant/evaluation/runs', authenticate, AssistantController.listEvaluationRuns);

router.post('/assistant/demo/journey', authenticate, AssistantController.runDemonstration);

// ==========================================
// M32: PERFORMANCE PREDICTION & EARLY-SUPPORT ANALYTICS
// ==========================================
router.get('/analytics/dashboard', authenticate, PredictionController.getDashboardSummary);
router.get('/analytics/cohort', authenticate, PredictionController.listCohortPredictions);
router.get('/analytics/student/:studentId', authenticate, PredictionController.getStudentPrediction);
router.post('/analytics/score-preview', authenticate, PredictionController.previewScoreChange);

router.post('/analytics/datasets/generate-synthetic', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), PredictionController.generateSyntheticDataset);
router.get('/analytics/datasets', authenticate, PredictionController.listDatasets);

router.post('/analytics/models/train', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), PredictionController.trainModel);
router.get('/analytics/models', authenticate, PredictionController.listModels);
router.get('/analytics/models/:modelId/evaluation', authenticate, PredictionController.getModelEvaluation);

router.post('/analytics/reviews', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), PredictionController.createAdvisorReview);

router.get('/analytics/interventions', authenticate, PredictionController.listInterventions);
router.post('/analytics/interventions', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), PredictionController.createIntervention);
router.patch('/analytics/interventions/:id', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), PredictionController.updateIntervention);

router.post('/analytics/demo/journey', authenticate, PredictionController.runDemonstration);

// ==========================================
// M33: PERSONALIZED LEARNING RECOMMENDATIONS
// ==========================================
router.get('/learning/my-plan', authenticate, LearningController.getMyPlan);
router.put('/learning/my-plan/preferences', authenticate, LearningController.updatePlanPreferences);

router.get('/learning/resources', authenticate, LearningController.listResources);
router.post('/learning/resources', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), LearningController.createResource);

router.get('/learning/topics', authenticate, LearningController.listTopics);
router.post('/learning/topics', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), LearningController.createTopic);
router.post('/learning/mappings', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), LearningController.mapAssessment);

router.post('/learning/activities/complete', authenticate, LearningController.completeActivity);
router.get('/learning/progress', authenticate, LearningController.getProgress);

router.get('/learning/faculty/engagement', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), LearningController.getFacultyEngagement);
router.post('/learning/faculty/endorse', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FACULTY), LearningController.endorseResource);

router.post('/learning/demo/journey', authenticate, LearningController.runDemonstration);

// ==========================================
// M34: MOBILE APP AND OFFLINE-SAFE ACCESS
// ==========================================
router.post('/mobile/devices/register', authenticate, MobileController.registerDevice);
router.get('/mobile/devices', authenticate, MobileController.listDevices);
router.post('/mobile/devices/revoke', authenticate, MobileController.revokeDevice);

router.get('/mobile/preferences', authenticate, MobileController.getNotificationPreferences);
router.put('/mobile/preferences', authenticate, MobileController.updateNotificationPreferences);

router.get('/mobile/storage-policy', MobileController.getStoragePolicy);
router.post('/mobile/deep-links/validate', MobileController.validateDeepLink);
router.post('/mobile/offline/attempt-write', MobileController.attemptOfflineWrite);
router.post('/mobile/session/clear-local', authenticate, MobileController.clearLocalPrivateState);

router.get('/mobile/dashboard', authenticate, MobileController.getMobileDashboard);
router.get('/mobile/android/build-info', MobileController.getAndroidBuildInfo);
router.post('/mobile/demo/journey', authenticate, MobileController.runDemonstration);

// ==========================================
// M35: DEMO CONTROL CENTER, INTEGRATIONS AND OPERATIONS
// ==========================================
router.get('/demo-operations/scenarios', DemoOperationsController.listScenarios);
router.get('/demo-operations/scenarios/:code', DemoOperationsController.getScenario);
router.post('/demo-operations/scenarios/:code/prepare', authenticate, DemoOperationsController.prepareScenario);

router.get('/demo-operations/seed/status', DemoOperationsController.getSeedStatus);
router.get('/demo-operations/seed-status', DemoOperationsController.getSeedStatus);
router.post('/demo-operations/reset', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DemoOperationsController.resetIsolatedDemoDataset);
router.post('/demo-operations/reset-demo-dataset', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DemoOperationsController.resetIsolatedDemoDataset);

router.get('/demo-operations/integrations', authenticate, DemoOperationsController.listIntegrations);
router.put('/demo-operations/integrations/:adapterId', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DemoOperationsController.updateIntegration);

router.get('/demo-operations/simulation-events', authenticate, DemoOperationsController.listSimulationEvents);
router.get('/demo-operations/simulator/events', authenticate, DemoOperationsController.listSimulationEvents);
router.post('/demo-operations/simulation-events/trigger', authenticate, DemoOperationsController.triggerSimulationEvent);
router.post('/demo-operations/simulator/events', authenticate, DemoOperationsController.triggerSimulationEvent);
router.post('/demo-operations/simulation-events/:eventId/replay', authenticate, DemoOperationsController.replaySimulationEvent);
router.post('/demo-operations/simulator/events/:eventId/replay', authenticate, DemoOperationsController.replaySimulationEvent);

router.get('/demo-operations/jobs', authenticate, DemoOperationsController.listJobs);
router.post('/demo-operations/jobs/:jobKey/run', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DemoOperationsController.runJob);
router.post('/demo-operations/jobs/run', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), DemoOperationsController.runJob);

router.get('/demo-operations/storage', DemoOperationsController.getStorageUsage);
router.get('/demo-operations/storage-usage', DemoOperationsController.getStorageUsage);
router.get('/demo-operations/backup-guide', DemoOperationsController.getBackupRestoreGuide);

router.get('/demo-operations/clock', DemoOperationsController.getDemoClock);
router.put('/demo-operations/clock', authenticate, DemoOperationsController.updateDemoClock);
router.post('/demo-operations/clock/advance', authenticate, DemoOperationsController.updateDemoClock);

router.post('/demo-operations/demo/journey', authenticate, DemoOperationsController.runDemonstration);
router.post('/demo-operations/demo/delayed-payment-recovery', authenticate, DemoOperationsController.runDemonstration);

// ==========================================
// M36: COMPLETE UI AUDIT, REHEARSAL & RELEASE
// ==========================================
router.get('/release/coverage', ReleaseAuditController.getRouteCoverageReport);
router.get('/release/route-coverage', ReleaseAuditController.getRouteCoverageReport);
router.get('/release/manifest', ReleaseAuditController.getReleaseManifest);
router.get('/release/reviewer-guide', ReleaseAuditController.getReviewerGuide);
router.get('/release/accessibility', ReleaseAuditController.getAccessibilityAuditReport);
router.get('/release/accessibility-report', ReleaseAuditController.getAccessibilityAuditReport);
router.get('/release/artifacts', ReleaseAuditController.getVerifiedArtifacts);
router.get('/release/verified-artifacts', ReleaseAuditController.getVerifiedArtifacts);
router.post('/release/submission-package', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), ReleaseAuditController.generateSubmissionPackage);
router.post('/release/demo/rehearsal', authenticate, ReleaseAuditController.runDemonstration);
router.post('/release/demo/journey', authenticate, ReleaseAuditController.runDemonstration);
router.get('/release/download/:filename', ReleaseAuditController.downloadArtifact);

export default router;







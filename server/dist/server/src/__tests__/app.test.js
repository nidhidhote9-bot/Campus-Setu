"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
const db_1 = require("../config/db");
const seed_1 = require("../seed");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_2 = require("@shared/index");
const models_1 = require("../models/models");
const request = (0, supertest_1.default)(index_1.app);
(0, vitest_1.describe)('CampusSetu Complete Integration Sprint & Acceptance Test Suite', () => {
    let adminToken;
    let studentToken;
    let studentId;
    let institutionId;
    (0, vitest_1.beforeAll)(async () => {
        await (0, db_1.connectDB)();
        await (0, seed_1.seedDatabase)();
        // Login as Admin
        const adminRes = await request.post('/api/v1/auth/login').send({
            email: 'admin@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.ADMIN
        });
        (0, vitest_1.expect)(adminRes.status).toBe(200);
        adminToken = adminRes.body.token;
        institutionId = adminRes.body.user.institutionId;
        // Login as Student
        const studentRes = await request.post('/api/v1/auth/login').send({
            email: 'student.aarav@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.STUDENT
        });
        (0, vitest_1.expect)(studentRes.status).toBe(200);
        studentToken = studentRes.body.token;
        studentId = studentRes.body.user.studentId;
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, db_1.disconnectDB)();
    });
    (0, vitest_1.it)('1. Auth Gate: Reject invalid credentials and unauthorized roles', async () => {
        const res = await request.post('/api/v1/auth/login').send({
            email: 'admin@campussetu.edu',
            password: 'WrongPassword!',
            role: index_2.UserRole.ADMIN
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.error).toBeDefined();
    });
    (0, vitest_1.it)('2. Session Gate: Successfully fetch session profile for authenticated user', async () => {
        const res = await request
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.user.email).toBe('admin@campussetu.edu');
    });
    (0, vitest_1.it)('3. Finance Gate: Process fee payment with Integer Paise & Idempotency Key', async () => {
        const idempotencyKey = `TEST-IDEMP-FEE-${Date.now()}`;
        const payload = {
            studentId,
            institutionId,
            amountPaise: 2500000, // ₹25,000.00
            feeType: index_2.FeeType.TUITION,
            paymentMode: index_2.PaymentMode.UPI,
            idempotencyKey
        };
        // First Call
        const res1 = await request
            .post('/api/v1/fees/pay')
            .set('Authorization', `Bearer ${studentToken}`)
            .send(payload);
        (0, vitest_1.expect)(res1.status).toBe(200);
        (0, vitest_1.expect)(res1.body.receiptNumber).toBeDefined();
        (0, vitest_1.expect)(res1.body.amountPaise).toBe(2500000);
        // Second Call with same Idempotency Key returns identical transaction
        const res2 = await request
            .post('/api/v1/fees/pay')
            .set('Authorization', `Bearer ${studentToken}`)
            .send(payload);
        (0, vitest_1.expect)(res2.status).toBe(200);
        (0, vitest_1.expect)(res2.body.transactionId).toBe(res1.body.transactionId);
    });
    (0, vitest_1.it)('4. Financial Precision Gate: Reject float monetary amounts', async () => {
        const res = await request
            .post('/api/v1/fees/pay')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            studentId,
            institutionId,
            amountPaise: 2500.75, // Invalid float!
            feeType: index_2.FeeType.TUITION,
            paymentMode: index_2.PaymentMode.UPI,
            idempotencyKey: `TEST-FLOAT-${Date.now()}`
        });
        (0, vitest_1.expect)(res.status).toBe(400);
    });
    (0, vitest_1.it)('5. RBAC Gate: Prevent student from approving staff payroll', async () => {
        const res = await request
            .post('/api/v1/payroll/approve')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            institutionId,
            monthYear: '2026-09',
            staffId: '600000000000000000000002',
            baseSalaryPaise: 8000000,
            hraPaise: 1000000,
            deductionsPaise: 500000,
            idempotencyKey: `PAYROLL-ATTEMPT-${Date.now()}`
        });
        (0, vitest_1.expect)(res.status).toBe(403);
    });
    (0, vitest_1.it)('6. Outbox & Notification Gate: Verify notice creation dispatches outbox event', async () => {
        const res = await request
            .post('/api/v1/notices')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            title: 'End-Sem Exam Notification',
            content: 'Clearance required before hall ticket issuance.',
            targetRole: 'STUDENT',
            sendSmsNotification: true
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.title).toBe('End-Sem Exam Notification');
        // Verify outbox queue
        const outboxRes = await request
            .get('/api/v1/system/outbox')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(outboxRes.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(outboxRes.body)).toBe(true);
        (0, vitest_1.expect)(outboxRes.body.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('7. AI Analytics Gate: Returns dropout risk classification with evaluation limits disclaimer', async () => {
        const res = await request
            .get('/api/v1/analytics/dropout-risk')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.evaluationDisclaimer).toContain('synthetic statistical rules');
        (0, vitest_1.expect)(Array.isArray(res.body.students)).toBe(true);
    });
    (0, vitest_1.it)('8. Admissions Dry Run Gate: Dry run mode writes no applicants to database', async () => {
        const dryRunPayload = {
            institutionId,
            filename: 'candidates_batch_01.csv',
            rows: [
                { row: 1, name: 'Siddharth Rao', email: 'siddharth@example.com', externalCode: 'CSE' },
                { row: 2, name: 'Priya Sharma', email: 'priya@example.com', externalCode: 'ECE' },
                { row: 3, name: 'Amit Gupta', email: 'amit@example.com', externalCode: 'INVALID_CODE' },
                { row: 4, name: 'Neha Singh', email: 'neha@example.com', externalCode: 'CSE' },
                { row: 5, name: 'Rahul Joshi', email: 'rahul@example.com', externalCode: 'ECE' }
            ]
        };
        const res = await request
            .post('/api/v1/admissions/imports/dry-run')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(dryRunPayload);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.status).toBe('DRY_RUN');
        (0, vitest_1.expect)(res.body.validRows).toBe(4);
        (0, vitest_1.expect)(res.body.invalidRows).toBe(1);
        (0, vitest_1.expect)(res.body.rowErrors.length).toBe(1);
        (0, vitest_1.expect)(res.body.rowErrors[0].externalCode).toBe('INVALID_CODE');
        // Verify 0 applicants were written to database from dry run
        const appsRes = await request
            .get('/api/v1/admissions/applications')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(appsRes.status).toBe(200);
        (0, vitest_1.expect)(appsRes.body.length).toBe(0);
    });
    (0, vitest_1.it)('9. Admissions Mapping Fix & Idempotent Commit Gate: Fix code mapping and commit batch idempotently', async () => {
        const batchId = `TEST-BATCH-${Date.now()}`;
        const rows = [
            { row: 1, name: 'Siddharth Rao', email: 'siddharth@example.com', externalCode: 'CSE' },
            { row: 2, name: 'Priya Sharma', email: 'priya@example.com', externalCode: 'ECE' },
            { row: 3, name: 'Amit Gupta', email: 'amit@example.com', externalCode: 'ME' }, // Fixed code
            { row: 4, name: 'Neha Singh', email: 'neha@example.com', externalCode: 'CSE' },
            { row: 5, name: 'Rahul Joshi', email: 'rahul@example.com', externalCode: 'ECE' }
        ];
        // First map external code 'ME' to CSE department for demonstration
        const deptsRes = await request
            .get('/api/v1/departments')
            .set('Authorization', `Bearer ${adminToken}`);
        const cseDeptId = deptsRes.body.find((d) => d.code === 'CSE')._id;
        await request
            .post('/api/v1/admissions/mappings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            externalCode: 'ME',
            mappedDepartmentId: cseDeptId,
            mappedProgramCode: 'BTECH_ME'
        });
        // Commit batch call 1
        const res1 = await request
            .post('/api/v1/admissions/imports/commit')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            batchId,
            filename: 'candidates_batch_01.csv',
            rows
        });
        (0, vitest_1.expect)(res1.status).toBe(200);
        (0, vitest_1.expect)(res1.body.status).toBe('COMMITTED');
        (0, vitest_1.expect)(res1.body.validRows).toBe(5);
        // Commit batch call 2 (Idempotency check)
        const res2 = await request
            .post('/api/v1/admissions/imports/commit')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            batchId,
            filename: 'candidates_batch_01.csv',
            rows
        });
        (0, vitest_1.expect)(res2.status).toBe(200);
        (0, vitest_1.expect)(res2.body._id).toBe(res1.body._id);
    });
    (0, vitest_1.it)('10. Admissions Bad Rows Download Gate: Download CSV of batch row errors', async () => {
        const res = await request
            .get('/api/v1/admissions/imports/errors/NON_EXISTENT_BATCH/download');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.header['content-type']).toContain('text/csv');
        (0, vitest_1.expect)(res.text).toContain('Row,Name,Email,ExternalCode,Error');
    });
    (0, vitest_1.it)('11. Admissions Correction Control Gate: Applicant can correct only requested fields', async () => {
        // 1. Create candidate application
        const deptsRes = await request
            .get('/api/v1/departments')
            .set('Authorization', `Bearer ${adminToken}`);
        const cseDeptId = deptsRes.body.find((d) => d.code === 'CSE')._id;
        const createRes = await request
            .post('/api/v1/admissions/apply')
            .send({
            institutionId,
            departmentId: cseDeptId,
            name: 'Rohan Sen',
            email: 'rohan.sen@example.com',
            phone: '9876543210',
            highSchoolScore: 89.0,
            entranceExamScore: 91.5
        });
        (0, vitest_1.expect)(createRes.status).toBe(201);
        const appId = createRes.body._id;
        // 2. Reviewer requests correction only for field 'phone'
        const reviewRes = await request
            .post(`/api/v1/admissions/applications/${appId}/review`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            decision: 'REQUEST_CORRECTION',
            reason: 'Invalid phone number format',
            requestedFields: ['phone']
        });
        (0, vitest_1.expect)(reviewRes.status).toBe(200);
        (0, vitest_1.expect)(reviewRes.body.status).toBe('correction_required');
        // 3. Attempt correcting unrequested field 'name' -> Expect 400 error!
        const unallowedRes = await request
            .post(`/api/v1/admissions/applications/${appId}/correct`)
            .send({ name: 'Rohan Modified' });
        (0, vitest_1.expect)(unallowedRes.status).toBe(400);
        (0, vitest_1.expect)(unallowedRes.body.error).toContain('Forbidden update');
        // 4. Correct requested field 'phone' -> Expect 200 OK and status 'resubmitted'
        const allowedRes = await request
            .post(`/api/v1/admissions/applications/${appId}/correct`)
            .send({ phone: '9876599999' });
        (0, vitest_1.expect)(allowedRes.status).toBe(200);
        (0, vitest_1.expect)(allowedRes.body.status).toBe('resubmitted');
    });
    (0, vitest_1.it)('12. Admissions Premature Enrollment Gate: Premature enrollment fails if application is not approved', async () => {
        const appsRes = await request
            .get('/api/v1/admissions/applications')
            .set('Authorization', `Bearer ${adminToken}`);
        const resubmittedApp = appsRes.body.find((a) => a.status === 'resubmitted');
        const enrollRes = await request
            .post(`/api/v1/admissions/applications/${resubmittedApp._id}/enroll`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(enrollRes.status).toBe(400);
        (0, vitest_1.expect)(enrollRes.body.error).toContain('Premature enrollment rejected');
    });
    (0, vitest_1.it)('13. Admissions Approval & Atomic Enrollment Gate: Approve application and generate distinct IURN/IUEN', async () => {
        const appsRes = await request
            .get('/api/v1/admissions/applications')
            .set('Authorization', `Bearer ${adminToken}`);
        const resubmittedApp = appsRes.body.find((a) => a.status === 'resubmitted');
        // 1. Approve application
        const approveRes = await request
            .post(`/api/v1/admissions/applications/${resubmittedApp._id}/review`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ decision: 'APPROVE', reason: 'Verified successfully' });
        (0, vitest_1.expect)(approveRes.status).toBe(200);
        (0, vitest_1.expect)(approveRes.body.status).toBe('approved');
        // 2. Enroll Candidate
        const enrollRes = await request
            .post(`/api/v1/admissions/applications/${resubmittedApp._id}/enroll`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(enrollRes.status).toBe(201);
        (0, vitest_1.expect)(enrollRes.body.enrollmentNumber).toMatch(/^ENR2026/);
        (0, vitest_1.expect)(enrollRes.body.rollNumber).toMatch(/^CSE-2026/);
        (0, vitest_1.expect)(enrollRes.body.status).toBe('ACTIVE');
    });
    (0, vitest_1.it)('14. Student 360 Gate: Composes unified Student 360 profile combining academics, fees, and attendance', async () => {
        const res = await request
            .get(`/api/v1/students/360/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.student.rollNumber).toBe('CSE-2024-001');
        (0, vitest_1.expect)(res.body.academics).toBeDefined();
        (0, vitest_1.expect)(res.body.finance).toBeDefined();
        (0, vitest_1.expect)(res.body.attendance).toBeDefined();
    });
    (0, vitest_1.it)('15. Profile Correction Self-Approval Gate: Student cannot approve their own profile correction', async () => {
        // 1. Student requests profile correction
        const reqRes = await request
            .post('/api/v1/students/profile-change-requests')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            studentId,
            requestedChanges: { phone: '+91 99999 88888' },
            reason: 'Updated contact phone number'
        });
        (0, vitest_1.expect)(reqRes.status).toBe(201);
        const requestId = reqRes.body._id;
        // 2. Student attempts approving own correction -> Expect 403 Forbidden!
        const selfApproveRes = await request
            .post(`/api/v1/students/profile-change-requests/${requestId}/approve`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ reviewNotes: 'Self approved' });
        (0, vitest_1.expect)(selfApproveRes.status).toBe(403);
        (0, vitest_1.expect)(selfApproveRes.body.error).toContain('Forbidden');
        // 3. Admin approves correction -> Expect 200 OK!
        const adminApproveRes = await request
            .post(`/api/v1/students/profile-change-requests/${requestId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ reviewNotes: 'Verified and approved' });
        (0, vitest_1.expect)(adminApproveRes.status).toBe(200);
        (0, vitest_1.expect)(adminApproveRes.body.status).toBe('APPROVED');
    });
    (0, vitest_1.it)('16. Document Ownership Gate: Unauthorized student cannot access another student private document locker', async () => {
        // Upload document for studentId
        await request
            .post('/api/v1/students/documents')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            studentId,
            title: 'Class 10 Certificate',
            docType: 'CERTIFICATE',
            fileUrl: 'https://digilocker.gov.in/doc/10th.pdf'
        });
        // Login as a second student (Ananya)
        const student2Res = await request.post('/api/v1/auth/login').send({
            email: 'student.ananya@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.STUDENT
        });
        const student2Token = student2Res.body.token;
        // Attempt accessing studentId's document locker as student2 -> Expect 403 Forbidden!
        const res = await request
            .get(`/api/v1/students/documents/${studentId}`)
            .set('Authorization', `Bearer ${student2Token}`);
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.error).toContain('Forbidden');
    });
    (0, vitest_1.it)('17. Term Progression & Transfer Gate: Transfer updates status to TRANSFERRED while preserving past results', async () => {
        // 1. Term Progression
        const progressRes = await request
            .post('/api/v1/students/progress')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ studentId, reason: 'Passed 4th semester end-sem exams' });
        (0, vitest_1.expect)(progressRes.status).toBe(200);
        (0, vitest_1.expect)(progressRes.body.currentSemester).toBe(5);
        // 2. Transfer Student
        const transferRes = await request
            .post('/api/v1/students/transfer')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ studentId, transferReason: 'Inter-university migration' });
        (0, vitest_1.expect)(transferRes.status).toBe(200);
        (0, vitest_1.expect)(transferRes.body.status).toBe('TRANSFERRED');
        // 3. Verify past marksheet records remain completely preserved in DB
        const student360 = await request
            .get(`/api/v1/students/360/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(student360.body.academics.markSheets.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('18. Graduation Clearance Gate: Performs graduation clearance check and graduates eligible student', async () => {
        const deptsRes = await request.get('/api/v1/departments').set('Authorization', `Bearer ${adminToken}`);
        const cseDeptId = deptsRes.body.find((d) => d.code === 'CSE')._id;
        // Create & enroll fresh candidate to test full graduation flow
        const appRes = await request.post('/api/v1/admissions/apply').send({
            institutionId,
            departmentId: cseDeptId,
            name: 'Graduation Candidate',
            email: 'grad.candidate@example.com',
            phone: '9876500000',
            highSchoolScore: 90,
            entranceExamScore: 95
        });
        await request.post(`/api/v1/admissions/applications/${appRes.body._id}/review`).set('Authorization', `Bearer ${adminToken}`).send({ decision: 'APPROVE', reason: 'Pass' });
        const enrollRes = await request.post(`/api/v1/admissions/applications/${appRes.body._id}/enroll`).set('Authorization', `Bearer ${adminToken}`);
        const newStudentId = enrollRes.body.studentId;
        // Run graduation check
        const checkRes = await request
            .post(`/api/v1/students/graduation-check/${newStudentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(checkRes.status).toBe(200);
        (0, vitest_1.expect)(checkRes.body.feeClearance).toBe(true);
        // Graduate student
        const gradRes = await request
            .post(`/api/v1/students/graduate/${newStudentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(gradRes.status).toBe(200);
        (0, vitest_1.expect)(gradRes.body.student.status).toBe('GRADUATED');
        (0, vitest_1.expect)(gradRes.body.alumni).toBeDefined();
    });
    (0, vitest_1.it)('19. Unassigned Faculty Gate: Unassigned faculty denied from marking attendance (403)', async () => {
        // Register unassigned faculty user
        const unassignedFacultyUser = await models_1.User.create({
            email: 'unassigned.faculty@campussetu.edu',
            passwordHash: await bcryptjs_1.default.hash('Password123!', 10),
            name: 'Dr. Unassigned Faculty',
            role: index_2.UserRole.FACULTY,
            institutionId
        });
        const loginRes = await request.post('/api/v1/auth/login').send({
            email: 'unassigned.faculty@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.FACULTY
        });
        const unassignedToken = loginRes.body.token;
        // Fetch a course
        const courseRes = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        const courseId = courseRes.body[0]._id;
        // Attempt to capture attendance for course Dr. Unassigned is NOT assigned to -> Expect 403 Forbidden!
        const res = await request
            .post('/api/v1/attendance/capture')
            .set('Authorization', `Bearer ${unassignedToken}`)
            .send({
            institutionId,
            courseId,
            date: '2026-10-01',
            section: 'A',
            entries: [{ studentId, status: index_2.AttendanceStatus.PRESENT }]
        });
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.error).toContain('not assigned to teach');
    });
    (0, vitest_1.it)('20. No-Session Percentage Gate: Zero sessions returns 0% without NaN error', async () => {
        // Create new student with 0 attendance entries
        const freshStudentUser = await models_1.User.create({
            email: 'fresh.nosession@campussetu.edu',
            passwordHash: await bcryptjs_1.default.hash('Password123!', 10),
            name: 'No Session Student',
            role: index_2.UserRole.STUDENT,
            institutionId
        });
        const depts = await request.get('/api/v1/departments').set('Authorization', `Bearer ${adminToken}`);
        const freshStudent = await models_1.Student.create({
            userId: freshStudentUser._id,
            institutionId,
            departmentId: depts.body[0]._id,
            rollNumber: 'FRESH-001',
            enrollmentNumber: 'ENRFRESH001',
            currentSemester: 1,
            batchYear: 2026
        });
        const summaryRes = await request
            .get(`/api/v1/attendance/student/${freshStudent._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(summaryRes.status).toBe(200);
        (0, vitest_1.expect)(summaryRes.body.totalSessions).toBe(0);
        (0, vitest_1.expect)(summaryRes.body.overallPercentage).toBe(0);
        (0, vitest_1.expect)(Number.isNaN(summaryRes.body.overallPercentage)).toBe(false);
    });
    (0, vitest_1.it)('21. Duplicate Entry Gate: Re-submitting attendance upserts without inflating totals', async () => {
        const courseRes = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        const courseId = courseRes.body[0]._id;
        // 1. Initial capture
        await request
            .post('/api/v1/attendance/capture')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            courseId,
            date: '2026-10-05',
            section: 'B',
            entries: [{ studentId, status: index_2.AttendanceStatus.PRESENT }]
        });
        // 2. Re-capture for exact same date/session/student
        const reCaptureRes = await request
            .post('/api/v1/attendance/capture')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            courseId,
            date: '2026-10-05',
            section: 'B',
            entries: [{ studentId, status: index_2.AttendanceStatus.ABSENT }]
        });
        (0, vitest_1.expect)(reCaptureRes.status).toBe(201);
        (0, vitest_1.expect)(reCaptureRes.body.recordedEntries).toBe(1); // Still exactly 1 entry, not 2!
    });
    (0, vitest_1.it)('22. Correction Workflow & Demonstration: Mark absence -> request correction -> approve -> percentage updated & prior value preserved', async () => {
        const courseRes = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        const courseId = courseRes.body[0]._id;
        // 1. Mark ABSENT for session
        const captureRes = await request
            .post('/api/v1/attendance/capture')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            courseId,
            date: '2026-10-10',
            section: 'C',
            entries: [{ studentId, status: index_2.AttendanceStatus.ABSENT }]
        });
        const sessionId = captureRes.body.session._id;
        // Fetch initial student attendance summary
        const initialSummary = await request
            .get(`/api/v1/attendance/student/${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        const initialAbsentCount = initialSummary.body.absentCount;
        // 2. Request Correction (ABSENT -> EXCUSED or PRESENT)
        const correctionRes = await request
            .post('/api/v1/attendance/corrections')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            sessionId,
            studentId,
            requestedStatus: index_2.AttendanceStatus.PRESENT,
            reason: 'Marked absent by mistake; student was present.'
        });
        (0, vitest_1.expect)(correctionRes.status).toBe(201);
        (0, vitest_1.expect)(correctionRes.body.priorStatus).toBe('ABSENT');
        (0, vitest_1.expect)(correctionRes.body.requestedStatus).toBe('PRESENT');
        const correctionId = correctionRes.body._id;
        // Student self-approval prevention test -> Expect 403
        const studentLogin = await request.post('/api/v1/auth/login').send({
            email: 'student.aarav@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.STUDENT
        });
        const studentApproveRes = await request
            .post(`/api/v1/attendance/corrections/${correctionId}/review`)
            .set('Authorization', `Bearer ${studentLogin.body.token}`)
            .send({ decision: 'APPROVED' });
        (0, vitest_1.expect)(studentApproveRes.status).toBe(403);
        // 3. Admin / Faculty approves correction
        const reviewRes = await request
            .post(`/api/v1/attendance/corrections/${correctionId}/review`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ decision: 'APPROVED', reviewComments: 'Verified attendance roll call list.' });
        (0, vitest_1.expect)(reviewRes.status).toBe(200);
        (0, vitest_1.expect)(reviewRes.body.correction.status).toBe('APPROVED');
        (0, vitest_1.expect)(reviewRes.body.correction.priorStatus).toBe('ABSENT'); // Preserved prior value!
        // 4. Verify updated student attendance percentage
        const updatedSummary = reviewRes.body.updatedSummary;
        (0, vitest_1.expect)(updatedSummary.absentCount).toBe(initialAbsentCount - 1);
        (0, vitest_1.expect)(updatedSummary.presentCount).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('23. Conflict Rejection Gate: Rejects schedule entries with room collision (409)', async () => {
        const depts = await request.get('/api/v1/departments').set('Authorization', `Bearer ${adminToken}`);
        const cseDeptId = depts.body.find((d) => d.code === 'CSE')._id;
        const courses = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        const courseId = courses.body[0]._id;
        const rooms = await request.get('/api/v1/timetable/rooms').set('Authorization', `Bearer ${adminToken}`);
        const room101 = rooms.body.find((r) => r.name === 'LH-101');
        // Attempt creating overlapping entry in LH-101 on Monday 09:15-10:15 (collides with 09:00-10:00) -> Expect 409 Conflict
        const res = await request
            .post('/api/v1/timetable/entries')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            departmentId: cseDeptId,
            courseId,
            facultyId: '600000000000000000000001',
            roomId: room101._id,
            semester: 4,
            section: 'B',
            dayOfWeek: 'Monday',
            startTime: '09:15',
            endTime: '10:15'
        });
        (0, vitest_1.expect)(res.status).toBe(409);
        (0, vitest_1.expect)(res.body.error).toContain('Room Collision');
    });
    (0, vitest_1.it)('24. Reschedule Isolation Gate: Resolves room collision & reschedules specific date instance', async () => {
        const depts = await request.get('/api/v1/departments').set('Authorization', `Bearer ${adminToken}`);
        const cseDeptId = depts.body.find((d) => d.code === 'CSE')._id;
        const courses = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        const courseId = courses.body[1]._id;
        const rooms = await request.get('/api/v1/timetable/rooms').set('Authorization', `Bearer ${adminToken}`);
        const room102 = rooms.body.find((r) => r.name === 'LH-102');
        // 1. Resolve collision by selecting non-conflicting Room LH-102 -> Expect 201 Created!
        const createRes = await request
            .post('/api/v1/timetable/entries')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            departmentId: cseDeptId,
            courseId,
            facultyId: '600000000000000000000001',
            roomId: room102._id,
            semester: 4,
            section: 'A',
            dayOfWeek: 'Friday',
            startTime: '14:00',
            endTime: '15:00'
        });
        (0, vitest_1.expect)(createRes.status).toBe(201);
        const entryId = createRes.body._id;
        // 2. Reschedule specific instance for 2026-10-16
        const rescheduleRes = await request
            .post('/api/v1/timetable/reschedule')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            entryId,
            exceptionDate: '2026-10-16',
            newStartTime: '15:00',
            newEndTime: '16:00',
            reason: 'Faculty guest lecture clash adjustment'
        });
        (0, vitest_1.expect)(rescheduleRes.status).toBe(200);
        (0, vitest_1.expect)(rescheduleRes.body.exception.exceptionType).toBe('RESCHEDULED');
        (0, vitest_1.expect)(rescheduleRes.body.exception.newStartTime).toBe('15:00');
    });
    (0, vitest_1.it)('25. Enrolled Student Filter & Holiday Policy Gate: Student schedule includes enrolled courses & holiday flags', async () => {
        const calendarRes = await request
            .get(`/api/v1/timetable/calendar?studentId=${studentId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(calendarRes.status).toBe(200);
        (0, vitest_1.expect)(calendarRes.body.entries.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(calendarRes.body.holidays.length).toBeGreaterThan(0);
    });
    // ==========================================
    // M10 TESTS: FEES, PAYMENTS, RECONCILIATION & FINANCE
    // ==========================================
    let m10InvoiceId;
    let m10OrderId;
    const m10AmountPaise = 3000000; // ₹30,000
    (0, vitest_1.it)('26. Finance Gate: Reject tampered signature and tampered monetary amount', async () => {
        // 1. Issue an invoice
        const invRes = await request
            .post('/api/v1/finance/invoices/assess')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            studentId,
            academicYear: '2026-2027',
            semester: 4,
            dueDate: '2026-12-15',
            lines: [
                { head: 'Tuition Assessment Fee', category: 'TUITION', amountPaise: 2500000 },
                { head: 'Laboratory Fee', category: 'LAB', amountPaise: 500000 }
            ]
        });
        (0, vitest_1.expect)(invRes.status).toBe(201);
        m10InvoiceId = invRes.body._id;
        (0, vitest_1.expect)(invRes.body.payableAmountPaise).toBe(m10AmountPaise);
        // 2. Create Payment Order bound to invoice
        const orderRes = await request
            .post('/api/v1/finance/orders/create')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            invoiceId: m10InvoiceId,
            studentId,
            institutionId,
            amountPaise: m10AmountPaise,
            idempotencyKey: `IDEMP-M10-${Date.now()}`
        });
        (0, vitest_1.expect)(orderRes.status).toBe(201);
        m10OrderId = orderRes.body.orderId;
        // 3. Reject Tampered Signature
        const tamperedSigRes = await request
            .post('/api/v1/finance/orders/simulate-callback')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            providerPaymentId: 'pay_sim_tampered_001',
            amountPaise: m10AmountPaise,
            eventType: 'PAYMENT_SUCCESS',
            signature: 'INVALID_TAMPERED_HMAC_SIGNATURE'
        });
        (0, vitest_1.expect)(tamperedSigRes.status).toBe(400);
        (0, vitest_1.expect)(tamperedSigRes.body.error).toContain('Tampered signature');
        // 4. Reject Tampered Amount
        const sigGenRes = await request
            .post('/api/v1/finance/simulator/sign')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            amountPaise: 100000, // Tampered amount (1,000 rupees instead of 30,000)
            providerPaymentId: 'pay_sim_tampered_002'
        });
        const tamperedAmountRes = await request
            .post('/api/v1/finance/orders/simulate-callback')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            providerPaymentId: 'pay_sim_tampered_002',
            amountPaise: 100000,
            eventType: 'PAYMENT_SUCCESS',
            signature: sigGenRes.body.signature
        });
        (0, vitest_1.expect)(tamperedAmountRes.status).toBe(400);
        (0, vitest_1.expect)(tamperedAmountRes.body.error).toContain('Tampered amount');
    });
    (0, vitest_1.it)('27. Duplicate Callback & Late Failure Gate: Duplicate callbacks yield one settlement and success is not reversed by late failure', async () => {
        const paymentId = `pay_sim_valid_${Date.now()}`;
        // Get legitimate simulator signature
        const sigRes = await request
            .post('/api/v1/finance/simulator/sign')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            amountPaise: m10AmountPaise,
            providerPaymentId: paymentId
        });
        (0, vitest_1.expect)(sigRes.status).toBe(200);
        const validSignature = sigRes.body.signature;
        // First Callback: Settle Order
        const firstCallback = await request
            .post('/api/v1/finance/orders/simulate-callback')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            providerPaymentId: paymentId,
            amountPaise: m10AmountPaise,
            eventType: 'PAYMENT_SUCCESS',
            signature: validSignature
        });
        (0, vitest_1.expect)(firstCallback.status).toBe(200);
        (0, vitest_1.expect)(firstCallback.body.settled).toBe(true);
        (0, vitest_1.expect)(firstCallback.body.receipt.receiptNumber).toBeDefined();
        const originalReceiptNumber = firstCallback.body.receipt.receiptNumber;
        // Second Duplicate Callback (Replay): Must yield same settlement and same receipt (idempotent)
        const duplicateCallback = await request
            .post('/api/v1/finance/orders/simulate-callback')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            providerPaymentId: paymentId,
            amountPaise: m10AmountPaise,
            eventType: 'PAYMENT_SUCCESS',
            signature: validSignature
        });
        (0, vitest_1.expect)(duplicateCallback.status).toBe(200);
        (0, vitest_1.expect)(duplicateCallback.body.status).toBe('ALREADY_SETTLED');
        (0, vitest_1.expect)(duplicateCallback.body.receipt.receiptNumber).toBe(originalReceiptNumber);
        // Third Late Failure Callback: Success must NOT be reversed!
        const lateFailureCallback = await request
            .post('/api/v1/finance/orders/simulate-callback')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            orderId: m10OrderId,
            providerPaymentId: paymentId,
            amountPaise: m10AmountPaise,
            eventType: 'PAYMENT_FAILED',
            signature: validSignature
        });
        (0, vitest_1.expect)(lateFailureCallback.status).toBe(200);
        (0, vitest_1.expect)(lateFailureCallback.body.status).toBe('SUCCESS_PRESERVED');
        (0, vitest_1.expect)(lateFailureCallback.body.order.status).toBe('PAID');
    });
    (0, vitest_1.it)('28. Refund Gate: Partial refund cannot exceed paid balance', async () => {
        // Attempt refund of 40,000 (exceeds paid 30,000)
        const excessiveRefund = await request
            .post('/api/v1/finance/refunds/request')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            invoiceId: m10InvoiceId,
            studentId,
            amountPaise: 4000000, // 40,000 exceeds paid 30,000
            reason: 'Duplicate payment claim'
        });
        (0, vitest_1.expect)(excessiveRefund.status).toBe(400);
        (0, vitest_1.expect)(excessiveRefund.body.error).toContain('cannot exceed paid balance');
        // Valid partial refund request of 10,000
        const validRefund = await request
            .post('/api/v1/finance/refunds/request')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            invoiceId: m10InvoiceId,
            studentId,
            amountPaise: 1000000,
            reason: 'Eligible course reduction rebate'
        });
        (0, vitest_1.expect)(validRefund.status).toBe(201);
        const refundId = validRefund.body.refundId;
        // Approve refund by finance officer
        const approveRes = await request
            .post(`/api/v1/finance/refunds/${refundId}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(approveRes.status).toBe(200);
        (0, vitest_1.expect)(approveRes.body.status).toBe('APPROVED');
        (0, vitest_1.expect)(approveRes.body.providerRefundId).toBeDefined();
    });
    (0, vitest_1.it)('29. Concession & Scholarship Gate: Concession applies and updates invoice balance', async () => {
        const concessionRes = await request
            .post('/api/v1/finance/concessions/request')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            institutionId,
            studentId,
            invoiceId: m10InvoiceId,
            category: 'NEED_BASED',
            amountPaise: 500000, // ₹5,000
            reason: 'Special Dean Hardship Grant'
        });
        (0, vitest_1.expect)(concessionRes.status).toBe(201);
        const concessionId = concessionRes.body.concessionId;
        // Review & Approve
        const reviewRes = await request
            .post(`/api/v1/finance/concessions/${concessionId}/review`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'APPROVED' });
        (0, vitest_1.expect)(reviewRes.status).toBe(200);
        (0, vitest_1.expect)(reviewRes.body.status).toBe('APPROVED');
    });
    (0, vitest_1.it)('30. Reconciliation Gate: Reconcile orders and flag deliberately pending order', async () => {
        const reconRes = await request
            .post('/api/v1/finance/reconciliation/run')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            periodStart: '2026-01-01',
            periodEnd: '2026-12-31'
        });
        (0, vitest_1.expect)(reconRes.status).toBe(200);
        (0, vitest_1.expect)(reconRes.body.totalOrdersChecked).toBeGreaterThan(0);
        (0, vitest_1.expect)(reconRes.body.matchedCount).toBeGreaterThan(0);
        // Verify deliberately pending order was detected
        const pendingOrderFlagged = reconRes.body.unmatchedOrders.some((u) => u.orderId === 'ORD-PENDING-DEMO' && u.status === 'PENDING_ORDER');
        (0, vitest_1.expect)(pendingOrderFlagged).toBe(true);
    });
    // ==========================================
    // M11 TESTS: EXAM APPLICATIONS, ELIGIBILITY & HALL TICKETS
    // ==========================================
    let m11ActiveCycleId;
    let m11CourseIds = [];
    let m11AaravAppId;
    let m11TicketId;
    let m11TicketNumber;
    (0, vitest_1.it)('31. Closed Window Gate: Exam application submission is blocked when application window is closed', async () => {
        // 1. Fetch available courses
        const coursesRes = await request.get('/api/v1/courses').set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(coursesRes.status).toBe(200);
        m11CourseIds = [coursesRes.body[0]._id, coursesRes.body[1]._id];
        // 2. Create an exam cycle with an expired application window (2026-01-01 to 2026-01-15)
        const closedCycleRes = await request
            .post('/api/v1/exam-applications/cycles')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            code: 'CLOSED-2026',
            name: 'Past Closed Examination Cycle',
            academicYear: '2025-2026',
            semester: 3,
            startDate: '2026-02-01',
            endDate: '2026-02-20',
            applicationStartDate: '2026-01-01',
            applicationEndDate: '2026-01-15'
        });
        (0, vitest_1.expect)(closedCycleRes.status).toBe(201);
        const closedCycleId = closedCycleRes.body._id;
        // 3. Attempt application submission in closed cycle -> Expect 400 Blocked
        const submitClosedRes = await request
            .post('/api/v1/exam-applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            cycleId: closedCycleId,
            studentId,
            category: 'REGULAR',
            subjectIds: m11CourseIds
        });
        (0, vitest_1.expect)(submitClosedRes.status).toBe(400);
        (0, vitest_1.expect)(submitClosedRes.body.error).toContain('window is closed');
    });
    (0, vitest_1.it)('32. Ineligibility & Prerequisites Gate: Unpaid fee arrears block exam registration', async () => {
        // Get the seeded open cycle WIN2026
        const cyclesRes = await request.get('/api/v1/exam-applications/cycles').set('Authorization', `Bearer ${adminToken}`);
        const winCycle = cyclesRes.body.find((c) => c.code === 'WIN2026');
        (0, vitest_1.expect)(winCycle).toBeDefined();
        m11ActiveCycleId = winCycle._id;
        // Check eligibility for Aarav (has unpaid invoice INV-2026-0001)
        const eligRes = await request
            .get(`/api/v1/exam-applications/eligibility/${m11ActiveCycleId}/${studentId}`)
            .set('Authorization', `Bearer ${studentToken}`);
        (0, vitest_1.expect)(eligRes.status).toBe(200);
        (0, vitest_1.expect)(eligRes.body.overallStatus).toBe('INELIGIBLE');
        (0, vitest_1.expect)(eligRes.body.ineligibilityReasons.length).toBeGreaterThan(0);
        const hasShortageOrArrears = eligRes.body.ineligibilityReasons.some((r) => r.toLowerCase().includes('fee') || r.toLowerCase().includes('attendance'));
        (0, vitest_1.expect)(hasShortageOrArrears).toBe(true);
        // Attempt submission while ineligible -> Expect 400 Blocked
        const submitBlockedRes = await request
            .post('/api/v1/exam-applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            studentId,
            category: 'REGULAR',
            subjectIds: m11CourseIds
        });
        (0, vitest_1.expect)(submitBlockedRes.status).toBe(400);
        (0, vitest_1.expect)(submitBlockedRes.body.error).toContain('blocked due to ineligibility');
    });
    (0, vitest_1.it)('33. Audited Exception & Approval Gate: Exam officer grants exception; application unblocked, approved & enrolled', async () => {
        // 1. Exam Officer grants audited exception overriding fee clearance and attendance requirements
        const exceptionRes = await request
            .post('/api/v1/exam-applications/exceptions/grant')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            studentId,
            reason: 'Special Dean Merit Exemption granted vide Resolution EC/2026/104',
            grantedBy: 'CONTROLLER_OF_EXAMINATIONS',
            overrideFee: true,
            overrideAttendance: true
        });
        (0, vitest_1.expect)(exceptionRes.status).toBe(200);
        (0, vitest_1.expect)(exceptionRes.body.decision.hasException).toBe(true);
        // 2. Now submit application -> Should succeed (201 Created)
        const submitRes = await request
            .post('/api/v1/exam-applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            studentId,
            category: 'REGULAR',
            subjectIds: m11CourseIds
        });
        (0, vitest_1.expect)(submitRes.status).toBe(201);
        (0, vitest_1.expect)(submitRes.body.status).toBe('SUBMITTED');
        m11AaravAppId = submitRes.body._id;
        // 3. Pay the required examination fee prior to hall ticket issuance
        const payRes = await request
            .post(`/api/v1/exam-applications/${m11AaravAppId}/pay`)
            .set('Authorization', `Bearer ${studentToken}`);
        (0, vitest_1.expect)(payRes.status).toBe(200);
        (0, vitest_1.expect)(payRes.body.feePaid).toBe(true);
        // 4. Review & Approve application
        const approveRes = await request
            .post(`/api/v1/exam-applications/review/${m11AaravAppId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ decision: 'APPROVE' });
        (0, vitest_1.expect)(approveRes.status).toBe(200);
        (0, vitest_1.expect)(approveRes.body.status).toBe('APPROVED');
        // 5. Assign Prototype Roll Number
        const rollRes = await request
            .post('/api/v1/exam-applications/roll-numbers/assign')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            studentId,
            applicationId: m11AaravAppId,
            rollNumber: 'WIN2026-CSE-1001'
        });
        (0, vitest_1.expect)(rollRes.status).toBe(200);
        (0, vitest_1.expect)(rollRes.body.rollNumber).toBe('WIN2026-CSE-1001');
    });
    (0, vitest_1.it)('34. Idempotency Gate: Repeat hall ticket issuance returns same record without duplication', async () => {
        // First issuance
        const issueRes1 = await request
            .post('/api/v1/exam-applications/hall-tickets/issue')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            applicationId: m11AaravAppId,
            centerCode: 'CTR-101',
            centerName: 'Main Academic Complex Hall A',
            reportingTime: '08:30 AM'
        });
        (0, vitest_1.expect)(issueRes1.status).toBe(201);
        m11TicketId = issueRes1.body._id;
        m11TicketNumber = issueRes1.body.ticketNumber;
        (0, vitest_1.expect)(m11TicketNumber).toBeDefined();
        // Repeat issuance -> Must be idempotent, return same ticket
        const issueRes2 = await request
            .post('/api/v1/exam-applications/hall-tickets/issue')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            applicationId: m11AaravAppId,
            centerCode: 'CTR-101',
            centerName: 'Main Academic Complex Hall A',
            reportingTime: '08:30 AM'
        });
        (0, vitest_1.expect)(issueRes2.status).toBe(201);
        (0, vitest_1.expect)(issueRes2.body._id).toBe(m11TicketId);
        (0, vitest_1.expect)(issueRes2.body.ticketNumber).toBe(m11TicketNumber);
    });
    (0, vitest_1.it)('35. Student Boundary Gate: Hall tickets never cross student boundaries (403 Forbidden)', async () => {
        // 1. Login as Student 2 (Ananya Patel)
        const student2Res = await request.post('/api/v1/auth/login').send({
            email: 'student.ananya@campussetu.edu',
            password: 'Password123!',
            role: index_2.UserRole.STUDENT
        });
        (0, vitest_1.expect)(student2Res.status).toBe(200);
        const student2Token = student2Res.body.token;
        const student2Id = student2Res.body.user.studentId;
        // 2. Ananya attempts to view Aarav\'s hall ticket -> Expect 403 Forbidden!
        const crossAccessRes = await request
            .get(`/api/v1/exam-applications/hall-tickets/${m11TicketId}`)
            .set('Authorization', `Bearer ${student2Token}`);
        (0, vitest_1.expect)(crossAccessRes.status).toBe(403);
        (0, vitest_1.expect)(crossAccessRes.body.error).toContain('Hall tickets never cross student boundaries');
        // 3. Aarav views his own hall ticket -> Expect 200 OK
        const ownTicketRes = await request
            .get(`/api/v1/exam-applications/hall-tickets/${m11TicketId}`)
            .set('Authorization', `Bearer ${studentToken}`);
        (0, vitest_1.expect)(ownTicketRes.status).toBe(200);
        (0, vitest_1.expect)(ownTicketRes.body.ticketNumber).toBe(m11TicketNumber);
    });
    // ==========================================
    // M12: EXAM SCHEDULING, CENTERS & MATERIALS TESTS
    // ==========================================
    let m12CenterId;
    let m12Schedule1Id;
    let m12Student1Id;
    let m12Student2Id;
    (0, vitest_1.it)('36. Center Verification & Schedule Publication: Verified centers enable published schedules with conflict detection', async () => {
        // 1. Fetch exam centers
        const centersRes = await request
            .get('/api/v1/exam-operations/centers')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(centersRes.status).toBe(200);
        (0, vitest_1.expect)(centersRes.body.length).toBeGreaterThan(0);
        const mainCenter = centersRes.body.find((c) => c.centerCode === 'CTR-MAIN');
        (0, vitest_1.expect)(mainCenter).toBeDefined();
        m12CenterId = mainCenter._id;
        // 2. Fetch center verifications
        const verifRes = await request
            .get(`/api/v1/exam-operations/verifications?centerId=${m12CenterId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(verifRes.status).toBe(200);
        (0, vitest_1.expect)(verifRes.body.length).toBeGreaterThan(0);
        (0, vitest_1.expect)(verifRes.body[0].status).toBe('VERIFIED');
        (0, vitest_1.expect)(verifRes.body[0].checklist.cctvFunctional).toBe(true);
        // 3. Fetch schedules
        const schedRes = await request
            .get('/api/v1/exam-operations/schedule')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(schedRes.status).toBe(200);
        (0, vitest_1.expect)(schedRes.body.length).toBeGreaterThan(0);
        m12Schedule1Id = schedRes.body[0]._id;
        (0, vitest_1.expect)(schedRes.body[0].status).toBe('PUBLISHED');
    });
    (0, vitest_1.it)('37. Capacity Gate & Over-Capacity Rejection: Room allocation respects capacity; over-capacity is rejected', async () => {
        // Get students
        const studentsRes = await request
            .get('/api/v1/students')
            .set('Authorization', `Bearer ${adminToken}`);
        m12Student1Id = studentsRes.body[0]._id;
        m12Student2Id = studentsRes.body[1]._id;
        // Room 102 in CTR-MAIN has capacity = 2
        // 1. Allocate 1 student into Room 102 -> Expect 201 Created
        const alloc1Res = await request
            .post('/api/v1/exam-operations/seating/allocate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            scheduleId: m12Schedule1Id,
            centerId: m12CenterId,
            roomId: '102',
            studentIds: [m12Student1Id]
        });
        (0, vitest_1.expect)(alloc1Res.status).toBe(201);
        (0, vitest_1.expect)(alloc1Res.body.length).toBe(1);
        (0, vitest_1.expect)(alloc1Res.body[0].seatNumber).toContain('R102-S01');
        // 2. Acceptance Gate: Attempt to allocate 2 more students into Room 102 (1 + 2 = 3 > 2) -> Expect 400 Over-Capacity Rejection!
        const overCapacityRes = await request
            .post('/api/v1/exam-operations/seating/allocate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            cycleId: m11ActiveCycleId,
            scheduleId: m12Schedule1Id,
            centerId: m12CenterId,
            roomId: '102',
            studentIds: [m12Student2Id, m12Student1Id]
        });
        (0, vitest_1.expect)(overCapacityRes.status).toBe(400);
        (0, vitest_1.expect)(overCapacityRes.body.error).toContain('Room capacity exceeded');
        (0, vitest_1.expect)(overCapacityRes.body.error).toContain('maximum capacity is 2');
    });
    (0, vitest_1.it)('38. Seating Reallocation & Audit Trail: Reallocating seat records reason and logs audit event', async () => {
        // Fetch active allocation in Room 102
        const currentAllocRes = await request
            .get(`/api/v1/exam-operations/seating/schedule/${m12Schedule1Id}?roomId=102`)
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(currentAllocRes.status).toBe(200);
        (0, vitest_1.expect)(currentAllocRes.body.length).toBeGreaterThan(0);
        const allocToMove = currentAllocRes.body[0];
        // Reallocate student from Room 102 to Room 103 (Capacity 25)
        const reallocRes = await request
            .post('/api/v1/exam-operations/seating/reallocate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            allocationId: allocToMove._id,
            newRoomId: '103',
            reason: 'Air conditioning malfunction in Room 102; relocated for candidate comfort'
        });
        (0, vitest_1.expect)(reallocRes.status).toBe(200);
        (0, vitest_1.expect)(reallocRes.body.status).toBe('ALLOCATED');
        (0, vitest_1.expect)(reallocRes.body.roomNumber).toBe('103');
        (0, vitest_1.expect)(reallocRes.body.reallocationReason).toContain('Air conditioning malfunction');
        // Verify AuditLog entry was recorded
        const auditRes = await request
            .get('/api/v1/system/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(auditRes.status).toBe(200);
        const reallocAudit = auditRes.body.find((a) => a.action === 'SEATING_REALLOCATION');
        (0, vitest_1.expect)(reallocAudit).toBeDefined();
        (0, vitest_1.expect)(reallocAudit.newState.reason).toContain('Air conditioning malfunction');
    });
    (0, vitest_1.it)('39. Serial Range Gate: Overlapping/duplicate answer-book serial range is rejected', async () => {
        // Existing seeded batch MB-2026-001 has range 100001 - 100500 with prefix 'AB-'
        // Attempting to create overlapping batch with range 100400 - 100900 -> Must reject!
        const overlapRes = await request
            .post('/api/v1/exam-operations/materials/batches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            cycleId: m11ActiveCycleId,
            batchNumber: 'MB-CONFLICT-001',
            materialType: 'MAIN_ANSWER_BOOK',
            prefix: 'AB-',
            startSerial: 100400,
            endSerial: 100900,
            securityBagSealNumber: 'SEAL-CONF-001'
        });
        (0, vitest_1.expect)(overlapRes.status).toBe(400);
        (0, vitest_1.expect)(overlapRes.body.error).toContain('Duplicate or overlapping serial range');
        (0, vitest_1.expect)(overlapRes.body.error).toContain('MB-2026-001');
    });
    (0, vitest_1.it)('40. Invigilation Gate: Duty roster clearly surfaces absent / unacknowledged duties', async () => {
        // 1. Fetch roster
        const rosterRes = await request
            .get('/api/v1/exam-operations/invigilators/roster')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, vitest_1.expect)(rosterRes.status).toBe(200);
        (0, vitest_1.expect)(rosterRes.body.length).toBeGreaterThan(0);
        // Find assigned unacknowledged duty
        const unackDuty = rosterRes.body.find((d) => d.status === 'ASSIGNED');
        (0, vitest_1.expect)(unackDuty).toBeDefined();
        // 2. Mark duty absent on exam day
        const absentRes = await request
            .post('/api/v1/exam-operations/invigilators/mark-absent')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            dutyId: unackDuty._id,
            remarks: 'Faculty member reported medical emergency; emergency reserve invigilator deployed'
        });
        (0, vitest_1.expect)(absentRes.status).toBe(200);
        (0, vitest_1.expect)(absentRes.body.status).toBe('ABSENT');
        (0, vitest_1.expect)(absentRes.body.remarks).toContain('medical emergency');
    });
    (0, vitest_1.it)('41. Materials Reconciliation Gate & Confidentiality: Dispatched reconciles with Used+Returned+Damaged; confidential notes restricted', async () => {
        // 1. Create a fresh demonstration batch
        const createBatchRes = await request
            .post('/api/v1/exam-operations/materials/batches')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            institutionId,
            cycleId: m11ActiveCycleId,
            batchNumber: 'MB-RECON-DEMO',
            materialType: 'MAIN_ANSWER_BOOK',
            prefix: 'DEMO-',
            startSerial: 500001,
            endSerial: 500200,
            securityBagSealNumber: 'SECRET-SEAL-8899',
            confidentialNotes: 'High-security confidential printing batch with holographic seal'
        });
        (0, vitest_1.expect)(createBatchRes.status).toBe(201);
        const batchId = createBatchRes.body._id;
        // 2. Dispatch 100 books to center
        const dispatchRes = await request
            .post('/api/v1/exam-operations/materials/dispatch')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            batchId,
            centerId: m12CenterId,
            startSerial: 500001,
            endSerial: 500100,
            quantity: 100,
            sealNumber: 'SECRET-SEAL-8899',
            remarks: 'Dispatched 100 demo answer books'
        });
        (0, vitest_1.expect)(dispatchRes.status).toBe(201);
        (0, vitest_1.expect)(dispatchRes.body.batch.dispatchedCount).toBe(100);
        // 3. Discrepancy test: used (70) + returned (20) + damaged (5) = 95 != 100 -> Expect DISCREPANCY
        const mismatchReconRes = await request
            .post('/api/v1/exam-operations/materials/reconcile')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            batchId,
            usedCount: 70,
            returnedCount: 20,
            damagedCount: 5,
            notes: '5 answer booklets unaccounted during post-exam count'
        });
        (0, vitest_1.expect)(mismatchReconRes.status).toBe(200);
        (0, vitest_1.expect)(mismatchReconRes.body.isReconciled).toBe(false);
        (0, vitest_1.expect)(mismatchReconRes.body.status).toBe('DISCREPANCY');
        (0, vitest_1.expect)(mismatchReconRes.body.variance).toBe(5);
        // 4. Exact Reconciliation demonstration: used (75) + returned (20) + damaged (5) = 100 == 100 dispatched -> Expect RECONCILED
        const exactReconRes = await request
            .post('/api/v1/exam-operations/materials/reconcile')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
            batchId,
            usedCount: 75,
            returnedCount: 20,
            damagedCount: 5,
            notes: 'Discovered 5 booklets in backup security locker. Batch fully accounted.'
        });
        (0, vitest_1.expect)(exactReconRes.status).toBe(200);
        (0, vitest_1.expect)(exactReconRes.body.isReconciled).toBe(true);
        (0, vitest_1.expect)(exactReconRes.body.status).toBe('RECONCILED');
        (0, vitest_1.expect)(exactReconRes.body.variance).toBe(0);
        // 5. Confidentiality Gate: Student querying batches cannot see confidentialNotes or securityBagSealNumber
        const studentBatchRes = await request
            .get('/api/v1/exam-operations/materials/batches')
            .set('Authorization', `Bearer ${studentToken}`);
        (0, vitest_1.expect)(studentBatchRes.status).toBe(200);
        const demoBatchStudentView = studentBatchRes.body.find((b) => b._id === batchId);
        (0, vitest_1.expect)(demoBatchStudentView).toBeDefined();
        (0, vitest_1.expect)(demoBatchStudentView.securityBagSealNumber).toBeUndefined();
        (0, vitest_1.expect)(demoBatchStudentView.confidentialNotes).toBeUndefined();
    });
});

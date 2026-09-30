"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./config/db");
const index_1 = require("@shared/index");
const models_1 = require("./models/models");
async function seedDatabase() {
    console.log('[Seed] Purging existing database collections...');
    await Promise.all([
        models_1.User.deleteMany({}),
        models_1.Institution.deleteMany({}),
        models_1.Department.deleteMany({}),
        models_1.Student.deleteMany({}),
        models_1.Course.deleteMany({}),
        models_1.Timetable.deleteMany({}),
        models_1.AttendanceRecord.deleteMany({}),
        models_1.Exam.deleteMany({}),
        models_1.MarkSheet.deleteMany({}),
        models_1.FeeStructure.deleteMany({}),
        models_1.FeeTransaction.deleteMany({}),
        models_1.PayrollRecord.deleteMany({}),
        models_1.HostelRoom.deleteMany({}),
        models_1.GatePass.deleteMany({}),
        models_1.TransportRoute.deleteMany({}),
        models_1.BusPass.deleteMany({}),
        models_1.Book.deleteMany({}),
        models_1.BookLoan.deleteMany({}),
        models_1.PlacementDrive.deleteMany({}),
        models_1.PlacementApplication.deleteMany({}),
        models_1.AlumniProfile.deleteMany({}),
        models_1.Grievance.deleteMany({}),
        models_1.Notice.deleteMany({}),
        models_1.AuditLog.deleteMany({}),
        models_1.OutboxEvent.deleteMany({}),
        models_1.Applicant.deleteMany({}),
        models_1.AdmissionApplication.deleteMany({}),
        models_1.AdmissionDocument.deleteMany({}),
        models_1.ImportBatch.deleteMany({}),
        models_1.ExternalCodeMapping.deleteMany({}),
        models_1.ReviewDecision.deleteMany({}),
        models_1.Enrollment.deleteMany({}),
        models_1.IdentifierSequence.deleteMany({}),
        models_1.EnrollmentHistory.deleteMany({}),
        models_1.ProfileChangeRequest.deleteMany({}),
        models_1.StudentDocument.deleteMany({}),
        models_1.StudentStatusEvent.deleteMany({}),
        models_1.GraduationRecord.deleteMany({}),
        models_1.AttendanceSession.deleteMany({}),
        models_1.AttendanceEntry.deleteMany({}),
        models_1.AttendanceCorrection.deleteMany({}),
        models_1.AttendancePolicyVersion.deleteMany({}),
        models_1.TeachingAssignment.deleteMany({}),
        models_1.Room.deleteMany({}),
        models_1.TimetableException.deleteMany({}),
        models_1.CalendarEvent.deleteMany({}),
        models_1.Holiday.deleteMany({}),
        models_1.SubjectEnrollment.deleteMany({}),
        models_1.FeeRuleVersion.deleteMany({}),
        models_1.Invoice.deleteMany({}),
        models_1.PaymentOrder.deleteMany({}),
        models_1.PaymentEvent.deleteMany({}),
        models_1.Receipt.deleteMany({}),
        models_1.Refund.deleteMany({}),
        models_1.Concession.deleteMany({}),
        models_1.ReconciliationRun.deleteMany({}),
        models_1.Fund.deleteMany({}),
        models_1.Budget.deleteMany({}),
        models_1.BudgetEntry.deleteMany({}),
        models_1.ExamCycle.deleteMany({}),
        models_1.ExamPolicyVersion.deleteMany({}),
        models_1.ExamApplication.deleteMany({}),
        models_1.EligibilityDecision.deleteMany({}),
        models_1.ExamEnrollment.deleteMany({}),
        models_1.RollNumberAssignment.deleteMany({}),
        models_1.HallTicket.deleteMany({}),
        models_1.ExamCenter.deleteMany({}),
        models_1.CenterVerification.deleteMany({}),
        models_1.ExamSchedule.deleteMany({}),
        models_1.SeatingAllocation.deleteMany({}),
        models_1.InvigilationDuty.deleteMany({}),
        models_1.MaterialBatch.deleteMany({}),
        models_1.MaterialMovement.deleteMany({})
    ]);
    console.log('[Seed] Creating Institution & Departments...');
    const inst = await models_1.Institution.create({
        code: 'DITS',
        name: 'Delhi Institute of Technology & Science',
        address: 'Sector 16, Knowledge Park, New Delhi',
        contactEmail: 'contact@dits.edu.in',
        contactPhone: '+91 11 2890 4321'
    });
    const depCse = await models_1.Department.create({
        institutionId: inst._id,
        code: 'CSE',
        name: 'Computer Science & Engineering'
    });
    const depEce = await models_1.Department.create({
        institutionId: inst._id,
        code: 'ECE',
        name: 'Electronics & Communication'
    });
    console.log('[Seed] Creating External Code Mappings for Admissions...');
    await models_1.ExternalCodeMapping.create({
        institutionId: inst._id,
        externalCode: 'CSE',
        mappedDepartmentId: depCse._id,
        mappedProgramCode: 'BTECH_CSE'
    });
    await models_1.ExternalCodeMapping.create({
        institutionId: inst._id,
        externalCode: 'ECE',
        mappedDepartmentId: depEce._id,
        mappedProgramCode: 'BTECH_ECE'
    });
    const passwordHash = await bcryptjs_1.default.hash('Password123!', 10);
    console.log('[Seed] Creating System Accounts for All Roles...');
    const superAdmin = await models_1.User.create({
        email: 'superadmin@campussetu.edu',
        passwordHash,
        name: 'Dr. Vikramaditya (Super Admin)',
        role: index_1.UserRole.SUPER_ADMIN
    });
    const admin = await models_1.User.create({
        email: 'admin@campussetu.edu',
        passwordHash,
        name: 'Suresh Menon (Campus Admin)',
        role: index_1.UserRole.ADMIN,
        institutionId: inst._id
    });
    const facultyCse = await models_1.User.create({
        email: 'faculty.cse@campussetu.edu',
        passwordHash,
        name: 'Prof. Rajesh Sharma (HOD CSE)',
        role: index_1.UserRole.FACULTY,
        institutionId: inst._id
    });
    const facultyEce = await models_1.User.create({
        email: 'faculty.ece@campussetu.edu',
        passwordHash,
        name: 'Dr. Priya Sharma (Associate Prof ECE)',
        role: index_1.UserRole.FACULTY,
        institutionId: inst._id
    });
    depCse.headOfDepartmentId = facultyCse._id;
    depEce.headOfDepartmentId = facultyEce._id;
    await depCse.save();
    await depEce.save();
    const financeUser = await models_1.User.create({
        email: 'finance@campussetu.edu',
        passwordHash,
        name: 'Priya Verma (Finance Head)',
        role: index_1.UserRole.FINANCE,
        institutionId: inst._id
    });
    const wardenUser = await models_1.User.create({
        email: 'warden@campussetu.edu',
        passwordHash,
        name: 'Rameshwar Singh (Hostel Warden)',
        role: index_1.UserRole.WARDEN,
        institutionId: inst._id
    });
    const placementUser = await models_1.User.create({
        email: 'placement@campussetu.edu',
        passwordHash,
        name: 'Anita Kapoor (Placement Director)',
        role: index_1.UserRole.PLACEMENT_OFFICER,
        institutionId: inst._id
    });
    // Students & Guardians
    const guardianUser = await models_1.User.create({
        email: 'guardian.sharma@campussetu.edu',
        passwordHash,
        name: 'Mr. Ramesh Sharma (Parent)',
        role: index_1.UserRole.GUARDIAN,
        institutionId: inst._id,
        phone: '+91 98765 43210'
    });
    const studentUser1 = await models_1.User.create({
        email: 'student.aarav@campussetu.edu',
        passwordHash,
        name: 'Aarav Sharma',
        role: index_1.UserRole.STUDENT,
        institutionId: inst._id
    });
    const studentUser2 = await models_1.User.create({
        email: 'student.ananya@campussetu.edu',
        passwordHash,
        name: 'Ananya Patel',
        role: index_1.UserRole.STUDENT,
        institutionId: inst._id
    });
    const student1 = await models_1.Student.create({
        userId: studentUser1._id,
        institutionId: inst._id,
        departmentId: depCse._id,
        rollNumber: 'CSE-2024-001',
        enrollmentNumber: 'ENR2024001',
        currentSemester: 4,
        batchYear: 2024,
        guardianUserId: guardianUser._id,
        cgpa: 8.8
    });
    const student2 = await models_1.Student.create({
        userId: studentUser2._id,
        institutionId: inst._id,
        departmentId: depEce._id,
        rollNumber: 'ECE-2024-002',
        enrollmentNumber: 'ENR2024002',
        currentSemester: 4,
        batchYear: 2024,
        cgpa: 7.4
    });
    guardianUser.wardStudentIds = [student1._id];
    await guardianUser.save();
    console.log('[Seed] Creating Rooms & Course Catalog...');
    const room101 = await models_1.Room.create({
        institutionId: inst._id,
        name: 'LH-101',
        building: 'Academic Block A',
        capacity: 60,
        roomType: 'LECTURE_HALL',
        hasProjector: true,
        hasAC: true
    });
    const room102 = await models_1.Room.create({
        institutionId: inst._id,
        name: 'LH-102',
        building: 'Academic Block A',
        capacity: 60,
        roomType: 'LECTURE_HALL',
        hasProjector: true,
        hasAC: true
    });
    const courseDsa = await models_1.Course.create({
        institutionId: inst._id,
        departmentId: depCse._id,
        code: 'CS201',
        name: 'Data Structures & Algorithms',
        credits: 4,
        semester: 4,
        facultyId: facultyCse._id
    });
    const courseDbms = await models_1.Course.create({
        institutionId: inst._id,
        departmentId: depCse._id,
        code: 'CS202',
        name: 'Database Management Systems',
        credits: 3,
        semester: 4,
        facultyId: facultyCse._id
    });
    // Seed Enrolled Courses for Student 1
    await models_1.SubjectEnrollment.create({
        institutionId: inst._id,
        studentId: student1._id,
        semester: 4,
        academicYear: '2026-2027',
        courseIds: [courseDsa._id, courseDbms._id]
    });
    console.log('[Seed] Creating Timetable Entries...');
    const ttDsa = await models_1.TimetableEntry.create({
        institutionId: inst._id,
        departmentId: depCse._id,
        semester: 4,
        section: 'A',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        courseId: courseDsa._id,
        roomNumber: 'LH-101',
        roomId: room101._id,
        facultyId: facultyCse._id,
        recurrencePattern: 'WEEKLY',
        academicYear: '2026-2027',
        isPublished: true
    });
    await models_1.TimetableEntry.create({
        institutionId: inst._id,
        departmentId: depCse._id,
        semester: 4,
        section: 'A',
        dayOfWeek: 'Wednesday',
        startTime: '10:00',
        endTime: '11:00',
        courseId: courseDbms._id,
        roomNumber: 'LH-102',
        roomId: room102._id,
        facultyId: facultyCse._id,
        recurrencePattern: 'WEEKLY',
        academicYear: '2026-2027',
        isPublished: true
    });
    console.log('[Seed] Creating Academic Calendar Events & Holidays...');
    await models_1.CalendarEvent.create({
        institutionId: inst._id,
        title: 'Mahatma Gandhi Jayanti Holiday',
        eventType: 'HOLIDAY',
        startDate: '2026-10-02',
        endDate: '2026-10-02',
        description: 'National Academic Holiday',
        isHoliday: true,
        affectsClasses: true
    });
    await models_1.Holiday.create({
        institutionId: inst._id,
        name: 'Mahatma Gandhi Jayanti',
        date: '2026-10-02',
        description: 'Mandatory Holiday',
        isMandatory: true
    });
    console.log('[Seed] Creating Teaching Assignments & Attendance Policy...');
    await models_1.TeachingAssignment.create({
        institutionId: inst._id,
        courseId: courseDsa._id,
        facultyId: facultyCse._id,
        semester: 4,
        section: 'A',
        academicYear: '2026-2027'
    });
    await models_1.AttendancePolicyVersion.create({
        institutionId: inst._id,
        policyName: 'Standard University Academic Regulations 2026',
        minPercentageRequired: 75,
        countExcusedInDenominator: false,
        version: 1,
        isCurrent: true
    });
    console.log('[Seed] Creating Attendance Sessions & Entries...');
    const attSession = await models_1.AttendanceSession.create({
        institutionId: inst._id,
        courseId: courseDsa._id,
        facultyId: facultyCse._id,
        date: '2026-09-29',
        startTime: '09:00',
        endTime: '10:00',
        semester: 4,
        section: 'A',
        topicCovered: 'Data Structures: Graph Traversals DFS/BFS',
        status: 'COMPLETED'
    });
    const entry1 = await models_1.AttendanceEntry.create({
        institutionId: inst._id,
        sessionId: attSession._id,
        courseId: courseDsa._id,
        studentId: student1._id,
        date: '2026-09-29',
        status: index_1.AttendanceStatus.PRESENT,
        remarks: 'Punctual attendance'
    });
    const entry2 = await models_1.AttendanceEntry.create({
        institutionId: inst._id,
        sessionId: attSession._id,
        courseId: courseDsa._id,
        studentId: student2._id,
        date: '2026-09-29',
        status: index_1.AttendanceStatus.ABSENT,
        remarks: 'Absence recorded - medical note pending'
    });
    await models_1.AttendanceCorrection.create({
        institutionId: inst._id,
        sessionId: attSession._id,
        entryId: entry2._id,
        studentId: student2._id,
        priorStatus: index_1.AttendanceStatus.ABSENT,
        requestedStatus: index_1.AttendanceStatus.EXCUSED,
        reason: 'Submitted medical certificate for 29th Sep class',
        status: 'PENDING'
    });
    await models_1.AttendanceRecord.create({
        institutionId: inst._id,
        courseId: courseDsa._id,
        facultyId: facultyCse._id,
        date: '2026-09-29',
        semester: 4,
        section: 'A',
        entries: [
            { studentId: student1._id, status: index_1.AttendanceStatus.PRESENT },
            { studentId: student2._id, status: index_1.AttendanceStatus.ABSENT, remarks: 'Medical Leave' }
        ]
    });
    const examMid = await models_1.Exam.create({
        institutionId: inst._id,
        name: 'Mid-Term Examination 2026',
        examType: index_1.ExamType.MID_TERM,
        academicYear: '2025-2026',
        startDate: '2026-10-10',
        endDate: '2026-10-20'
    });
    await models_1.MarkSheet.create({
        examId: examMid._id,
        courseId: courseDsa._id,
        studentId: student1._id,
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A',
        isFinalized: true,
        finalizedBy: facultyCse._id,
        finalizedAt: new Date()
    });
    console.log('[Seed] Creating Fee Structures & Transactions (Integer Paise)...');
    await models_1.FeeStructure.create({
        institutionId: inst._id,
        departmentId: depCse._id,
        batchYear: 2024,
        semester: 4,
        feeType: index_1.FeeType.TUITION,
        amountPaise: 5000000, // ₹50,000.00
        dueDate: '2026-11-15'
    });
    await models_1.FeeTransaction.create({
        transactionId: 'TXN-20260930-1001',
        idempotencyKey: 'SEED-IDEMP-FEE-001',
        studentId: student1._id,
        institutionId: inst._id,
        amountPaise: 5000000, // ₹50,000.00
        feeType: index_1.FeeType.TUITION,
        paymentMode: index_1.PaymentMode.UPI,
        status: index_1.PaymentStatus.SUCCESS,
        receiptNumber: 'RCP-20260930-1001',
        gatewayReference: 'PAY-SIM-RAZORPAY-8821'
    });
    console.log('[Seed] Creating M10 Fee Rules, Invoices, Orders, Concessions, Funds & Budgets...');
    const feeRule = await models_1.FeeRuleVersion.create({
        institutionId: inst._id,
        name: 'B.Tech CSE Semester 4 Standard Fee Structure',
        version: 1,
        academicYear: '2026-2027',
        departmentId: depCse._id,
        feeCategory: index_1.FeeType.TUITION,
        heads: [
            { name: 'Tuition Fee', code: 'TUIT', amountPaise: 4000000, isMandatory: true }, // ₹40,000
            { name: 'Computer Lab & Cloud Computing Fee', code: 'LAB', amountPaise: 1000000, isMandatory: true }, // ₹10,000
            { name: 'Digital Library & IEEE Access', code: 'LIB', amountPaise: 250000, isMandatory: true }, // ₹2,500
            { name: 'Examination & Evaluation Fee', code: 'EXAM', amountPaise: 250000, isMandatory: true } // ₹2,500
        ],
        totalAmountPaise: 5500000, // ₹55,000
        lateFeeRule: { graceDays: 15, dailyLateFeePaise: 5000, maxLateFeePaise: 100000 },
        status: 'ACTIVE'
    });
    const invoice1 = await models_1.Invoice.create({
        invoiceNumber: 'INV-2026-0001',
        studentId: student1._id,
        institutionId: inst._id,
        academicYear: '2026-2027',
        semester: 4,
        dueDate: '2026-11-30',
        lines: [
            { head: 'Tuition Fee', category: 'TUITION', amountPaise: 4000000 },
            { head: 'Computer Lab Fee', category: 'LAB', amountPaise: 1000000 },
            { head: 'Digital Library', category: 'LIBRARY', amountPaise: 250000 },
            { head: 'Examination Fee', category: 'EXAM', amountPaise: 250000 }
        ],
        totalAmountPaise: 5500000,
        concessionAmountPaise: 1000000, // ₹10,000 merit concession applied
        payableAmountPaise: 4500000, // ₹45,000
        paidAmountPaise: 0,
        status: index_1.InvoiceStatus.ISSUED
    });
    const invoice2 = await models_1.Invoice.create({
        invoiceNumber: 'INV-2026-0002',
        studentId: student2._id,
        institutionId: inst._id,
        academicYear: '2026-2027',
        semester: 4,
        dueDate: '2026-11-30',
        lines: [
            { head: 'Tuition Fee', category: 'TUITION', amountPaise: 4000000 },
            { head: 'Computer Lab Fee', category: 'LAB', amountPaise: 1000000 }
        ],
        totalAmountPaise: 5000000,
        concessionAmountPaise: 0,
        payableAmountPaise: 5000000,
        paidAmountPaise: 5000000,
        status: index_1.InvoiceStatus.PAID
    });
    const paidOrder2 = await models_1.PaymentOrder.create({
        orderId: 'ORD-2026-0002',
        invoiceId: invoice2._id,
        studentId: student2._id,
        institutionId: inst._id,
        amountPaise: 5000000,
        currency: 'INR',
        status: index_1.PaymentOrderStatus.PAID,
        idempotencyKey: 'SEED-IDEMP-ORD-002',
        provider: 'RAZORPAY_SIM',
        providerOrderId: 'order_sim_seed002',
        expiresAt: new Date(Date.now() + 86400000),
        paidAt: new Date(),
        receiptNumber: 'RCP-2026-0002'
    });
    await models_1.Receipt.create({
        receiptNumber: 'RCP-2026-0002',
        invoiceId: invoice2._id,
        paymentOrderId: 'ORD-2026-0002',
        studentId: student2._id,
        institutionId: inst._id,
        amountPaise: 5000000,
        paymentMode: index_1.PaymentMode.UPI,
        issuedAt: new Date(),
        counterfoilData: { providerPaymentId: 'pay_sim_seed002', provider: 'RAZORPAY_SIM' }
    });
    await models_1.PaymentEvent.create({
        eventId: 'EVT-SEED-002',
        orderId: 'ORD-2026-0002',
        providerPaymentId: 'pay_sim_seed002',
        eventType: index_1.PaymentEventType.PAYMENT_SUCCESS,
        amountPaise: 5000000,
        currency: 'INR',
        signature: 'seed_sim_signature_002',
        verified: true,
        processed: true
    });
    // Deliberately pending payment order for reproducible demonstration & reconciliation gate
    await models_1.PaymentOrder.create({
        orderId: 'ORD-PENDING-DEMO',
        invoiceId: invoice1._id,
        studentId: student1._id,
        institutionId: inst._id,
        amountPaise: 4500000,
        currency: 'INR',
        status: index_1.PaymentOrderStatus.CREATED,
        idempotencyKey: 'IDEMP-DEMO-PENDING-001',
        provider: 'RAZORPAY_SIM',
        providerOrderId: 'order_sim_pending_demo',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });
    await models_1.Concession.create({
        concessionId: 'CNC-2026-0001',
        studentId: student1._id,
        invoiceId: invoice1._id,
        category: index_1.ConcessionCategory.MERIT_SCHOLARSHIP,
        amountPaise: 1000000, // ₹10,000
        reason: 'Top 5% Departmental Academic Standing Award',
        status: index_1.ConcessionStatus.APPROVED,
        approvedBy: 'FINANCE_HEAD'
    });
    // Funds & Budgets
    const fund1 = await models_1.Fund.create({
        code: 'UGC_INFRA',
        name: 'UGC Infrastructure & Modernization Grant',
        description: 'Central grant for departmental computing laboratories and high-performance clusters',
        totalAllocatedPaise: 500000000, // ₹50 Lakhs
        utilizedPaise: 150000000,
        balancePaise: 350000000
    });
    const fund2 = await models_1.Fund.create({
        code: 'STUDENT_WELFARE',
        name: 'Student Welfare & Emergency Aid Fund',
        description: 'Direct institutional financial aid and merit scholarships',
        totalAllocatedPaise: 200000000, // ₹20 Lakhs
        utilizedPaise: 1000000,
        balancePaise: 199000000
    });
    const budget1 = await models_1.Budget.create({
        academicYear: '2026-2027',
        departmentId: depCse._id,
        fundId: fund1._id,
        fundCode: 'UGC_INFRA',
        fundName: 'UGC Infrastructure & Modernization Grant',
        allocatedPaise: 150000000, // ₹15 Lakhs
        spentPaise: 50000000,
        status: index_1.BudgetStatus.APPROVED
    });
    await models_1.BudgetEntry.create({
        budgetId: budget1._id,
        head: 'AI/ML GPU Workstations',
        allocatedPaise: 100000000,
        spentPaise: 50000000,
        approvedAt: new Date(),
        approvedBy: 'FINANCE_CONTROLLER'
    });
    await models_1.BudgetEntry.create({
        budgetId: budget1._id,
        head: 'Campus Network Gigabit Upgrade',
        allocatedPaise: 50000000,
        spentPaise: 0,
        approvedAt: new Date(),
        approvedBy: 'FINANCE_CONTROLLER'
    });
    console.log('[Seed] Creating Staff Payroll (Integer Paise)...');
    await models_1.PayrollRecord.create({
        institutionId: inst._id,
        monthYear: '2026-09',
        staffId: facultyCse._id,
        baseSalaryPaise: 8500000, // ₹85,000
        hraPaise: 1500000, // ₹15,000
        deductionsPaise: 500000, // ₹5,000
        netSalaryPaise: 9500000, // ₹95,000
        status: 'APPROVED',
        idempotencyKey: 'SEED-IDEMP-PAYROLL-001'
    });
    console.log('[Seed] Creating Hostel, Transport, Library & Placements...');
    await models_1.HostelRoom.create({
        institutionId: inst._id,
        buildingName: 'Kalpana Chawla Hall',
        roomNumber: '101',
        capacity: 2,
        currentOccupancy: 1,
        monthlyRentPaise: 600000 // ₹6,000
    });
    await models_1.GatePass.create({
        studentId: student1._id,
        reason: 'Weekend Home Visit',
        outDate: '2026-10-02',
        inDate: '2026-10-04',
        status: 'APPROVED',
        approvedBy: wardenUser._id
    });
    await models_1.TransportRoute.create({
        institutionId: inst._id,
        routeNumber: 'R-12',
        routeName: 'Connaught Place to Campus Express',
        vehicleNumber: 'DL-01-AB-1234',
        driverName: 'Sohan Lal',
        feePaise: 250000 // ₹2,500
    });
    await models_1.Book.create({
        institutionId: inst._id,
        isbn: '978-0262033848',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen',
        totalCopies: 15,
        availableCopies: 12
    });
    const driveGoogle = await models_1.PlacementDrive.create({
        institutionId: inst._id,
        companyName: 'Google India',
        jobTitle: 'Software Development Engineer I',
        packageLpaPaise: 240000000, // 24 LPA = ₹24,000,000 = 2,400,000,000 Paise
        eligibilityMinCgpa: 8.0,
        deadline: '2026-11-30',
        status: 'ACTIVE'
    });
    await models_1.PlacementApplication.create({
        driveId: driveGoogle._id,
        studentId: student1._id,
        status: 'SHORTLISTED'
    });
    console.log('[Seed] Creating Support Grievances & Notice Board...');
    await models_1.Grievance.create({
        institutionId: inst._id,
        userId: studentUser1._id,
        category: index_1.GrievanceCategory.HOSTEL,
        subject: 'Wi-Fi connectivity issue in Kalpana Chawla Hall Block B',
        description: 'Signal drops frequently after 10 PM during study hours.',
        status: 'IN_PROGRESS'
    });
    await models_1.Notice.create({
        institutionId: inst._id,
        title: 'Mid-Term Exam Timetable Published',
        content: 'All undergraduate students must download their hall tickets from the portal before 5th October.',
        targetRole: 'ALL',
        publishedBy: admin._id
    });
    console.log('[Seed] Creating M11 Exam Cycles, Applications, Exceptions & Hall Tickets...');
    const winterCycle = await models_1.ExamCycle.create({
        institutionId: inst._id,
        code: 'WIN2026',
        name: 'Winter 2026 Regular & Backlog Examinations',
        academicYear: '2026-2027',
        semester: 4,
        startDate: '2026-11-20',
        endDate: '2026-12-10',
        applicationStartDate: '2026-09-01',
        applicationEndDate: '2026-10-31',
        status: index_1.ExamCycleStatus.APPLICATION_OPEN
    });
    const examPolicy = await models_1.ExamPolicyVersion.create({
        cycleId: winterCycle._id,
        version: 1,
        minAttendancePercentage: 75,
        requireFeeClearance: true,
        feePerSubjectPaise: 50000, // ₹500
        lateFeeChargePaise: 20000, // ₹200
        allowBacklog: true,
        allowPrivate: false,
        isActive: true
    });
    // 1. Ineligible case demonstration: Student 1 (Aarav Sharma) has unpaid fees (INV-2026-0001)
    const decStudent1 = await models_1.EligibilityDecision.create({
        cycleId: winterCycle._id,
        studentId: student1._id,
        overallStatus: index_1.EligibilityStatus.INELIGIBLE,
        attendancePercentage: 100,
        feeCleared: false,
        ineligibilityReasons: ['Outstanding fee arrears must be cleared prior to exam registration'],
        hasException: false
    });
    // 2. Exception & Issuance demonstration: Student 2 (Ananya Patel) had attendance shortage (0%)
    // Exam Controller grants audited exception based on verified medical certification
    const decStudent2 = await models_1.EligibilityDecision.create({
        cycleId: winterCycle._id,
        studentId: student2._id,
        overallStatus: index_1.EligibilityStatus.CONDITIONAL_EXCEPTION,
        attendancePercentage: 0,
        feeCleared: true,
        ineligibilityReasons: [],
        hasException: true,
        exceptionReason: 'Special medical exemption approved by Academic Council vide Resolution AC-2026/89',
        exceptionGrantedBy: 'CONTROLLER_OF_EXAMINATIONS',
        exceptionGrantedAt: new Date()
    });
    const appStudent2 = await models_1.ExamApplication.create({
        applicationNumber: 'EX-WIN2026-000002',
        cycleId: winterCycle._id,
        studentId: student2._id,
        category: index_1.ExamStudentCategory.REGULAR,
        subjectIds: [courseDsa._id, courseDbms._id],
        status: index_1.ExamApplicationStatus.HALL_TICKET_ISSUED,
        feeAmountPaise: 100000, // ₹1,000 (2 subjects)
        feePaid: true,
        submittedAt: new Date(Date.now() - 86400000),
        approvedAt: new Date(),
        approvedBy: 'CONTROLLER_OF_EXAMINATIONS'
    });
    decStudent2.applicationId = appStudent2._id;
    await decStudent2.save();
    await models_1.ExamEnrollment.create({
        cycleId: winterCycle._id,
        studentId: student2._id,
        subjectId: courseDsa._id,
        category: index_1.ExamStudentCategory.REGULAR,
        status: 'ENROLLED'
    });
    await models_1.ExamEnrollment.create({
        cycleId: winterCycle._id,
        studentId: student2._id,
        subjectId: courseDbms._id,
        category: index_1.ExamStudentCategory.REGULAR,
        status: 'ENROLLED'
    });
    const rollStudent2 = await models_1.RollNumberAssignment.create({
        cycleId: winterCycle._id,
        studentId: student2._id,
        applicationId: appStudent2._id,
        rollNumber: 'WIN2026-ECE-1002',
        assignedAt: new Date()
    });
    await models_1.HallTicket.create({
        ticketNumber: 'HT-WIN2026-200002',
        applicationId: appStudent2._id,
        cycleId: winterCycle._id,
        studentId: student2._id,
        rollNumber: rollStudent2.rollNumber,
        centerCode: 'CTR-101',
        centerName: 'Main Academic Complex Exam Hall B',
        reportingTime: '08:30 AM',
        papers: [
            {
                subjectId: courseDsa._id,
                subjectCode: courseDsa.code,
                subjectName: courseDsa.name,
                examDate: '2026-11-20',
                examTime: '09:30 AM - 12:30 PM'
            },
            {
                subjectId: courseDbms._id,
                subjectCode: courseDbms.code,
                subjectName: courseDbms.name,
                examDate: '2026-11-22',
                examTime: '09:30 AM - 12:30 PM'
            }
        ],
        issuedAt: new Date(),
        issuedBy: 'CONTROLLER_OF_EXAMINATIONS'
    });
    // ==========================================
    // 17. M12 EXAM SCHEDULING, CENTERS & MATERIALS FIXTURES
    // ==========================================
    console.log('[Seed] Creating M12 Exam Centers, Verification, Schedule, Allocation, Invigilation & Materials...');
    const examCenterMain = await models_1.ExamCenter.create({
        institutionId: inst._id,
        centerCode: 'CTR-MAIN',
        name: 'Main Campus Examination Complex',
        address: 'Block A & B, Knowledge Park, DITS Campus',
        contactPerson: 'Dr. Suresh Menon (Chief Superintendent)',
        contactPhone: '+91 11 2890 4399',
        totalCapacity: 57,
        rooms: [
            {
                roomId: '101',
                roomNumber: '101',
                building: 'Academic Block A',
                floor: 'First Floor',
                capacity: 30,
                hasCCTV: true,
                isAccessible: true
            },
            {
                roomId: '102',
                roomNumber: '102',
                building: 'Academic Block A',
                floor: 'First Floor',
                capacity: 2, // Deliberately small capacity room for over-capacity rejection test
                hasCCTV: true,
                isAccessible: true
            },
            {
                roomId: '103',
                roomNumber: '103',
                building: 'Academic Block B',
                floor: 'Ground Floor',
                capacity: 25,
                hasCCTV: true,
                isAccessible: true
            }
        ],
        status: 'ACTIVE'
    });
    await models_1.CenterVerification.create({
        institutionId: inst._id,
        centerId: examCenterMain._id,
        cycleId: winterCycle._id,
        verifiedBy: 'CONTROLLER_OF_EXAMINATIONS',
        verifiedAt: new Date(),
        checklist: {
            cctvFunctional: true,
            secureStorageAvailable: true,
            powerBackupAvailable: true,
            accessibilityCompliant: true,
            drinkingWaterAndWashrooms: true
        },
        remarks: 'Pre-exam inspection completed and approved. CCTV and secure strong-room verified.',
        status: index_1.CenterVerificationStatus.VERIFIED
    });
    const schedule1 = await models_1.ExamSchedule.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        subjectId: courseDsa._id,
        subjectCode: courseDsa.code,
        subjectName: courseDsa.name,
        examDate: '2026-11-20',
        startTime: '09:30',
        endTime: '12:30',
        session: 'MORNING',
        centerId: examCenterMain._id,
        roomIds: ['101'],
        totalEnrolled: 2,
        status: index_1.ExamScheduleStatus.PUBLISHED,
        conflicts: [],
        publishedBy: 'CONTROLLER_OF_EXAMINATIONS',
        publishedAt: new Date()
    });
    const schedule2 = await models_1.ExamSchedule.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        subjectId: courseDbms._id,
        subjectCode: courseDbms.code,
        subjectName: courseDbms.name,
        examDate: '2026-11-22',
        startTime: '09:30',
        endTime: '12:30',
        session: 'MORNING',
        centerId: examCenterMain._id,
        roomIds: ['101'],
        totalEnrolled: 2,
        status: index_1.ExamScheduleStatus.PUBLISHED,
        conflicts: [],
        publishedBy: 'CONTROLLER_OF_EXAMINATIONS',
        publishedAt: new Date()
    });
    // Seating Allocation for Student 2
    await models_1.SeatingAllocation.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        scheduleId: schedule1._id,
        centerId: examCenterMain._id,
        roomId: '101',
        roomNumber: '101',
        seatNumber: 'R101-S01',
        studentId: student2._id,
        studentRollNumber: 'WIN2026-ECE-1002',
        studentName: 'Ananya Patel',
        subjectId: courseDsa._id,
        allocatedAt: new Date(),
        allocatedBy: 'CONTROLLER_OF_EXAMINATIONS',
        status: index_1.SeatingAllocationStatus.ALLOCATED
    });
    // Invigilation Duty: Duty 1 Acknowledged, Duty 2 Assigned (Absent / Pending acknowledgement visible)
    await models_1.InvigilationDuty.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        scheduleId: schedule1._id,
        centerId: examCenterMain._id,
        roomId: '101',
        facultyId: facultyCse._id,
        facultyName: facultyCse.name,
        facultyEmail: facultyCse.email,
        dutyDate: '2026-11-20',
        startTime: '09:30',
        endTime: '12:30',
        reportingTime: '08:30 AM',
        status: index_1.InvigilationDutyStatus.ACKNOWLEDGED,
        assignedBy: 'CONTROLLER_OF_EXAMINATIONS',
        assignedAt: new Date(),
        acknowledgedAt: new Date()
    });
    await models_1.InvigilationDuty.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        scheduleId: schedule2._id,
        centerId: examCenterMain._id,
        roomId: '101',
        facultyId: facultyEce._id,
        facultyName: facultyEce.name,
        facultyEmail: facultyEce.email,
        dutyDate: '2026-11-22',
        startTime: '09:30',
        endTime: '12:30',
        reportingTime: '08:30 AM',
        status: index_1.InvigilationDutyStatus.ASSIGNED, // Visible pending acknowledgement / unacknowledged gate
        assignedBy: 'CONTROLLER_OF_EXAMINATIONS',
        assignedAt: new Date()
    });
    // Material Batches
    // Batch 1: Reconciled normal path: 200 dispatched = 180 used + 18 returned + 2 damaged
    const batch1 = await models_1.MaterialBatch.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        batchNumber: 'MB-2026-001',
        materialType: index_1.MaterialType.MAIN_ANSWER_BOOK,
        prefix: 'AB-',
        startSerial: 100001,
        endSerial: 100500,
        totalCount: 500,
        dispatchedCount: 200,
        usedCount: 180,
        returnedCount: 18,
        damagedCount: 2,
        status: index_1.MaterialBatchStatus.RECONCILED,
        securityBagSealNumber: 'SEAL-SEC-9901',
        confidentialNotes: 'High-security 32-page booklet with watermark',
        reconciliationNotes: 'Perfect reconciliation: Dispatched (200) = Used (180) + Returned (18) + Damaged (2)',
        reconciledAt: new Date(),
        reconciledBy: 'CONTROLLER_OF_EXAMINATIONS'
    });
    await models_1.MaterialMovement.create({
        institutionId: inst._id,
        batchId: batch1._id,
        movementType: index_1.MaterialMovementType.DISPATCH_TO_CENTER,
        centerId: examCenterMain._id,
        scheduleId: schedule1._id,
        startSerial: 100001,
        endSerial: 100200,
        quantity: 200,
        sealNumber: 'SEAL-SEC-9901',
        handledBy: 'CONTROLLER_OF_EXAMINATIONS',
        timestamp: new Date(),
        acknowledgementStatus: 'ACKNOWLEDGED',
        acknowledgedBy: 'Dr. Suresh Menon (Chief Superintendent)',
        acknowledgedAt: new Date(),
        remarks: 'Dispatched to Main Exam Complex under security escort'
    });
    // Batch 2: In-stock / active batch for demo and testing
    await models_1.MaterialBatch.create({
        institutionId: inst._id,
        cycleId: winterCycle._id,
        batchNumber: 'SB-2026-001',
        materialType: index_1.MaterialType.SUPPLEMENTARY_SHEET,
        prefix: 'SUP-',
        startSerial: 200001,
        endSerial: 200500,
        totalCount: 500,
        dispatchedCount: 100,
        usedCount: 0,
        returnedCount: 0,
        damagedCount: 0,
        status: index_1.MaterialBatchStatus.DISPATCHED,
        securityBagSealNumber: 'SEAL-SEC-9902',
        confidentialNotes: 'Supplementary 8-page ruled sheets'
    });
    await models_1.AuditLog.create({
        action: 'SYSTEM_SEED',
        resource: 'Database',
        newState: { status: 'Coherent Synthetic Dataset Initialized' }
    });
    console.log('[Seed] Database successfully seeded!');
}
if (require.main === module) {
    (0, db_1.connectDB)().then(async () => {
        await seedDatabase();
        process.exit(0);
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

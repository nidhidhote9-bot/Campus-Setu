# CampusSetu Required Modules and Pages Catalog

All listed modules and pages are mandatory components of the CampusSetu higher education ERP prototype workspace.

## Module 1: Core Platform, Auth & Multi-Tenancy
- **Page 1.1: Login / Role Portal (`/login`)**
  - Controls: Multi-role selector (SuperAdmin, Admin, Faculty, Student, Guardian, Finance, Warden, Placement), Email & Password inputs, Remember Me, CSRF protection token, Language Switcher (EN/HI).
  - Backend Action: `POST /api/v1/auth/login`
- **Page 1.2: System Dashboard (`/dashboard`)**
  - Controls: Role-adapted view, Metrics overview (Total Students, Faculty, Fee Collections in Paise, Active Placement Drives, Attendance Average), Quick Action shortcuts, Recent Audit Outbox activity feed.
  - Backend Action: `GET /api/v1/analytics/dashboard-summary`
- **Page 1.3: Institution & Department Manager (`/admin/institutions`)**
  - Controls: Institution list & creation modal, Department mapping, HOD assignment, Academic calendar setup.
  - Backend Action: `GET /POST /api/v1/institutions`, `POST /api/v1/departments`
- **Page 1.4: User & RBAC Management (`/admin/users`)**
  - Controls: User creation (Admin, Faculty, Student, Guardian), Ward linking for Guardians, Account status toggle, Role permission audit.
  - Backend Action: `GET /POST /api/v1/users`, `POST /api/v1/users/link-ward`

## Module 2: Student Admissions & Enrollment
- **Page 2.1: Admissions Portal (`/admissions`)**
  - Controls: Online application form (Personal info, Academic records, Course selection), Document upload simulation (DigiLocker verification badge), Application fee payment (integer paise).
  - Backend Action: `POST /api/v1/admissions/apply`, `POST /api/v1/admissions/pay-fee`
- **Page 2.2: Application Review & Seat Allocation (`/admin/admissions`)**
  - Controls: Filter applications by status/department, Verification checklist, Seat offer generation, Enrollment number issuance.
  - Backend Action: `GET /api/v1/admissions/applications`, `POST /api/v1/admissions/allocate-seat`
- **Page 2.3: Student Directory & Profile (`/students`, `/students/:id`)**
  - Controls: Student listing with search/filter (Department, Batch, Semester), Student profile view (Personal details, Academic transcript, Attendance rate, Fee dues, Guardian details).
  - Backend Action: `GET /api/v1/students`, `GET /api/v1/students/:id`

## Module 3: Academic Management & Timetable
- **Page 3.1: Course & Curriculum Catalog (`/academics/courses`)**
  - Controls: Course creation, Syllabus credits (Lecture, Tutorial, Practical), Prerequisite declaration, Faculty assignment.
  - Backend Action: `GET /POST /api/v1/courses`
- **Page 3.2: Class Timetable & Schedule (`/academics/timetable`)**
  - Controls: Timetable grid view (Monday-Saturday), Room allocation, Faculty conflict warning indicator, Weekly schedule export.
  - Backend Action: `GET /POST /api/v1/timetable`
- **Page 3.3: Attendance Management (`/academics/attendance`)**
  - Controls: Class selection, Date picker, Student roster checklist (Present, Absent, Late, Excused), QR/Geofence simulation mode, Low attendance threshold highlight (<75%).
  - Backend Action: `POST /api/v1/attendance`, `GET /api/v1/attendance/summary`

## Module 4: Examinations, Grading & Transcripts
- **Page 4.1: Exam Schedule & Invigilation (`/exams/schedule`)**
  - Controls: Exam creation (Mid-term, End-sem), Room allocation, Invigilator assignment, Student hall ticket generation.
  - Backend Action: `GET /POST /api/v1/exams`, `GET /api/v1/exams/hall-ticket/:studentId`
- **Page 4.2: Gradebook & Marks Entry (`/exams/marks`)**
  - Controls: Course & Exam selector, Student marks entry form, Automatic SGPA/CGPA calculation, Grade locks/Finalize button (Creates immutable ledger entry).
  - Backend Action: `POST /api/v1/exams/marks`, `POST /api/v1/exams/finalize`
- **Page 4.3: Grade Sheet & Transcript Verification (`/exams/transcripts`)**
  - Controls: Official report card generation, DigiLocker verification QR code simulator, Revision history viewer for mark corrections.
  - Backend Action: `GET /api/v1/exams/report-card/:studentId`

## Module 5: Financial Management (Fees & Staff Payroll)
- **Page 5.1: Student Fee Portal & Receipts (`/fees/student`)**
  - Controls: Fee breakdown (Tuition, Hostel, Exam in integer paise), Outstanding balance calculator, Razorpay [SIMULATION] checkout modal with `X-Idempotency-Key`, Download PDF Receipt.
  - Backend Action: `GET /api/v1/fees/student/:studentId`, `POST /api/v1/fees/pay`
- **Page 5.2: Fee Structure & Collections Dashboard (`/fees/admin`)**
  - Controls: Fee template creator (Department/Batch wise), Defaulter list, Payment status filters, Collection ledger overview.
  - Backend Action: `GET /POST /api/v1/fees/structures`, `GET /api/v1/fees/collections`
- **Page 5.3: Staff Payroll & Expense Ledger (`/finance/payroll`)**
  - Controls: Staff salary breakdown (Base, HRA, Deductions in integer paise), Monthly payroll approval batch, Adjustment/Revision entry, Approved Payslip viewer.
  - Backend Action: `GET /POST /api/v1/payroll/approve`, `GET /api/v1/payroll/slips`

## Module 6: Campus Facilities (Hostel, Transport & Library)
- **Page 6.1: Hostel Allocation & Gate Pass (`/facilities/hostel`)**
  - Controls: Building & room occupancy grid, Room allocation modal, Outpass/Gate pass student request form, Warden approval workflow.
  - Backend Action: `GET /POST /api/v1/hostels`, `POST /api/v1/hostels/gatepass`
- **Page 6.2: Transport Routes & Bus Pass (`/facilities/transport`)**
  - Controls: Vehicle route map/list, Driver contact details, Bus pass request form (fee calculated in integer paise), Active pass QR view.
  - Backend Action: `GET /POST /api/v1/transport/routes`, `POST /api/v1/transport/buspass`
- **Page 6.3: Library Catalog & Circulation (`/facilities/library`)**
  - Controls: Book inventory search (ISBN, Title, Author), Book issue/return modal, Overdue fine counter (Paise), Borrowing history.
  - Backend Action: `GET /POST /api/v1/library/books`, `POST /api/v1/library/issue`

## Module 7: Training, Placements & Alumni Network
- **Page 7.1: Placement Drives & Applications (`/placement/drives`)**
  - Controls: Placement drive post (Company, Role, Package in LPA paise, CGPA cutoff), Student eligibility scanner & 1-click apply, Application pipeline Kanban (Applied, Shortlisted, Interviewed, Offered).
  - Backend Action: `GET /POST /api/v1/placement/drives`, `POST /api/v1/placement/apply`
- **Page 7.2: Alumni Directory & Contributions (`/alumni`)**
  - Controls: Alumni network directory, Mentorship slot booking, Contribution/Donation portal (Integer paise), Event invites.
  - Backend Action: `GET /api/v1/alumni`, `POST /api/v1/alumni/donate`

## Module 8: Student Welfare, Guardian Portal & Communications
- **Page 8.1: Guardian / Parent Portal (`/guardian/dashboard`)**
  - Controls: Linked Ward selector, Ward attendance radar, Grade sheet access, Direct fee payment button, Contact HOD/Warden form.
  - Backend Action: `GET /api/v1/guardian/wards`, `GET /api/v1/guardian/ward-summary/:wardId`
- **Page 8.2: Grievance Desk & Helpdesk (`/support/grievances`)**
  - Controls: Ticket submission (Category: Academic, Hostel, Anti-Ragging, Financial), Anonymous/Confidential mode toggle, Escalation timeline, Resolution notes.
  - Backend Action: `GET /POST /api/v1/support/grievances`, `PATCH /api/v1/support/grievances/:id`
- **Page 8.3: Notice Board & Communication Dispatch (`/notices`)**
  - Controls: Target audience selector (All, Department, Faculty, Students, Guardians), Circular publisher, SMS/WhatsApp [SIMULATION] outbox queue inspector.
  - Backend Action: `GET /POST /api/v1/notices`, `GET /api/v1/system/outbox`

## Module 9: AI Early Warning & Executive Analytics
- **Page 9.1: AI Academic Risk / Dropout Early Warning (`/analytics/risk`)**
  - Controls: Risk threshold filter (High, Medium, Low), Student academic/attendance/fee risk breakdown, Intervention assignment notes, Model Evaluation Limits & Synthetic Dataset Disclaimer badge.
  - Backend Action: `GET /api/v1/analytics/dropout-risk`

## Module 10: System Utilities & Demo Dataset Reset
- **Page 10.1: System Settings & Demo Dataset Reset (`/admin/system`)**
  - Controls: System health indicators, Synthetic seed generator / Reset disposable demo dataset button, Audit log exporter.
  - Backend Action: `POST /api/v1/system/reset-demo`, `GET /api/v1/system/audit-logs`

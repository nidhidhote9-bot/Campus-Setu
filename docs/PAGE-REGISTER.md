# CampusSetu Page Register

| Page Group | Route | Persona / Roles | Key Controls & Workflows | Status |
|---|---|---|---|---|
| Foundation Landing | `/app/foundation/landing`, `/login` | Public, All | Product overview, module showcase, language toggle (EN/HI), portal sign-in | Active |
| Foundation Auth | `/app/foundation/authentication`, `/login` | Public | Multi-role selector, CSRF double-submit token, password auth, session expired modal | Active |
| Foundation Dashboard | `/app/foundation/dashboard`, `/dashboard` | All Roles | Role-adapted dashboard, metrics cards, global search, notifications drawer, audit log outbox feed | Active |
| Foundation Components | `/app/foundation/components` | Admin, Developer | UI Component gallery: tables, filters, pagination, forms, dialogs, badges, empty/loading/error states | Active |
| Identity Login | `/app/identity/login` | Public | Login portal, demo persona selector, password reset request modal | Active |
| Identity Account | `/app/identity/my-account` | All Roles | Profile view, change password (Bcrypt), active sessions manager, session revocation | Active |
| Identity Users | `/app/identity/users` | Admin | User list, membership & role assignment, permission matrix explorer | Active |
| Identity Audit | `/app/identity/audit` | Admin, SuperAdmin | Audit explorer filtered by actor, resource, institution and timestamp | Active |
| University Organization | `/app/organization/university` | Admin, SuperAdmin | University profile & branding settings, campus hierarchy tree | Active |
| Organization Hierarchy | `/app/organization/hierarchy` | Admin, SuperAdmin | Institute, department, designation and post lists with create/edit forms | Active |
| Staff Post Assignments | `/app/organization/post-assignments` | Admin, HR | Staff-to-post assignments and delegated responsibility dates | Active |
| Organization Settings | `/app/organization/settings` | Admin, SuperAdmin | Academic year/session config, numbering sequences ($inc) and module rules | Active |
| Form Builder | `/app/forms/builder` | Admin | Form builder, preview, immutable schema version publishing (v1.0 -> v2.0) | Active |
| Form Submissions | `/app/forms/submissions` | Admin, Staff | Submission list & detail, unmutated version lock retention | Active |
| Form Translations | `/app/forms/translations` | All Roles | English/Hindi label dictionary with missing translation fallback | Active |
| Form Templates | `/app/forms/templates` | Admin | Document template & FAQ/content editor with strict XSS sanitization | Active |
| Academic Catalog | `/app/academics/catalog` | All Roles | Degree program, subject catalog & term credit structure list | Active |
| Assessment Schemes | `/app/academics/schemes` | Faculty, Admin | Configurable assessment scheme editor (NLIU law vs CSE engineering, 100% weight check) | Active |
| Elective Registration | `/app/academics/electives` | Student, Staff | Elective group rules, prerequisite checks & subject enrollment | Active |
| Teaching Assignments | `/app/academics/teaching` | Faculty, Admin | Faculty teaching workload allocation & syllabus repository download | Active |
| Institution Manager | `/admin/institutions` | SuperAdmin, Admin | Multi-tenant campus list, institution creation modal, department mapping, HOD assignment | Active |
| User & RBAC Manager | `/admin/users` | SuperAdmin, Admin | User account provisioning, Bcrypt password hashing, role permissions, guardian ward linking | Active |
| Student Admissions | `/admissions` | Applicants, Public | Online application form, DigiLocker Govt document verification, application fee payment | Active |
| Admission Review | `/admin/admissions` | Admin, Admissions | Application review checklist, academic score filter, seat allocation, enrollment number issuance | Active |
| Student Directory | `/students` | Admin, Faculty, Finance | Student roster search, department & semester filters, student profile link | Active |
| Student Detail | `/students/:id` | Student, Guardian, Staff | Comprehensive profile: personal details, CGPA, guardian contact, academic history | Active |
| Course Catalog | `/academics/courses` | All Roles | Course listing, credit allocation, semester prerequisites, faculty mapping | Active |
| Timetable Grid | `/academics/timetable` | All Roles | Weekly schedule matrix (Mon-Sat), room allocation, faculty slot clash detection | Active |
| Attendance System | `/academics/attendance` | Faculty, Admin | Class roster checklist, present/absent/late toggle, QR/Geofence mode, low attendance alert (<75%) | Active |
| Exam Schedule | `/exams/schedule` | All Roles | Mid-term & End-sem schedules, invigilation roster, hall ticket PDF download | Active |
| Gradebook Entry | `/exams/marks` | Faculty, Admin | Course marks entry, automatic SGPA/CGPA calculation, finalization lock, audit revision log | Active |
| Report Cards & Transcripts | `/exams/transcripts` | Student, Guardian, Staff | Official grade sheet generation, DigiLocker QR verification code | Active |
| Student Fee Checkout | `/fees/student` | Student, Guardian | Fee breakdown in integer paise, Razorpay [SIMULATION] checkout modal, idempotency key, receipt download | Active |
| Fee Collections Ledger | `/fees/admin` | Finance, Admin | Fee template setup, defaulter tracking, collection breakdown in integer paise | Active |
| Staff Payroll | `/finance/payroll` | Finance, Admin | Base salary & HRA breakdown in integer paise, monthly approval batch, payslip download | Active |
| Hostel Facilities | `/facilities/hostel` | All Roles | Building room occupancy grid, outpass / gate pass request form, warden approval workflow | Active |
| Transport Services | `/facilities/transport` | All Roles | Vehicle routes, driver contacts, bus pass QR code generator | Active |
| Library Catalog | `/facilities/library` | All Roles | ISBN book inventory search, book issue/return modal, overdue fine counter in integer paise | Active |
| Training & Placements | `/placement/drives` | All Roles | Corporate drive posts, package LPA in integer paise, CGPA cutoff, 1-click application | Active |
| Alumni Network | `/alumni` | All Roles | Alumni directory, mentorship booking, donation portal | Active |
| Guardian Portal | `/guardian/dashboard` | Guardian, Parent | Linked ward selector, attendance radar, grade sheet access, direct fee payment button | Active |
| Grievance Desk | `/support/grievances` | All Roles | Ticket submission, anonymous/confidential mode toggle, escalation matrix, resolution notes | Active |
| Notice Board | `/notices` | All Roles | Official circular publisher, SMS/WhatsApp outbox dispatch queue inspector | Active |
| AI Dropout Early Warning | `/analytics/risk` | Admin, Faculty | Predictive risk classification (High/Med/Low), synthetic model evaluation limits disclaimer badge | Active |
| System Admin & Demo | `/admin/system` | SuperAdmin, Admin | System health indicators, audit log viewer, disposable demo dataset reset button | Active |
| Exam Cycles & Windows | `/app/exam-applications/cycles` | Admin, SuperAdmin | Exam cycle configuration, regular/private/backlog policy, registration windows | Active |
| Student Exam Apply | `/app/exam-applications/apply` | Student | Exam application wizard, subject paper selection, fee link, submission status | Active |
| Exam Office Review | `/app/exam-applications/review` | Admin, SuperAdmin | Application review queue, exception grant modal, subject roster | Active |
| Hall Tickets | `/app/exam-applications/hall-tickets` | Admin, Student | Roll number assignment, hall ticket generation, PDF preview/download | Active |
| Exam Operations Schedule | `/app/exam-operations/schedule` | Admin, SuperAdmin | Exam timetable builder, date/time/room conflict detector, schedule publishing | Active |
| Exam Operations Centers | `/app/exam-operations/centers` | Admin, SuperAdmin | Center and room verification, live capacity matrix, seating allocation, audited reallocation | Active |
| Exam Operations Invigilators | `/app/exam-operations/invigilators` | Admin, Faculty | Invigilator duty roster, appointment modal, duty acknowledgement, absent tracking | Active |
| Exam Operations Materials | `/app/exam-operations/materials` | Admin, SuperAdmin | Answer-book stock, non-overlapping serial ranges, dispatch under seal, reconciliation | Active |


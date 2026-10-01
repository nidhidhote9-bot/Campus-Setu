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
| Assessment Marks Grid | `/app/assessment/marks` | Faculty, Admin | Faculty assessment roster, component-wise grid, explicit absent/withheld states | Active |
| Bulk CSV Marks Import | `/app/assessment/imports` | Faculty, Admin | CSV marks upload, term verification check, out-of-range rejection & row error summary | Active |
| Assessment Moderation | `/app/assessment/moderation` | Admin, Moderator | Moderator review queue, discrepancy inspection, approve/return workflow & comments | Active |
| Student Published Scores | `/app/assessment/my-assessments` | Student | Published component assessment breakdown; unpublished draft/moderation scores hidden | Active |
| Results Tabulation & Approval | `/app/results/tabulation` | Admin, SuperAdmin | Tabulation grid preview, grade scale check, pass/backlog status, board approval queue | Active |
| Results Publication & Revisions | `/app/results/publication` | Admin, SuperAdmin | Idempotent publication dashboard, revision comparison (v1 vs v2 superseding revision) | Active |
| Student Term Results & Grade Cards | `/app/results/my-results` | Student | Term grade card, SGPA/CGPA radar, digital transcript download, privacy shield | Active |
| Results Reports & Pass Lists | `/app/results/reports` | Admin, Faculty | Pass list, withheld list, pass percentage analytics, CSV/PDF report export | Active |
| Revaluation & Retotalling Apply | `/app/revaluation/apply` | Student | Eligible published paper list, retotalling/revaluation request form, fee status & payment simulator | Active |
| Revaluation Assignments Queue | `/app/revaluation/assignments` | Admin, SuperAdmin | Exam office request queue, reviewer/evaluator assignment form, deadline tracking matrix | Active |
| Revaluation Outcome Entry | `/app/revaluation/outcomes` | Faculty, Admin | Evaluator score change entry, exam office outcome approval & superseding v2 revision creation | Active |
| Student Revaluation Decisions | `/app/revaluation/my-decisions` | Student | Official decision notice board, before/after score comparison table & fee refund status | Active |
| Certificate Catalog & Request | `/app/certificates/catalog` | Student, All Roles | Certificate catalog, no-dues eligibility checklist, request form & fee tracking | Active |
| Staff Certificate Review Queue | `/app/certificates/review` | Staff, Admin | Staff review queue, template preview, approval & cryptographic snapshot issuance | Active |
| My Issued Certificates | `/app/certificates/my-certificates` | Student | My certificates list, private authenticated download, sharing link & revocation notice | Active |
| Public QR Verification Portal | `/app/certificates/verify`, `/certificates/verify` | Public | Unauthenticated QR verification portal, minimal fact disclosure & revocation status | Active |
| AI Assistant Chat & Context Drawer | `/app/assistant/chat` | All Roles | Grounded AI Chat Assistant, contextual drawer, verified source citations, linked record navigation | Active |
| AI Conversation History | `/app/assistant/history` | All Roles | Conversation history controls, source cards inspect, linked records and resumption | Active |
| AI Assistant Voice Gateway | `/app/assistant/voice` | All Roles | Speech input/output controls, live audio wave animation, transcript and microphone error fallback | Active |
| AI Knowledge & Evaluation Admin | `/app/assistant/evaluation` | Admin, SuperAdmin | Knowledge article versioning, 32-case AI evaluation suite runner, category breakdown & pass rate | Active |
| Prediction Cohort Dashboard | `/app/predictions/dashboard` | Admin, Faculty, Staff | Cohort prediction dashboard, risk distribution, department filters & active model version badge | Active |
| Student Support Profile & Simulator | `/app/predictions/student-support` | Faculty, Advisor, Admin | Individual support profile, predicted SGPA confidence interval, risk gauge, explainable drivers & What-If sensitivity simulator | Active |
| Synthetic Training & Evaluation Console | `/app/predictions/training` | Admin, SuperAdmin | Seeded synthetic dataset generator, holdout evaluation metrics (MAE, R², PR-AUC, Brier), 5-bin calibration curve & threshold scenario comparison (0.35 vs 0.50 vs 0.65) | Active |
| Advisor Reviews & Support Interventions | `/app/predictions/interventions` | Faculty, Advisor, Admin | Human review queue, qualitative rationale logging, peer tutoring/counseling task assignment & outcome tracking | Active |
| Student Learning Dashboard & My Plan | `/app/learning/my-plan` | Student, Admin | Student personalized learning dashboard, radar concept mastery, explainable ranked recommendations, learning preferences modal & cold-start notice | Active |
| Curated Resource Catalog | `/app/learning/resources` | All Roles | Verified multilingual internal learning resources catalog, topic/difficulty/format/language filters & new resource submission modal | Active |
| Personal Progress & Activity Timeline | `/app/learning/progress` | Student, All Roles | Student study hour progress, completion metrics, activity logger modal with score/ratings & interactive completion timeline | Active |
| Faculty Recommendations & Cohort Analytics | `/app/learning/faculty` | Faculty, Admin | Faculty cohort topic mastery heatmap, weakest topic identifier alert, individual student plans inspect & resource endorsement modal | Active |
| Mobile Navigation & Student Home | `/app/mobile/home` | Student, Guardian, All Roles | Complete responsive mobile navigation on phone shell (390px), quick action drawer, academic schedule, dues & hall ticket previews | Active |
| Mobile PWA Install & Offline Portal | `/app/mobile/install` | All Roles | PWA installation state, standalone indicator, Service Worker cache inspector & offline storage safety policy | Active |
| Android App Shell & Deep Link Console | `/app/mobile/android` | All Roles, Admin | Native Android Capacitor shell, debug APK download, permissions roster, live deep link tester & CSRF-safe auth check | Active |
| Mobile Settings & Local Data Purge | `/app/mobile/settings` | All Roles | Mobile notification toggles, language switcher (English/Hindi), biometric toggle, registered devices list & local private state wipe | Active |
| Demo Scenarios & Isolated Reset | `/app/demo-operations/scenarios` | Admin, SuperAdmin | Scenario catalog, scenario activation/preparation, seed manifest checksum validator & confirmation-phrase guarded destructive reset | Active |
| Integration Adapters & Simulator | `/app/demo-operations/integrations` | Admin, SuperAdmin | Integration mode switcher (MOCK, SIMULATED, SANDBOX, LIVE), failure injection modal, simulation event history & idempotent replay | Active |
| Background Job Telemetry & Storage Runbook | `/app/demo-operations/jobs` | Admin, SuperAdmin | Background job runner, execution telemetry, database storage statistics & mongodump/mongorestore backup runbook | Active |
| Virtual Scenario Clock & Demonstration | `/app/demo-operations/clock` | Admin, SuperAdmin | Scenario virtual clock controls (time offsets & scaling), sticky simulator indicator & reproducible delayed-payment recovery runner | Active |
| Route Coverage & Zero 'Coming Soon' | `/app/release/coverage` | Admin, SuperAdmin | Complete route and action coverage inventory, persona reachability matrix, live deep link tester & zero placeholder invariant validator | Active |
| Reviewer Guide & Demo Scenarios | `/app/release/reviewer-guide` | All Roles, Evaluators | Seed credentials cheat-sheet, 7 golden-path storyline workflows, 7 scenario preparers, verified SHA-256 artifacts & submission package generator | Active |
| Accessibility & Bilingual Radar | `/app/release/accessibility` | All Roles | WCAG 2.1 AA compliance radar, color contrast telemetry, screen reader labels, 100% English/Hindi dictionary parity & 4 responsive viewports | Active |


# Complete Antigravity prompt sequence

All stages below belong to the complete prototype. Build in this dependency order, not numeric module-ID order: M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09 → M10 → M11 → M12 → M13 → M14 → M15 → M16 → M17 → M18 → M19 → M20 → M22 → M21 → M23 → M24 → M25 → M26 → M27 → M28 → M29 → M30 → M31 → M32 → M33 → M34 → M35 → M36.

Use a new repository. Copy WORKSPACE-RULES.md.template into its GEMINI.md and load the requirements documents into the workspace. Paste the master prompt once, then one build step at a time. The modules specify requirements, not evidence of completion.

## Master prompt
```text
Build CampusSetu, a complete MERN smart-university demonstration prototype from a fresh repository. The complete module catalogue is in scope: admissions, full academics/exams/results, student services, campus operations, governance, HR/payroll, library/inventory, MIS, AI, guardian portal and mobile app.

Use React/Vite/TypeScript, Express/TypeScript, MongoDB/Mongoose and shared Zod contracts. Use a modular monolith, npm workspaces, same-origin web/API hosting and secure Mongo-backed sessions. Prefer one consistent UI system, React Router and TanStack Query. Follow WORKSPACE-RULES copied into GEMINI.md.

Read the supplied architecture, module catalogue, seed scenarios and QA requirements. Build original code only. Do not copy legacy source, data, secrets, documents or branding.

Seed MongoDB with coherent fictional data. Implement real persistent CRUD, validated transitions, calculations, approvals, downloads, reports and scoped queries. Dummy external APIs are permitted behind typed adapters; label simulation, but make their events drive real domain services and database state. Never replace implemented workflows with static JSON pages or success toasts.

Complete every named module/page. Do not unilaterally move modules to a future roadmap because they are large. Work one supplied stage at a time and report actual blockers. The final prototype includes a tested Android APK, a labelled synthetic prediction pipeline, and either a real provider-backed assistant or an explicitly simulated conversational adapter with full tested workflows.

Before each stage inspect relevant existing code and propose the smallest plan. Implement it, run acceptance checks and fix failures. Record page/action/API/test coverage. Do not overwrite unrelated work or fabricate completion. Pause only for information/access that genuinely blocks the active work; continue independent authorized local work.
```

## Mandatory completion footer — applies to every build prompt
```text
For each described page, implement its route and all named controls; document child routes. Every action must navigate, persist, compute, export/download or return a useful validation error. Include loading/empty/error/forbidden states and mobile layout.

Implement backend routes, shared request/response schemas, indexes, scope policies, services, seed fixtures and UI together. Add API tests for the important invalid/unauthorized/duplicate cases, and a browser journey for the main workflow. Use real MongoDB in integration tests.

Update docs/PAGE-REGISTER.md, docs/API-CONTRACTS.md, docs/PROGRESS.md and docs/DEMO-SCENARIOS.md. Report changed files, executed commands/results, exact demo steps, unresolved defects and next dependency. Never mark a gate passed if tests did not run. Commit only according to the user's repository workflow.
```

## Step 01 — M01: Workspace, design system and application shell
Prerequisites: fresh repository.
```text
Implement M01: Workspace, design system and application shell. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/foundation/landing — Public landing: product overview, module overview, sign-in and demo-mode disclosure.
2. /app/foundation/authentication — Sign-in, session-expired, forbidden, not-found and recoverable-error pages.
3. /app/foundation/dashboard — Role-specific dashboard shells, global search, notifications drawer, profile menu and mobile navigation.
4. /app/foundation/components — Component gallery: tables, filters, pagination, forms, date/time input, dialogs, timeline, charts, empty/loading/error states.

Implement these domain records/contracts:
Workspace packages, environment schema, navigation registry, route metadata, theme tokens and shared API contracts.

Implement this complete workflow:
Create the fresh React/Express/MongoDB workspace; implement reusable UI and API infrastructure; route every persona into an authenticated shell.

Enforce these business and authorization rules:
Use original branding. All named pages must exist by their module gate. Do not ship dead menu entries or buttons that only show a success toast. Dates use an explicit campus timezone.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Production build and health/readiness work; nested routes refresh; shell is usable at 390, 768 and 1440 pixels; keyboard navigation and visible focus work.

Provide this reproducible demonstration:
Open landing, sign in and compare desktop/mobile shells.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 02 — M02: Identity, role permissions and record scope
Prerequisites: M01.
```text
Implement M02: Identity, role permissions and record scope. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/identity/login — Login and demo persona selector; password reset request and reset confirmation.
2. /app/identity/my-account — My profile, change password and active sessions.
3. /app/identity/users — User list/detail/create/edit; membership and role assignment; permission matrix.
4. /app/identity/audit — Audit explorer filtered by actor, resource, institution and date.

Implement these domain records/contracts:
User, Membership, Role, Permission, Session, PasswordResetToken, AuditEvent. Roles: university_admin, institute_admin, admissions_officer, faculty, exam_controller, finance_officer, hostel_warden, transport_manager, librarian, hr_officer, helpdesk_agent, student and guardian.

Implement this complete workflow:
Create account→assign institution membership→authenticate→select authorized scope→perform permitted operation→audit→logout or revoke session.

Enforce these business and authorization rules:
Hash passwords. Use Mongo-backed opaque sessions, secure cookies and CSRF protection. Scope comes from authenticated memberships. Demo persona selection authenticates a seeded account only in explicitly configured demo mode. Never create an unrestricted role switch.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Test unauthenticated, wrong role, wrong institute, wrong student and revoked session cases. Reset tokens expire and are single-use. DTOs exclude password/session secrets.

Provide this reproducible demonstration:
Switch between seeded student/faculty/staff accounts and demonstrate one denied access.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 03 — M03: University organization, posts and configuration
Prerequisites: M02.
```text
Implement M03: University organization, posts and configuration. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/organization/university — University profile and branding settings; campus/college hierarchy tree.
2. /app/organization/hierarchy — Institute, department, designation and post lists with create/edit/detail forms.
3. /app/organization/post-assignments — Staff-to-post assignments and delegated responsibility dates.
4. /app/organization/settings — Academic year/session settings, numbering settings and module configuration.

Implement these domain records/contracts:
University, Institute, Department, Designation, Post, PostAssignment, AcademicSession, NumberSequence, TenantSettings.

Implement this complete workflow:
Configure university→add institutes/departments→create posts→assign staff→configure scoped numbering and module settings.

Enforce these business and authorization rules:
Prevent hierarchy cycles and cross-university parents. Referenced masters are archived, not deleted. Branding and terminology are configuration, never username conditionals. Number sequences use atomic increments and unique indexes.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Two fictional universities cannot see each other's data; institutes within one university remain scoped; hierarchy cycles and duplicate active post assignments are rejected.

Provide this reproducible demonstration:
Change a university display label and show a scoped department/post assignment.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 04 — M04: Versioned forms, localization and content configuration
Prerequisites: M03.
```text
Implement M04: Versioned forms, localization and content configuration. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/forms/builder — Form builder list/editor/preview/publish/history.
2. /app/forms/submissions — Submission list/detail and validation errors.
3. /app/forms/translations — English/Hindi label dictionary with missing-translation view.
4. /app/forms/templates — Document template and FAQ/content editor with preview.

Implement these domain records/contracts:
FormDefinition, FormVersion, FormSubmission, TranslationEntry, ContentArticle, DocumentTemplateVersion.

Implement this complete workflow:
Draft fields→preview→publish immutable schema version→submit data→review/export; revise by publishing a new version.

Enforce these business and authorization rules:
Allow only defined field types: text, number, date, select, multiselect, checkbox and attachment. Validation runs server-side. No arbitrary JavaScript/HTML execution. Existing submissions retain their version. English is fallback for missing Hindi labels.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Published schema cannot mutate existing submissions; unsafe markup is sanitized; required/conditional fields validate on both client and server; switching language preserves workflow state.

Provide this reproducible demonstration:
Publish a feedback form, submit it, then create a new version without changing the old response.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 05 — M05: Academic masters and configurable curriculum
Prerequisites: M03.
```text
Implement M05: Academic masters and configurable curriculum. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/academics/catalog — Program, course, subject and term lists with detail/create/edit/archive.
2. /app/academics/schemes — Scheme version editor: components, weights, credits, passing rules and grading bands.
3. /app/academics/electives — Elective groups, prerequisites and student subject registration.
4. /app/academics/teaching — Teaching assignment and faculty workload pages; syllabus upload/download.

Implement these domain records/contracts:
Program, Course, Subject, CurriculumVersion, AssessmentComponent, GradePolicy, ElectiveGroup, SubjectEnrollment, TeachingAssignment, SyllabusDocument.

Implement this complete workflow:
Create program→version scheme→define subjects/components→publish curriculum→assign cohort→enroll subjects→assign faculty.

Enforce these business and authorization rules:
Model NLIU-style mid-semester, viva, project and attendance components as configuration. Published schemes are immutable. Validate maxima, minima, weight totals, grade boundaries and elective constraints; credit calculations use the assigned version.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Invalid weight totals, duplicate subjects and unmet prerequisites fail. A later curriculum revision does not alter an existing cohort. Faculty sees only assigned offerings.

Provide this reproducible demonstration:
Compare a law program's assessment scheme with a different program without code changes.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 06 — M06: Admissions, import mapping and enrollment
Prerequisites: M04, M05.
```text
Implement M06: Admissions, import mapping and enrollment. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/admissions/apply — Applicant registration, application wizard, documents, preview and status timeline.
2. /app/admissions/review — Admissions dashboard, reviewer queue, application detail and correction/approval actions.
3. /app/admissions/imports — CSV import wizard: upload, external-code mapping, dry run, row errors and commit.
4. /app/admissions/enrollment — Registration/enrollment ID registry, transfer/withdrawal record and enrollment confirmation.

Implement these domain records/contracts:
Applicant, AdmissionApplication, AdmissionDocument, ImportBatch, ExternalCodeMapping, ReviewDecision, Enrollment, IdentifierSequence.

Implement this complete workflow:
Draft→submitted→under_review→correction_required→resubmitted→approved→enrolled. Approval can also reject with reason. Mock admission-provider data enters the same staging pipeline.

Enforce these business and authorization rules:
Explicit document and fee prerequisites; simulate provider checks through adapters. Generate distinct registration/enrollment IDs atomically; use IURN/IUEN concepts without claiming official issuance. Duplicate detection offers review, never silent merging.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Invalid transitions and premature enrollment fail; dry run writes no applicants; import is idempotent; bad rows are downloadable; applicant can correct only requested fields; numbering survives concurrent approvals.

Provide this reproducible demonstration:
Import five candidates with one mapping error, fix it, request a correction, approve and enroll one candidate.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 07 — M07: Student lifecycle and unified record
Prerequisites: M05, M06.
```text
Implement M07: Student lifecycle and unified record. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/students/overview — Student dashboard with live summaries, student directory and Student 360 detail.
2. /app/students/profile — Profile correction request, ID card preview/download and document locker.
3. /app/students/lifecycle — Subject enrollment, progression, transfer, withdrawal and graduation status.
4. /app/students/alumni — Alumni profile and service eligibility screen.

Implement these domain records/contracts:
StudentProfile, EnrollmentHistory, ProfileChangeRequest, StudentDocument, StudentStatusEvent, GraduationRecord, AlumniProfile.

Implement this complete workflow:
Admission creates student→subject enrollment→term progression→graduation/alumni, with separate authorized transfer/withdrawal paths. Other modules attach facts to this record.

Enforce these business and authorization rules:
Student 360 composes scoped module data, not duplicate editable copies. Sensitive fields use explicit DTOs. Documents are private. Status changes preserve history and affect future eligibility without deleting records.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Student cannot approve their own profile correction; graduation requires configured checks; transfer preserves past results; document access respects ownership; dashboard numbers match source records.

Provide this reproducible demonstration:
Show the enrolled candidate as a student with academics, fees and request history in one profile.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 08 — M08: Attendance and academic engagement
Prerequisites: M05, M07.
```text
Implement M08: Attendance and academic engagement. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/attendance/capture — Faculty class roster, attendance capture and session history.
2. /app/attendance/corrections — Attendance correction request/review and bulk upload preview.
3. /app/attendance/my-attendance — Student course attendance detail, trend and shortage explanation.
4. /app/attendance/reports — Staff attendance analytics and downloadable scoped report.

Implement these domain records/contracts:
AttendanceSession, AttendanceEntry, AttendanceCorrection, AttendancePolicyVersion.

Implement this complete workflow:
Create class session→mark attendance→submit→student sees summary→request correction→authorized review→audited update.

Enforce these business and authorization rules:
Explicit present/absent/excused states; denominator follows policy. Unique student/session pair. Faculty is restricted to teaching assignments. Bulk upload validates roster and dates before commit.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Duplicate entries cannot inflate totals; no-session percentage is not NaN; unassigned faculty denied; approved correction updates aggregates and preserves prior value.

Provide this reproducible demonstration:
Mark one absence, request correction, approve it and show the updated student percentage.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 09 — M09: Timetable, rooms and academic calendar
Prerequisites: M05.
```text
Implement M09: Timetable, rooms and academic calendar. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/timetable/calendar — Weekly/day timetable for student, faculty and administrator.
2. /app/timetable/editor — Timetable editor, room list/capacity and conflict checker.
3. /app/timetable/reschedule — Substitution/reschedule workflow and affected-class notice preview.
4. /app/timetable/events — Academic calendar, holidays, assessment dates and calendar export.

Implement these domain records/contracts:
Room, TimetableEntry, RecurrenceRule, TimetableException, CalendarEvent, Holiday.

Implement this complete workflow:
Create recurring schedule→check faculty/room/cohort conflicts→publish→reschedule a dated instance→notify affected users.

Enforce these business and authorization rules:
Use campus timezone and date-specific exceptions. Check overlapping intervals, room capacity and faculty/cohort conflicts. Do not overwrite history when changing future schedules.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Reject conflicting schedule entries; a reschedule updates only intended dates; holidays remove or flag sessions according to policy; student schedule includes only enrolled courses.

Provide this reproducible demonstration:
Attempt a room collision, resolve it and show the student's changed next class.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 10 — M10: Fees, payments, reconciliation and finance
Prerequisites: M07.
```text
Implement M10: Fees, payments, reconciliation and finance. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/finance/rules — Fee head/category/rule configuration; concession and late-fee configuration.
2. /app/finance/my-fees — Student invoices, checkout, payment attempts, receipts and refund status.
3. /app/finance/reconciliation — Finance dashboard, fund/budget register, cash/bank collection ledger, reconciliation queue and exception detail.
4. /app/finance/concessions — Scholarship/concession request review and finance export.

Implement these domain records/contracts:
FeeRuleVersion, Invoice, InvoiceLine, PaymentOrder, PaymentEvent, Receipt, Refund, Concession, ReconciliationRun. Fund, Budget, BudgetEntry with configurable heads and immutable approved entries.

Implement this complete workflow:
Assess fees→issue invoice→create payment order→simulated provider callback→verify→settle→receipt; refund uses separate approval and provider event. Reconciliation compares ledger/provider events.

Enforce these business and authorization rules:
Integer paise; server-calculated amounts; unique idempotency keys; signed local simulator callbacks; amount/currency/order binding; atomic settlement and receipt creation. Delayed/duplicate/failed callbacks must be testable. No actual money moves.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Duplicate callbacks yield one settlement; tampered signature/amount rejected; success is not reversed by a late failure; partial refund cannot exceed paid balance; reports reconcile.

Provide this reproducible demonstration:
Pay one invoice, replay its callback, show one receipt, then reconcile a deliberately pending order.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 11 — M11: Exam applications, eligibility and hall tickets
Prerequisites: M05, M07, M10.
```text
Implement M11: Exam applications, eligibility and hall tickets. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/exam-applications/cycles — Exam cycle/setup, regular/private/backlog policy and application windows.
2. /app/exam-applications/apply — Student exam application wizard, eligibility explanation, fee link and status.
3. /app/exam-applications/review — Exam office review queue, exceptions and subject roster.
4. /app/exam-applications/hall-tickets — Roll-number assignment and hall ticket preview/download.

Implement these domain records/contracts:
ExamCycle, ExamPolicyVersion, ExamApplication, EligibilityDecision, ExamEnrollment, RollNumberAssignment, HallTicket.

Implement this complete workflow:
Open cycle→calculate eligibility→student selects valid papers→pay required fee→review→approve→assign roll number→issue hall ticket.

Enforce these business and authorization rules:
Configurable attendance/academic/fee requirements. Exceptions need authorized reason. Private/backlog categories use explicit policy rather than guessed regulations. Roll numbering is a new prototype design because the manual does not fully specify it.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Closed windows, ineligible subjects and unpaid prerequisites block submission/approval appropriately; repeat issuance is idempotent; hall tickets never cross student boundaries.

Provide this reproducible demonstration:
Show an ineligible application, an audited exception and successful hall ticket issuance.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 12 — M12: Exam scheduling, centers and materials
Prerequisites: M11, M09.
```text
Implement M12: Exam scheduling, centers and materials. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/exam-operations/schedule — Exam timetable builder and conflict report.
2. /app/exam-operations/centers — Center/room verification, capacity and seating allocation.
3. /app/exam-operations/invigilators — Invigilator duty roster, appointment and acknowledgement.
4. /app/exam-operations/materials — Answer-book stock/serial ranges, dispatch, receipt, usage and return register.

Implement these domain records/contracts:
ExamSchedule, ExamCenter, CenterVerification, SeatingAllocation, InvigilationDuty, MaterialBatch, MaterialMovement.

Implement this complete workflow:
Verify center→publish schedule→allocate seats→assign invigilators→dispatch numbered materials→acknowledge/return→reconcile.

Enforce these business and authorization rules:
No student/paper/time collisions or capacity overrun. Serial intervals cannot overlap. Reallocation retains an audit record. Confidential metadata is restricted to exam staff.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Allocation respects capacity under concurrent actions; duplicate serial range rejected; absent acknowledgement is visible; usage plus remaining/returned quantities reconciles.

Provide this reproducible demonstration:
Allocate an exam room, reject an over-capacity action and reconcile an answer-book batch.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 13 — M13: Paper setters and confidential question bank
Prerequisites: M05, M11.
```text
Implement M13: Paper setters and confidential question bank. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/question-papers/appointments — Setter panel and appointment requests; acceptance/rejection with reason.
2. /app/question-papers/papers — Secure paper upload, version list, review and approval.
3. /app/question-papers/question-bank — Question bank by subject/topic/difficulty and draft paper assembly.
4. /app/question-papers/access — Controlled download/access audit and confidentiality settings.

Implement these domain records/contracts:
SetterAppointment, AppointmentResponse, Question, PaperVersion, PaperReview, ConfidentialAccessEvent.

Implement this complete workflow:
Invite internal seeded setter→accept→submit paper→review/revise→approve→authorized release.

Enforce these business and authorization rules:
Mock notification delivery; private storage and narrowly scoped access. Submitted versions immutable. Paper content never enters general search, guardian views or AI context. No public file URLs.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Non-appointed faculty and students cannot retrieve papers; version history preserved; release before approval fails; downloads are auditable.

Provide this reproducible demonstration:
Accept a setter appointment and approve a revised sample paper using authorized accounts.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 14 — M14: Marks entry, moderation and approval
Prerequisites: M05, M11.
```text
Implement M14: Marks entry, moderation and approval. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/assessment/marks — Faculty assessment roster and component-wise marks grid.
2. /app/assessment/imports — CSV marks import preview/errors and submission summary.
3. /app/assessment/moderation — Moderator review, discrepancy queue and approval history.
4. /app/assessment/my-assessments — Student published assessment breakdown; unpublished marks hidden.

Implement these domain records/contracts:
AssessmentBatch, MarkEntry, MarkImport, ModerationDecision, AssessmentApproval.

Implement this complete workflow:
Draft marks→validate→faculty submits→moderator returns or approves→exam office locks assessment for results.

Enforce these business and authorization rules:
Use exact curriculum component version. Explicit absent/withheld states, no sentinel negative score. Validate maxima, missing entries and authorized correction reasons. Separation of submission and approval is configurable and demonstrated.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Out-of-range marks rejected; submitted batches not silently editable; wrong-term import cannot overwrite another term; returned batches preserve review comments.

Provide this reproducible demonstration:
Import a mark above maximum, fix it, submit, return for correction and approve.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 15 — M15: Results, transcripts and academic progression
Prerequisites: M14.
```text
Implement M15: Results, transcripts and academic progression. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/results/tabulation — Tabulation preview, validation errors and result approval queue.
2. /app/results/publication — Publication dashboard and revision comparison.
3. /app/results/my-results — Student result/grade card, transcript download and progression status.
4. /app/results/reports — Pass list, withheld list, summary and export.

Implement these domain records/contracts:
ResultRun, ResultRevision, SubjectResult, TermResult, PublicationEvent, TranscriptSnapshot.

Implement this complete workflow:
Calculate draft from approved marks→validate→approve→publish immutable revision→student views result; correction creates superseding revision.

Enforce these business and authorization rules:
Document rounding, credit, grade and pass/backlog formulas. Never delete published results during recalculation. Term/university/student keys are explicit. Transcripts refer to effective published revisions.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Golden fixture grade calculations match expected values; duplicate publish does not duplicate records; correction changes only selected scope; unpublished results remain private.

Provide this reproducible demonstration:
Publish a term result, then compare an authorized revised version with its original.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 16 — M16: Revaluation and retotalling
Prerequisites: M10, M15.
```text
Implement M16: Revaluation and retotalling. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/revaluation/apply — Student eligible-paper list, revaluation/retotalling request and fee status.
2. /app/revaluation/assignments — Exam-office request queue, reviewer assignment and deadline tracking.
3. /app/revaluation/outcomes — Reviewer outcome entry, approval and result revision link.
4. /app/revaluation/my-decisions — Student decision notice and before/after comparison.

Implement these domain records/contracts:
ReviewPolicy, ResultReviewRequest, ReviewAssignment, ReviewOutcome.

Implement this complete workflow:
Published result→eligible request within window→fee settlement→review assignment→outcome approval→superseding result revision.

Enforce these business and authorization rules:
Retotalling and revaluation are separate procedures. Policy values are fictional configurable examples until official regulations are supplied. Review outcome cannot directly overwrite a published record.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Late/ineligible requests rejected; unpaid request not assigned; duplicate same-paper/type request controlled; changed result links to original and reason.

Provide this reproducible demonstration:
Submit retotalling, pay via simulator and publish its approved correction.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 17 — M17: Certificates and digital document verification
Prerequisites: M07, M10, M15.
```text
Implement M17: Certificates and digital document verification. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/certificates/catalog — Certificate catalog, eligibility checklist, request form and tracking.
2. /app/certificates/review — Staff review/approval/issuance queue and template preview.
3. /app/certificates/my-certificates — My certificates, download, sharing/verification link and revocation status.
4. /app/certificates/verify — Public QR verification page with minimal fields.

Implement these domain records/contracts:
CertificateType, CertificateRequest, IssuedCertificate, CertificateRevocation, VerificationToken.

Implement this complete workflow:
Request→check prerequisites→review→approve→issue snapshot/PDF→verify; authorized revocation changes verification state without deleting issuance.

Enforce these business and authorization rules:
Mark all credentials DEMO. Random opaque verification tokens; private authenticated downloads; minimal public facts. Persist immutable snapshot and document hash. No claim of legally recognized signing or national integration.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Unapproved issuance blocked; retries produce same certificate; revoked document verifies as revoked; PDF data matches issued snapshot; other students cannot download it.

Provide this reproducible demonstration:
Issue a bonafide certificate, scan QR and then demonstrate revocation with a second sample.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 18 — M18: Student helpdesk, grievances and service desk
Prerequisites: M02, M07.
```text
Implement M18: Student helpdesk, grievances and service desk. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/helpdesk/my-tickets — Student service catalog, ticket form with attachments and my tickets.
2. /app/helpdesk/ticket-detail — Ticket detail with public thread, status timeline and reopen action.
3. /app/helpdesk/staff-inbox — Staff inbox, assignment, priority, escalation and SLA views.
4. /app/helpdesk/knowledge — Knowledge base and service category configuration.

Implement these domain records/contracts:
Ticket, TicketMessage, TicketAssignment, ServiceCategory, SLAPolicy, EscalationEvent.

Implement this complete workflow:
Open→triage→assign→in_progress→resolved→student closes or reopens; overdue tickets surface in escalation queue.

Enforce these business and authorization rules:
Internal notes are separate from public messages. Sensitive grievances have restricted staff membership. Attachment policies apply. Simulated time advancement may trigger demo escalation but must be labelled.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Unrelated students/staff cannot access restricted tickets; reopen retains history; SLA computation follows configured working hours; public DTO excludes internal notes.

Provide this reproducible demonstration:
Raise a hostel issue, add an internal note, resolve and reopen it from student account.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 19 — M19: Hostel operations
Prerequisites: M07, M10.
```text
Implement M19: Hostel operations. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/hostel/inventory — Hostel/building/room/bed inventory and occupancy map.
2. /app/hostel/apply — Student application, preferences, eligibility and waitlist position.
3. /app/hostel/allocations — Warden review, allocation, room transfer, check-in/out and clearance.
4. /app/hostel/reports — Hostel charges, complaints and occupancy/dues reports.

Implement these domain records/contracts:
Hostel, HostelRoom, Bed, HostelApplication, BedAllocation, WaitlistEntry, HostelMovement, HostelClearance.

Implement this complete workflow:
Apply→review→allocate or waitlist→pay deposit→check in→transfer or check out→clear dues→release bed.

Enforce these business and authorization rules:
Use unique active-bed and active-student allocation constraints with transactions. Define gender/accessibility/preferences as configured eligibility rules, not guessed institutional policy. No capacity overrun or duplicate occupancy.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Concurrent requests for final bed yield only one allocation; checkout releases bed; transfer cannot occupy two beds permanently; fees and complaints link to existing modules.

Provide this reproducible demonstration:
Fill last bed, waitlist another student, check out occupant and allocate the released bed.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 20 — M20: Transport operations
Prerequisites: M07, M10.
```text
Implement M20: Transport operations. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/transport/routes — Routes/stops, vehicles, capacity, drivers and service calendar.
2. /app/transport/my-pass — Student route subscription, pass, renewal and cancellation.
3. /app/transport/operations — Transport manager allocation/waitlist, vehicle substitution and trip log.
4. /app/transport/tracking — Map or route schematic, simulated vehicle position and utilization reports.

Implement these domain records/contracts:
TransportRoute, Stop, Vehicle, DriverAssignment, TransportSubscription, SeatAllocation, TransportPass, Trip, SimulatedLocation.

Implement this complete workflow:
Choose route/stop→approve seat→pay→issue pass→record trip→renew/cancel; substitute vehicle with capacity checks.

Enforce these business and authorization rules:
No real GPS is required: label deterministic location playback as simulation. Capacity is defined per service/time slot. Store exact route/pass validity dates. Reuse fee records.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Cannot overbook final seat; expired pass marked invalid; cancellation releases capacity; smaller replacement vehicle surfaces a conflict; simulation never claims live tracking.

Provide this reproducible demonstration:
Allocate a pass, show the route and play a labelled simulated trip.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 21 — M22: Notices, notifications and calendar communication
Prerequisites: M03, M04.
```text
Implement M22: Notices, notifications and calendar communication. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/communications/notices — Notice compose/preview, audience selection, scheduling and publication.
2. /app/communications/inbox — Personal notification center, read/unread and preferences.
3. /app/communications/outbox — Delivery outbox, retry, failure details and simulated provider inbox.
4. /app/communications/calendar — Academic/event calendar subscription and document attachments.

Implement these domain records/contracts:
Notice, NoticeAudience, Notification, NotificationPreference, OutboxMessage, DeliveryAttempt.

Implement this complete workflow:
Domain action creates outbox event→delivery worker dispatches through simulator→recipient sees notification→delivery status recorded.

Enforce these business and authorization rules:
Idempotent event handling prevents duplicate delivery. Match audience from authorized membership/enrollment. Simulator stores messages locally and sends no real SMS/email. Preview audience size and content.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Failed delivery retries without duplicate in-app notice; wrong institute excluded; scheduled notice respects campus timezone; sensitive event details absent from broad notifications.

Provide this reproducible demonstration:
Publish a class notice and inspect one successful and one retried simulated delivery.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 22 — M21: Parent and guardian portal
Prerequisites: M07, M08, M10, M15, M22.
```text
Implement M21: Parent and guardian portal. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/guardians/linking — Guardian invitation/link verification and consent/authority record.
2. /app/guardians/dashboard — Guardian dashboard and linked-student switcher.
3. /app/guardians/student-summary — Permitted attendance, fee, published-result and notice views.
4. /app/guardians/permissions — Access preferences, contact update request and relationship revocation.

Implement these domain records/contracts:
GuardianLink, GuardianPermissionGrant, GuardianInvitation, GuardianAccessEvent.

Implement this complete workflow:
Authorized invitation→simulated verification→student/institution approval under configured policy→limited access→revoke.

Enforce these business and authorization rules:
Guardian gets a separate account, never the student's session. Access categories are explicit. University students may be adults; use a configurable consent/authority process and do not assume automatic parental access. No private grievances or unpublished results.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Unlinked student IDs denied; revoked relationship stops next request; removing result permission hides API data, not only UI; invitation expires.

Provide this reproducible demonstration:
Show attendance as guardian, deny a private ticket and revoke the link.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 23 — M23: Committees, tasks and notesheets
Prerequisites: M03, M22.
```text
Implement M23: Committees, tasks and notesheets. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/governance/committees — Committee list, member tenure, meeting agenda and decisions.
2. /app/governance/tasks — Task board/list/detail with assignee, due date and priority.
3. /app/governance/notesheets — Notesheet compose, attachments, forwarding, review and decision timeline.
4. /app/governance/approvals — My pending approvals and overdue-work dashboard.

Implement these domain records/contracts:
Committee, CommitteeMembership, Meeting, CommitteeDecision, Task, Notesheet, NotesheetStep.

Implement this complete workflow:
Create notesheet→assign/forward→review with remarks→approve/reject/return→complete; committee decision may create tasks.

Enforce these business and authorization rules:
Only current authorized assignee can act. Forwarding target must have valid institutional responsibility. Preserve remarks/attachments/history. Prevent self-approval when the selected policy requires separation.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Former committee member denied; forwarding records prior owner; concurrent decisions do not both win; completed notesheet remains auditable.

Provide this reproducible demonstration:
Forward a purchase notesheet through two staff roles and show its decision timeline.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 24 — M24: E-register and document movement
Prerequisites: M03, M23.
```text
Implement M24: E-register and document movement. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/registers/entries — Inward/outward register lists, create entry and document detail.
2. /app/registers/numbering — Number format/sequence configuration and printable acknowledgement.
3. /app/registers/movement — Document dispatch, recipient acknowledgement and movement history.
4. /app/registers/reports — Search, date/type filters and authorized export.

Implement these domain records/contracts:
RegisterType, RegisterEntry, RegisterSequence, DocumentMovement, DispatchAcknowledgement.

Implement this complete workflow:
Register document→assign unique scoped number→route→acknowledge→dispatch/archive.

Enforce these business and authorization rules:
Atomic university/institute/year/type numbering. No mutable reused numbers; void with reason instead. Attachments private and exports scoped. Department labels/number prefixes configurable.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Concurrent entries remain unique; wrong-year format rejected; void history visible; private attachment not downloadable by unrelated users.

Provide this reproducible demonstration:
Register a document, move it to another department and acknowledge it.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 25 — M25: Staff establishment and leave
Prerequisites: M03, M22.
```text
Implement M25: Staff establishment and leave. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/hr/employees — Employee directory/detail, appointment/post history and service documents.
2. /app/hr/my-leave — Leave policies, balances, application and personal calendar.
3. /app/hr/approvals — Manager approval queue, delegation and team absence calendar.
4. /app/hr/establishment — Vacancy, retirement/pension-case and establishment-case registers.

Implement these domain records/contracts:
Employee, Appointment, ServiceEvent, LeavePolicy, LeaveBalance, LeaveRequest, EstablishmentCase.

Implement this complete workflow:
Create staff record→assign post→accrue demo leave balance→apply→approve/reject→update balance; track establishment cases separately.

Enforce these business and authorization rules:
Use fictional policies. Approved leave affects availability; prevents overlapping approved leave. Pension cases are tracked, not legally calculated. Sensitive staff documents restricted to HR.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Insufficient balance and overlapping requests rejected; cancellation restores correct balance once; employee cannot approve own leave; vacancy counts derive from active posts.

Provide this reproducible demonstration:
Approve leave and show balance/calendar change and one establishment-case timeline.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 26 — M26: Payroll and expenditure prototype
Prerequisites: M25, M10.
```text
Implement M26: Payroll and expenditure prototype. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/payroll/structures — Salary component/structure editor and effective-date assignments.
2. /app/payroll/runs — Monthly payroll draft, validation, approval and simulated disbursement.
3. /app/payroll/my-payslips — Employee payslip and payroll history.
4. /app/payroll/claims — Expense claim, attachment, approval and reimbursement status.

Implement these domain records/contracts:
SalaryStructureVersion, EmployeeSalaryAssignment, PayrollRun, Payslip, DisbursementEvent, ExpenseClaim.

Implement this complete workflow:
Configure fictional salary→generate monthly draft→validate→approve→simulate disbursement→issue DEMO payslip; claims follow approval→simulated reimbursement.

Enforce these business and authorization rules:
Integer paise, documented demo formulas, immutable approved runs, no real tax/statutory compliance claims. Prevent duplicate employee/month runs and double disbursement. Corrections use adjustment records.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Golden salary fixture totals match; duplicate payroll blocked; wrong employee cannot view payslip; rejected claim never enters disbursement.

Provide this reproducible demonstration:
Generate and approve one payroll run, simulate payment and download a DEMO payslip.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 27 — M27: Library services
Prerequisites: M07, M10.
```text
Implement M27: Library services. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/library/catalog — Searchable catalog, book detail and availability.
2. /app/library/accessions — Catalog/accession management and borrower membership.
3. /app/library/circulation — Issue/return/renew counter, reservations and waiting queue.
4. /app/library/my-library — Student loans, due dates, fines and library clearance.

Implement these domain records/contracts:
BookTitle, BookCopy, LibraryMembership, Loan, Reservation, LibraryFinePolicy, LibraryClearance.

Implement this complete workflow:
Catalog copy→reserve/issue→renew or return→calculate demo overdue charge→settle linked invoice→clearance.

Enforce these business and authorization rules:
One active loan per copy; borrowing/renewal policies configurable. Fine computation reproducible from dates and policy version. No separate duplicate payment ledger.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Concurrent issue for one copy gives one winner; reserved copy respects queue; return idempotent; overdue charge capped/configured; graduation clearance reflects outstanding loans.

Provide this reproducible demonstration:
Issue a book, use a labelled simulated date to show an overdue return and resolve clearance.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 28 — M28: Inventory, procurement and assets
Prerequisites: M23, M24, M10.
```text
Implement M28: Inventory, procurement and assets. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/inventory/masters — Item/category/vendor masters, stock ledger and low-stock view.
2. /app/inventory/procurement — Requisition, approval, purchase order and goods receipt.
3. /app/inventory/movements — Issue/return, department transfer and asset assignment.
4. /app/inventory/assets — Stock count, adjustment approval and maintenance history.

Implement these domain records/contracts:
InventoryItem, Vendor, Requisition, PurchaseOrder, GoodsReceipt, StockMovement, Asset, StockAdjustment.

Implement this complete workflow:
Requisition→approval→purchase order→receive→issue/assign→return/transfer→audit count→approved adjustment.

Enforce these business and authorization rules:
Do not claim the legacy manual specified this flow. Inventory changes use immutable movements and nonnegative balance checks. No real purchase emails/orders are sent. Serial-numbered assets are unique.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Issue beyond stock rejected; repeated receipt does not double stock; transfer balances reconcile; only authorized staff approve adjustments.

Provide this reproducible demonstration:
Receive five items, issue two and reconcile the balance with movement history.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 29 — M29: Research, accreditation, establishment and finance MIS
Prerequisites: M07, M10, M15, M25, M28.
```text
Implement M29: Research, accreditation, establishment and finance MIS. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/mis/dashboard — Leadership dashboard with drill-down and filters.
2. /app/mis/research — Research publications, projects, PhD records and patents.
3. /app/mis/accreditation — Accreditation/activity evidence register and reporting-period snapshots.
4. /app/mis/reports — Enrollment/results/staffing/vacancy/finance/student-welfare reports and export builder.

Implement these domain records/contracts:
ResearchPublication, ResearchProject, PhDRecord, PatentRecord, AccreditationEvidence, ReportingPeriod, ReportSnapshot.

Implement this complete workflow:
Authorized data entry→verification→period aggregation→preview report→publish snapshot/export.

Enforce these business and authorization rules:
Operational metrics derive from source modules. Research/accreditation entries are synthetic and labelled. Every metric has a formula, scope and period. No fabricated institutional ranking or claimed compliance.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Dashboard totals reconcile to filtered source records; restricted dimensions cannot be exported; CSV formula injection neutralized; snapshot remains stable after later data changes.

Provide this reproducible demonstration:
Filter one institute's enrollment/collections, drill to records and export a period snapshot.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 30 — M30: Feedback and surveys
Prerequisites: M04, M05, M22.
```text
Implement M30: Feedback and surveys. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/feedback/surveys — Survey builder/templates, audience and schedule.
2. /app/feedback/respond — Student/faculty response form and completion history.
3. /app/feedback/analytics — Response dashboard, topic summaries and authorized export.
4. /app/feedback/actions — Action items linked to survey outcomes.

Implement these domain records/contracts:
Survey, SurveyAudience, SurveyResponse, SurveyAggregate, SurveyAction.

Implement this complete workflow:
Publish versioned survey→notify audience→collect response→close→aggregate→assign improvement task.

Enforce these business and authorization rules:
Choose identified or anonymous mode at creation; explain limits. Anonymous results use a minimum response threshold and restricted linkage, not a false promise of perfect anonymity. One response per invitation, with token handling appropriate to mode.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Non-audience response denied; duplicate token rejected; results suppressed below configured threshold; published questions immutable.

Provide this reproducible demonstration:
Collect seeded course feedback and create one improvement task from its aggregate.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 31 — M31: AI chat assistant and voice interface
Prerequisites: M07, M08, M09, M10, M17, M18, M19, M20, M22.
```text
Implement M31: AI chat assistant and voice interface. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/assistant/chat — Assistant full page and contextual drawer.
2. /app/assistant/history — Conversation history controls, source cards and linked records.
3. /app/assistant/voice — Voice input/output controls, transcript and microphone error/fallback.
4. /app/assistant/evaluation — Admin knowledge articles, source versions and AI evaluation dashboard.

Implement these domain records/contracts:
KnowledgeArticleVersion, Conversation, AssistantMessage, AIEvaluationCase, AIEvaluationRun. Provider adapter: real LLM or deterministic labelled simulator.

Implement this complete workflow:
Authenticate→retrieve authorized facts/FAQ→generate or simulate grounded answer→validate output→show sources→navigate to relevant page; voice feeds the same pipeline.

Enforce these business and authorization rules:
Read-only tools only; policy checks before retrieval; no arbitrary queries, hidden exam papers or staff notes. Redact unnecessary PII. Browser speech fallback is mandatory. Simulated mode is visibly labelled; real model key stays server-side.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
At least 30 evaluation questions cover sources, false premise, unauthorized student, prompt injection, timeout, Hindi/English and unavailable data. Facts must match DB. No voice permission means typed flow remains usable.

Provide this reproducible demonstration:
Ask fee balance, next class, hostel status and certificate status; ask for another student's data and show refusal.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 32 — M32: Performance prediction and early-support analytics
Prerequisites: M08, M14, M15.
```text
Implement M32: Performance prediction and early-support analytics. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/predictions/dashboard — Prediction dashboard with cohort filter and data/model version.
2. /app/predictions/student-support — Individual support profile with score, drivers, uncertainty and history.
3. /app/predictions/training — Synthetic training/evaluation console and threshold scenario comparison.
4. /app/predictions/interventions — Advisor review, outreach task and outcome tracking.

Implement these domain records/contracts:
SyntheticDatasetVersion, FeatureSnapshot, ModelVersion, Prediction, EvaluationReport, AdvisorReview, SupportIntervention.

Implement this complete workflow:
Generate labelled synthetic longitudinal data→split/train baseline→evaluate→version model→score authorized cohort→advisor reviews→creates support task→tracks outcome.

Enforce these business and authorization rules:
Actually compute numeric performance regression and dropout-risk logistic baseline in Node/TypeScript or documented Node-compatible runtime. Use student-separated temporal holdout and pre-cutoff features. Synthetic labels demonstrate pipeline only. No claim of real predictive validity; no automated penalties. No sensitive demographic features.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Seeded training reproducible; holdout never enters fitting/preprocessing; regression MAE and classification precision/recall/PR-AUC/calibration actually computed with class balance; changing input changes score; low-data conditions shown.

Provide this reproducible demonstration:
Train the synthetic baseline, inspect held-out metrics, compare two scenarios and create a human-reviewed support task.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 33 — M33: Personalized learning recommendations
Prerequisites: M05, M14, M31, M32.
```text
Implement M33: Personalized learning recommendations. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/learning/my-plan — Student learning dashboard, topic mastery and suggested resources.
2. /app/learning/resources — Resource catalog/editor tagged by topic, difficulty, language and format.
3. /app/learning/progress — Personal learning plan, progress/completion and feedback.
4. /app/learning/faculty — Faculty recommendation review and aggregate engagement.

Implement these domain records/contracts:
Topic, Resource, TopicAssessmentMapping, MasterySnapshot, Recommendation, LearningPlan, LearningActivity.

Implement this complete workflow:
Map assessment to topics→compute mastery→rank curated resources→explain recommendation→student completes activity→update plan.

Enforce these business and authorization rules:
Provide working explainable rule-based ranking, clearly described as such, with optional LLM explanations grounded in catalog facts. Never invent external resources or infer mastery from unrelated grades. Manual override and student preference controls.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Low mastery changes ranked resources; prerequisites and language preference respected; completion persists; no data returns starter plan, not fabricated personalized insight.

Provide this reproducible demonstration:
Show a weak topic, recommended resource and progress after completing a seeded activity.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 34 — M34: Mobile app and offline-safe access
Prerequisites: M07, M08, M09, M10, M17, M18, M19, M20, M21, M31, M33.
```text
Implement M34: Mobile app and offline-safe access. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/mobile/home — Complete responsive student/guardian navigation on phone.
2. /app/mobile/install — Install/update/offline indicators and download states.
3. /app/mobile/android — Native Android app shell with deep links and permission screens.
4. /app/mobile/settings — Settings: language, notifications, privacy, logout and local-data clearing.

Implement these domain records/contracts:
DeviceRegistration, NotificationPreference; explicit storage/cache policy and Capacitor configuration.

Implement this complete workflow:
Use responsive web→install PWA→package Android app→authenticate→use student journeys→logout and clear private state.

Enforce these business and authorization rules:
Full prototype includes a tested Android debug APK via Capacitor, not only a PWA. Cache public/static assets only by default; offline private writes disabled with clear UI. Verify actual device authentication without disabling CSRF/browser protections. No claim of iOS build unless tested.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Android build installs on emulator/device; login, timetable, ticket, payment simulation, PDF download and voice fallback work; deep links enforce auth; logout clears private local state; offline screen honest.

Provide this reproducible demonstration:
Run student certificate/helpdesk journey on Android and show safe offline state.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 35 — M35: Demo control center, integrations and operations
Prerequisites: M10, M17, M22, M31, M32.
```text
Implement M35: Demo control center, integrations and operations. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/demo-operations/scenarios — Restricted demo control center: scenario catalog and reset/seed status.
2. /app/demo-operations/integrations — Integration mode/health dashboard, simulator event history and retry.
3. /app/demo-operations/jobs — Background job status, audit/search, storage usage and backup/restore guide.
4. /app/demo-operations/clock — Scenario time controls with prominent simulated-clock indicator.

Implement these domain records/contracts:
DemoScenario, SimulationEvent, IntegrationConfiguration, JobRun, SeedManifest, DemoClock.

Implement this complete workflow:
Select seeded scenario→run labelled provider event→inspect domain outcome→reset isolated demo dataset through protected command/control→verify integrity.

Enforce these business and authorization rules:
Modes are explicit per adapter. Simulator commands never bypass domain services or fabricate success. Reset limited to a dedicated disposable demo environment with confirmation and protected staff role; default reset remains CLI. Never reset user/pilot databases.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Non-demo environment refuses reset/simulator mutation; failed event remains failed; replay remains idempotent; all simulator events marked in audit; seed validation reports missing references.

Provide this reproducible demonstration:
Trigger delayed payment callback and notification failure, then demonstrate recovery.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```

## Step 36 — M36: Complete UI audit, end-to-end rehearsal and release
Prerequisites: M01, M02, M03, M04, M05, M06, M07, M08, M09, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, M21, M22, M23, M24, M25, M26, M27, M28, M29, M30, M31, M32, M33, M34, M35.
```text
Implement M36: Complete UI audit, end-to-end rehearsal and release. Read its full specification in 02-MODULES-AND-PAGES.md and the shared architecture/seed/QA documents.

Build these page groups and their required detail/create/edit/action routes:
1. /app/release/coverage — All page inventory entries must be reachable by the correct persona.
2. /app/release/reviewer-guide — Reviewer guide, demo scenario index and feature/integration disclosure page.
3. /app/release/accessibility — Complete English/Hindi primary navigation and accessible state coverage.

Implement these domain records/contracts:
Route coverage report, action coverage report, test evidence, release manifest and verified artifact links.

Implement this complete workflow:
Run clean setup→seed→API/security tests→browser journeys→Android checks→deployed rehearsal→record module walkthroughs→prepare submission package.

Enforce these business and authorization rules:
No page may remain 'coming soon'. Every visible action must persist, compute, download, navigate or clearly validate. Integration simulation is allowed but must exercise real domain logic. Never silently downgrade to read-only mock screens.

Create coherent synthetic fixtures for both the normal path and the important failure/edge cases. Add no unrelated demo-only shortcuts to domain services.

Pass this acceptance gate:
Every module acceptance gate passes or is explicitly listed as a release blocker; all cross-module demo journeys pass; all routes/actions mapped to evidence; clean install reproducible; screenshots/recordings show actual app.

Provide this reproducible demonstration:
Present the complete storyline plus short module-specific recordings indexed by module ID.

Apply the mandatory completion footer. If a cross-module integration is not yet available, preserve a typed interface and record the exact integration gate; it must be completed before M36. Do not portray it as working until connected.
```


## Integration sprint prompt — run before M36
```text
Read the required integration gates in 02-MODULES-AND-PAGES.md. Connect every outstanding dependency using the existing domain services, not duplicate tables or frontend-only status changes.

Run the multi-role scenarios in 05-DEMONSTRATION-AND-SUBMISSION.md. Resolve identifier, permissions, event, timezone, money and state-machine mismatches. Ensure admission/exam prerequisites use finance, clearance uses fees/hostel/library, notifications use the outbox, reports reconcile to source data, AI retrieves all allowed services, and Android reads the same backend.

Update the coverage register with concrete evidence for each gate. Do not omit an integration silently. Then execute M36.
```

## Repair prompt
```text
Reproduce this defect: [steps/error with secrets removed]. Inspect the relevant module contract and failing state transition. Fix the smallest root cause without bypassing permissions, weakening assertions, deleting unrelated records or replacing functionality with mocks. Run targeted regression tests and the affected end-to-end scenario. Record actual evidence.
```

## Resume prompt
```text
Read GEMINI.md, docs/PROGRESS.md, docs/PAGE-REGISTER.md and docs/DECISIONS.md. Inspect git status and the current stage's implementation. Identify the next failing acceptance criterion. Continue that stage without restarting scaffolding, rewriting working modules or assuming undocumented work is complete.
```

## Module completion audit prompt
```text
Audit M[module ID] against every sentence of its specification. Produce a checklist mapping page→control→API→policy→database effect→test. Exercise all visible controls. Identify placeholders, hardcoded totals, disconnected data and missing failure states. Fix gaps and rerun the main journey. Mark complete only when the whole checklist passes.
```

## Submission artifact prompt
```text
Inspect the completed feature/test inventory. Create a concise executive synopsis, problem/solution, innovation note, impact measurement plan, implementation feasibility, architecture, reviewer setup instructions, repository/demo links, ten-slide outline and module recording index.

Describe every integration mode accurately: synthetic data, simulated money/messages/GPS/payroll, DEMO credentials, synthetic-model validation limits, AI provider or simulator, and tested mobile platform. Do not invent live deployment, measured impact or real predictive validity. Match the current organizer checklist and list remaining human submission steps.
```


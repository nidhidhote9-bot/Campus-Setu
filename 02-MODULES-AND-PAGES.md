# Complete module and page catalogue

This catalogue defines the complete requested prototype. All 36 stages are in scope. No module below is optional or deferred from the final prototype. Some stages are platform/release work rather than user-facing business modules.

There are 143 page groups. Each group can contain multiple list/detail/create/edit pages or tabs, as explicitly described. This is not a claim that there are exactly 143 final URLs. Maintain a machine-readable page/action registry as implementation resolves the routes.

## Routing and page contract
The route roots below are the stable feature entry points. Add /new, /:id and /:id/edit to collection routes when the described workflow needs those screens. Explicitly map non-CRUD action pages such as review, allocation, publish and download in docs/PAGE-REGISTER.md. Public landing/login/verification use public aliases outside /app, including /login and /verify/certificates/:token. Native mobile reuses permitted student/guardian routes.

Every page must include: title and context, authorized actions, meaningful loading/empty/error/forbidden states, validation, breadcrumbs or back navigation, responsive layout and keyboard access. Lists need search, filters, pagination, sorting and a detail action. Forms need validation, save/cancel and dirty-state protection. Detail pages need related records and history when applicable. Approval pages need approve/reject/return reasons and status history. Reports need metric definitions and scoped export. Actions must call working APIs; no visual-only success.

Origins distinguish requirements from proposed details. Library, payroll and stock procedures below are explicit prototype designs where the reference manual is broad or incomplete; they are not represented as verified legacy behavior.

## M01. Workspace, design system and application shell
**Origin:** Prototype foundation. **Dependencies:** None.

### Pages and functionality
- `/app/foundation/landing` — Public landing: product overview, module overview, sign-in and demo-mode disclosure.
- `/app/foundation/authentication` — Sign-in, session-expired, forbidden, not-found and recoverable-error pages.
- `/app/foundation/dashboard` — Role-specific dashboard shells, global search, notifications drawer, profile menu and mobile navigation.
- `/app/foundation/components` — Component gallery: tables, filters, pagination, forms, date/time input, dialogs, timeline, charts, empty/loading/error states.

**Records:** Workspace packages, environment schema, navigation registry, route metadata, theme tokens and shared API contracts.

**Workflow:** Create the fresh React/Express/MongoDB workspace; implement reusable UI and API infrastructure; route every persona into an authenticated shell.

**Rules:** Use original branding. All named pages must exist by their module gate. Do not ship dead menu entries or buttons that only show a success toast. Dates use an explicit campus timezone.

**Acceptance gate:** Production build and health/readiness work; nested routes refresh; shell is usable at 390, 768 and 1440 pixels; keyboard navigation and visible focus work.

**Demonstration:** Open landing, sign in and compare desktop/mobile shells.

## M02. Identity, role permissions and record scope
**Origin:** IUMS + challenge foundation. **Dependencies:** M01.

### Pages and functionality
- `/app/identity/login` — Login and demo persona selector; password reset request and reset confirmation.
- `/app/identity/my-account` — My profile, change password and active sessions.
- `/app/identity/users` — User list/detail/create/edit; membership and role assignment; permission matrix.
- `/app/identity/audit` — Audit explorer filtered by actor, resource, institution and date.

**Records:** User, Membership, Role, Permission, Session, PasswordResetToken, AuditEvent. Roles: university_admin, institute_admin, admissions_officer, faculty, exam_controller, finance_officer, hostel_warden, transport_manager, librarian, hr_officer, helpdesk_agent, student and guardian.

**Workflow:** Create account→assign institution membership→authenticate→select authorized scope→perform permitted operation→audit→logout or revoke session.

**Rules:** Hash passwords. Use Mongo-backed opaque sessions, secure cookies and CSRF protection. Scope comes from authenticated memberships. Demo persona selection authenticates a seeded account only in explicitly configured demo mode. Never create an unrestricted role switch.

**Acceptance gate:** Test unauthenticated, wrong role, wrong institute, wrong student and revoked session cases. Reset tokens expire and are single-use. DTOs exclude password/session secrets.

**Demonstration:** Switch between seeded student/faculty/staff accounts and demonstrate one denied access.

## M03. University organization, posts and configuration
**Origin:** IUMS + NLIU. **Dependencies:** M02.

### Pages and functionality
- `/app/organization/university` — University profile and branding settings; campus/college hierarchy tree.
- `/app/organization/hierarchy` — Institute, department, designation and post lists with create/edit/detail forms.
- `/app/organization/post-assignments` — Staff-to-post assignments and delegated responsibility dates.
- `/app/organization/settings` — Academic year/session settings, numbering settings and module configuration.

**Records:** University, Institute, Department, Designation, Post, PostAssignment, AcademicSession, NumberSequence, TenantSettings.

**Workflow:** Configure university→add institutes/departments→create posts→assign staff→configure scoped numbering and module settings.

**Rules:** Prevent hierarchy cycles and cross-university parents. Referenced masters are archived, not deleted. Branding and terminology are configuration, never username conditionals. Number sequences use atomic increments and unique indexes.

**Acceptance gate:** Two fictional universities cannot see each other's data; institutes within one university remain scoped; hierarchy cycles and duplicate active post assignments are rejected.

**Demonstration:** Change a university display label and show a scoped department/post assignment.

## M04. Versioned forms, localization and content configuration
**Origin:** IUMS. **Dependencies:** M03.

### Pages and functionality
- `/app/forms/builder` — Form builder list/editor/preview/publish/history.
- `/app/forms/submissions` — Submission list/detail and validation errors.
- `/app/forms/translations` — English/Hindi label dictionary with missing-translation view.
- `/app/forms/templates` — Document template and FAQ/content editor with preview.

**Records:** FormDefinition, FormVersion, FormSubmission, TranslationEntry, ContentArticle, DocumentTemplateVersion.

**Workflow:** Draft fields→preview→publish immutable schema version→submit data→review/export; revise by publishing a new version.

**Rules:** Allow only defined field types: text, number, date, select, multiselect, checkbox and attachment. Validation runs server-side. No arbitrary JavaScript/HTML execution. Existing submissions retain their version. English is fallback for missing Hindi labels.

**Acceptance gate:** Published schema cannot mutate existing submissions; unsafe markup is sanitized; required/conditional fields validate on both client and server; switching language preserves workflow state.

**Demonstration:** Publish a feedback form, submit it, then create a new version without changing the old response.

## M05. Academic masters and configurable curriculum
**Origin:** IUMS + NLIU. **Dependencies:** M03.

### Pages and functionality
- `/app/academics/catalog` — Program, course, subject and term lists with detail/create/edit/archive.
- `/app/academics/schemes` — Scheme version editor: components, weights, credits, passing rules and grading bands.
- `/app/academics/electives` — Elective groups, prerequisites and student subject registration.
- `/app/academics/teaching` — Teaching assignment and faculty workload pages; syllabus upload/download.

**Records:** Program, Course, Subject, CurriculumVersion, AssessmentComponent, GradePolicy, ElectiveGroup, SubjectEnrollment, TeachingAssignment, SyllabusDocument.

**Workflow:** Create program→version scheme→define subjects/components→publish curriculum→assign cohort→enroll subjects→assign faculty.

**Rules:** Model NLIU-style mid-semester, viva, project and attendance components as configuration. Published schemes are immutable. Validate maxima, minima, weight totals, grade boundaries and elective constraints; credit calculations use the assigned version.

**Acceptance gate:** Invalid weight totals, duplicate subjects and unmet prerequisites fail. A later curriculum revision does not alter an existing cohort. Faculty sees only assigned offerings.

**Demonstration:** Compare a law program's assessment scheme with a different program without code changes.

## M06. Admissions, import mapping and enrollment
**Origin:** IUMS. **Dependencies:** M04, M05.

### Pages and functionality
- `/app/admissions/apply` — Applicant registration, application wizard, documents, preview and status timeline.
- `/app/admissions/review` — Admissions dashboard, reviewer queue, application detail and correction/approval actions.
- `/app/admissions/imports` — CSV import wizard: upload, external-code mapping, dry run, row errors and commit.
- `/app/admissions/enrollment` — Registration/enrollment ID registry, transfer/withdrawal record and enrollment confirmation.

**Records:** Applicant, AdmissionApplication, AdmissionDocument, ImportBatch, ExternalCodeMapping, ReviewDecision, Enrollment, IdentifierSequence.

**Workflow:** Draft→submitted→under_review→correction_required→resubmitted→approved→enrolled. Approval can also reject with reason. Mock admission-provider data enters the same staging pipeline.

**Rules:** Explicit document and fee prerequisites; simulate provider checks through adapters. Generate distinct registration/enrollment IDs atomically; use IURN/IUEN concepts without claiming official issuance. Duplicate detection offers review, never silent merging.

**Acceptance gate:** Invalid transitions and premature enrollment fail; dry run writes no applicants; import is idempotent; bad rows are downloadable; applicant can correct only requested fields; numbering survives concurrent approvals.

**Demonstration:** Import five candidates with one mapping error, fix it, request a correction, approve and enroll one candidate.

## M07. Student lifecycle and unified record
**Origin:** Challenge + IUMS. **Dependencies:** M05, M06.

### Pages and functionality
- `/app/students/overview` — Student dashboard with live summaries, student directory and Student 360 detail.
- `/app/students/profile` — Profile correction request, ID card preview/download and document locker.
- `/app/students/lifecycle` — Subject enrollment, progression, transfer, withdrawal and graduation status.
- `/app/students/alumni` — Alumni profile and service eligibility screen.

**Records:** StudentProfile, EnrollmentHistory, ProfileChangeRequest, StudentDocument, StudentStatusEvent, GraduationRecord, AlumniProfile.

**Workflow:** Admission creates student→subject enrollment→term progression→graduation/alumni, with separate authorized transfer/withdrawal paths. Other modules attach facts to this record.

**Rules:** Student 360 composes scoped module data, not duplicate editable copies. Sensitive fields use explicit DTOs. Documents are private. Status changes preserve history and affect future eligibility without deleting records.

**Acceptance gate:** Student cannot approve their own profile correction; graduation requires configured checks; transfer preserves past results; document access respects ownership; dashboard numbers match source records.

**Demonstration:** Show the enrolled candidate as a student with academics, fees and request history in one profile.

## M08. Attendance and academic engagement
**Origin:** Challenge. **Dependencies:** M05, M07.

### Pages and functionality
- `/app/attendance/capture` — Faculty class roster, attendance capture and session history.
- `/app/attendance/corrections` — Attendance correction request/review and bulk upload preview.
- `/app/attendance/my-attendance` — Student course attendance detail, trend and shortage explanation.
- `/app/attendance/reports` — Staff attendance analytics and downloadable scoped report.

**Records:** AttendanceSession, AttendanceEntry, AttendanceCorrection, AttendancePolicyVersion.

**Workflow:** Create class session→mark attendance→submit→student sees summary→request correction→authorized review→audited update.

**Rules:** Explicit present/absent/excused states; denominator follows policy. Unique student/session pair. Faculty is restricted to teaching assignments. Bulk upload validates roster and dates before commit.

**Acceptance gate:** Duplicate entries cannot inflate totals; no-session percentage is not NaN; unassigned faculty denied; approved correction updates aggregates and preserves prior value.

**Demonstration:** Mark one absence, request correction, approve it and show the updated student percentage.

## M09. Timetable, rooms and academic calendar
**Origin:** Challenge + IUMS. **Dependencies:** M05.

### Pages and functionality
- `/app/timetable/calendar` — Weekly/day timetable for student, faculty and administrator.
- `/app/timetable/editor` — Timetable editor, room list/capacity and conflict checker.
- `/app/timetable/reschedule` — Substitution/reschedule workflow and affected-class notice preview.
- `/app/timetable/events` — Academic calendar, holidays, assessment dates and calendar export.

**Records:** Room, TimetableEntry, RecurrenceRule, TimetableException, CalendarEvent, Holiday.

**Workflow:** Create recurring schedule→check faculty/room/cohort conflicts→publish→reschedule a dated instance→notify affected users.

**Rules:** Use campus timezone and date-specific exceptions. Check overlapping intervals, room capacity and faculty/cohort conflicts. Do not overwrite history when changing future schedules.

**Acceptance gate:** Reject conflicting schedule entries; a reschedule updates only intended dates; holidays remove or flag sessions according to policy; student schedule includes only enrolled courses.

**Demonstration:** Attempt a room collision, resolve it and show the student's changed next class.

## M10. Fees, payments, reconciliation and finance
**Origin:** Challenge + IUMS. **Dependencies:** M07.

### Pages and functionality
- `/app/finance/rules` — Fee head/category/rule configuration; concession and late-fee configuration.
- `/app/finance/my-fees` — Student invoices, checkout, payment attempts, receipts and refund status.
- `/app/finance/reconciliation` — Finance dashboard, fund/budget register, cash/bank collection ledger, reconciliation queue and exception detail.
- `/app/finance/concessions` — Scholarship/concession request review and finance export.

**Records:** FeeRuleVersion, Invoice, InvoiceLine, PaymentOrder, PaymentEvent, Receipt, Refund, Concession, ReconciliationRun. Fund, Budget, BudgetEntry with configurable heads and immutable approved entries.

**Workflow:** Assess fees→issue invoice→create payment order→simulated provider callback→verify→settle→receipt; refund uses separate approval and provider event. Reconciliation compares ledger/provider events.

**Rules:** Integer paise; server-calculated amounts; unique idempotency keys; signed local simulator callbacks; amount/currency/order binding; atomic settlement and receipt creation. Delayed/duplicate/failed callbacks must be testable. No actual money moves.

**Acceptance gate:** Duplicate callbacks yield one settlement; tampered signature/amount rejected; success is not reversed by a late failure; partial refund cannot exceed paid balance; reports reconcile.

**Demonstration:** Pay one invoice, replay its callback, show one receipt, then reconcile a deliberately pending order.

## M11. Exam applications, eligibility and hall tickets
**Origin:** IUMS. **Dependencies:** M05, M07, M10.

### Pages and functionality
- `/app/exam-applications/cycles` — Exam cycle/setup, regular/private/backlog policy and application windows.
- `/app/exam-applications/apply` — Student exam application wizard, eligibility explanation, fee link and status.
- `/app/exam-applications/review` — Exam office review queue, exceptions and subject roster.
- `/app/exam-applications/hall-tickets` — Roll-number assignment and hall ticket preview/download.

**Records:** ExamCycle, ExamPolicyVersion, ExamApplication, EligibilityDecision, ExamEnrollment, RollNumberAssignment, HallTicket.

**Workflow:** Open cycle→calculate eligibility→student selects valid papers→pay required fee→review→approve→assign roll number→issue hall ticket.

**Rules:** Configurable attendance/academic/fee requirements. Exceptions need authorized reason. Private/backlog categories use explicit policy rather than guessed regulations. Roll numbering is a new prototype design because the manual does not fully specify it.

**Acceptance gate:** Closed windows, ineligible subjects and unpaid prerequisites block submission/approval appropriately; repeat issuance is idempotent; hall tickets never cross student boundaries.

**Demonstration:** Show an ineligible application, an audited exception and successful hall ticket issuance.

## M12. Exam scheduling, centers and materials
**Origin:** IUMS. **Dependencies:** M11, M09.

### Pages and functionality
- `/app/exam-operations/schedule` — Exam timetable builder and conflict report.
- `/app/exam-operations/centers` — Center/room verification, capacity and seating allocation.
- `/app/exam-operations/invigilators` — Invigilator duty roster, appointment and acknowledgement.
- `/app/exam-operations/materials` — Answer-book stock/serial ranges, dispatch, receipt, usage and return register.

**Records:** ExamSchedule, ExamCenter, CenterVerification, SeatingAllocation, InvigilationDuty, MaterialBatch, MaterialMovement.

**Workflow:** Verify center→publish schedule→allocate seats→assign invigilators→dispatch numbered materials→acknowledge/return→reconcile.

**Rules:** No student/paper/time collisions or capacity overrun. Serial intervals cannot overlap. Reallocation retains an audit record. Confidential metadata is restricted to exam staff.

**Acceptance gate:** Allocation respects capacity under concurrent actions; duplicate serial range rejected; absent acknowledgement is visible; usage plus remaining/returned quantities reconciles.

**Demonstration:** Allocate an exam room, reject an over-capacity action and reconcile an answer-book batch.

## M13. Paper setters and confidential question bank
**Origin:** IUMS. **Dependencies:** M05, M11.

### Pages and functionality
- `/app/question-papers/appointments` — Setter panel and appointment requests; acceptance/rejection with reason.
- `/app/question-papers/papers` — Secure paper upload, version list, review and approval.
- `/app/question-papers/question-bank` — Question bank by subject/topic/difficulty and draft paper assembly.
- `/app/question-papers/access` — Controlled download/access audit and confidentiality settings.

**Records:** SetterAppointment, AppointmentResponse, Question, PaperVersion, PaperReview, ConfidentialAccessEvent.

**Workflow:** Invite internal seeded setter→accept→submit paper→review/revise→approve→authorized release.

**Rules:** Mock notification delivery; private storage and narrowly scoped access. Submitted versions immutable. Paper content never enters general search, guardian views or AI context. No public file URLs.

**Acceptance gate:** Non-appointed faculty and students cannot retrieve papers; version history preserved; release before approval fails; downloads are auditable.

**Demonstration:** Accept a setter appointment and approve a revised sample paper using authorized accounts.

## M14. Marks entry, moderation and approval
**Origin:** IUMS + NLIU. **Dependencies:** M05, M11.

### Pages and functionality
- `/app/assessment/marks` — Faculty assessment roster and component-wise marks grid.
- `/app/assessment/imports` — CSV marks import preview/errors and submission summary.
- `/app/assessment/moderation` — Moderator review, discrepancy queue and approval history.
- `/app/assessment/my-assessments` — Student published assessment breakdown; unpublished marks hidden.

**Records:** AssessmentBatch, MarkEntry, MarkImport, ModerationDecision, AssessmentApproval.

**Workflow:** Draft marks→validate→faculty submits→moderator returns or approves→exam office locks assessment for results.

**Rules:** Use exact curriculum component version. Explicit absent/withheld states, no sentinel negative score. Validate maxima, missing entries and authorized correction reasons. Separation of submission and approval is configurable and demonstrated.

**Acceptance gate:** Out-of-range marks rejected; submitted batches not silently editable; wrong-term import cannot overwrite another term; returned batches preserve review comments.

**Demonstration:** Import a mark above maximum, fix it, submit, return for correction and approve.

## M15. Results, transcripts and academic progression
**Origin:** IUMS. **Dependencies:** M14.

### Pages and functionality
- `/app/results/tabulation` — Tabulation preview, validation errors and result approval queue.
- `/app/results/publication` — Publication dashboard and revision comparison.
- `/app/results/my-results` — Student result/grade card, transcript download and progression status.
- `/app/results/reports` — Pass list, withheld list, summary and export.

**Records:** ResultRun, ResultRevision, SubjectResult, TermResult, PublicationEvent, TranscriptSnapshot.

**Workflow:** Calculate draft from approved marks→validate→approve→publish immutable revision→student views result; correction creates superseding revision.

**Rules:** Document rounding, credit, grade and pass/backlog formulas. Never delete published results during recalculation. Term/university/student keys are explicit. Transcripts refer to effective published revisions.

**Acceptance gate:** Golden fixture grade calculations match expected values; duplicate publish does not duplicate records; correction changes only selected scope; unpublished results remain private.

**Demonstration:** Publish a term result, then compare an authorized revised version with its original.

## M16. Revaluation and retotalling
**Origin:** IUMS. **Dependencies:** M10, M15.

### Pages and functionality
- `/app/revaluation/apply` — Student eligible-paper list, revaluation/retotalling request and fee status.
- `/app/revaluation/assignments` — Exam-office request queue, reviewer assignment and deadline tracking.
- `/app/revaluation/outcomes` — Reviewer outcome entry, approval and result revision link.
- `/app/revaluation/my-decisions` — Student decision notice and before/after comparison.

**Records:** ReviewPolicy, ResultReviewRequest, ReviewAssignment, ReviewOutcome.

**Workflow:** Published result→eligible request within window→fee settlement→review assignment→outcome approval→superseding result revision.

**Rules:** Retotalling and revaluation are separate procedures. Policy values are fictional configurable examples until official regulations are supplied. Review outcome cannot directly overwrite a published record.

**Acceptance gate:** Late/ineligible requests rejected; unpaid request not assigned; duplicate same-paper/type request controlled; changed result links to original and reason.

**Demonstration:** Submit retotalling, pay via simulator and publish its approved correction.

## M17. Certificates and digital document verification
**Origin:** Challenge + IUMS. **Dependencies:** M07, M10, M15.

### Pages and functionality
- `/app/certificates/catalog` — Certificate catalog, eligibility checklist, request form and tracking.
- `/app/certificates/review` — Staff review/approval/issuance queue and template preview.
- `/app/certificates/my-certificates` — My certificates, download, sharing/verification link and revocation status.
- `/app/certificates/verify` — Public QR verification page with minimal fields.

**Records:** CertificateType, CertificateRequest, IssuedCertificate, CertificateRevocation, VerificationToken.

**Workflow:** Request→check prerequisites→review→approve→issue snapshot/PDF→verify; authorized revocation changes verification state without deleting issuance.

**Rules:** Mark all credentials DEMO. Random opaque verification tokens; private authenticated downloads; minimal public facts. Persist immutable snapshot and document hash. No claim of legally recognized signing or national integration.

**Acceptance gate:** Unapproved issuance blocked; retries produce same certificate; revoked document verifies as revoked; PDF data matches issued snapshot; other students cannot download it.

**Demonstration:** Issue a bonafide certificate, scan QR and then demonstrate revocation with a second sample.

## M18. Student helpdesk, grievances and service desk
**Origin:** Challenge. **Dependencies:** M02, M07.

### Pages and functionality
- `/app/helpdesk/my-tickets` — Student service catalog, ticket form with attachments and my tickets.
- `/app/helpdesk/ticket-detail` — Ticket detail with public thread, status timeline and reopen action.
- `/app/helpdesk/staff-inbox` — Staff inbox, assignment, priority, escalation and SLA views.
- `/app/helpdesk/knowledge` — Knowledge base and service category configuration.

**Records:** Ticket, TicketMessage, TicketAssignment, ServiceCategory, SLAPolicy, EscalationEvent.

**Workflow:** Open→triage→assign→in_progress→resolved→student closes or reopens; overdue tickets surface in escalation queue.

**Rules:** Internal notes are separate from public messages. Sensitive grievances have restricted staff membership. Attachment policies apply. Simulated time advancement may trigger demo escalation but must be labelled.

**Acceptance gate:** Unrelated students/staff cannot access restricted tickets; reopen retains history; SLA computation follows configured working hours; public DTO excludes internal notes.

**Demonstration:** Raise a hostel issue, add an internal note, resolve and reopen it from student account.

## M19. Hostel operations
**Origin:** Challenge. **Dependencies:** M07, M10.

### Pages and functionality
- `/app/hostel/inventory` — Hostel/building/room/bed inventory and occupancy map.
- `/app/hostel/apply` — Student application, preferences, eligibility and waitlist position.
- `/app/hostel/allocations` — Warden review, allocation, room transfer, check-in/out and clearance.
- `/app/hostel/reports` — Hostel charges, complaints and occupancy/dues reports.

**Records:** Hostel, HostelRoom, Bed, HostelApplication, BedAllocation, WaitlistEntry, HostelMovement, HostelClearance.

**Workflow:** Apply→review→allocate or waitlist→pay deposit→check in→transfer or check out→clear dues→release bed.

**Rules:** Use unique active-bed and active-student allocation constraints with transactions. Define gender/accessibility/preferences as configured eligibility rules, not guessed institutional policy. No capacity overrun or duplicate occupancy.

**Acceptance gate:** Concurrent requests for final bed yield only one allocation; checkout releases bed; transfer cannot occupy two beds permanently; fees and complaints link to existing modules.

**Demonstration:** Fill last bed, waitlist another student, check out occupant and allocate the released bed.

## M20. Transport operations
**Origin:** Challenge. **Dependencies:** M07, M10.

### Pages and functionality
- `/app/transport/routes` — Routes/stops, vehicles, capacity, drivers and service calendar.
- `/app/transport/my-pass` — Student route subscription, pass, renewal and cancellation.
- `/app/transport/operations` — Transport manager allocation/waitlist, vehicle substitution and trip log.
- `/app/transport/tracking` — Map or route schematic, simulated vehicle position and utilization reports.

**Records:** TransportRoute, Stop, Vehicle, DriverAssignment, TransportSubscription, SeatAllocation, TransportPass, Trip, SimulatedLocation.

**Workflow:** Choose route/stop→approve seat→pay→issue pass→record trip→renew/cancel; substitute vehicle with capacity checks.

**Rules:** No real GPS is required: label deterministic location playback as simulation. Capacity is defined per service/time slot. Store exact route/pass validity dates. Reuse fee records.

**Acceptance gate:** Cannot overbook final seat; expired pass marked invalid; cancellation releases capacity; smaller replacement vehicle surfaces a conflict; simulation never claims live tracking.

**Demonstration:** Allocate a pass, show the route and play a labelled simulated trip.

## M21. Parent and guardian portal
**Origin:** Challenge. **Dependencies:** M07, M08, M10, M15, M22.

### Pages and functionality
- `/app/guardians/linking` — Guardian invitation/link verification and consent/authority record.
- `/app/guardians/dashboard` — Guardian dashboard and linked-student switcher.
- `/app/guardians/student-summary` — Permitted attendance, fee, published-result and notice views.
- `/app/guardians/permissions` — Access preferences, contact update request and relationship revocation.

**Records:** GuardianLink, GuardianPermissionGrant, GuardianInvitation, GuardianAccessEvent.

**Workflow:** Authorized invitation→simulated verification→student/institution approval under configured policy→limited access→revoke.

**Rules:** Guardian gets a separate account, never the student's session. Access categories are explicit. University students may be adults; use a configurable consent/authority process and do not assume automatic parental access. No private grievances or unpublished results.

**Acceptance gate:** Unlinked student IDs denied; revoked relationship stops next request; removing result permission hides API data, not only UI; invitation expires.

**Demonstration:** Show attendance as guardian, deny a private ticket and revoke the link.

## M22. Notices, notifications and calendar communication
**Origin:** IUMS + cross-module. **Dependencies:** M03, M04.

### Pages and functionality
- `/app/communications/notices` — Notice compose/preview, audience selection, scheduling and publication.
- `/app/communications/inbox` — Personal notification center, read/unread and preferences.
- `/app/communications/outbox` — Delivery outbox, retry, failure details and simulated provider inbox.
- `/app/communications/calendar` — Academic/event calendar subscription and document attachments.

**Records:** Notice, NoticeAudience, Notification, NotificationPreference, OutboxMessage, DeliveryAttempt.

**Workflow:** Domain action creates outbox event→delivery worker dispatches through simulator→recipient sees notification→delivery status recorded.

**Rules:** Idempotent event handling prevents duplicate delivery. Match audience from authorized membership/enrollment. Simulator stores messages locally and sends no real SMS/email. Preview audience size and content.

**Acceptance gate:** Failed delivery retries without duplicate in-app notice; wrong institute excluded; scheduled notice respects campus timezone; sensitive event details absent from broad notifications.

**Demonstration:** Publish a class notice and inspect one successful and one retried simulated delivery.

## M23. Committees, tasks and notesheets
**Origin:** IUMS. **Dependencies:** M03, M22.

### Pages and functionality
- `/app/governance/committees` — Committee list, member tenure, meeting agenda and decisions.
- `/app/governance/tasks` — Task board/list/detail with assignee, due date and priority.
- `/app/governance/notesheets` — Notesheet compose, attachments, forwarding, review and decision timeline.
- `/app/governance/approvals` — My pending approvals and overdue-work dashboard.

**Records:** Committee, CommitteeMembership, Meeting, CommitteeDecision, Task, Notesheet, NotesheetStep.

**Workflow:** Create notesheet→assign/forward→review with remarks→approve/reject/return→complete; committee decision may create tasks.

**Rules:** Only current authorized assignee can act. Forwarding target must have valid institutional responsibility. Preserve remarks/attachments/history. Prevent self-approval when the selected policy requires separation.

**Acceptance gate:** Former committee member denied; forwarding records prior owner; concurrent decisions do not both win; completed notesheet remains auditable.

**Demonstration:** Forward a purchase notesheet through two staff roles and show its decision timeline.

## M24. E-register and document movement
**Origin:** IUMS + NLIU. **Dependencies:** M03, M23.

### Pages and functionality
- `/app/registers/entries` — Inward/outward register lists, create entry and document detail.
- `/app/registers/numbering` — Number format/sequence configuration and printable acknowledgement.
- `/app/registers/movement` — Document dispatch, recipient acknowledgement and movement history.
- `/app/registers/reports` — Search, date/type filters and authorized export.

**Records:** RegisterType, RegisterEntry, RegisterSequence, DocumentMovement, DispatchAcknowledgement.

**Workflow:** Register document→assign unique scoped number→route→acknowledge→dispatch/archive.

**Rules:** Atomic university/institute/year/type numbering. No mutable reused numbers; void with reason instead. Attachments private and exports scoped. Department labels/number prefixes configurable.

**Acceptance gate:** Concurrent entries remain unique; wrong-year format rejected; void history visible; private attachment not downloadable by unrelated users.

**Demonstration:** Register a document, move it to another department and acknowledge it.

## M25. Staff establishment and leave
**Origin:** Broader IUMS vision; prototype workflow specified here. **Dependencies:** M03, M22.

### Pages and functionality
- `/app/hr/employees` — Employee directory/detail, appointment/post history and service documents.
- `/app/hr/my-leave` — Leave policies, balances, application and personal calendar.
- `/app/hr/approvals` — Manager approval queue, delegation and team absence calendar.
- `/app/hr/establishment` — Vacancy, retirement/pension-case and establishment-case registers.

**Records:** Employee, Appointment, ServiceEvent, LeavePolicy, LeaveBalance, LeaveRequest, EstablishmentCase.

**Workflow:** Create staff record→assign post→accrue demo leave balance→apply→approve/reject→update balance; track establishment cases separately.

**Rules:** Use fictional policies. Approved leave affects availability; prevents overlapping approved leave. Pension cases are tracked, not legally calculated. Sensitive staff documents restricted to HR.

**Acceptance gate:** Insufficient balance and overlapping requests rejected; cancellation restores correct balance once; employee cannot approve own leave; vacancy counts derive from active posts.

**Demonstration:** Approve leave and show balance/calendar change and one establishment-case timeline.

## M26. Payroll and expenditure prototype
**Origin:** Broader manual vision; proposed prototype detail. **Dependencies:** M25, M10.

### Pages and functionality
- `/app/payroll/structures` — Salary component/structure editor and effective-date assignments.
- `/app/payroll/runs` — Monthly payroll draft, validation, approval and simulated disbursement.
- `/app/payroll/my-payslips` — Employee payslip and payroll history.
- `/app/payroll/claims` — Expense claim, attachment, approval and reimbursement status.

**Records:** SalaryStructureVersion, EmployeeSalaryAssignment, PayrollRun, Payslip, DisbursementEvent, ExpenseClaim.

**Workflow:** Configure fictional salary→generate monthly draft→validate→approve→simulate disbursement→issue DEMO payslip; claims follow approval→simulated reimbursement.

**Rules:** Integer paise, documented demo formulas, immutable approved runs, no real tax/statutory compliance claims. Prevent duplicate employee/month runs and double disbursement. Corrections use adjustment records.

**Acceptance gate:** Golden salary fixture totals match; duplicate payroll blocked; wrong employee cannot view payslip; rejected claim never enters disbursement.

**Demonstration:** Generate and approve one payroll run, simulate payment and download a DEMO payslip.

## M27. Library services
**Origin:** Broader IUMS vision; proposed prototype detail. **Dependencies:** M07, M10.

### Pages and functionality
- `/app/library/catalog` — Searchable catalog, book detail and availability.
- `/app/library/accessions` — Catalog/accession management and borrower membership.
- `/app/library/circulation` — Issue/return/renew counter, reservations and waiting queue.
- `/app/library/my-library` — Student loans, due dates, fines and library clearance.

**Records:** BookTitle, BookCopy, LibraryMembership, Loan, Reservation, LibraryFinePolicy, LibraryClearance.

**Workflow:** Catalog copy→reserve/issue→renew or return→calculate demo overdue charge→settle linked invoice→clearance.

**Rules:** One active loan per copy; borrowing/renewal policies configurable. Fine computation reproducible from dates and policy version. No separate duplicate payment ledger.

**Acceptance gate:** Concurrent issue for one copy gives one winner; reserved copy respects queue; return idempotent; overdue charge capped/configured; graduation clearance reflects outstanding loans.

**Demonstration:** Issue a book, use a labelled simulated date to show an overdue return and resolve clearance.

## M28. Inventory, procurement and assets
**Origin:** Manual stock section incomplete; proposed prototype workflow. **Dependencies:** M23, M24, M10.

### Pages and functionality
- `/app/inventory/masters` — Item/category/vendor masters, stock ledger and low-stock view.
- `/app/inventory/procurement` — Requisition, approval, purchase order and goods receipt.
- `/app/inventory/movements` — Issue/return, department transfer and asset assignment.
- `/app/inventory/assets` — Stock count, adjustment approval and maintenance history.

**Records:** InventoryItem, Vendor, Requisition, PurchaseOrder, GoodsReceipt, StockMovement, Asset, StockAdjustment.

**Workflow:** Requisition→approval→purchase order→receive→issue/assign→return/transfer→audit count→approved adjustment.

**Rules:** Do not claim the legacy manual specified this flow. Inventory changes use immutable movements and nonnegative balance checks. No real purchase emails/orders are sent. Serial-numbered assets are unique.

**Acceptance gate:** Issue beyond stock rejected; repeated receipt does not double stock; transfer balances reconcile; only authorized staff approve adjustments.

**Demonstration:** Receive five items, issue two and reconcile the balance with movement history.

## M29. Research, accreditation, establishment and finance MIS
**Origin:** IUMS MIS. **Dependencies:** M07, M10, M15, M25, M28.

### Pages and functionality
- `/app/mis/dashboard` — Leadership dashboard with drill-down and filters.
- `/app/mis/research` — Research publications, projects, PhD records and patents.
- `/app/mis/accreditation` — Accreditation/activity evidence register and reporting-period snapshots.
- `/app/mis/reports` — Enrollment/results/staffing/vacancy/finance/student-welfare reports and export builder.

**Records:** ResearchPublication, ResearchProject, PhDRecord, PatentRecord, AccreditationEvidence, ReportingPeriod, ReportSnapshot.

**Workflow:** Authorized data entry→verification→period aggregation→preview report→publish snapshot/export.

**Rules:** Operational metrics derive from source modules. Research/accreditation entries are synthetic and labelled. Every metric has a formula, scope and period. No fabricated institutional ranking or claimed compliance.

**Acceptance gate:** Dashboard totals reconcile to filtered source records; restricted dimensions cannot be exported; CSV formula injection neutralized; snapshot remains stable after later data changes.

**Demonstration:** Filter one institute's enrollment/collections, drill to records and export a period snapshot.

## M30. Feedback and surveys
**Origin:** IUMS. **Dependencies:** M04, M05, M22.

### Pages and functionality
- `/app/feedback/surveys` — Survey builder/templates, audience and schedule.
- `/app/feedback/respond` — Student/faculty response form and completion history.
- `/app/feedback/analytics` — Response dashboard, topic summaries and authorized export.
- `/app/feedback/actions` — Action items linked to survey outcomes.

**Records:** Survey, SurveyAudience, SurveyResponse, SurveyAggregate, SurveyAction.

**Workflow:** Publish versioned survey→notify audience→collect response→close→aggregate→assign improvement task.

**Rules:** Choose identified or anonymous mode at creation; explain limits. Anonymous results use a minimum response threshold and restricted linkage, not a false promise of perfect anonymity. One response per invitation, with token handling appropriate to mode.

**Acceptance gate:** Non-audience response denied; duplicate token rejected; results suppressed below configured threshold; published questions immutable.

**Demonstration:** Collect seeded course feedback and create one improvement task from its aggregate.

## M31. AI chat assistant and voice interface
**Origin:** Challenge. **Dependencies:** M07, M08, M09, M10, M17, M18, M19, M20, M22.

### Pages and functionality
- `/app/assistant/chat` — Assistant full page and contextual drawer.
- `/app/assistant/history` — Conversation history controls, source cards and linked records.
- `/app/assistant/voice` — Voice input/output controls, transcript and microphone error/fallback.
- `/app/assistant/evaluation` — Admin knowledge articles, source versions and AI evaluation dashboard.

**Records:** KnowledgeArticleVersion, Conversation, AssistantMessage, AIEvaluationCase, AIEvaluationRun. Provider adapter: real LLM or deterministic labelled simulator.

**Workflow:** Authenticate→retrieve authorized facts/FAQ→generate or simulate grounded answer→validate output→show sources→navigate to relevant page; voice feeds the same pipeline.

**Rules:** Read-only tools only; policy checks before retrieval; no arbitrary queries, hidden exam papers or staff notes. Redact unnecessary PII. Browser speech fallback is mandatory. Simulated mode is visibly labelled; real model key stays server-side.

**Acceptance gate:** At least 30 evaluation questions cover sources, false premise, unauthorized student, prompt injection, timeout, Hindi/English and unavailable data. Facts must match DB. No voice permission means typed flow remains usable.

**Demonstration:** Ask fee balance, next class, hostel status and certificate status; ask for another student's data and show refusal.

## M32. Performance prediction and early-support analytics
**Origin:** Challenge AI. **Dependencies:** M08, M14, M15.

### Pages and functionality
- `/app/predictions/dashboard` — Prediction dashboard with cohort filter and data/model version.
- `/app/predictions/student-support` — Individual support profile with score, drivers, uncertainty and history.
- `/app/predictions/training` — Synthetic training/evaluation console and threshold scenario comparison.
- `/app/predictions/interventions` — Advisor review, outreach task and outcome tracking.

**Records:** SyntheticDatasetVersion, FeatureSnapshot, ModelVersion, Prediction, EvaluationReport, AdvisorReview, SupportIntervention.

**Workflow:** Generate labelled synthetic longitudinal data→split/train baseline→evaluate→version model→score authorized cohort→advisor reviews→creates support task→tracks outcome.

**Rules:** Actually compute numeric performance regression and dropout-risk logistic baseline in Node/TypeScript or documented Node-compatible runtime. Use student-separated temporal holdout and pre-cutoff features. Synthetic labels demonstrate pipeline only. No claim of real predictive validity; no automated penalties. No sensitive demographic features.

**Acceptance gate:** Seeded training reproducible; holdout never enters fitting/preprocessing; regression MAE and classification precision/recall/PR-AUC/calibration actually computed with class balance; changing input changes score; low-data conditions shown.

**Demonstration:** Train the synthetic baseline, inspect held-out metrics, compare two scenarios and create a human-reviewed support task.

## M33. Personalized learning recommendations
**Origin:** Challenge AI. **Dependencies:** M05, M14, M31, M32.

### Pages and functionality
- `/app/learning/my-plan` — Student learning dashboard, topic mastery and suggested resources.
- `/app/learning/resources` — Resource catalog/editor tagged by topic, difficulty, language and format.
- `/app/learning/progress` — Personal learning plan, progress/completion and feedback.
- `/app/learning/faculty` — Faculty recommendation review and aggregate engagement.

**Records:** Topic, Resource, TopicAssessmentMapping, MasterySnapshot, Recommendation, LearningPlan, LearningActivity.

**Workflow:** Map assessment to topics→compute mastery→rank curated resources→explain recommendation→student completes activity→update plan.

**Rules:** Provide working explainable rule-based ranking, clearly described as such, with optional LLM explanations grounded in catalog facts. Never invent external resources or infer mastery from unrelated grades. Manual override and student preference controls.

**Acceptance gate:** Low mastery changes ranked resources; prerequisites and language preference respected; completion persists; no data returns starter plan, not fabricated personalized insight.

**Demonstration:** Show a weak topic, recommended resource and progress after completing a seeded activity.

## M34. Mobile app and offline-safe access
**Origin:** Challenge. **Dependencies:** M07, M08, M09, M10, M17, M18, M19, M20, M21, M31, M33.

### Pages and functionality
- `/app/mobile/home` — Complete responsive student/guardian navigation on phone.
- `/app/mobile/install` — Install/update/offline indicators and download states.
- `/app/mobile/android` — Native Android app shell with deep links and permission screens.
- `/app/mobile/settings` — Settings: language, notifications, privacy, logout and local-data clearing.

**Records:** DeviceRegistration, NotificationPreference; explicit storage/cache policy and Capacitor configuration.

**Workflow:** Use responsive web→install PWA→package Android app→authenticate→use student journeys→logout and clear private state.

**Rules:** Full prototype includes a tested Android debug APK via Capacitor, not only a PWA. Cache public/static assets only by default; offline private writes disabled with clear UI. Verify actual device authentication without disabling CSRF/browser protections. No claim of iOS build unless tested.

**Acceptance gate:** Android build installs on emulator/device; login, timetable, ticket, payment simulation, PDF download and voice fallback work; deep links enforce auth; logout clears private local state; offline screen honest.

**Demonstration:** Run student certificate/helpdesk journey on Android and show safe offline state.

## M35. Demo control center, integrations and operations
**Origin:** Prototype infrastructure. **Dependencies:** M10, M17, M22, M31, M32.

### Pages and functionality
- `/app/demo-operations/scenarios` — Restricted demo control center: scenario catalog and reset/seed status.
- `/app/demo-operations/integrations` — Integration mode/health dashboard, simulator event history and retry.
- `/app/demo-operations/jobs` — Background job status, audit/search, storage usage and backup/restore guide.
- `/app/demo-operations/clock` — Scenario time controls with prominent simulated-clock indicator.

**Records:** DemoScenario, SimulationEvent, IntegrationConfiguration, JobRun, SeedManifest, DemoClock.

**Workflow:** Select seeded scenario→run labelled provider event→inspect domain outcome→reset isolated demo dataset through protected command/control→verify integrity.

**Rules:** Modes are explicit per adapter. Simulator commands never bypass domain services or fabricate success. Reset limited to a dedicated disposable demo environment with confirmation and protected staff role; default reset remains CLI. Never reset user/pilot databases.

**Acceptance gate:** Non-demo environment refuses reset/simulator mutation; failed event remains failed; replay remains idempotent; all simulator events marked in audit; seed validation reports missing references.

**Demonstration:** Trigger delayed payment callback and notification failure, then demonstrate recovery.

## M36. Complete UI audit, end-to-end rehearsal and release
**Origin:** Whole-product completion. **Dependencies:** M01, M02, M03, M04, M05, M06, M07, M08, M09, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19, M20, M21, M22, M23, M24, M25, M26, M27, M28, M29, M30, M31, M32, M33, M34, M35.

### Pages and functionality
- `/app/release/coverage` — All page inventory entries must be reachable by the correct persona.
- `/app/release/reviewer-guide` — Reviewer guide, demo scenario index and feature/integration disclosure page.
- `/app/release/accessibility` — Complete English/Hindi primary navigation and accessible state coverage.

**Records:** Route coverage report, action coverage report, test evidence, release manifest and verified artifact links.

**Workflow:** Run clean setup→seed→API/security tests→browser journeys→Android checks→deployed rehearsal→record module walkthroughs→prepare submission package.

**Rules:** No page may remain 'coming soon'. Every visible action must persist, compute, download, navigate or clearly validate. Integration simulation is allowed but must exercise real domain logic. Never silently downgrade to read-only mock screens.

**Acceptance gate:** Every module acceptance gate passes or is explicitly listed as a release blocker; all cross-module demo journeys pass; all routes/actions mapped to evidence; clean install reproducible; screenshots/recordings show actual app.

**Demonstration:** Present the complete storyline plus short module-specific recordings indexed by module ID.


## Required integration gates
Some modules are constructed before all linked modules exist. During construction, use typed interfaces and explicit unavailable states rather than fake completion. Integration is mandatory before M36.
- M06 admissions and M11 exam applications must use M10 invoice/payment prerequisites.
- M07 graduation/clearance aggregates M10 fees, M19 hostel and M27 library.
- M09 timetable and M25 approved leave must flag faculty availability conflicts.
- M12 exam materials and M28 general inventory use a shared movement convention; avoid duplicate balances.
- M17 certificates use current published M15 result revisions and explicit clearance rules.
- M18 helpdesk links hostel/transport/library records without copying them.
- M22 notifications receives domain events from admissions, fees, exams, services and leave.
- M23 governance and M24 register entries link procurement and establishment cases.
- M29 MIS derives live totals from the completed modules.
- M31 assistant includes all permitted finished services; confidential exam/staff content stays excluded.
- M32 predictions and M33 learning recommendations use scoped academic features; training demonstration remains synthetic.
- M34 Android must demonstrate the same backend state as the web application.


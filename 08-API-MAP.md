# API implementation map

All paths below are under /api/v1 unless explicitly public/build-only. These are resource families and required commands, not permission to implement generic unrestricted CRUD. Expand them into typed request/response contracts before each module build.

GET lists/details are scoped and paginated; POST creates drafts; PATCH edits allowlisted draft fields; business commands use POST /resource/:id/action. Archive referenced masters instead of deleting them. Each command must define actor permissions, allowed prior states, input schema, atomic writes, emitted event, response DTO and failure cases.

| Module | Resource families | Required commands |
|---|---|---|
| M01 Workspace, design system and application shell | /health; /ready | Environment validation, SPA routing and API 404 handling |
| M02 Identity, role permissions and record scope | /auth/login; /auth/logout; /auth/me; /auth/csrf; /users; /memberships; /roles; /audit-events | login, reset-password, revoke-session, assign-membership |
| M03 University organization, posts and configuration | /universities; /institutes; /departments; /posts; /post-assignments; /settings | archive, assign, configure-numbering |
| M04 Versioned forms, localization and content configuration | /forms; /form-versions; /form-submissions; /translations; /content | preview, publish-version, submit |
| M05 Academic masters and configurable curriculum | /programs; /subjects; /curricula; /electives; /teaching-assignments | publish-version, register-subjects, assign-faculty |
| M06 Admissions, import mapping and enrollment | /admission-applications; /admission-imports; /external-code-mappings | submit, request-correction, resubmit, approve, reject, enroll, dry-run, commit |
| M07 Student lifecycle and unified record | /students; /student-status-events; /profile-change-requests; /student-documents; /alumni | request-change, approve-change, progress, transfer, withdraw, graduate |
| M08 Attendance and academic engagement | /attendance-sessions; /attendance-corrections; /students/:id/attendance | submit, import-preview, request-correction, approve-correction |
| M09 Timetable, rooms and academic calendar | /timetable-entries; /rooms; /calendar-events; /holidays | validate-conflicts, publish, reschedule, export-calendar |
| M10 Fees, payments, reconciliation and finance | /fee-rules; /invoices; /payment-orders; /payment-events; /receipts; /refunds; /reconciliation-runs; /concessions; /funds; /budgets | assess, issue, create-order, ingest-event, reconcile, approve-refund, post-budget-entry |
| M11 Exam applications, eligibility and hall tickets | /exam-cycles; /exam-applications; /exam-enrollments; /hall-tickets | check-eligibility, submit, approve-exception, assign-roll-numbers, issue |
| M12 Exam scheduling, centers and materials | /exam-schedules; /exam-centers; /seating-allocations; /invigilation-duties; /exam-materials | verify-center, allocate-seats, acknowledge-duty, dispatch, receive, reconcile |
| M13 Paper setters and confidential question bank | /setter-appointments; /questions; /paper-versions; /paper-reviews | accept, reject, submit-version, return, approve, release, authorized-download |
| M14 Marks entry, moderation and approval | /assessment-batches; /mark-imports; /moderation-decisions | validate, submit, return, approve, lock |
| M15 Results, transcripts and academic progression | /result-runs; /result-revisions; /transcripts | calculate, validate, approve, publish, supersede, export |
| M16 Revaluation and retotalling | /result-review-requests; /review-assignments; /review-outcomes | check-eligibility, submit, assign, approve-outcome, create-revision |
| M17 Certificates and digital document verification | /certificate-types; /certificate-requests; /issued-certificates; /public/certificates/:token | submit, review, approve, reject, issue, download, revoke, verify |
| M18 Student helpdesk, grievances and service desk | /tickets; /ticket-messages; /service-categories; /sla-policies | assign, reply, add-internal-note, transition, reopen, escalate |
| M19 Hostel operations | /hostels; /hostel-rooms; /beds; /hostel-applications; /bed-allocations | apply, allocate, waitlist, check-in, transfer, check-out, clear |
| M20 Transport operations | /transport-routes; /vehicles; /transport-subscriptions; /transport-passes; /trips | subscribe, allocate, renew, cancel, issue-pass, substitute-vehicle, playback |
| M21 Parent and guardian portal | /guardian-invitations; /guardian-links; /guardian/students | invite, verify, approve, restrict-category, revoke |
| M22 Notices, notifications and calendar communication | /notices; /notifications; /outbox; /delivery-attempts | preview-audience, publish, schedule, mark-read, retry |
| M23 Committees, tasks and notesheets | /committees; /meetings; /tasks; /notesheets | assign, forward, return, approve, reject, complete |
| M24 E-register and document movement | /register-types; /register-entries; /document-movements | register, route, acknowledge, dispatch, void |
| M25 Staff establishment and leave | /employees; /appointments; /leave-policies; /leave-requests; /establishment-cases | apply, approve, reject, cancel, adjust-balance, update-case |
| M26 Payroll and expenditure prototype | /salary-structures; /payroll-runs; /payslips; /expense-claims | generate, validate, approve, simulate-disbursement, adjust, reimburse |
| M27 Library services | /books; /book-copies; /library-memberships; /loans; /reservations | issue, return, renew, reserve, calculate-fine, clear |
| M28 Inventory, procurement and assets | /inventory-items; /vendors; /requisitions; /purchase-orders; /goods-receipts; /stock-movements; /assets | approve, receive, issue, return, transfer, approve-adjustment |
| M29 Research, accreditation, establishment and finance MIS | /reports; /research-publications; /research-projects; /phd-records; /patents; /accreditation-evidence | verify, aggregate, drill-down, snapshot, export |
| M30 Feedback and surveys | /surveys; /survey-responses; /survey-actions | publish, invite, respond, close, aggregate, assign-action |
| M31 AI chat assistant and voice interface | /assistant/chat; /assistant/conversations; /assistant/knowledge; /assistant/evaluations | retrieve-authorized-context, answer, clear-history, run-evaluation |
| M32 Performance prediction and early-support analytics | /analytics/datasets; /analytics/models; /analytics/predictions; /analytics/interventions | generate-synthetic, train, evaluate, score, review, create-intervention |
| M33 Personalized learning recommendations | /learning/topics; /learning/resources; /learning/plans; /learning/activities | recommend, explain, complete, feedback, override |
| M34 Mobile app and offline-safe access | /devices; /notification-preferences | register-device, revoke-device; native uses the same domain APIs |
| M35 Demo control center, integrations and operations | /demo/scenarios; /integration-health; /simulation-events; /jobs | prepare-scenario, replay-event, retry-job; destructive reset CLI by default |
| M36 Complete UI audit, end-to-end rehearsal and release | /release/coverage (build artifact, not required public API) | run coverage, run integrity checks, verify artifacts |

## Example concrete command contract: hostel allocation
POST /api/v1/hostel/applications/:id/allocate
Input: bedId, expectedApplicationVersion, idempotencyKey.
Policy: current hostel staff membership; same institution; eligible approved application.
Transaction: conditionally reserve free bed; create active allocation; advance application; create audit/outbox.
Response: allocation DTO and updated application.
Failures: unauthenticated, wrong role/scope, stale version, occupied bed, already allocated student.
Tests: two concurrent applicants compete for last bed; only one succeeds.

## Example concrete command contract: result publication
POST /api/v1/result-runs/:id/publish
Input: expectedVersion, approvalReference, idempotencyKey.
Policy: exam publication permission and approved same-scope result run.
Transaction: create immutable revision records, publication event, audit/outbox.
Response: publication summary and revision references.
Failures: missing marks, unapproved batch, wrong term/scope, stale run.
Tests: retry produces same publication; correction does not mutate prior revision.

## Required contract register
For every frontend control record the exact endpoint, request schema, successful DTO, error codes and database effect in docs/API-CONTRACTS.md. Do not allow UI and backend teams to invent different status strings or identifier fields independently.


# Architecture, UI and implementation contracts

## 1. Product structure
Use one application with persona-specific navigation and shared records. The user sees tasks appropriate to their role, not every ERP menu.

| Persona | Primary destinations |
|---|---|
| Applicant | Application, documents, corrections, fee status, enrollment |
| Student | Home, academics, timetable, attendance, exams/results, fees, services, hostel, transport, library, learning, assistant |
| Faculty | Classes, attendance, assessments, timetable, students in assigned classes, tasks and feedback |
| Exam office | Cycles, applications, centers, schedules, confidential papers, marks, results and reviews |
| Finance | Fee rules, invoices, payments, reconciliation, concessions and refunds |
| Campus services | Assigned hostel/transport/library/helpdesk work queues |
| HR/payroll | Staff, posts, leave, cases, payroll and claims |
| Registrar/administration | Organization, committees, notesheets, registers, configuration and MIS |
| Guardian | Authorized linked-student attendance, fees, published results and notices |
| University administrator | Authorized cross-institute dashboards, roles, settings and audit |

Add applicant, alumni, registrar, research officer, inventory officer and payroll permissions when those modules require them. Roles are presets of permissions, not scattered string comparisons. A person can have multiple scoped memberships. Demonstrate separation of duties with different accounts.

## 2. Runtime and layout
- React + TypeScript + Vite SPA, React Router, TanStack Query.
- Tailwind CSS with one reusable accessible component set; React Hook Form and Zod.
- Express + TypeScript modules; Mongoose/MongoDB.
- npm workspaces: apps/web, apps/api, packages/contracts.
- Mongo-backed opaque cookie sessions and explicit server policy functions.
- Node background worker using a durable Mongo job/outbox collection. It can run in the same service for the prototype, with claiming/lease/retry semantics.
- Private GridFS document adapter initially; object storage can replace it behind the same interface.
- Server-side PDF/QR generation. Store immutable issued snapshots and file hashes.
- Same-origin web/API deployment; React build served by Express.
- Node 24 LTS or a supported compatible installed LTS; resolve current compatible dependencies and lock them.
- MongoDB Atlas or a local replica set; multi-document transaction tests require a replica set.

Directory layout:
```text
apps/web/src/
  app/                 router, providers, session and persona layouts
  components/          buttons, forms, tables, timeline, charts, PDF preview
  features/<module>/   pages, queries, forms and domain UI
  lib/                 client, dates, money, i18n and errors
apps/api/src/
  config/
  middleware/          auth, scope, CSRF, validation, rate limits, errors
  modules/<module>/
    routes.ts
    contracts.ts       re-export shared contracts where appropriate
    policy.ts
    service.ts
    repository.ts
    models.ts
  platform/
    audit/ jobs/ storage/ documents/ adapters/ simulation/
  app.ts
  server.ts
packages/contracts/src/
scripts/seed/
tests/api/
tests/e2e/
tests/fixtures/
docs/
android/               generated native project after mobile stage
```

Do not split into microservices. Avoid a generic CRUD engine for domain decisions; approval, publication, allocation and settlement need explicit services.

## 3. UI contract for every page
Use a consistent header, breadcrumbs, scoped institution indicator, page title and primary action. Dashboard cards navigate to filtered underlying records. Never hardcode counts that diverge from data.

- Collection pages: search, meaningful filters, sort, server pagination, status badges, create action when authorized, bulk action only if genuinely implemented.
- Create/edit pages: default values from masters, client/server validation, field-specific errors, save/cancel, submission progress and unsaved-change warning.
- Detail pages: summary, related records, documents, history and contextual next actions.
- Approval pages: prerequisite checklist, request data, prior decisions, approve/reject/return with reason, concurrency conflict handling.
- Reports: period/scope filters, formula descriptions, empty data handling and safe CSV/PDF export.
- Simulators: prominent mode badge and visible event outcome. Never imply live payment, live vehicle tracking or actual message delivery.
- Accessibility: labelled controls, semantic headings, keyboard focus, sufficient contrast and errors not communicated by color alone.
- Responsive behavior: phone navigation, stacked summaries, horizontally scrollable dense grids only where necessary, usable dialogs and touch targets.
- English/Hindi: translate primary navigation, action labels, statuses and validation messages. Seed representative content in both languages; do not claim every free-text document is translated.

Maintain a page register: module ID, route, persona, controls, API, status and evidence. A “View” button must open an actual detail page; “Download” must return a valid file; “Export” must export the filtered authorized dataset.

## 4. Domain identity and scoping
All university-owned records contain universityId. Institute-owned records also contain instituteId. Records such as shared policy versions can be university-scoped explicitly. Do not blindly demand instituteId on every object, or infer global access from a missing field.

Record references must be checked for compatible scope. Derive scope from authenticated membership and authorized selections. Student self-service additionally filters by studentId derived from that account. Faculty queries additionally filter by TeachingAssignment. Guardians use an active permission grant.

Use server-side projections to exclude confidential fields. Frontend route guards are usability features, not the security boundary.

Add createdAt/updatedAt, actor fields and concurrency version where necessary. Audit immutable transitions with actor, scope, entity, action, timestamp and safe before/after information. Never log session tokens, passwords, provider keys or complete sensitive documents.

## 5. API contract
Prefix: /api/v1. Use resource collections for queries and explicit actions for business transitions.

Examples:
- GET /students?search=&page=&limit=&sort=
- GET /students/:id/overview
- POST /admission-applications/:id/submit
- POST /admission-applications/:id/request-correction
- POST /admission-applications/:id/enroll
- POST /invoices/:id/payment-orders
- POST /integrations/payment-simulator/events
- POST /exam-cycles/:id/allocate-seats
- POST /assessment-batches/:id/submit
- POST /result-runs/:id/publish
- POST /certificates/requests/:id/approve
- POST /hostel/applications/:id/allocate
- POST /payroll/runs/:id/approve
- POST /library/loans/:id/return
- POST /assistant/chat
- POST /models/:id/evaluate

Never expose a free-form Mongo query endpoint or arbitrary status PATCH. Define request/response schemas in shared contracts. Whitelist update fields and limit query lengths/sort keys/page sizes. Return consistent errors: code, message, fieldErrors, requestId. Use 401 unauthenticated, 403 forbidden, 404 unavailable resource, 409 conflict and 422 invalid business/input conditions consistently.

Mutation contract:
1. Authenticate and validate CSRF/origin.
2. Resolve authorized membership/record scope.
3. Parse/validate input.
4. Check state and business prerequisites.
5. Execute atomic conditional update or transaction.
6. Write audit and outbox event in the same transaction when required.
7. Return a safe updated DTO.
8. Invalidate affected frontend queries.

Use idempotency keys for settlement, issuance, enrollment/import commit, payroll disbursement and other retry-prone transitions. Use a version/expected-status condition to prevent simultaneous staff actions from both succeeding.

## 6. State and financial integrity
Use integer paise and explicit INR currency. Store policy versions used for calculation. Choose documented rounding once and test boundary cases. Totals are computed on the server.

Use transactions for multi-record operations: payment settlement+receipt, bed transfer, result publication, payroll approval/disbursement and numbered issuance where multiple records must agree. Back them with unique indexes; UI button disabling alone is insufficient.

Examples of unique constraints:
- membership: user + institution + role/grant definition;
- attendance: session + student;
- enrollment: student + program/term as defined by policy;
- payment event: provider/mode + external event ID;
- receipt: settled payment ID;
- active bed allocation: bed ID with active-status partial index;
- active book loan: copy ID with active-status partial index;
- result revision: student + exam cycle + revision;
- payroll: employee + pay period + approved revision policy;
- document number: university/institute + year + type + sequence.

Archive referenced master data. Do not destructively cascade deletion across academic/financial history. Published results, approved payroll and issued document snapshots are immutable; corrections create revisions/adjustments.

## 7. Event integration
Create a small event catalogue:
admission.submitted, admission.enrolled, attendance.corrected, invoice.paid, payment.failed, exam.approved, result.published, certificate.issued, ticket.assigned, hostel.allocated, transport.pass_issued, leave.approved, payroll.disbursed, library.overdue, notesheet.forwarded.

Consumers produce notifications, update necessary derived views and enqueue documents. Prefer querying authoritative domain data for dashboards; avoid complex event-sourced architecture. Consumers are idempotent and retriable. Failed jobs appear in operations UI.

## 8. External adapters
Interfaces:
- PaymentAdapter: createOrder, fetchStatus, simulateCallback only in demo, refund.
- NotificationAdapter: send, status; simulator writes to outbox/inbox.
- AdmissionProviderAdapter: fetchFixtureBatch with mapping/import staging.
- CertificateIntegrationAdapter: verify/export demo credential; national provider integration not claimed.
- VehicleLocationAdapter: deterministic playback with SIMULATED source.
- PayrollBankAdapter: simulateDisbursement and event status.
- AssistantProvider: answer typed authorized context in real or simulator mode.
- VerificationAdapter: fixture-backed document/guardian verification.
- Clock: real timestamp by default; scoped labelled demonstration date for SLA/fine examples.

For each adapter expose mode, status, last event and configured capabilities. Secrets are server-only. Simulator events use the same domain services as real provider adapters. Browser components do not call simulation fixtures directly.

## 9. AI and ML boundaries
The assistant's retrieval operates after authorization. Its input is a minimal structured fact set plus approved FAQ content, never a complete database document. Output schema contains answer, references, suggested internal routes and unavailable-data indicators. Validate references against allowed records and routes.

Simulated assistant mode uses deterministic intent/entity matching for the documented demo questions, with DB-backed answers and unknown-question fallback. It demonstrates the conversational workflow, not a live generative model. Real provider mode uses a server-side supported SDK and the same permission/retrieval pipeline.

Voice must work in at least one explicitly tested supported browser/device for the final demo. Use browser speech recognition and speech synthesis where available, handle microphone denial and retain typed fallback. If a platform needs an external speech provider, put it behind an adapter. A prerecorded transcript is labelled a fixture, not passed off as live voice.

Predictions must be actual reproducible computations on synthetic labelled data. Implement regularized linear regression for performance and logistic regression for dropout-support probability, or another justified baseline. Fit preprocessing only on training data. Split by student and time, document the cutoff, and ensure features predate the target. Show actual metrics, baseline comparison, missing-data behavior and version metadata. This demonstrates an engineering pipeline, not real university predictive accuracy.

Learning recommendations can be fully functional deterministic ranking by topic mastery, prerequisites, language and difficulty. Say “rule-based recommendation” if that is the implementation. Do not require an LLM to invent study resources.

## 10. Deployment and mobile
Deploy a skeleton early, then update continuously. One Node service can host API, built web and bounded background jobs for the prototype. Use persistent Mongo storage and private GridFS; never host documents only on ephemeral local disk.

Publish the Android debug APK only after installing/testing it on an emulator or device. Verify native session handling and allowed origins explicitly; do not disable CSRF for everyone. Use platform-specific authenticated configuration if required. Confirm API URL and document downloads from the native runtime.

Environment groups:
NODE_ENV, PORT, APP_ORIGIN, MONGODB_URI, SESSION_SECRET;
DEMO_MODE, DEMO_DATASET_ID, PAYMENT_MODE, NOTIFICATION_MODE, GPS_MODE, PAYROLL_MODE;
AI_MODE, AI_PROVIDER_KEY, AI_MODEL, AI_TIMEOUT_MS;
STORAGE_MODE, JOB_WORKER_ENABLED.
Use .env.example placeholders and validate incompatible settings on startup.

## 11. References
Requirements:
- https://innovate.mponline.gov.in/challenges/smart-university-digital-campus
- Original User Manual IUMS English.pdf supplied by the user.
- NLIU codebase used only to understand customization patterns.

Implementation guidance:
- https://nodejs.org/en/about/previous-releases
- https://vite.dev/guide/
- https://react.dev/learn/build-a-react-app-from-scratch
- https://expressjs.com/en/advanced/best-practice-security/
- https://www.mongodb.com/docs/manual/core/transactions/
- https://www.antigravity.google/docs/rules-workflows?tab=ide
- https://ai.google.dev/gemini-api/docs/function-calling
- https://ai.google.dev/gemini-api/docs/structured-output
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://capacitorjs.com/docs

Use current compatible installation instructions during execution rather than copying legacy package versions.


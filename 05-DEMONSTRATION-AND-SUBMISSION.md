# Complete demonstrations and reviewer package

## Demonstration strategy
One short pitch cannot responsibly demonstrate every screen. Supply a 7–10 minute main story, a module-indexed library of short recordings, and an unrestricted reviewer walkthrough using scoped demo accounts. Together these cover all modules without pretending the short pitch shows every feature.

Use only real implemented screens and database transitions. Reset isolated named scenarios before recording. Display simulation labels in the recordings.

## A. Main story: applicant to active student
1. Admissions officer opens staged applications, fixes a course-code mapping and imports candidates.
2. Applicant submits documents. Officer requests a correction and then approves.
3. Applicant pays the configured admission fee through the simulator. Enrollment creates the student record.
4. Student sees timetable and enrolled subjects; faculty records attendance.
5. Student asks the assistant about attendance and fee status using voice in a tested browser.
6. Student applies for an exam, resolves eligibility/prerequisites and downloads a hall ticket.
7. Faculty enters marks; moderator approves; exam office publishes results.
8. Student requests a certificate. Staff approves and issues it. QR verification opens the real app verification page.
9. Student opens the same record in the Android app and raises a helpdesk request.
10. Guardian sees only permitted student information.
11. Finish with leadership dashboard drill-down and explicit simulation/model disclosures.

Prepare this as a concise story with preseeded intermediate states. Do not wait for every background workflow on stage. Explain transitions you skip and provide their module recordings.

## B. Academic and examination tour
Modules M04–M16:
- Build a versioned form and demonstrate Hindi labels.
- Configure a curriculum with midterm/viva/project components.
- Show elective validation and faculty assignments.
- Demonstrate import correction and student lifecycle transition.
- Reject a timetable collision and approve an attendance correction.
- Show exam eligibility, center capacity and invigilator allocation.
- Accept a paper-setting appointment; demonstrate confidential access.
- Reconcile answer-book materials.
- Import invalid marks, correct them and complete moderation.
- Publish a result and display immutable revision comparison.
- Process retotalling with fee linkage and a corrected result.

Evidence: PDF hall ticket, transcript, import error report, audit events and result versions.

## C. Student and campus services tour
Modules M10, M17–M22, M27, M30:
- Pay an invoice and replay callback; show one receipt.
- Reconcile a pending order; approve a simulated refund.
- Issue and revoke DEMO certificates.
- Resolve/reopen a ticket while protecting internal notes.
- Allocate final hostel bed and show waitlist behavior.
- Issue transport pass and play labelled simulated route movement.
- Link and revoke guardian access.
- Publish notice, simulate failed delivery and retry.
- Issue/return library book and clear an overdue fine.
- Complete a survey and show threshold-controlled aggregate results.

Evidence: fee ledger, occupancy/seat counts, guardian authorization tests and delivery history.

## D. Governance, staff and resource tour
Modules M03, M23–M29:
- Navigate hierarchy, posts and scoped permissions.
- Forward notesheet through two assignees.
- Create a committee decision and linked task.
- Register and dispatch a document with unique numbering.
- Approve leave and show balance/calendar changes.
- Generate payroll, approve it and simulate bank processing; download payslip.
- Receive inventory, issue stock and inspect remaining balance.
- Add research/accreditation evidence and generate a period MIS snapshot.

Evidence: notesheet/register history, payroll totals, stock movement reconciliation and report drill-down.

## E. AI and mobile tour
Modules M31–M35:
- Switch real/simulated assistant modes only if both are configured; explain the active mode.
- Ask supported factual, unknown and unauthorized-data questions.
- Demonstrate live voice input/output on a supported tested platform; show fallback separately.
- Generate synthetic analytics data, train baseline and inspect actual held-out metrics.
- Compare support-risk scenarios and create an advisor-reviewed intervention.
- Show topic-specific learning recommendations, explanations and saved progress.
- Install/run Android APK, submit ticket and download document.
- Simulate offline condition safely.
- Inspect integration events, job failures and seed validation in the restricted operations console.

Evidence: evaluation reports, source-linked answers, APK installation record and shared web/mobile state.

## F. Full module walkthrough index
Create docs/DEMO-INDEX.md with one row per module:
module ID | persona | initial scenario | steps | expected result | recording timestamp/link | API/test evidence.
All 36 stages must be covered; foundation/release stages can use setup/test evidence rather than separate UI videos.

## Ten-slide pitch outline
1. Problem and users.
2. Unified student lifecycle.
3. Complete module map, grouped for readability.
4. Main multi-role workflow.
5. Campus services and guardian access.
6. Governance, resources and MIS.
7. AI/voice/predictions/learning, with simulation and validity labels.
8. MERN architecture, privacy and data integrity.
9. Working web/mobile demo, tested coverage and deployment.
10. Impact measurement plan, team, next production steps and links.

Do not fill the deck with tiny screenshots of every page. Use the recording index for breadth and a coherent story for the live pitch.

## Submission documents
Prepare executive synopsis, solution PDF, problem/solution note, differentiation, impact/benefits, implementation/feasibility, architecture, prototype/demo access, repository URL and selection rationale. Confirm actual portal fields before uploading.

Suggested impact measures: request turnaround, digital completion rate, repeat data entry, ticket SLA compliance, payment reconciliation exceptions and assistant factual accuracy. These are proposed pilot measures until measured; never fabricate a benefit percentage.

The original site review listed a maximum ten-slide presentation and 5–10 minute pitch, with submission items at:
- https://innovate.mponline.gov.in/document-submission
- https://innovate.mponline.gov.in/#guidelines

No deadline extension or amended rules have been verified for this revised plan.

## Final release package
- README with verified setup, seeded personas, environment names and actual URLs.
- Source repository and lockfile; no secrets or legacy data.
- Web deployment, APK and installation instructions.
- Module/page/action coverage report.
- Main recording and module recording index.
- Synthetic model evaluation report.
- Simulation/integration disclosure matrix.
- Submission PDFs with readable text and correct links.
- Known defects, if any; a failed required gate means prototype completion is not yet achieved.


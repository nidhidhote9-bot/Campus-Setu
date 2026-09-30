# Team sequence, milestones and effort planning

## Change from the first plan
Remove the one-person/tomorrow constraint from engineering scope. All modules are required. Do not retain the earlier schedule, deferred-feature labels or emergency scope cuts. Verify the actual organizer timeline separately; this plan does not establish an extension.

## Suggested team responsibilities
With four contributors:
- Platform/integration owner: architecture, contracts, auth/scope, organization, deployment, merge/release checks.
- Academic owner: admissions, curriculum, attendance, timetable, exams, marks, results and revaluation.
- Services owner: fees, certificates, helpdesk, hostel, transport, guardians, HR/resources.
- Experience/AI owner: UI consistency, notifications/forms, assistant, analytics, learning, mobile and demonstration evidence.

These are responsibility areas, not permission to modify shared contracts independently. Balance workload after the first milestones; services and academic areas are substantial. Everyone supplies tests and working UI for owned modules. With two or three people, combine ownership and extend calendar time.

Antigravity can generate code quickly, but integrating data models, testing state transitions, fixing UI and preparing coherent demos remain real work. Do not promise a complete 36-stage prototype in a day or two.

## Milestone 0 — Product contract
Deliver: fixed module catalogue, personas, simulation modes, route/action registry format, schema conventions, environment plan and fresh repository.
Gate: each contributor understands shared IDs, money/date policy and state transitions.

## Milestone 1 — Platform and institutional backbone
M01–M05, then shared event/storage infrastructure.
Deliver: shell, identity, institution hierarchy, versioned forms/localization and curricula.
Gate: role/institution isolation and a deployed skeleton work.

## Milestone 2 — Core student operations
M06–M10 and M22.
Deliver: admission/enrollment, Student 360, attendance, timetable, finance and notifications.
Gate: applicant→fee→enrollment→faculty action→student view is integrated.

## Milestone 3 — Full academic/examination lifecycle
M11–M17.
Deliver: exam applications, scheduling/materials, confidential papers, marks, results, reviews and credentials.
Gate: application→exam→approved marks→published result→certificate/revision works.

## Milestone 4 — Campus and guardian services
M18–M21, with M22 already available.
Deliver: helpdesk, hostel, transport and guardian access.
Gate: real capacity, fee links, consent/permissions and notifications work.

## Milestone 5 — Governance and resource operations
M23–M30.
Deliver: committees/notesheets, registers, HR, payroll, library, inventory, research/MIS and feedback.
Gate: balances, approvals, reports and exports reconcile to source data.

## Milestone 6 — AI, mobile and simulator operations
M31–M35.
Deliver: chat/voice, actual synthetic prediction pipeline, learning plans, PWA/Android and restricted scenario controls.
Gate: source-grounded or clearly simulated assistant, actual metrics, tested APK and repeatable scenarios.

## Milestone 7 — Complete integration and demonstration
Run integration sprint, then M36.
Deliver: no placeholder pages, complete coverage evidence, deployment, APK, recordings and submission package.
Gate: all module and cross-module requirements pass.

## Parallel work boundaries
After Milestone 1, owners can work in separate branches on independent domain modules. Use shared contracts and fixtures, with one designated integrator for cross-cutting changes. Do not have several AI sessions edit router/auth/common schema files concurrently.

Agree feature API contracts before parallel UI/backend work. Merge small coherent vertical slices daily. Resolve failing shared tests before starting additional modules. Keep a working main branch and deploy at milestone boundaries.

Some cross-links arrive later: admissions payment, graduation clearance and MIS should retain explicit integration tasks until downstream modules exist. They cannot be counted complete at final release until connected.

## Estimation method
After implementing M02 and one representative vertical workflow:
1. Measure person-hours for schema/API, UI, fixtures, tests and integration.
2. Classify remaining modules as small, medium or complex using actual observed effort.
3. Sum person-hours and add explicit integration/QA/demo contingency.
4. Divide by realistic productive team hours, accounting for dependencies and review.
5. Re-estimate after the full exam and finance workflows.

A planning heuristic is 4–8 focused person-hours for a small module, 8–16 for medium and 16–32+ for complex modules such as results, finance, dynamic forms, analytics and mobile. These are estimates, not delivery promises. A several-hundred-person-hour total is plausible for this breadth, even with AI.

If the calendar is shorter, change implementation depth deliberately while preserving every agreed demonstration contract—for example, one configured policy or provider simulator per module instead of a general integration platform. Do not silently replace working workflows with static pages.

## Daily completion report
For each active module report:
- finished pages/actions;
- API/data/policy status;
- passed checks and actual failures;
- cross-module dependencies;
- demo scenario readiness;
- next concrete acceptance criterion.

Avoid percentage-complete estimates based on number of generated files.


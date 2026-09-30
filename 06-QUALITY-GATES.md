# Definition of complete and test plan

## Module completion contract
Every module must pass all six dimensions:
1. Pages: every catalogue page and required child route exists.
2. Actions: each visible control is wired to actual navigation, validation, persisted state, calculation or file generation.
3. Data: coherent MongoDB records survive refresh/restart and relate correctly to other modules.
4. Policy: role, institute, ownership and workflow rules are enforced server-side.
5. Evidence: main browser journey and critical negative API cases pass.
6. Demo: a named seeded scenario reproduces the behavior.

A beautiful dashboard with hardcoded data is not complete. A functioning API without its required page is not complete. A labelled simulator is allowed if it drives the real workflow and exposes its actual outcome.

## Page/action coverage register
Implement a machine-readable registry, for example docs/page-register.json:
- moduleId, route, personas, title;
- controls: id, label, operation, API, expected database effect;
- required states: loading, empty, invalid, failure, forbidden, success;
- test IDs, manual evidence and completion status.

Build a coverage script that checks registered routes and required tests exist. Existence alone is insufficient: browser tests/manual inspection must exercise their behavior. No disabled “coming soon” action counts as complete.

## Essential cross-cutting API tests
- No session: 401; invalid role/scope: denied.
- Same role in another institute and another university: denied.
- Student A cannot read/change Student B.
- Faculty can access only assigned classes.
- Guardian revoked/limited categories: enforced on next request.
- Confidential question papers and HR files never enter broad search/AI/public APIs.
- Client-supplied scope/price/status fields cannot override server authority.
- Referenced foreign IDs must belong to a compatible scope.
- CSRF/origin checks reject unauthorized mutations.
- Duplicate requests/events preserve idempotency.
- Concurrent allocation/approval preserves capacity and single transition.
- Archived masters retain references; immutable artifacts cannot be silently edited.
- Files enforce authorization and type/size policy; public verification reveals minimal facts.
- Login/session secrets and keys absent from responses/logs/assets.

## Golden calculation fixtures
Attendance numerator/denominator including excused/no-session cases.
Fee components, late fees, concessions, taxes only if explicitly implemented, refunds and balances.
Curriculum maxima, rounding, credits, grades, pass/backlog and term isolation.
Hostel/transport/library active-capacity totals.
Leave accrual/use/cancellation.
Payroll earnings/deductions/net amounts using fictional documented rules.
Inventory receipts/issues/returns/adjustments.
SLA durations under calendar policy.
MIS aggregates against source fixtures.
Synthetic ML metrics and reproducibility.

Use explicit expected numbers, not tests that merely repeat the same implementation formula.

## Browser journey suite
At minimum automate:
- application correction→fee→enrollment;
- faculty attendance→student correction→approval;
- timetable conflict→valid publication;
- invoice→duplicate callback→one receipt;
- exam application→hall ticket;
- marks→moderation→result publication→revision;
- revaluation→fee→approved outcome;
- certificate request→issue→verify/revoke;
- ticket→staff reply→reopen;
- hostel final bed→waitlist;
- transport subscription→pass;
- guardian grant→view→revoke;
- notice→delivery retry;
- notesheet→forward→decision;
- e-register→movement→acknowledgement;
- leave→approve→cancel;
- payroll→approve→simulated disbursement;
- library issue→return→clearance;
- stock receive→issue→reconcile;
- survey→threshold→aggregate;
- assistant fact/refusal/failure;
- ML train/evaluate→score→intervention;
- recommendation→activity completion.

Use separate browser contexts for different personas. Avoid reliance on test execution order. Use API helpers to prepare isolated fixtures, not to bypass the browser action being tested.

## UI and localization audit
Check 390px, 768px and 1440px views. Exercise keyboard focus and form errors. Check long Hindi labels, currency, date formatting, PDF fonts and print layout. Verify all primary labels/statuses are localized; record untranslated content explicitly and resolve required interface gaps.

Validate generated PDFs by opening/rendering them: no clipping, blank pages, broken QR or missing glyphs. Verify downloaded CSV contains only the authorized filtered set and neutralizes formula-leading text.

## Android checks
Record device/emulator and OS version. Verify installation, login, session expiry/logout, deep links, navigation, timetable, invoice simulator, helpdesk creation, document download and voice support/fallback. Confirm no private response cache survives logout.

A successful web build does not prove the APK works. A generated APK file without an installation test is not a passed mobile gate.

## Assistant/ML evidence
Maintain at least 30 assistant cases with expected facts/refusals/source links. Test both provider timeout and simulation mode. Report mode used for each evaluation.

For ML, preserve seed/splits/features/model version and computed metrics. Include naive baselines and class distribution. Test future-feature leakage guards and access control. Show synthetic-data limitations in the UI and exported report.

## Release procedure
1. Fresh checkout and clean install.
2. Environment validation and replica-set database connection.
3. Seed + integrity validation.
4. Typecheck, production build and API tests.
5. Browser journeys.
6. UI/localization/PDF checks.
7. Android installation and journeys.
8. Deployed smoke tests and restart persistence.
9. Backup/restore rehearsal on disposable data.
10. Main and module-demo rehearsal.
11. Verify all module gates and archive evidence.

Do not bypass tests because the UI looks correct. Conversely, avoid redundant tests for purely visual reversible changes when existing coverage/manual review is sufficient.

## Prototype vs production boundary
The prototype is complete when the defined catalogue and simulations work. Production work still requires institutional policy validation, real provider access, data protection review, operational capacity planning and model validation on authorized real data. This boundary must not be used to omit prototype screens/workflows.


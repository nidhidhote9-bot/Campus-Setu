# Seed data, simulations and reproducible scenarios

## 1. Seed strategy
Seed a coherent fictional university ecosystem, not disconnected arrays per screen.

- Two fictional universities, with two institutes under the primary university and one under the second.
- Three programs, two academic years, multiple terms, about 15 subjects, two curriculum versions and six teaching assignments.
- Sixty operational student profiles, ten applicants, six faculty, service-role staff, five guardian links and alumni examples.
- Asha Demo as the central student; Bilal Demo as waitlisted/overdue example; Charu Demo with an approved accommodation preference; a second-institute student and second-university student for isolation tests.
- Attendance histories with present/absent/excused and correction examples.
- Paid/unpaid/failed/pending fee scenarios, concessions, one refund and reconciliable ledger totals.
- Exam cycles, eligible/ineligible applications, seating constraints, sample papers, marks awaiting approval, published results and revisions.
- Certificate requests in each supported state and at least one revoked DEMO credential.
- Hostel beds including one final vacant bed, transport route with one final seat, and library copies with one final available copy.
- Notesheets, registers, leave, payroll, procurement, surveys, research records and MIS reporting periods.

Use synthetic phone/email/address values and generated documents. Do not include real student records, Aadhaar-like identifiers, bank details or NLIU database exports. Number formats should clearly identify the fictional demonstration dataset.

## 2. Determinism and integrity
Use a fixed random seed and stable entity keys mapped to ObjectIds. Derive dates relative to DEMO_REFERENCE_DATE for replayable scenarios; show this date in demo controls. Do not silently manipulate the server's real clock.

Seed in dependency order: institutions→identities→masters→students→academic events→finance/services→governance/resources→analytics. Add a validator that checks referenced IDs, scope compatibility, money sums, attendance totals, capacities and chronology.

Commands to implement:
- npm run seed:demo — idempotent upsert of the designated seed dataset.
- npm run seed:validate — integrity checks and counts.
- npm run demo:reset -- --dataset=<id> --confirm — disposable environment only.
- npm run scenario:prepare -- --scenario=<id> — prepare a named isolated scenario.
- npm run ml:generate / ml:train / ml:evaluate — reproducible separate synthetic analytics pipeline.

Do not run reset implicitly during startup or deployment. Do not delete user-created records outside the explicitly designated disposable dataset. Separate seed users/test users from demonstration state.

## 3. Primary demonstration fixtures
| Scenario ID | Initial condition | Operation | Expected persistent outcome |
|---|---|---|---|
| ADM-01 | Five staged applicants, one invalid course code | Dry run, fix mapping, commit, review | Valid applicants imported once; one enrolled after prerequisites |
| ATT-01 | One absent entry for Asha | Request and approve correction | New percentage, old value retained in audit |
| TIME-01 | Faculty/room collision | Validate and reschedule | Collision rejected; valid schedule published |
| PAY-01 | Unpaid invoice | Success callback twice | One settlement and one receipt |
| PAY-02 | Pending provider order | Delay, failure then valid success | Event history retained; correct final state |
| EXAM-01 | Ineligible application | Authorized exception then fee settlement | Approved application and hall ticket |
| MARK-01 | One invalid component score | Import, fix, submit, moderate | Approved complete assessment batch |
| RES-01 | Approved marks | Publish, approve correction | Immutable original and superseding revision |
| REV-01 | Eligible published paper | Retotal request and review | Linked fee and revised outcome |
| CERT-01 | Approved certificate request | Issue, verify, revoke separate sample | Stable issued PDF; correct verification status |
| HELP-01 | Open grievance | Assign, internal note, resolve, reopen | Public timeline excludes staff-only note |
| HOST-01 | One remaining bed, two applicants | Concurrent allocation attempts | Exactly one allocation and one waitlist |
| TRANS-01 | One seat remaining | Subscribe, pay, issue pass | Capacity respected; valid pass |
| GUARD-01 | Linked guardian | View then revoke link | Next access denied |
| GOV-01 | Draft notesheet | Forward twice and decide | Ordered actor history and completion |
| REG-01 | Sequence initialized | Concurrent registrations | Distinct scoped numbers |
| HR-01 | Leave balance ten days | Approve two days then cancel | Correct balance restored once |
| PAYROLL-01 | Salary fixture | Generate, approve, disburse twice | One DEMO payslip/disbursement |
| LIB-01 | One book copy | Issue, overdue return, settle fine | Copy available; clearance correct |
| STOCK-01 | Five items received | Issue two, return one | Balance four with immutable movements |
| FEED-01 | Survey with minimum response threshold | Submit then aggregate | Suppression until threshold; task link |
| AI-01 | Known authorized facts | Ask supported and malicious questions | Grounded answer or safe refusal |
| ML-01 | Synthetic longitudinal dataset | Train, evaluate, score | Reproducible model and actual metrics |
| LEARN-01 | Weak topic and mapped resources | Recommend and complete activity | Explainable ranking and saved progress |
| MOBILE-01 | Same student account | Open app, submit ticket, download PDF | Same backend records as web |

Store expected outcomes as machine-readable assertions where practical. Prepare edge cases in independent datasets so demonstrating one does not destroy another.

## 4. Dummy API design
Dummy APIs are external-system simulators. Core APIs remain real Express endpoints backed by MongoDB.

Example payment:
1. Student asks application to create a payment order.
2. Server validates invoice/ownership and derives amount.
3. Simulator persists external order reference and chosen scenario.
4. Simulator posts a signed local callback or queues a delayed event.
5. Shared settlement service validates reference/signature/amount/currency.
6. Transaction records payment, receipt, audit and outbox.
7. UI refetches the real invoice and displays the outcome.

Never let the browser send {paid:true} directly to update an invoice.

| Integration | Simulator behavior | Demo evidence |
|---|---|---|
| Admission feed | Fixture batch with invalid/duplicate mapping cases | Import staging and error report |
| Payment | Success/failure/delay/replay/refund callbacks | Ledger, invoice and receipt |
| Email/SMS | Local delivery inbox with failed/retried attempts | Outbox detail and recipient notification |
| Guardian/document check | Fixture verdict with timestamp and source SIMULATED | Review decision and permission grant |
| Vehicle location | Deterministic route playback | Labelled position, trip and route |
| Bank payroll | Mock accepted/failed disbursement events | Approved payroll and payslip |
| Credentials | Locally issued DEMO PDF + real app verification | QR status/hash/revocation |
| Assistant | DB-backed intent simulator or actual model adapter | Mode indicator and source cards |
| Time | Explicit scenario clock for fines/SLAs | Visible simulated date and repeatable calculation |

## 5. Synthetic predictive data
Keep ML demonstration data separate from the 60 operational profiles. Generate at least several hundred fictional longitudinal student sequences with documented feature/target rules; size is a starting configuration, not evidence of validity.

Features could include past attendance rate, change in attendance, submitted-assignment ratio and prior assessment scores available at the prediction date. Performance target is a later synthetic assessment outcome; dropout target is a later synthetic continuation label. Do not use future attendance, final results or the target itself as features.

Divide students and time windows so neither identities nor future information leak into held-out evaluation. Fit scaling/imputation on training only. Store generation seed, schema, feature cutoff, split manifest, hyperparameters and versioned metrics.

Show:
- regression MAE and comparison to a training-mean baseline;
- classification class balance, confusion matrix, precision, recall, PR-AUC and calibration;
- threshold tradeoffs and missing-data handling;
- “Synthetic demonstration only; not validated for real student decisions.”

Because generation rules determine synthetic relationships, good metrics do not establish actual predictive value. The UI should make that explicit while demonstrating a complete working pipeline.


# Requirements traceability

Every requirement below is included in the complete prototype. Status remains planned until implementation evidence exists. These documents do not claim the app has already been built.

## MPOnline challenge coverage
| Requirement | Modules | Demonstrable outcome |
|---|---|---|
| Student lifecycle | M06, M07, M11–M17 | Applicant progresses through enrollment, academics, examination and documents |
| AI chat assistant | M31 | Authorized DB-backed answers and source links; mode explicitly shown |
| Digital certificates | M17 | Approval, DEMO PDF, QR verification and revocation |
| Hostel | M19 | Application, capacity-safe allocation, waitlist, movement and clearance |
| Transport | M20 | Route subscription, seat allocation, pass and labelled location playback |
| Attendance | M08 | Faculty entry, student summary, correction and audit |
| Timetable | M09, M12 | Personal/class schedules and conflict-checked exam schedule |
| Fee payments | M10 | Order, simulated callback, receipt, reconciliation and refund |
| Student helpdesk | M18 | Ticket assignment, replies, resolution, reopening and SLA |
| Parent portal | M21 | Scoped linked-student views and revocable access |
| Mobile app | M34 | Responsive web/PWA plus tested Android debug APK |
| Voice assistant | M31, M34 | Tested voice input/output on supported platform, typed fallback |
| Predictive performance | M32 | Reproducible synthetic regression training/evaluation/inference |
| Early dropout prediction | M32 | Synthetic classification pipeline with advisor review and limitations |
| Personalized learning | M33 | Topic-based ranking, explanation, plan and tracked activity |

Source: https://innovate.mponline.gov.in/challenges/smart-university-digital-campus

## IUMS/NLIU reference coverage
| Reference capability | Modules |
|---|---|
| University/college hierarchy, designation, post, permissions | M02, M03 |
| Dynamic forms, dictionaries and templates | M04 |
| Course/scheme/subject/elective/syllabus masters | M05 |
| Admission import, external code mapping, registration/enrollment | M06 |
| Student profile, documents and lifecycle | M07 |
| Academic/exam timetables and calendars | M09, M12, M22 |
| Fee heads, categories, late fees and finance reporting | M10, M29 |
| Regular/private/backlog exam applications and hall tickets | M11 |
| Centers, seating, invigilators and answer-book inventory | M12 |
| Paper-setter appointments and question banks | M13 |
| Configurable assessment components, marks and moderation | M05, M14 |
| Tabulation, publication, grade cards and exports | M15 |
| Revaluation and retotalling | M16 |
| Documents, certificates and private student locker | M07, M17 |
| Notices, calendar and delivery tracking | M22 |
| Committees, tasks and notesheets | M23 |
| E-register, numbering and document movement | M24 |
| Staff, vacancies, leave and establishment cases | M25 |
| Payroll and expenditure demonstration | M26 |
| Library circulation | M27 |
| Inventory, stock and procurement demonstration | M28 |
| Academic/staff/finance/research/accreditation MIS | M29 |
| Feedback and surveys | M30 |

Payroll, library and stock workflows are explicitly proposed prototype designs where the supplied manual gives broad ambitions or incomplete details. Roll-number policy is likewise configurable prototype behavior. No claim is made that every proposed detail existed in the reference code.

## Integration disclosure matrix
| Capability | Complete prototype behavior | Claim boundary |
|---|---|---|
| Payments/refunds | Real app ledger and state via simulated provider | No real bank settlement |
| Certificates | Real generated files and application verification | DEMO, not officially recognized credentials |
| Messages | Real outbox/retry/in-app delivery via simulator | No real SMS/email required |
| Transport position | Working route playback | Simulated, not live GPS |
| Payroll | Real fictional calculations/approval/payslip | No real salary transfer or statutory validation |
| AI assistant | Real model adapter or explicit DB-backed simulator | Identify active mode |
| Predictions | Actually trained/evaluated synthetic baselines | Not validated on real university outcomes |
| Recommendations | Working explainable rule-based ranking | Do not describe rules as a trained model |
| Mobile | Installed/tested Android APK plus PWA | No iOS release claim without testing |
| Data | Persistent fictional seeded records | No real university data or endorsement |

## Final completeness check
For every row, link a page, action, API, seeded scenario and evidence. Required modules with unimplemented workflow steps remain blockers. Production integrations can remain simulated because simulation is explicitly part of the agreed prototype scope.


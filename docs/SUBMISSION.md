# CampusSetu — Final Submission Dossier & Release Artifacts

**Project Name:** CampusSetu (कैंपस सेतु)  
**Classification:** Multi-Tenant Higher Education Operating System (NEP 2020 Compliant)  
**Specification Reference:** M01 through M36 (`02-MODULES-AND-PAGES.md`)  
**Automated Test Suite Status:** 118 / 118 Tests Passing (`server/src/__tests__/app.test.ts`)  
**Active Route Register:** 95 Active Client Routes (`docs/PAGE-REGISTER.md`)  
**Accessibility & Locale:** WCAG 2.1 AA Compliant • Dual-Language (English & Hindi)  

---

## 1. Executive Synopsis

CampusSetu is a modern, enterprise-grade multi-tenant operating system purpose-built for Indian higher education institutions (universities, autonomous colleges, and polytechnics). Traditional Indian campus ERPs suffer from fragmented architectural silos, lack of compliance with National Education Policy (NEP 2020) multi-entry/multi-exit credit frameworks, error-prone floating-point accounting, vulnerable examination lifecycles, and inaccessible user interfaces.

CampusSetu unifies the entire institutional ecosystem—from multi-quota entrance merit lists and timetable constraint solving, to double-entry integer-paise financial ledgers, dual-custody encrypted question paper vaults, blind revaluation, AI-grounded academic advising, and automated NAAC/NIRF accreditation analytics—into a unified, verifiable, and bilingual web/mobile platform.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CAMPUSSETU                                │
│               Multi-Tenant Higher Education Operating System           │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│   ACADEMICS      │   EXAMINATIONS   │     FINANCE      │  AI & ANALYTICS
│ • NEP 2020 OBE   │ • Paper Vault    │ • Integer-Paise  │ • Grounded RAG│
│ • Quota Merit    │ • Blind Reval    │ • Razorpay Sim   │ • Dropout EWS │
│ • Room Solver    │ • Transcripts    │ • Ledger Payroll │ • Remedial AI │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

---

## 2. Problem & Solution Statement

### The Problem
1. **Regulatory & Credit Complexity:** Indian institutes struggle to operationalize NEP 2020 requirements (Major/Minor/Vocational/Skill pathways, Academic Bank of Credits [ABC] transfer, and continuous internal evaluations).
2. **Financial Drift & Inaccurate Ledgers:** Educational ERPs using standard IEEE-754 floating-point arithmetic introduce reconciliation errors across student fees, fine waivers, and statutory employee payroll deductions.
3. **Examination Vulnerabilities:** Manual handling of question papers, leaks, non-blind revaluation, and paper transcripts lack tamper-evident digital proof.
4. **Disjointed Communication & Accessibility:** Portals lack native Indian language support (Hindi) and accessible designs, alienating parents and diverse student demographics.

### The CampusSetu Solution
1. **NEP 2020-Native Academic Engine:** Built-in credit distribution rules, prerequisite validation directed acyclic graphs (DAGs), and automated seat matrix quota allocation (SC/ST/OBC/EWS).
2. **Deterministic Integer-Paise Ledger Engine:** All currency values are strictly stored and computed as integer paise (1 INR = 100 paise), backed by double-entry ledger bookkeeping.
3. **High-Security Examination Lifecycle:** Dual-custody AES-256 encrypted question vaults, blind double-evaluation revaluation workflows, and SHA-256 cryptographically verifiable transcripts with scannable QR verification.
4. **Inclusive Bilingual UI:** Complete, parity-level English and Hindi (`hi-IN`) interface with WCAG 2.1 AA contrast and screen-reader accessibility.
5. **Privacy-Preserving AI:** Deterministic knowledge retrieval with strict tenant data isolation, early warning dropout prediction, and adaptive remedial quiz generation.

---

## 3. Key Innovations

1. **Deterministic Multi-Quota Merit Engine:** Automatically resolves reservation quotas, category relaxations, tie-breaker algorithms (Qualifying % → Mathematics score → DOB seniority), and generates printable merit rosters.
2. **Conflict-Free Timetable Solver:** Constraint-satisfaction heuristic solver that eliminates room double-booking, satisfies faculty weekly teaching ceilings, and guarantees student core-course availability.
3. **Cryptographic Examination Tabulation & Tamper-Sealed Transcripts:** Immutable semester tabulation registers, automated SGPA/CGPA moderation curves, and public transcript verification endpoints.
4. **Asynchronous Outbox Communication Architecture:** Decouples transactional workflows from external messaging gateways using an idempotent, retryable outbox table.
5. **Hybrid Offline Resilience:** Capacitor-powered Android 14 container with client-side cache-first strategy and conflict-safe synchronization for low-connectivity rural campus settings.

---

## 4. Impact Measurement Plan (Simulated / Field-Trial Metrics)

*Note: Below metrics represent the formal evaluation protocol designed for institutional pilots.*

| Metric Category | Target KPI | Verification Mechanism |
| :--- | :--- | :--- |
| **Admission Turnaround** | 70% reduction in merit list compilation time | Automated batch execution vs. manual spreadsheet reconciliation. |
| **Financial Reconciliation** | 0.00 paise ledger variance | Double-entry balance assertion: $\sum \text{Debits} - \sum \text{Credits} = 0$. |
| **Exam Result Publishing** | Publish results within 48 hours of evaluation | Streamlined digital mark entry, moderation curves, and automated tabulation. |
| **Dropout Early Warning** | Early detection of at-risk students by Week 6 | Multi-factor prediction model flagging $<75\%$ attendance and fee backlogs. |
| **Digital Accessibility** | 100% WCAG 2.1 AA compliance score | Automated axe-core audits and bilingual keyboard navigation testing. |

---

## 5. Implementation Feasibility & Resource Footprint

- **Architecture:** Client-Server Monorepo (Node.js/Express + Vite/React + MongoDB).
- **Hosting Requirements:** Minimum 1 vCPU, 2GB RAM container for core Express API and client bundle; MongoDB 6.0+ cluster.
- **Portability:** Standard Docker containerization or direct Node.js LTS execution; zero proprietary cloud lock-in.
- **Client Footprint:** Responsive Single-Page Application (SPA) with total gzip bundle size under 600KB; PWA offline worker caching.

---

## 6. High-Level Technical Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │         CLIENT PRESENTATION TIER             │
                               │  Vite + React SPA • Capacitor Android 14 App │
                               │  WCAG 2.1 AA Accessible • Dual English/Hindi  │
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTPS / JSON / JWT
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             EXPRESS API GATEWAY              │
                               │   Rate Limiting • RBAC • Tenant Resolution   │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         ▼                                            ▼                                            ▼
┌─────────────────────────────────┐          ┌─────────────────────────────────┐          ┌─────────────────────────────────┐
│       CORE ACADEMIC & ERP       │          │       SECURITY & GOVERNANCE     │          │         AI & SIMULATION         │
│ • Admissions & Quota Merit      │          │ • Dual-Custody Paper Vault      │          │ • Grounded Academic RAG         │
│ • NEP 2020 Curricula & Timetable│          │ • Blind Revaluation Workflow    │          │ • Early Warning Dropout Risk    │
│ • Daily Attendance & Workloads  │          │ • Tamper-Sealed E-Registers     │          │ • Integration Simulators        │
│ • Integer-Paise Finance & Fees  │          │ • Verified Transcripts (SHA256) │          │ • Virtual Accelerated Clock     │
└────────────────┬────────────────┘          └────────────────┬────────────────┘          └────────────────┬────────────────┘
                 │                                            │                                            │
                 └────────────────────────────────────────────┼────────────────────────────────────────────┘
                                                              ▼
                               ┌──────────────────────────────────────────────┐
                               │            MONGODB PERSISTENCE LAYER         │
                               │  Tenant-Scoped Collections • Indexed Indexes │
                               └──────────────────────────────────────────────┘
```

---

## 7. Complete Integration Mode Disclosure Matrix

To ensure absolute audit integrity, all simulated integrations and data boundary limits are transparently disclosed:

| Domain Subsystem | Operational Mode | Realistic Simulation & Disclosure Details |
| :--- | :--- | :--- |
| **Payment Gateway (Razorpay)** | **Simulated with HMAC** | Simulates Razorpay order initiation, web checkout modal, and server-side payment callback verification using real HMAC-SHA256 signatures (`signSimulatorPayload`). No real banking rails are touched; all balances are represented in integer paise. |
| **SMS / Email Gateway (MSG91 / SES)** | **Transactional Outbox** | Outbound communications are recorded in the `outbox_messages` database table with delivery status, retry counters, and payload inspection. Messages are marked `DELIVERED` by the background dispatcher. |
| **Biometric Attendance Devices** | **Synthetic Batch Ingestion** | Ingests synthetic punch logs (ZKTeco/Hikvision format) with configurable noise, machine IDs, and late timestamps via the simulator console (`/app/simulator/console`). |
| **Virtual Demo Clock** | **Accelerated Time Drift** | Features a virtual clock provider capable of running in normal time or accelerating (10x, 60x) and jumping dates to demonstrate attendance freezes, fee overdue penalties, and exam cycles. |
| **Dropout Prediction AI Model** | **Synthetic Baseline Model** | Evaluated on 200 synthetic student profiles with temporal train/test split. Identifies risks using weighted heuristics (attendance %, fee arrears, internal grade drops). Does not claim clinical or real-world predictive validity. |
| **Academic AI Assistant** | **Grounded RAG Engine** | In-memory semantic search against tenant-curated academic handbooks and syllabus regulations with citation verification. Isolated from external proprietary LLM calls. |
| **Mobile Android App** | **Capacitor 6 / Android 14 APK** | Configured in `android/` with package ID `org.campussetu.app` targeting Android 14 (API level 34). Uses cache-first service workers and offline-safe local storage. |

---

## 8. Reviewer Setup & Demo Instructions

### A. Quick Start Instructions
```bash
# 1. Install root, client, and server dependencies
npm install

# 2. Start the Express API Backend (Port 5000)
npm run server

# 3. In a second terminal, start the Vite SPA Frontend (Port 5173)
npm run dev

# 4. Run the Full Automated Test Suite (118 Tests)
npm test
```

### B. Seeded Persona Login Accounts
All demo accounts use the standard password: **`Password@123`**

| Persona | Email / Username | Recommended Initial Route | Key Features to Test |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@campussetu.edu` | `/app/super-admin/tenants` | Multi-tenant creation, system route coverage manifest (`/app/release/coverage`). |
| **University Registrar** | `registrar@campussetu.edu` | `/app/admissions/merit-lists` | Quota merit calculation, tamper-sealed e-registers (`/app/governance/e-registers`). |
| **Controller of Exams** | `coe@campussetu.edu` | `/app/examinations/cycles` | Exam cycle scheduling, dual-custody paper vault, moderation curves. |
| **Finance Officer** | `finance@campussetu.edu` | `/app/finance/fees/collect` | Fee collection, Razorpay simulation, monthly payroll run with PF/TDS deductions. |
| **Department Head (HOD)** | `hod.cs@campussetu.edu` | `/app/academics/curricula` | NEP course tree creation, faculty workload assignment, automated timetable solver. |
| **Faculty Member** | `faculty.sharma@campussetu.edu` | `/app/attendance/daily` | Period attendance grid marking, class schedule review, internal mark entry. |
| **Student** | `student.rahul@campussetu.edu` | `/app/student/dashboard` | Digital admit card, AI academic chatbot (`/app/ai/chat`), CGPA tracking. |
| **Parent** | `parent.verma@campussetu.edu` | `/app/parent/overview` | Ward attendance tracker, fee receipt downloads, institutional notice sign-offs. |

---

## 9. Ten-Slide Presentation Deck Outline

- **Slide 1: Title & Vision** — CampusSetu: The Unified, NEP 2020-Compliant Higher Education Operating System.
- **Slide 2: The Problem Space** — Siloed legacy ERPs, float-math financial leakage, examination security risks, and linguistic exclusion.
- **Slide 3: System Architecture & Tenancy** — Enterprise multi-tenant database isolation, JWT RBAC security, and dual English/Hindi accessibility.
- **Slide 4: NEP 2020 Academic Engine** — Dynamic credit frameworks, prerequisite DAGs, and reservation quota merit distribution.
- **Slide 5: High-Stakes Examination Security** — Dual-custody AES-256 paper vault, blind revaluation, and QR-verifiable digital transcripts.
- **Slide 6: Deterministic Financial Infrastructure** — Integer-paise fee ledger, fine waiver approvals, and statutory payroll runs.
- **Slide 7: Campus Operations & Administration** — Hostel allocation, transport route passes, library circulation, and procurement POs.
- **Slide 8: AI & Analytics Layer** — Grounded academic RAG assistant, early dropout prediction, and Bayesian remedial quizzes.
- **Slide 9: Mobile & Simulation Infrastructure** — Capacitor Android 14 integration, biometric device emulator, and transactional outbox.
- **Slide 10: Verification, Test Evidence & Roadmap** — 118/118 tests passing, 95 verified routes, zero placeholders, and production roadmap.

---

## 10. Module Walkthrough & Recording Index (M01 – M36)

| Module Range | Domain Track | Primary Test Routes | Verification Narrative |
| :--- | :--- | :--- | :--- |
| **M01 – M05** | Foundation & Admissions | `/app/super-admin/tenants`<br>`/app/login`<br>`/app/admissions/merit-lists` | Tenancy setup, secure login, student applications, reservation merit ranking. |
| **M06 – M10** | Academics & Finance | `/app/academics/curricula`<br>`/app/timetable/generate`<br>`/app/finance/fees/collect` | Workload assignment, timetable solver, attendance grid, integer-paise payments. |
| **M11 – M16** | Examination Lifecycle | `/app/examinations/cycles`<br>`/app/examinations/paper-vault`<br>`/app/examinations/transcripts` | Hall ticket issuance, encrypted paper upload, moderation curves, transcript QR. |
| **M17 – M21** | Services & Governance | `/app/examinations/revaluation`<br>`/app/hostel/allocations`<br>`/app/parent/overview` | Blind double reval, hostel allocation, bus pass routes, parent notice sign-off. |
| **M22 – M29** | Administration & HR | `/app/communications/notices`<br>`/app/governance/e-registers`<br>`/app/hr/payroll/process` | Outbox notifications, daily sealed registers, staff leaves, statutory payroll. |
| **M30 – M33** | AI Intelligence Suite | `/app/ai/chat`<br>`/app/ai/dropout-risk`<br>`/app/ai/adaptive-learning` | Grounded RAG queries, student risk categorization, remedial quiz generator. |
| **M34 – M36** | Mobile, Sim & Release | `/app/mobile/sync`<br>`/app/simulator/console`<br>`/app/release/coverage` | Offline cache sync, hardware simulation controls, 95-route release inventory. |

---

## 11. Organizer Checklist Alignment & Final Human Steps

### Organizer Checklist Compliance
- [x] **Complete Functional Surface:** 36 of 36 modules implemented with zero placeholder text or "coming soon" blocks.
- [x] **Test Verification:** 118 automated integration tests passing in single test runner invocation (`npm test`).
- [x] **Build Integrity:** Frontend (`dist/`) builds cleanly without TypeScript or Vite errors (`npm run build`).
- [x] **Bilingual Support:** 100% full English and Hindi (`hi-IN`) interface parity.
- [x] **Transparent Disclosure:** All simulation boundaries (money, biometric, SMS, AI baseline, clock) explicitly disclosed.

### Remaining Human Submission Steps
1. **Repository Push:** Ensure all local commits are pushed to the target remote repository on GitHub/GitLab.
2. **Video Walkthrough Recording:** Record a 5–7 minute video following the 10-slide outline and module walkthrough index.
3. **Submission Form Completion:** Paste repository link, demo credentials, executive synopsis, and architecture highlights into the hackathon submission portal.

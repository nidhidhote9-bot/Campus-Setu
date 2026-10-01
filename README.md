# CampusSetu — Smart University Digital Campus

> **Enterprise-Grade Multi-Tenant Higher Education Operating System (NEP 2020 Compliant)**

CampusSetu is a unified, accessible, and high-security operating system designed specifically for Indian universities, autonomous colleges, and polytechnic institutions. It consolidates admissions quota merit calculations, timetable conflict solving, integer-paise financial ledgers, dual-custody question paper vaults, blind revaluations, AI-grounded academic advising, and automated NAAC/NIRF accreditation analytics into a single bilingual (English/Hindi) platform.

---

## 1. System Requirements

* **Node.js:** v18.x or v20.x LTS
* **Package Manager:** npm v9+ or v10+
* **Database:** MongoDB 6.0+ (Local MongoDB Server or MongoDB Atlas Cluster)

---

## 2. Installation & Quick Setup

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/nidhidhote9-bot/Campus-Setu.git
cd Campus-Setu
npm install
```

### Step 2: Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure your environment variables in `.env`:
```env
# MongoDB Atlas or Local URI
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/campussetu_demo

# Server Port
PORT=5000

# Authentication & Session Secrets
JWT_SECRET=campus_setu_secret_key_2026
SESSION_SECRET=campus_setu_session_secret_demo

# Demo Mode Settings
DEMO_MODE=true
DEMO_DATASET_ID=campussetu-demo-01
```

> **Important Security Notice:** Never commit `.env` or any production credentials to GitHub. `.env` is ignored by `.gitignore`.

---

## 3. Seed Demo Database

Run the idempotent database seeder to populate realistic, synthetic Indian university demo data (1 University, 3 Institutes, 6 Departments, Faculty, Students, Fees, Exams, Timetables, and Audit Logs):

```bash
npm run seed
```

---

## 4. Run Application

### Run Full Stack (Backend API + Frontend SPA) in Development:
```bash
npm run dev
```
* **Express API Gateway:** `http://localhost:5000` (API routes at `/api/v1` and `/api`)
* **Vite React Frontend:** `http://localhost:5173`

### Run Backend Only:
```bash
npm run dev:server
```

### Run Frontend Only:
```bash
npm run dev:client
```

### Run Automated Integration Test Suite (124 Tests):
```bash
npm test
```

### Production Build:
```bash
npm run build
```

---

## 5. Seeded Demo Login Credentials

All demo accounts use the standard demo password: **`Demo@12345`**

| Role | Demo Account Email | Default Password | Primary Dashboard & Landing Page |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@demo.com` | `Demo@12345` | `/app/super-admin/tenants` (Multi-Tenancy, Route Coverage, Release Radar) |
| **University Admin** | `university@demo.com` | `Demo@12345` | `/dashboard` (University Overview, Institutes, Programs, Compliance) |
| **College Admin** | `college@demo.com` | `Demo@12345` | `/dashboard` (College Departments, Staff Leaves, Daily E-Registers) |
| **Faculty** | `faculty@demo.com` | `Demo@12345` | `/app/attendance/daily` (Period Attendance, Classes, Internal Marks) |
| **Student** | `student@demo.com` | `Demo@12345` | `/app/student/dashboard` (Digital Hall Tickets, CGPA, AI Assistant) |
| **Exam Officer** | `exam@demo.com` | `Demo@12345` | `/app/examinations/cycles` (Cycles, Encrypted Paper Vault, Moderation) |
| **Finance Officer** | `finance@demo.com` | `Demo@12345` | `/app/finance/fees/collect` (Integer-Paise Ledger, Invoices, Payroll) |

---

## 6. System Architecture & Scoping

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
                               │         MONGODB ATLAS / LOCAL DATABASE       │
                               │    Database: campussetu_demo (Tenant-Scoped) │
                               └──────────────────────────────────────────────┘
```

---

## 7. MongoDB Collections Inventory

1. `users` — User credentials, roles, and institution associations.
2. `institutions` — Multi-tenant university and college entities.
3. `departments` — Academic and administrative department masters.
4. `students` — Student 360 master profiles, roll numbers, and CGPA records.
5. `courses` — NEP 2020 syllabus units, credit weights, and course prerequisites.
6. `timetables` / `timetableentries` — Conflict-free room and faculty schedules.
7. `attendancerecords` / `attendancesessions` — Period-wise attendance marks.
8. `invoices` / `feetransactions` — Double-entry integer-paise financial accounting.
9. `examcycles` / `halltickets` — Examination schedules and digital admit cards.
10. `moderatedmarks` / `termresults` — Grade moderation and published semester cards.
11. `notices` / `outboxmessages` — Asynchronous notification outbox.
12. `auditlogs` — Immutable actor, role, action, and entity audit records.

---

## 8. License

MIT License. Copyright (c) 2026 CampusSetu Team.

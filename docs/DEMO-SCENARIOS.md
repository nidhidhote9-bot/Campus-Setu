# CampusSetu Demonstration Scenarios & Persona Journeys

## Pre-requisites
- Ensure MongoDB service is running (`mongodb://127.0.0.1:27017/campus_setu`).
- Ensure Express backend server is running on `http://localhost:5000`.
- Ensure Vite client SPA dev server is running on `http://localhost:5173`.

---

## Scenario 1: Super Admin System Overview & Disposable Data Reset
1. Open `http://localhost:5173/login`.
2. Select Portal Role: **Super Admin** (`superadmin@campussetu.edu` / `Password123!`).
3. Click **Log In**. Verify redirection to `/dashboard`.
4. Review Dashboard Telemetry: Total Students, Integer Paise Fee Collections, Active Placement Drives, and Outbox Event Feed.
5. Click **System Administration** in the sidebar (`/admin/system`).
6. Review system audit logs.
7. Click **Reset Disposable Demo Data**. Confirm prompt. Verify success toast and database re-seeding.

---

## Scenario 2: Student Fee Checkout & Official Transcript Verification
1. Log out and sign in as **Student** (`student.aarav@campussetu.edu` / `Password123!`).
2. Navigate to **Student Fee Checkout** (`/fees/student`).
3. Review fee breakdown: Total Fee (₹50,000.00 = 5,000,000 paise).
4. Click **Pay Fee via Razorpay [SIMULATION]**. Verify instant receipt generation with receipt number `RCP-...` and idempotency key badge `[IDEMPOTENCY SAFE]`.
5. Navigate to **Transcripts & Report Cards** (`/exams/transcripts`).
6. Verify official grade sheet with CGPA `8.80` and DigiLocker verification QR code.

---

## Scenario 3: Faculty Attendance Marking & Gradebook Finalization Lock
1. Sign in as **Faculty** (`faculty.cse@campussetu.edu` / `Password123!`).
2. Navigate to **Attendance** (`/academics/attendance`).
3. Select course `CS201 - Data Structures`, toggle student statuses, and click **Submit Class Attendance**.
4. Navigate to **Gradebook Marks Entry** (`/exams/marks`).
5. Update student marks to `88`, check **Finalize & Lock Marks**, and save. Verify `[MARKS FINALIZED & LOCKED]` badge.

---

## Scenario 4: Guardian Ward Performance & Fee Portal
1. Sign in as **Guardian** (`guardian.sharma@campussetu.edu` / `Password123!`).
2. Redirection to **Guardian Portal** (`/guardian/dashboard`).
3. Verify linked ward: `Aarav Sharma` (Roll: `CSE-2024-001`).
4. Review ward CGPA (`8.80`), attendance rate (`88.5%`), and fee status (`PAID`).

---

## Scenario 5: AI Dropout Early Warning Risk Classification
1. Sign in as **Campus Admin** (`admin@campussetu.edu` / `Password123!`).
2. Navigate to **AI Early Warning System** (`/analytics/risk`).
3. Inspect student risk roster: High/Medium/Low risk classifications.
4. Verify notice badge: `[SYNTHETIC DATASET EVALUATION LIMITS]`.

---

## Scenario 6: M12 Exam Operations — Center Verification, Seating Capacity & Material Reconciliation
1. Sign in as **Campus Admin** (`admin@campussetu.edu` / `Password123!`).
2. Navigate to **Exam Operations Schedule** (`/app/exam-operations/schedule`).
3. View scheduled examinations (e.g. CS201 Data Structures and CS202 DBMS). Run **Check Schedule Conflicts** to verify room & slot availability. Click **Publish Official Timetable**.
4. Navigate to **Centers & Seating Allocation** (`/app/exam-operations/centers`).
5. Select center `CTR-MAIN` (Main Examination Building). Verify inspection status `VERIFIED` with CCTV and power backup confirmed.
6. Check Room 102 (capacity: 2). Test the capacity boundary: allocate more students than capacity allows; verify the over-capacity rejection error.
7. Test seat reallocation: select a student allocation, click **Reallocate Seat**, choose Room 101, provide a reason, and verify the audited reallocation with an `AuditLog` entry.
8. Navigate to **Invigilator Roster** (`/app/exam-operations/invigilators`).
9. Appoint faculty to an examination hall. Test attendance tracking: mark absent with superintendent remarks and verify the `ABSENT` badge.
10. Navigate to **Materials & Answer Books** (`/app/exam-operations/materials`).
11. View registered batches. Try creating a duplicate serial range (e.g., `AB-001001` to `AB-002000`) and verify rejection.
12. Inspect Batch `BATCH-2026-AB-01` (200 dispatched = 180 used + 18 returned + 2 damaged). Click **Reconcile Batch** to verify mathematically balanced status `RECONCILED`.


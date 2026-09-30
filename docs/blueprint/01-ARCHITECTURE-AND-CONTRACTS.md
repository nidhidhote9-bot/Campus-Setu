# CampusSetu Architecture and Systems Contract

## 1. System Architecture
CampusSetu is engineered as a production-grade TypeScript Express modular monolith with a React/Vite web application, powered by MongoDB via Mongoose.

```
                  +-----------------------------------+
                  |   React + Vite SPA Client (TS)   |
                  |  (English / Hindi i18n, PWA/Mobile)|
                  +-----------------+-----------------+
                                    |
                                REST API
                        (Zod DTO Validated)
                                    |
                  +-----------------v-----------------+
                  |      Express Modular Monolith      |
                  |                                   |
                  | [Auth & Scope Middleware (RBAC)]  |
                  | [CSRF & Session Security Layer]  |
                  | [Domain Services & Idempotency]  |
                  | [Durable Audit & Outbox Engine]   |
                  +-----------------+-----------------+
                                    |
                                Mongoose
                                    |
                  +-----------------v-----------------+
                  |           MongoDB Database        |
                  | (Integer Paise, Unique Indexes,   |
                  |   Immutable Ledgers, Outbox Log)  |
                  +-----------------------------------+
```

## 2. Core Architectural & Domain Principles
1. **Monetary Precision**: All monetary values are represented as **integer paise** (e.g., ₹100.00 = `10000` paise). Double floating-point representation for currency is strictly prohibited.
2. **Immutability & Audit Trail**: Published exam marks, fee receipts, payroll records, and official transcripts are immutable once finalized. Adjustments, corrections, or revisions are stored as appended audit/ledger events.
3. **Multi-Institution & Scope-Based RBAC**:
   - `SuperAdmin`: System-wide monitoring and institution management.
   - `Admin`: Full control within their assigned `institutionId`.
   - `Faculty`: Scope restricted to courses, classes, and students assigned in `facultyAssignments`.
   - `Student`: Scope strictly restricted to their own record (`studentId`).
   - `Guardian`: Scope restricted to linked ward records (`wardStudentIds`).
   - `Finance`: Financial operations, fee structures, payroll, and ledgers within `institutionId`.
   - `Warden`: Hostel and room management within assigned buildings.
   - `PlacementOfficer`: Drive management and company registrations.
4. **Idempotency & Resilience**:
   - Financial mutations (Fee payment, Payroll disbursement) require an `X-Idempotency-Key` header.
   - Outbox pattern logs asynchronous domain events (SMS notifications, Email, External sync) to `OutboxEvent` collection for resilient delivery.
5. **CSRF & Scoped Sessions**:
   - Cookie-based HTTP-only session tokens or bearer tokens scoped with CSRF double-submit token verification for mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Passwords stored via Argon2 / Bcrypt with salt.
6. **Simulated External Services**:
   - External gateways (Razorpay Payment Gateway, DigiLocker Verification API, WhatsApp/SMS Gateway) are simulated via explicit domain adapters clearly labelled `[SIMULATION]` in logs and UI.

## 3. Data Schema Contracts & Unique Constraints

### 3.1 Auth & User Schema (`User`)
- `email`: `String`, required, unique, lowercase, trimmed.
- `passwordHash`: `String`, required.
- `role`: `Enum['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'GUARDIAN', 'FINANCE', 'WARDEN', 'PLACEMENT_OFFICER']`, required.
- `institutionId`: `ObjectId` (Ref: `Institution`), required for non-SuperAdmin.
- `name`: `String`, required.
- `phone`: `String`, optional.
- `isActive`: `Boolean`, default `true`.
- `wardStudentIds`: `[ObjectId]` (Ref: `Student`), for Guardians.

### 3.2 Institution & Department (`Institution`, `Department`)
- `Institution`: `code` (unique string), `name`, `address`, `contactEmail`, `contactPhone`, `config` (currency: 'INR', language: 'en').
- `Department`: `institutionId`, `code` (unique per institution), `name`, `headOfDepartmentId` (Ref: `User`).

### 3.3 Student Profile (`Student`)
- `userId`: `ObjectId` (Ref: `User`), unique.
- `institutionId`: `ObjectId`, required.
- `departmentId`: `ObjectId`, required.
- `rollNumber`: `String`, unique per institution.
- `enrollmentNumber`: `String`, unique system-wide.
- `currentSemester`: `Number` (1 to 8/10).
- `batchYear`: `Number` (e.g. 2024).
- `guardianUserId`: `ObjectId` (Ref: `User`).
- `cgpa`: `Number`, default 0.

### 3.4 Fee Ledger (`FeeStructure`, `FeeTransaction`)
- `FeeStructure`: `institutionId`, `departmentId`, `batchYear`, `semester`, `feeType` (Tuition, Hostel, Exam, Transport), `amountPaise` (`Number` integer), `dueDate`.
- `FeeTransaction`:
  - `transactionId`: `String`, unique.
  - `idempotencyKey`: `String`, unique index.
  - `studentId`: `ObjectId`, required.
  - `institutionId`: `ObjectId`, required.
  - `amountPaise`: `Number` (integer paise).
  - `paymentMode`: `Enum['UPI', 'NET_BANKING', 'CARD', 'CASH', 'CHQ']`.
  - `status`: `Enum['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED']`.
  - `gatewayReference`: `String`.
  - `receiptNumber`: `String`, unique index.
  - `createdAt`, `updatedAt`.

### 3.5 Attendance Record (`AttendanceRecord`)
- `institutionId`: `ObjectId`.
- `courseId`: `ObjectId` (Ref: `Course`).
- `facultyId`: `ObjectId` (Ref: `User`).
- `date`: `Date` (YYYY-MM-DD format).
- `semester`: `Number`.
- `section`: `String`.
- `entries`: `[{ studentId: ObjectId, status: Enum['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], remarks: String }]`.
- Compound unique index: `{ courseId: 1, date: 1, section: 1 }`.

### 3.6 Examination & Marks (`Exam`, `MarkSheet`)
- `Exam`: `institutionId`, `name`, `examType` (MID_TERM, END_SEM, QUIZ), `academicYear`, `startDate`, `endDate`.
- `MarkSheet`:
  - `examId`: `ObjectId`, `courseId`: `ObjectId`, `studentId`: `ObjectId`.
  - `marksObtained`: `Number`, `maxMarks`: `Number`, `grade`: `String`, `isFinalized`: `Boolean`.
  - `finalizedBy`: `ObjectId`, `finalizedAt`: `Date`.
  - Compound unique index: `{ examId: 1, courseId: 1, studentId: 1 }`.

### 3.7 Hostel & Transport (`HostelRoom`, `HostelAllocation`, `TransportRoute`, `BusPass`)
- `HostelRoom`: `institutionId`, `buildingName`, `roomNumber`, `capacity`, `currentOccupancy`, `monthlyRentPaise`.
- `HostelAllocation`: `studentId`, `roomId`, `startDate`, `endDate`, `status`.
- `TransportRoute`: `institutionId`, `routeNumber`, `routeName`, `vehicleNumber`, `driverName`, `feePaise`.
- `BusPass`: `studentId`, `routeId`, `passNumber`, `validUntil`, `status`.

### 3.8 Placement Drive & Application (`PlacementDrive`, `PlacementApplication`)
- `PlacementDrive`: `institutionId`, `companyName`, `jobTitle`, `packageLpaPaise` (`Number`), `eligibilityMinCgpa`, `deadline`.
- `PlacementApplication`: `driveId`, `studentId`, `status` (`Enum['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED']`), `appliedAt`.

### 3.9 Audit Log & Outbox (`AuditLog`, `OutboxEvent`)
- `AuditLog`: `timestamp`, `userId`, `institutionId`, `action`, `resource`, `resourceId`, `ipAddress`, `userAgent`, `previousState`, `newState`.
- `OutboxEvent`: `eventId`, `eventType`, `payload`, `status` (`Enum['PENDING', 'SENT', 'FAILED']`), `attempts`, `createdAt`.

## 4. REST API Endpoint Specification Matrix
All API paths start with `/api/v1`.

| Module | Method | Endpoint | Access Roles | Description |
|---|---|---|---|---|
| Auth | POST | `/auth/register` | Public / Admin | Create user account |
| Auth | POST | `/auth/login` | Public | Authenticate user & issue session cookie / token |
| Auth | POST | `/auth/logout` | Authenticated | Terminate session |
| Auth | GET | `/auth/me` | Authenticated | Retrieve current user profile & permissions |
| Institution | GET | `/institutions` | SuperAdmin, Admin | List institutions |
| Institution | POST | `/institutions` | SuperAdmin | Create institution |
| Student | GET | `/students` | Admin, Faculty | List students with filters |
| Student | GET | `/students/:id` | Admin, Faculty, Guardian, Student | Get student details (Scope checked) |
| Academic | POST | `/attendance` | Faculty, Admin | Submit class attendance |
| Academic | GET | `/attendance/student/:studentId` | Student, Guardian, Faculty, Admin | Fetch student attendance summary |
| Exams | POST | `/exams/marks` | Faculty, Admin | Enter marks (Finalization creates immutable log) |
| Exams | GET | `/exams/report-card/:studentId` | Student, Guardian, Faculty, Admin | Get semester report card & CGPA |
| Fees | POST | `/fees/pay` | Student, Guardian, Finance, Admin | Process fee payment with Idempotency & Integer Paise |
| Fees | GET | `/fees/ledger/:studentId` | Student, Guardian, Finance, Admin | Fetch fee ledger and receipts |
| Payroll | POST | `/payroll/approve` | Finance, Admin | Approve staff monthly payroll |
| Facilities | GET/POST | `/hostel/*`, `/transport/*` | Admin, Warden, Student | Hostel room booking & bus pass issuance |
| Placement | GET/POST | `/placement/*` | PlacementOfficer, Student | Placement drives & job applications |
| Analytics | GET | `/analytics/dropout-risk` | Admin, Faculty | AI Academic Risk / Early Warning (Synthetic Model) |
| System | POST | `/system/reset-demo` | SuperAdmin, Admin | Reset explicitly disposable demo synthetic dataset |

## 5. Security, Validation & Compliance Checklist
- [x] Input validation via Zod schemas on all endpoint inputs.
- [x] Password hashing using Bcrypt/Argon2.
- [x] Scope verification middleware checking user's `institutionId`, `departmentId`, or `studentId`.
- [x] CSRF protection token validation on POST/PUT/PATCH/DELETE calls.
- [x] Sensitive field redaction (passwords, tokens) in server logs & API responses.
- [x] Multi-language fallback (English & Hindi i18n support).

# CampusSetu API Contracts Specification

## Base URL
`/api/v1`

## Common Headers
- `Content-Type`: `application/json`
- `Authorization`: `Bearer <jwt_token>` (for authenticated endpoints)
- `X-CSRF-Token`: `<csrf_token>` (required for mutating `POST`, `PUT`, `PATCH`, `DELETE` requests)
- `X-Idempotency-Key`: `<unique_string>` (required for financial mutations: fee payments, payroll approvals)

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@campussetu.edu",
    "password": "Password123!",
    "role": "ADMIN"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "600000000000000000000002",
      "email": "admin@campussetu.edu",
      "name": "Suresh Menon (Campus Admin)",
      "role": "ADMIN",
      "institutionId": "600000000000000000000001"
    },
    "csrfToken": "csrf-demo-token"
  }
  ```

### `GET /auth/me`
- **Access**: Authenticated
- **Response (200 OK)**: Current user profile and active session scope.

---

## 2. Financial & Fee Payment Endpoints (`/fees`)

### `POST /fees/pay`
- **Access**: Enforced Student / Guardian / Finance scope
- **Request Body**:
  ```json
  {
    "studentId": "600000000000000000000008",
    "institutionId": "600000000000000000000001",
    "amountPaise": 5000000,
    "feeType": "TUITION",
    "paymentMode": "UPI",
    "idempotencyKey": "FEE-IDEMP-99120"
  }
  ```
- **Constraint**: `amountPaise` MUST be a positive integer. Idempotency key guarantees duplicate calls return the original transaction record without double processing.
- **Response (200 OK)**:
  ```json
  {
    "transactionId": "TXN-1790754111-4892",
    "idempotencyKey": "FEE-IDEMP-99120",
    "studentId": "600000000000000000000008",
    "amountPaise": 5000000,
    "feeType": "TUITION",
    "paymentMode": "UPI",
    "status": "SUCCESS",
    "receiptNumber": "RCP-1790754111-2018",
    "gatewayReference": "PAY-SIM-RAZORPAY-8821"
  }
  ```

### `GET /fees/ledger/:studentId`
- **Access**: Enforced Student / Guardian / Staff scope
- **Response (200 OK)**: Total due in paise, total paid in paise, formatted INR strings, structures array, and transactions array.

---

## 3. Examination & Gradebook Endpoints (`/exams`)

### `POST /exams/marks`
- **Access**: Faculty, Admin
- **Request Body**:
  ```json
  {
    "examId": "600000000000000000000010",
    "courseId": "600000000000000000000004",
    "studentMarks": [
      {
        "studentId": "600000000000000000000008",
        "marksObtained": 88,
        "maxMarks": 100,
        "remarks": "Grade re-evaluation"
      }
    ],
    "isFinalized": true
  }
  ```
- **Constraint**: If `isFinalized` is set to true, marks lock. Subsequent mark modifications automatically record an entry in `revisionHistory` log.

---

## 4. Analytics & AI Early Warning (`/analytics`)

### `GET /analytics/dropout-risk`
- **Access**: Admin, Faculty, SuperAdmin
- **Response (200 OK)**:
  ```json
  {
    "evaluationDisclaimer": "DISCLAIMER: Risk indicators generated via synthetic statistical rules. Model evaluation limits: Prototype dataset only.",
    "students": [
      {
        "studentId": "600000000000000000000008",
        "name": "Aarav Sharma",
        "rollNumber": "CSE-2024-001",
        "department": "Computer Science & Engineering",
        "cgpa": 8.8,
        "attendancePct": 88,
        "riskScore": 0,
        "riskLevel": "LOW",
        "recommendedAction": "Satisfactory Progress"
      }
    ]
  }
  ```

---

## 5. System Administration & Seeder (`/system`)

### `POST /system/reset-demo`
- **Access**: SuperAdmin, Admin
- **Response (200 OK)**:
  ```json
  {
    "message": "Synthetic demo dataset reset successfully!"
  }
  ```

---

## 6. Exam Operations Endpoints (`/exam-operations`)

### `GET /exam-operations/centers`
- **Access**: Staff
- **Response (200 OK)**: List of examination centers, rooms, capacities, and verification statuses.

### `POST /exam-operations/centers/verify`
- **Access**: Admin, SuperAdmin
- **Request Body**: `{ centerId, cycleId, status: "VERIFIED", verifiedCapacity: 120, cctvWorking: true, secureStorageAvailable: true }`

### `POST /exam-operations/schedules`
- **Access**: Admin, SuperAdmin
- **Validation**: Enforces slot conflict detection preventing overlapping room/subject assignments.

### `POST /exam-operations/seating/allocate`
- **Access**: Admin, SuperAdmin
- **Validation**: Strict enforcement of room capacity. Over-capacity assignment throws 400 error.

### `POST /exam-operations/seating/reallocate`
- **Access**: Admin, SuperAdmin
- **Audit**: Generates an explicit `AuditLog` entry retaining previous and new room/seat assignment.

### `POST /exam-operations/materials/batches`
- **Access**: Admin, SuperAdmin
- **Validation**: Overlapping serial intervals within the same prefix and material type are rejected with a 400 error.

### `POST /exam-operations/materials/reconcile`
- **Access**: Admin, SuperAdmin
- **Validation**: Mathematically checks that `dispatchedCount = usedCount + returnedCount + damagedCount`. Sets `RECONCILED` or flags `DISCREPANCY` with delta explanation.


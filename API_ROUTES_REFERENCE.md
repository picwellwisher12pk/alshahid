# Multi-Teacher Portal API Routes Reference

Complete reference for all API endpoints in the multi-teacher Quran portal.

## Authentication

All API routes require authentication via JWT tokens. Tokens can be provided in two ways:
- **Web**: HTTP-only cookies (`accessToken`)
- **Mobile**: Authorization header (`Bearer <token>`)

## Role-Based Access Control

- **ADMIN**: Full access to all routes
- **TEACHER**: Access to their assigned students and related data
- **STUDENT**: Access to their own data only

---

## Teachers API

### Create Teacher
**Endpoint:** `POST /api/teachers`
**Access:** Admin only
**Description:** Create a new teacher account with user profile

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "fullName": "Teacher Name",
  "password": "SecurePass123!",
  "bio": "Experienced Quran teacher (optional)",
  "profilePictureUrl": "https://... (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": { /* teacher object */ },
    "user": { /* user object */ }
  },
  "message": "Teacher created successfully"
}
```

---

### List Teachers
**Endpoint:** `GET /api/teachers`
**Access:** Admin only
**Description:** List all teachers with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "success": true,
  "data": [/* array of teacher objects */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### Get Teacher Details
**Endpoint:** `GET /api/teachers/[id]`
**Access:** Admin, Teacher (own profile)
**Description:** Get single teacher details with assigned students

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "bio": "...",
    "isActive": true,
    "user": { /* user object */ },
    "students": [/* array of student objects */]
  }
}
```

---

### Update Teacher
**Endpoint:** `PATCH /api/teachers/[id]`
**Access:** Admin, Teacher (own profile)
**Description:** Update teacher profile

**Request Body:**
```json
{
  "fullName": "Updated Name (optional)",
  "bio": "Updated bio (optional)",
  "profilePictureUrl": "https://... (optional)",
  "isActive": true
}
```

---

### Deactivate Teacher
**Endpoint:** `DELETE /api/teachers/[id]`
**Access:** Admin only
**Description:** Soft delete - sets isActive to false

---

## Students API

### Create Student
**Endpoint:** `POST /api/students`
**Access:** Admin only
**Description:** Create a new student, optionally with login account

**Request Body:**
```json
{
  "fullName": "Student Name",
  "age": 12,
  "contactEmail": "parent@example.com",
  "contactPhone": "+1234567890 (optional)",
  "teacherId": "teacher-uuid",
  "status": "ACTIVE",
  "createLoginAccount": true,
  "email": "student@example.com (required if createLoginAccount=true)",
  "password": "StudentPass123! (required if createLoginAccount=true)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "...",
    "teacherId": "...",
    "user": { /* user object if login created */ }
  },
  "message": "Student created successfully"
}
```

---

### List Students
**Endpoint:** `GET /api/students`
**Access:** Admin (all students), Teacher (assigned students), Student (own profile)
**Description:** List students with automatic role-based scoping

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `status` (optional): Filter by status (ACTIVE/INACTIVE/TRIAL)
- `teacherId` (optional): Filter by teacher (Admin only)

**Response:**
```json
{
  "success": true,
  "data": [/* array of student objects */],
  "pagination": { /* pagination object */ }
}
```

---

### Get Student Details
**Endpoint:** `GET /api/students/[id]`
**Access:** Admin, Teacher (assigned student), Student (own profile)
**Description:** Get single student with classes, invoices, progress logs

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "fullName": "...",
    "teacher": { /* teacher object */ },
    "classes": [/* recent 5 classes */],
    "invoices": [/* recent 5 invoices */],
    "progressLogs": [/* recent 5 logs */]
  }
}
```

---

### Update Student
**Endpoint:** `PATCH /api/students/[id]`
**Access:** Admin, Teacher (assigned student, cannot reassign)
**Description:** Update student details

**Request Body:**
```json
{
  "fullName": "Updated Name (optional)",
  "age": 13,
  "contactEmail": "newemail@example.com (optional)",
  "contactPhone": "+9876543210 (optional)",
  "status": "ACTIVE (optional)",
  "teacherId": "new-teacher-id (Admin only)"
}
```

---

### Deactivate Student
**Endpoint:** `DELETE /api/students/[id]`
**Access:** Admin only
**Description:** Soft delete - sets status to INACTIVE

---

### Assign Teacher to Student
**Endpoint:** `POST /api/students/[id]/assign-teacher`
**Access:** Admin only
**Description:** Assign or reassign student to a teacher

**Request Body:**
```json
{
  "teacherId": "new-teacher-uuid"
}
```

---

## Trial Requests API

### Convert Trial to Student
**Endpoint:** `POST /api/trial-requests/[id]/convert`
**Access:** Admin only
**Description:** Convert a trial request into an actual student

**Request Body:**
```json
{
  "teacherId": "teacher-uuid",
  "createLoginAccount": true,
  "email": "student@example.com (optional)",
  "password": "Password123! (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "student": { /* new student object */ },
    "trialRequest": { /* updated trial with status=CONVERTED */ }
  },
  "message": "Trial request converted successfully"
}
```

---

## Classes API

### Create Class
**Endpoint:** `POST /api/classes`
**Access:** Teacher only
**Description:** Schedule a new class for a student

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "scheduledAt": "2025-10-20T10:00:00Z",
  "duration": 30,
  "notes": "Tajweed practice (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "SCHEDULED",
    "student": { /* student object */ },
    "teacher": { /* teacher object */ }
  },
  "message": "Class scheduled successfully"
}
```

---

### List Classes
**Endpoint:** `GET /api/classes`
**Access:** Admin, Teacher (own classes), Student (own classes)
**Description:** List classes with role-based scoping

**Query Parameters:**
- `page`, `limit`: Pagination
- `studentId` (optional): Filter by student
- `status` (optional): Filter by status (SCHEDULED/COMPLETED/CANCELLED)
- `from` (optional): Filter from date (ISO format)
- `to` (optional): Filter to date (ISO format)

---

### Get Class Details
**Endpoint:** `GET /api/classes/[id]`
**Access:** Admin, Teacher (own class), Student (own class)
**Description:** Get single class details

---

### Update Class
**Endpoint:** `PATCH /api/classes/[id]`
**Access:** Admin, Teacher (own class)
**Description:** Update class details

**Request Body:**
```json
{
  "scheduledAt": "2025-10-20T11:00:00Z (optional)",
  "duration": 45,
  "status": "COMPLETED (optional)",
  "notes": "Updated notes (optional)"
}
```

---

### Cancel Class
**Endpoint:** `DELETE /api/classes/[id]`
**Access:** Admin, Teacher (own class)
**Description:** Cancel class - sets status to CANCELLED

---

## Progress Logs API

### Create Progress Log
**Endpoint:** `POST /api/progress-logs`
**Access:** Teacher only
**Description:** Add progress log for an assigned student

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "title": "Completed Surah Al-Fatiha",
  "notes": "Excellent tajweed, needs work on makharij",
  "logDate": "2025-10-15T14:30:00Z (optional, defaults to now)"
}
```

---

### List Progress Logs
**Endpoint:** `GET /api/progress-logs`
**Access:** Admin, Teacher (own logs), Student (own logs)
**Description:** List progress logs with role-based scoping

**Query Parameters:**
- `page`, `limit`: Pagination
- `studentId` (optional): Filter by student

---

### Get Progress Log
**Endpoint:** `GET /api/progress-logs/[id]`
**Access:** Admin, Teacher (own log), Student (own log)
**Description:** Get single progress log details

---

### Update Progress Log
**Endpoint:** `PATCH /api/progress-logs/[id]`
**Access:** Teacher (own log only)
**Description:** Update progress log

**Request Body:**
```json
{
  "title": "Updated title (optional)",
  "notes": "Updated notes (optional)",
  "logDate": "2025-10-15T15:00:00Z (optional)"
}
```

---

### Delete Progress Log
**Endpoint:** `DELETE /api/progress-logs/[id]`
**Access:** Teacher (own log only)
**Description:** Permanently delete progress log

---

## Invoices API

### Create Invoice
**Endpoint:** `POST /api/invoices`
**Access:** Admin only
**Description:** Generate invoice for a student

**Request Body:**
```json
{
  "studentId": "student-uuid",
  "amount": 150.00,
  "dueDate": "2025-11-01T00:00:00Z",
  "description": "Monthly tuition - October 2025 (optional)"
}
```

---

### List Invoices
**Endpoint:** `GET /api/invoices`
**Access:** Admin, Teacher (students' invoices), Student (own invoices)
**Description:** List invoices with role-based scoping

**Query Parameters:**
- `page`, `limit`: Pagination
- `studentId` (optional): Filter by student
- `status` (optional): Filter by status (UNPAID/PAID/OVERDUE/PENDING_VERIFICATION)

---

### Get Invoice Details
**Endpoint:** `GET /api/invoices/[id]`
**Access:** Admin, Teacher (student's invoice), Student (own invoice)
**Description:** Get single invoice with payment receipts

---

### Update Invoice
**Endpoint:** `PATCH /api/invoices/[id]`
**Access:** Admin only
**Description:** Update invoice details

**Request Body:**
```json
{
  "amount": 175.00,
  "dueDate": "2025-11-05T00:00:00Z (optional)",
  "description": "Updated description (optional)",
  "status": "PAID (optional)"
}
```

---

### Delete Invoice
**Endpoint:** `DELETE /api/invoices/[id]`
**Access:** Admin only
**Description:** Delete invoice and associated receipts

---

## Payment Receipts API

### Upload Receipt
**Endpoint:** `POST /api/invoices/[id]/upload-receipt`
**Access:** Student only
**Description:** Upload payment receipt for an invoice

**Request Body:**
```json
{
  "fileUrl": "https://storage.supabase.com/...",
  "notes": "Bank transfer reference: ABC123 (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": { /* receipt object */ },
    "invoice": { /* invoice with status=PENDING_VERIFICATION */ }
  },
  "message": "Payment receipt uploaded successfully. Awaiting admin verification."
}
```

---

### List Receipts for Invoice
**Endpoint:** `GET /api/invoices/[id]/upload-receipt`
**Access:** Admin, Teacher (student's invoice), Student (own invoice)
**Description:** List all receipts for an invoice

---

### Verify Payment
**Endpoint:** `POST /api/invoices/[id]/verify-payment`
**Access:** Admin only
**Description:** Approve or reject payment receipt

**Request Body:**
```json
{
  "receiptId": "receipt-uuid",
  "action": "APPROVE or REJECT",
  "rejectionReason": "Required if action=REJECT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receipt": { /* updated receipt */ },
    "invoice": { /* invoice with updated status */ }
  },
  "message": "Payment approved successfully. Invoice marked as paid."
}
```

---

### Get Verification History
**Endpoint:** `GET /api/invoices/[id]/verify-payment`
**Access:** Admin only
**Description:** Get all receipts and verification stats for an invoice

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice": { /* invoice object */ },
    "receipts": [/* all receipts */],
    "pendingCount": 1,
    "approvedCount": 2,
    "rejectedCount": 1
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [/* validation errors if applicable */]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Scoping Summary

| Role    | Students       | Classes        | Progress Logs  | Invoices       |
|---------|----------------|----------------|----------------|----------------|
| Admin   | All            | All            | All            | All            |
| Teacher | Assigned only  | Own only       | Own only       | Students' only |
| Student | Own only       | Own only       | Own only       | Own only       |

---

## Testing with cURL

### Login and get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alshahid.com","password":"Admin123!"}'
```

### Use token in requests:
```bash
# Web (cookie-based) - cookies are set automatically
# Mobile (Bearer token):
curl -X GET http://localhost:3000/api/teachers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Notes

1. All datetime fields use ISO 8601 format
2. File uploads for payment receipts require Supabase integration
3. Soft deletes preserve data (sets status/isActive flags)
4. Hard deletes only for progress logs and payment receipts
5. Pagination defaults: page=1, limit=10-20 depending on endpoint
6. All routes validate input using Zod schemas
7. Transactions ensure data integrity for multi-step operations

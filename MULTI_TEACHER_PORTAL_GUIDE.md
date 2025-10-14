# Multi-Teacher Quran Portal - Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the multi-teacher Quran portal with the following user roles:
- **Admin**: Full system access, manages teachers and all students
- **Teacher**: Manages assigned students only
- **Student/Parent**: Views schedules, progress, and invoices

## Database Schema Completed ✅

The Prisma schema has been updated with all required tables:

### Core Tables
1. **users** - Authentication for all users (admin, teacher, student)
2. **teachers** - Teacher profiles linked to user accounts
3. **students** - Student profiles, can be linked to user accounts
4. **trial_requests** - Public form submissions
5. **classes** - Class scheduling
6. **progress_logs** - Teacher notes on student progress
7. **invoices** - Fee management
8. **payment_receipts** - Receipt uploads for verification

### Key Relationships
- User → Teacher (1:1 for teachers)
- User → Student (1:1 for students with login)
- Teacher → Students (1:many)
- Student → Classes (1:many)
- Student → Invoices (1:many)
- Invoice → PaymentReceipts (1:many)

## Implementation Roadmap

### Phase 1: Foundation (CURRENT)
- [x] Update Prisma schema
- [ ] Run migrations: `npx prisma db push`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Test database connections

### Phase 2: Teacher Management APIs
Create API routes for managing teachers:

#### `/api/teachers` (Admin only)
- `POST` - Create new teacher account
- `GET` - List all teachers
- `PUT /[id]` - Update teacher profile
- `DELETE /[id]` - Deactivate teacher

#### `/api/teachers/[id]/students` (Admin only)
- `GET` - Get students assigned to specific teacher

### Phase 3: Student Management APIs

#### `/api/students` (Admin + Teacher scoped)
- `POST` - Create student (Admin assigns teacher)
- `GET` - List students (Admin: all, Teacher: their students only)
- `PUT /[id]` - Update student info
- `DELETE /[id]` - Deactivate student

#### `/api/students/[id]/assign-teacher` (Admin only)
- `POST` - Assign/reassign student to teacher

#### `/api/students/[id]/convert-from-trial` (Admin only)
- `POST` - Convert trial request to actual student

### Phase 4: Class Scheduling APIs

#### `/api/classes` (Teacher + Student scoped)
- `POST` - Create class schedule (Teacher)
- `GET` - List classes (Teacher: their classes, Student: their classes)
- `PUT /[id]` - Update class
- `DELETE /[id]` - Cancel class

### Phase 5: Progress Tracking APIs

#### `/api/progress-logs` (Teacher + Student scoped)
- `POST` - Add progress log (Teacher only)
- `GET` - View progress logs (Teacher: their students, Student: their own)
- `PUT /[id]` - Update progress log (Teacher only)
- `DELETE /[id]` - Delete progress log (Teacher only)

### Phase 6: Invoice Management APIs

#### `/api/invoices` (Admin, Teacher, Student scoped)
- `POST` - Create invoice (Admin only)
- `GET` - List invoices (scoped by role)
- `PUT /[id]` - Update invoice (Admin only)
- `GET /[id]` - View single invoice

#### `/api/invoices/[id]/upload-receipt` (Student only)
- `POST` - Upload payment receipt

#### `/api/invoices/[id]/verify-payment` (Admin only)
- `POST` - Approve/reject payment receipt

### Phase 7: File Upload with Supabase

#### Setup Supabase Storage
1. Create Supabase project
2. Create storage bucket: `payment-receipts`
3. Set bucket policies (authenticated upload, admin read)
4. Install Supabase client: `npm install @supabase/supabase-js`

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Phase 8: Role-Based Access Control

#### Update Middleware
```typescript
// middleware.ts additions
const adminRoutes = ['/dashboard/teachers', '/dashboard/all-students'];
const teacherRoutes = ['/dashboard/my-students', '/dashboard/classes'];
const studentRoutes = ['/portal/schedule', '/portal/invoices'];

// Check role and route access
if (adminRoutes.some(r => pathname.startsWith(r))) {
  // Verify user.role === 'ADMIN'
}
```

### Phase 9: Dashboard UI Components

#### Admin Dashboard
- **Overview**: Total teachers, students, pending receipts
- **Teachers**: CRUD interface for teacher management
- **All Students**: View/edit/assign all students
- **Trial Requests**: Approve and convert to students
- **Payment Verification**: Review uploaded receipts
- **Invoices**: Generate and manage invoices

#### Teacher Dashboard
- **My Students**: List of assigned students
- **Schedule**: Calendar view of classes
- **Progress Logs**: Add/view student progress
- **Invoices**: View student payment status
- **Classes**: Schedule and manage classes

#### Student Portal
- **My Schedule**: Upcoming classes
- **Progress**: View progress logs from teacher
- **Invoices**: View and pay invoices
- **Upload Receipt**: Upload payment proof

### Phase 10: Key User Flows

#### Flow 1: Trial to Student Conversion
```
1. User submits trial request (public form)
   ↓
2. Admin views in /dashboard/trial-requests
   ↓
3. Admin clicks "Approve & Convert"
   ↓
4. Modal: Enter student details + assign teacher
   ↓
5. Creates: User (role=STUDENT), Student record
   ↓
6. Updates: trial_request.status = 'CONVERTED'
   ↓
7. Student receives login credentials (email)
```

#### Flow 2: Payment Verification
```
1. Admin generates monthly invoice for student
   ↓
2. Student logs in, sees invoice (status=UNPAID)
   ↓
3. Student pays externally (bank transfer)
   ↓
4. Student uploads receipt in portal
   ↓
5. Invoice status → PENDING_VERIFICATION
   ↓
6. Admin gets notification
   ↓
7. Admin reviews receipt and invoice
   ↓
8. Admin clicks Approve → status=PAID
   OR Admin clicks Reject → status=UNPAID
```

#### Flow 3: Teacher Assignment
```
1. Admin views student list
   ↓
2. Clicks "Assign Teacher" on student
   ↓
3. Selects teacher from dropdown
   ↓
4. Student.teacherId updated
   ↓
5. Teacher can now see student in their dashboard
```

## API Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { ...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors if applicable
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Security Considerations

### Role-Based Access
```typescript
// Helper function for API routes
async function checkRole(request: NextRequest, allowedRoles: UserRole[]) {
  const user = await getCurrentUser(request);
  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Usage in API route
export async function GET(request: NextRequest) {
  const user = await checkRole(request, ['ADMIN', 'TEACHER']);
  // ... rest of logic
}
```

### Teacher Data Scoping
```typescript
// Teachers can only access their own students
if (user.role === 'TEACHER') {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id }
  });

  // Scope query to teacher's students only
  where.teacherId = teacher.id;
}
```

### Student Data Scoping
```typescript
// Students can only access their own data
if (user.role === 'STUDENT') {
  const student = await prisma.student.findUnique({
    where: { userId: user.id }
  });

  // Scope query to student's own records
  where.studentId = student.id;
}
```

## File Upload Implementation

### Client-Side Upload Component
```typescript
// components/ReceiptUpload.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function ReceiptUpload({ invoiceId }: { invoiceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${invoiceId}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(fileName);

      // Call API to save receipt record
      await fetch(`/api/invoices/${invoiceId}/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl }),
      });

      alert('Receipt uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload Receipt'}
      </button>
    </div>
  );
}
```

## Testing Checklist

### Database
- [ ] All tables created successfully
- [ ] Relationships working correctly
- [ ] Cascade deletes working as expected
- [ ] Indexes on foreign keys

### Authentication
- [ ] Admin can login
- [ ] Teacher can login
- [ ] Student can login
- [ ] Role-based redirects working

### Authorization
- [ ] Admin can access all routes
- [ ] Teacher can only see their students
- [ ] Student can only see their own data
- [ ] Unauthorized access is blocked

### Core Features
- [ ] Trial request submission works
- [ ] Admin can convert trial to student
- [ ] Admin can assign student to teacher
- [ ] Teacher can view assigned students
- [ ] Teacher can create class schedule
- [ ] Teacher can add progress logs
- [ ] Admin can generate invoices
- [ ] Student can view invoices
- [ ] Student can upload receipt
- [ ] Admin can verify payment
- [ ] File uploads to Supabase work

## Next Steps

1. **Run Database Migration**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

2. **Create Seed Script**
   - Create first admin user
   - Create sample teacher
   - Create sample students
   - Create sample data for testing

3. **Implement Core API Routes**
   - Start with teacher management
   - Then student management
   - Then other features

4. **Build Dashboard UIs**
   - Admin dashboard first
   - Teacher dashboard
   - Student portal

5. **Setup Supabase**
   - Create project
   - Configure storage
   - Add credentials to .env

6. **Testing**
   - Test each user flow
   - Test role-based access
   - Test file uploads

## Migration from Current System

Since you already have:
- ✅ Authentication system
- ✅ Trial requests
- ✅ Contact messages

You need to:
1. Run the new schema migration
2. Keep existing trial_requests data
3. Keep existing contact_messages data
4. Keep existing users (they become admins initially)
5. Create teacher profiles for existing admins if needed

## Questions to Clarify

Before proceeding with full implementation:

1. **Initial Setup**: Should I create all teachers as admin initially?
2. **Student Login**: Do ALL students need login access or just some?
3. **Payment Method**: What payment methods are accepted? (for receipt verification)
4. **Invoice Generation**: Should invoices be auto-generated monthly?
5. **Notifications**: Email notifications needed for what events?
6. **File Storage**: Should we use Supabase or another service?
7. **Teacher Capacity**: Is there a limit on students per teacher?
8. **Class Duration**: Are all classes 30 minutes or variable?

Would you like me to proceed with implementing any specific phase first?

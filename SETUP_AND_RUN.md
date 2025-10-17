# Al-Shahid Multi-Teacher Quran Portal - Setup and Run Guide

## Overview

This is a complete multi-teacher Quran learning portal with three user roles:
- **Admin**: Full system management
- **Teacher**: Manage assigned students, classes, and progress
- **Student**: View schedule, progress, and manage payments

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher)
3. **npm** or **yarn** package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/alshahid_db?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: Supabase (for file uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Setup Database

#### Start PostgreSQL
Make sure PostgreSQL is running on `localhost:5432`

#### Create Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE alshahid_db;
\q
```

Or use a GUI tool like pgAdmin to create the database.

#### Apply Database Schema
```bash
npx prisma db push
```

#### Generate Prisma Client
```bash
npx prisma generate
```

#### Seed Database with Test Data
```bash
npm run db:seed
```

This will create:
- 1 Admin account
- 2 Teacher accounts
- 3 Student accounts (2 with login, 1 without)
- Sample classes, progress logs, invoices, trial requests

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Test Accounts

After running the seed script, use these credentials to login:

### Admin Account
```
Email: admin@alshahid.com
Password: Admin123!
```

### Teacher Accounts
```
Email: ustadh.ahmed@alshahid.com
Password: Teacher123!

Email: ustadh.ibrahim@alshahid.com
Password: Teacher123!
```

### Student Accounts
```
Email: zainab.parent@example.com
Password: Student123!

Email: omar.parent@example.com
Password: Student123!
```

## Features

### Admin Features
- ✅ Manage teachers (create, edit, deactivate)
- ✅ Manage all students
- ✅ Assign students to teachers
- ✅ Convert trial requests to students
- ✅ Generate invoices
- ✅ Verify payment receipts
- ✅ View system-wide statistics

### Teacher Features
- ✅ View assigned students
- ✅ Schedule classes for students
- ✅ Add progress logs
- ✅ Update student information
- ✅ View student invoices and payment status

### Student Features
- ✅ View class schedule
- ✅ View progress history
- ✅ View and pay invoices
- ✅ Upload payment receipts
- ✅ Track payment status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Teachers (Admin only)
- `POST /api/teachers` - Create teacher
- `GET /api/teachers` - List teachers
- `GET /api/teachers/[id]` - Get teacher details
- `PATCH /api/teachers/[id]` - Update teacher
- `DELETE /api/teachers/[id]` - Deactivate teacher

### Students
- `POST /api/students` - Create student (Admin only)
- `GET /api/students` - List students (role-scoped)
- `GET /api/students/[id]` - Get student details
- `PATCH /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Deactivate student (Admin only)
- `POST /api/students/[id]/assign-teacher` - Assign teacher (Admin only)

### Trial Requests
- `POST /api/trial-requests` - Submit trial request (public)
- `GET /api/trial-requests` - List trial requests
- `POST /api/trial-requests/[id]/convert` - Convert to student (Admin only)

### Classes
- `POST /api/classes` - Schedule class (Teacher)
- `GET /api/classes` - List classes (role-scoped)
- `GET /api/classes/[id]` - Get class details
- `PATCH /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Cancel class

### Progress Logs
- `POST /api/progress-logs` - Add progress log (Teacher)
- `GET /api/progress-logs` - List progress logs (role-scoped)
- `GET /api/progress-logs/[id]` - Get progress log
- `PATCH /api/progress-logs/[id]` - Update progress log (Teacher)
- `DELETE /api/progress-logs/[id]` - Delete progress log (Teacher)

### Invoices
- `POST /api/invoices` - Create invoice (Admin only)
- `GET /api/invoices` - List invoices (role-scoped)
- `GET /api/invoices/[id]` - Get invoice details
- `PATCH /api/invoices/[id]` - Update invoice (Admin only)
- `DELETE /api/invoices/[id]` - Delete invoice (Admin only)

### Payment Receipts
- `POST /api/invoices/[id]/upload-receipt` - Upload receipt (Student)
- `GET /api/invoices/[id]/upload-receipt` - List receipts
- `POST /api/invoices/[id]/verify-payment` - Verify payment (Admin)
- `GET /api/invoices/[id]/verify-payment` - Get verification history (Admin)

## Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
```

This opens a browser-based GUI to view and edit database records.

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Run Migrations (Production)
```bash
npx prisma migrate dev --name describe_your_changes
```

## Project Structure

```
alshahid/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── teachers/             # Teacher management
│   │   ├── students/             # Student management
│   │   ├── classes/              # Class scheduling
│   │   ├── progress-logs/        # Progress tracking
│   │   ├── invoices/             # Invoice management
│   │   └── trial-requests/       # Trial request handling
│   ├── dashboard/                # Dashboard pages
│   │   ├── teachers/             # Teacher management UI
│   │   ├── all-students/         # Student management UI
│   │   ├── classes/              # Class scheduling UI
│   │   ├── progress-logs/        # Progress logs UI
│   │   ├── invoices/             # Invoice management UI
│   │   └── payment-verification/ # Payment verification UI
│   └── portal/                   # Student portal pages
├── src/
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard components
│   │   └── ui/                   # Reusable UI components
│   ├── contexts/                 # React contexts (auth, etc.)
│   ├── lib/                      # Utility functions
│   │   ├── prisma.ts             # Prisma client
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── auth.ts               # Password hashing
│   │   └── rbac.ts               # Role-based access control
│   └── pages/                    # Page components
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed script
├── middleware.ts                 # Route protection
├── IMPLEMENTATION_STATUS.md      # Implementation checklist
├── API_ROUTES_REFERENCE.md       # API documentation
└── MULTI_TEACHER_PORTAL_GUIDE.md # Implementation guide
```

## Technology Stack

- **Frontend**: Next.js 15, React 18, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Supabase Storage (optional, for payment receipts)

## Security Features

- ✅ JWT-based authentication
- ✅ HTTP-only cookies for web security
- ✅ Role-based access control (RBAC)
- ✅ Data scoping (teachers only see their students)
- ✅ Password hashing with bcrypt
- ✅ Route protection with middleware
- ✅ SQL injection prevention via Prisma

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma db push         # Apply schema changes
npx prisma generate        # Generate Prisma Client
npm run db:seed            # Seed database

# View database directly
psql -U postgres -d alshahid_db
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check DATABASE_URL in .env file
- Verify database exists: `psql -U postgres -l`

### Prisma Client Not Found
```bash
npx prisma generate
```

### Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

### JWT Token Issues
- Clear browser cookies
- Check JWT_SECRET in .env
- Try logging in again

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Set Environment Variables
Ensure all production environment variables are set:
- DATABASE_URL (production database)
- JWT_SECRET (strong random string)
- NEXT_PUBLIC_SUPABASE_* (if using file uploads)

### 3. Run Database Migrations
```bash
npx prisma migrate deploy
```

### 4. Start Production Server
```bash
npm start
```

## Optional: Supabase Setup for File Uploads

Payment receipt uploads require Supabase Storage:

### 1. Create Supabase Project
- Go to [https://supabase.com](https://supabase.com)
- Create new project
- Copy project URL and anon key

### 2. Create Storage Bucket
- Go to Storage in Supabase dashboard
- Create bucket named `payment-receipts`
- Set policies:
  - Allow authenticated uploads
  - Allow authenticated reads

### 3. Add Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
```

### 4. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

## Support & Documentation

- **Implementation Status**: See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)
- **API Documentation**: See [API_ROUTES_REFERENCE.md](API_ROUTES_REFERENCE.md)
- **Implementation Guide**: See [MULTI_TEACHER_PORTAL_GUIDE.md](MULTI_TEACHER_PORTAL_GUIDE.md)

## License

[Your License Here]

## Contact

[Your Contact Information]

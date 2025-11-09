# TypeScript & Next.js 15 Showcase

This document highlights the best TypeScript examples in this codebase for interview demonstrations.

## 🎯 Best Files for Screenshots

### 1. **lib/types/api.ts** - Advanced Type System
**Lines to highlight**: 1-100, 200-250, 350-400

**What it demonstrates**:
- ✅ Generic types with constraints
- ✅ Discriminated unions (`ApiResponse<T>`)
- ✅ Type guards (`isSuccessResponse`, `isErrorResponse`)
- ✅ Branded types for ID safety (`UserId`, `StudentId`)
- ✅ Utility types (`DeepPartial`, `RequireKeys`, `KeysOfType`)
- ✅ Railway-oriented programming (`Result<T, E>`)
- ✅ Type-safe API response builders
- ✅ Advanced TypeScript patterns

**Key highlights to mention**:
```typescript
// Generic API response with discrimination
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type guard for narrowing
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

// Branded types prevent ID confusion
type Brand<T, B> = T & { [__brand]: B };
export type UserId = Brand<string, 'UserId'>;

// Result type for railway-oriented programming
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

### 2. **lib/services/student.service.ts** - Service Layer Pattern
**Lines to highlight**: 1-150, 200-300

**What it demonstrates**:
- ✅ Clean architecture with service layer
- ✅ Dependency injection
- ✅ Repository pattern
- ✅ Prisma type inference
- ✅ Error handling with Result type
- ✅ Class-based TypeScript
- ✅ Async/await patterns
- ✅ Transaction management

**Key highlights to mention**:
```typescript
// Service class with dependency injection
export class StudentService {
  constructor(private readonly prisma: PrismaClient) {}

  // Type-safe with Result pattern
  async findById(
    studentId: StudentId | string
  ): Promise<Result<StudentWithCounts | null, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.findUnique({
        where: { id: studentId as string },
        include: {
          user: { select: { id: true, email: true } },
          teacher: { include: { user: true } },
          _count: { select: { classes: true } },
        },
      });
    });
  }
}
```

---

### 3. **lib/rbac.ts** - Authentication & Authorization
**Lines to highlight**: 1-82, 125-159

**What it demonstrates**:
- ✅ Type-safe authentication
- ✅ Role-based access control
- ✅ Custom types and interfaces
- ✅ Async/await with proper typing
- ✅ Error handling
- ✅ Prisma integration

**Key highlights to mention**:
```typescript
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

// Type-safe role checking
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}
```

---

### 4. **app/api/invoices/[id]/verify-payment/route.ts** - Next.js 15 API Route
**Lines to highlight**: 1-120

**What it demonstrates**:
- ✅ Next.js 15 route handlers
- ✅ Zod validation with TypeScript
- ✅ Type-safe request/response
- ✅ Database transactions
- ✅ Error handling patterns
- ✅ Business logic implementation

**Key highlights to mention**:
```typescript
// Zod schema for type-safe validation
const verifyPaymentSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
});

// Type-safe route handler with Next.js 15
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(request, ['ADMIN']);
  const { id: invoiceId } = await params;
  const body = await request.json();

  // Validation with type inference
  const validatedData = verifyPaymentSchema.parse(body);

  // Type-safe database operations
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { student: true, trialRequest: true },
  });
}
```

---

### 5. **app/dashboard/students/[id]/page.tsx** - React Component with TypeScript
**Lines to highlight**: 1-80, 150-250

**What it demonstrates**:
- ✅ React with TypeScript
- ✅ Next.js 15 client components
- ✅ Type-safe hooks (useState, useEffect)
- ✅ Interface definitions
- ✅ Async data fetching
- ✅ Type-safe event handlers
- ✅ Component props typing

**Key highlights to mention**:
```typescript
interface StudentDetails {
  id: string;
  fullName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  teacher?: {
    id: string;
    user: { fullName: string };
  };
  classes: Array<{ id: string; status: string }>;
}

export default function StudentDetailsPage() {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentDetails = async () => {
    const response = await fetch(`/api/students/${studentId}`);
    const result: ApiResponse<StudentDetails> = await response.json();

    if (isSuccessResponse(result)) {
      setStudent(result.data);
    }
  };
}
```

---

## 📊 Skills Demonstrated

### TypeScript Features
- [x] Generics with constraints
- [x] Conditional types
- [x] Mapped types
- [x] Template literal types
- [x] Discriminated unions
- [x] Type guards and narrowing
- [x] Branded types
- [x] Utility types
- [x] Type inference
- [x] Advanced patterns (Railway-oriented programming)

### Next.js 15 Features
- [x] App Router
- [x] Server Components
- [x] Client Components
- [x] API Routes with type safety
- [x] Async Route Params
- [x] Middleware
- [x] Dynamic routes

### Architecture Patterns
- [x] Clean Architecture
- [x] Service Layer Pattern
- [x] Repository Pattern
- [x] Dependency Injection
- [x] Error Handling Patterns
- [x] SOLID Principles
- [x] Separation of Concerns

### Database & ORM
- [x] Prisma with TypeScript
- [x] Type-safe queries
- [x] Relations and includes
- [x] Transactions
- [x] Type inference from schema

---

## 🎤 Interview Talking Points

### When showing **lib/types/api.ts**:
> "I implemented a comprehensive type system using advanced TypeScript features. The `ApiResponse<T>` generic type uses discriminated unions with type guards for compile-time safety. I also created branded types to prevent accidentally mixing different ID types, which catches bugs at compile time rather than runtime."

### When showing **lib/services/student.service.ts**:
> "This demonstrates clean architecture with a service layer pattern. I use dependency injection with the Prisma client, and all methods return a `Result` type for railway-oriented programming. This makes error handling explicit and type-safe throughout the application."

### When showing **lib/rbac.ts**:
> "I built a role-based access control system with full type safety. The `requireRole` function uses TypeScript's type system to ensure only authenticated users with proper permissions can access protected routes. It integrates seamlessly with Next.js 15's middleware and API routes."

### When showing API routes:
> "These Next.js 15 API routes use Zod for runtime validation with automatic TypeScript type inference. The validation schema serves as both runtime validation and compile-time type checking, eliminating the need to maintain separate types and validators."

### When showing React components:
> "I use TypeScript extensively in React components with proper interface definitions for props and state. The type system catches errors during development and provides excellent IDE autocomplete, making the code more maintainable."

---

## 📸 Screenshot Recommendations

### Best sections for screenshots:

1. **lib/types/api.ts** (lines 40-120)
   - Shows generic types, discriminated unions, type guards

2. **lib/services/student.service.ts** (lines 1-80)
   - Shows class structure, dependency injection, Result type usage

3. **lib/rbac.ts** (lines 60-95)
   - Shows practical authentication/authorization with types

4. **app/api/invoices/[id]/verify-payment/route.ts** (lines 1-70)
   - Shows Next.js 15 API route with Zod validation

5. **app/dashboard/students/[id]/page.tsx** (lines 24-100)
   - Shows React component with TypeScript interfaces

---

## 💡 Key Strengths to Emphasize

1. **Type Safety**: Every API, service, and component is fully typed
2. **Error Handling**: Consistent Result/ApiResponse patterns
3. **Scalability**: Service layer allows easy testing and extension
4. **Modern Patterns**: Railway-oriented programming, branded types
5. **Best Practices**: SOLID, DRY, separation of concerns
6. **Production Ready**: Complete error handling, validation, logging

---

## 🔗 File Locations

- Advanced Types: `lib/types/api.ts`
- Service Layer: `lib/services/student.service.ts`
- RBAC System: `lib/rbac.ts`
- API Example: `app/api/invoices/[id]/verify-payment/route.ts`
- Component Example: `app/dashboard/students/[id]/page.tsx`

---

**Generated**: 2025-01-04 for interview showcase purposes

/**
 * API Types and Response Handlers
 * Demonstrates TypeScript generics, type utilities, and type-safe API responses
 */

import { NextResponse } from 'next/server';

// ============================================================================
// Base Types
// ============================================================================

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'OVERDUE' | 'PENDING_VERIFICATION' | 'CANCELLED';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL';

export type ClassStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// ============================================================================
// Generic API Response Types
// ============================================================================

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Generic API response type
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Create a success response with type safety
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: unknown,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
      code,
    },
    { status }
  );
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  status: number = 200
): NextResponse<ApiSuccessResponse<PaginatedResponse<T>>> {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return NextResponse.json(
    {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

// ============================================================================
// Domain-Specific Types
// ============================================================================

/**
 * User profile with type safety
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Student with optional relations
 */
export interface StudentDto {
  id: string;
  fullName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  age: number | null;
  status: StudentStatus;
  createdAt: Date | string;
  teacher?: {
    id: string;
    user: {
      fullName: string | null;
      email: string;
    };
  };
  user?: {
    id: string;
    email: string;
    fullName: string | null;
  };
  _count?: {
    classes: number;
    invoices: number;
    progressLogs: number;
  };
}

/**
 * Invoice with relations
 */
export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  invoiceType: 'ENROLLMENT' | 'MONTHLY' | 'OTHER';
  amount: string | number;
  currency: string;
  status: InvoiceStatus;
  dueDate: Date | string;
  issueDate: Date | string;
  student?: {
    id: string;
    fullName: string;
  } | null;
  trialRequest?: {
    id: string;
    studentName: string;
    contactEmail: string;
  } | null;
  paymentReceipts?: PaymentReceiptDto[];
}

/**
 * Payment receipt
 */
export interface PaymentReceiptDto {
  id: string;
  invoiceId: string;
  fileUrl: string;
  uploadedBy: string | null;
  uploadedAt: Date | string;
  verificationStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  verifiedAt: Date | string | null;
  rejectionReason: string | null;
  notes: string | null;
}

// ============================================================================
// Request Body Types
// ============================================================================

/**
 * Generic request body with validation
 */
export interface CreateStudentRequest {
  fullName: string;
  age?: number;
  contactPhone?: string;
  contactEmail?: string;
  teacherId: string;
  createLoginAccount?: boolean;
  email?: string;
  password?: string;
  status?: StudentStatus;
}

/**
 * Update student request
 */
export interface UpdateStudentRequest {
  fullName?: string;
  age?: number;
  contactEmail?: string;
  contactPhone?: string;
  status?: StudentStatus;
  teacherId?: string;
}

/**
 * Payment verification request
 */
export interface VerifyPaymentRequest {
  receiptId: string;
  approved: boolean;
  rejectionReason?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract keys of T where value type extends U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Make specific keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Recursive partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Prisma-style select type
 */
export type SelectFields<T> = {
  [K in keyof T]?: boolean | SelectFields<T[K]>;
};

// ============================================================================
// Query Parameter Types
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
}

/**
 * Extract and validate pagination from URL search params
 */
export function extractPaginationParams(
  searchParams: URLSearchParams
): Required<PaginationParams> {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  return { page, limit, sortBy, sortOrder };
}

// ============================================================================
// Branded Types for ID Safety
// ============================================================================

/**
 * Branded type to prevent mixing different ID types
 */
declare const __brand: unique symbol;
type Brand<T, B> = T & { [__brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type StudentId = Brand<string, 'StudentId'>;
export type TeacherId = Brand<string, 'TeacherId'>;
export type InvoiceId = Brand<string, 'InvoiceId'>;

/**
 * Create a branded ID with runtime validation
 */
export function createUserId(id: string): UserId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID');
  }
  return id as UserId;
}

export function createStudentId(id: string): StudentId {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid student ID');
  }
  return id as StudentId;
}

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Validation result discriminated union
 */
export type ValidationResult<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Parse and validate with type safety
 */
export function validateOrThrow<T>(
  result: ValidationResult<T>
): asserts result is { success: true; data: T } {
  if (!result.success) {
    throw new Error(result.error);
  }
}

// ============================================================================
// Async Result Type (Railway-Oriented Programming)
// ============================================================================

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Wrap async operations in Result type
 */
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

/**
 * Map Result value if ok
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? { ok: true, value: fn(result.value) } : result;
}

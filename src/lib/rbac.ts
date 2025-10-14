import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from './prisma';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const authHeader = request.headers.get('Authorization');
    const token = accessToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get full user details from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName || undefined,
    };
  } catch (error) {
    console.error('Get authenticated user error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
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

/**
 * Get teacher ID for authenticated teacher
 */
export async function getTeacherId(userId: string): Promise<string | null> {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    select: { id: true },
  });

  return teacher?.id || null;
}

/**
 * Get student ID for authenticated student
 */
export async function getStudentId(userId: string): Promise<string | null> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  return student?.id || null;
}

/**
 * Check if teacher owns student
 */
export async function teacherOwnsStudent(
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { teacherId: true },
  });

  return student?.teacherId === teacherId;
}

/**
 * Apply role-based data scoping to Prisma where clause
 */
export async function applyScopeToStudents(
  user: AuthenticatedUser,
  baseWhere: any = {}
): Promise<any> {
  if (user.role === 'ADMIN') {
    // Admin sees all students
    return baseWhere;
  }

  if (user.role === 'TEACHER') {
    // Teacher sees only their students
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      throw new Error('Teacher profile not found');
    }
    return {
      ...baseWhere,
      teacherId,
    };
  }

  if (user.role === 'STUDENT') {
    // Student sees only themselves
    const studentId = await getStudentId(user.id);
    if (!studentId) {
      throw new Error('Student profile not found');
    }
    return {
      ...baseWhere,
      id: studentId,
    };
  }

  return baseWhere;
}

/**
 * Apply role-based data scoping to classes
 */
export async function applyScopeToClasses(
  user: AuthenticatedUser,
  baseWhere: any = {}
): Promise<any> {
  if (user.role === 'ADMIN') {
    return baseWhere;
  }

  if (user.role === 'TEACHER') {
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      throw new Error('Teacher profile not found');
    }
    return {
      ...baseWhere,
      teacherId,
    };
  }

  if (user.role === 'STUDENT') {
    const studentId = await getStudentId(user.id);
    if (!studentId) {
      throw new Error('Student profile not found');
    }
    return {
      ...baseWhere,
      studentId,
    };
  }

  return baseWhere;
}

/**
 * Apply role-based data scoping to invoices
 */
export async function applyScopeToInvoices(
  user: AuthenticatedUser,
  baseWhere: any = {}
): Promise<any> {
  if (user.role === 'ADMIN') {
    return baseWhere;
  }

  if (user.role === 'TEACHER') {
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      throw new Error('Teacher profile not found');
    }
    return {
      ...baseWhere,
      teacherId,
    };
  }

  if (user.role === 'STUDENT') {
    const studentId = await getStudentId(user.id);
    if (!studentId) {
      throw new Error('Student profile not found');
    }
    return {
      ...baseWhere,
      studentId,
    };
  }

  return baseWhere;
}

/**
 * Student Service Layer
 * Demonstrates clean architecture, dependency injection, and separation of concerns
 */

import { Prisma, PrismaClient, StudentStatus } from '@prisma/client';
import {
  StudentDto,
  Result,
  tryCatch,
  PaginationParams,
  StudentId,
  TeacherId,
  UserId,
} from '@/lib/types/api';

// ============================================================================
// Service Types
// ============================================================================

/**
 * Student creation data
 */
export interface CreateStudentData {
  fullName: string;
  age?: number;
  contactPhone?: string;
  contactEmail?: string;
  teacherId: string;
  userId?: string;
  status?: StudentStatus;
}

/**
 * Student update data
 */
export interface UpdateStudentData {
  fullName?: string;
  age?: number;
  contactEmail?: string;
  contactPhone?: string;
  status?: StudentStatus;
  teacherId?: string;
}

/**
 * Student query filters
 */
export interface StudentFilters {
  status?: StudentStatus;
  teacherId?: string;
  search?: string;
}

/**
 * Student with count relations
 */
export type StudentWithCounts = Prisma.StudentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        fullName: true;
      };
    };
    teacher: {
      include: {
        user: {
          select: {
            fullName: true;
            email: true;
          };
        };
      };
    };
    _count: {
      select: {
        classes: true;
        invoices: true;
        progressLogs: true;
      };
    };
  };
}>;

// ============================================================================
// Student Service Class
// ============================================================================

/**
 * Service for managing student operations
 * Implements repository pattern with clean separation of concerns
 */
export class StudentService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find student by ID with full details
   */
  async findById(
    studentId: StudentId | string
  ): Promise<Result<StudentWithCounts | null, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.findUnique({
        where: { id: studentId as string },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              invoices: true,
              progressLogs: true,
            },
          },
        },
      });
    });
  }

  /**
   * Find student by user ID
   */
  async findByUserId(userId: UserId | string): Promise<Result<StudentWithCounts | null, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.findUnique({
        where: { userId: userId as string },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              invoices: true,
              progressLogs: true,
            },
          },
        },
      });
    });
  }

  /**
   * Find students with pagination and filtering
   */
  async findMany(
    filters: StudentFilters,
    pagination: PaginationParams
  ): Promise<Result<{ students: StudentWithCounts[]; total: number }, Error>> {
    return tryCatch(async () => {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.StudentWhereInput = {
        ...(filters.status && { status: filters.status }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
        ...(filters.search && {
          OR: [
            { fullName: { contains: filters.search, mode: 'insensitive' } },
            { contactEmail: { contains: filters.search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: filters.search, mode: 'insensitive' },
              },
            },
          ],
        }),
      };

      // Execute queries in parallel
      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                classes: true,
                invoices: true,
                progressLogs: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        this.prisma.student.count({ where }),
      ]);

      return { students, total };
    });
  }

  /**
   * Create a new student
   */
  async create(data: CreateStudentData): Promise<Result<StudentWithCounts, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.create({
        data: {
          fullName: data.fullName,
          age: data.age,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          teacherId: data.teacherId,
          userId: data.userId,
          status: data.status || 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              invoices: true,
              progressLogs: true,
            },
          },
        },
      });
    });
  }

  /**
   * Update student
   */
  async update(
    studentId: StudentId | string,
    data: UpdateStudentData
  ): Promise<Result<StudentWithCounts, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.update({
        where: { id: studentId as string },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.age !== undefined && { age: data.age }),
          ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
          ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.teacherId !== undefined && { teacherId: data.teacherId }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              classes: true,
              invoices: true,
              progressLogs: true,
            },
          },
        },
      });
    });
  }

  /**
   * Soft delete student (mark as inactive)
   */
  async deactivate(studentId: StudentId | string): Promise<Result<StudentWithCounts, Error>> {
    return this.update(studentId, { status: 'INACTIVE' });
  }

  /**
   * Hard delete student and all related data
   */
  async delete(studentId: StudentId | string): Promise<Result<void, Error>> {
    return tryCatch(async () => {
      await this.prisma.$transaction(async (tx) => {
        // Delete in correct order to maintain referential integrity
        await tx.progressLog.deleteMany({ where: { studentId: studentId as string } });
        await tx.class.deleteMany({ where: { studentId: studentId as string } });

        // Delete invoices and their receipts
        const invoices = await tx.invoice.findMany({
          where: { studentId: studentId as string },
          select: { id: true },
        });

        for (const invoice of invoices) {
          await tx.paymentReceipt.deleteMany({ where: { invoiceId: invoice.id } });
        }

        await tx.invoice.deleteMany({ where: { studentId: studentId as string } });

        // Finally delete the student
        await tx.student.delete({ where: { id: studentId as string } });
      });
    });
  }

  /**
   * Get students by teacher
   */
  async findByTeacher(
    teacherId: TeacherId | string,
    pagination: PaginationParams
  ): Promise<Result<{ students: StudentWithCounts[]; total: number }, Error>> {
    return this.findMany({ teacherId: teacherId as string }, pagination);
  }

  /**
   * Get active students count
   */
  async getActiveCount(): Promise<Result<number, Error>> {
    return tryCatch(async () => {
      return await this.prisma.student.count({
        where: { status: 'ACTIVE' },
      });
    });
  }

  /**
   * Check if student exists
   */
  async exists(studentId: StudentId | string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const count = await this.prisma.student.count({
        where: { id: studentId as string },
      });
      return count > 0;
    });
  }

  /**
   * Check if email is already in use
   */
  async emailExists(email: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const count = await this.prisma.student.count({
        where: {
          OR: [
            { contactEmail: email },
            { user: { email } },
          ],
        },
      });
      return count > 0;
    });
  }

  /**
   * Bulk update student status
   */
  async bulkUpdateStatus(
    studentIds: (StudentId | string)[],
    status: StudentStatus
  ): Promise<Result<number, Error>> {
    return tryCatch(async () => {
      const result = await this.prisma.student.updateMany({
        where: { id: { in: studentIds as string[] } },
        data: { status },
      });
      return result.count;
    });
  }

  /**
   * Transfer students to another teacher
   */
  async transferToTeacher(
    studentIds: (StudentId | string)[],
    newTeacherId: TeacherId | string
  ): Promise<Result<number, Error>> {
    return tryCatch(async () => {
      const result = await this.prisma.student.updateMany({
        where: { id: { in: studentIds as string[] } },
        data: { teacherId: newTeacherId as string },
      });
      return result.count;
    });
  }

  /**
   * Get student statistics
   */
  async getStatistics(): Promise<
    Result<
      {
        total: number;
        active: number;
        inactive: number;
        trial: number;
        withLoginAccount: number;
      },
      Error
    >
  > {
    return tryCatch(async () => {
      const [total, active, inactive, trial, withLoginAccount] = await Promise.all([
        this.prisma.student.count(),
        this.prisma.student.count({ where: { status: 'ACTIVE' } }),
        this.prisma.student.count({ where: { status: 'INACTIVE' } }),
        this.prisma.student.count({ where: { status: 'TRIAL' } }),
        this.prisma.student.count({ where: { userId: { not: null } } }),
      ]);

      return {
        total,
        active,
        inactive,
        trial,
        withLoginAccount,
      };
    });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new student service instance
 */
export function createStudentService(prisma: PrismaClient): StudentService {
  return new StudentService(prisma);
}

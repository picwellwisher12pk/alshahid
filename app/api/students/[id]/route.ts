import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, applyScopeToStudents } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for updating a student
const updateStudentSchema = z.object({
  fullName: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRIAL']).optional(),
  teacherId: z.string().optional(),
});

// GET /api/students/[id] - Get single student details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { id: studentId } = await params;

    // Build query with role-based scoping
    const whereClause = await applyScopeToStudents(user, { id: studentId });

    const student = await prisma.student.findFirst({
      where: whereClause,
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
        classes: {
          where: {
            status: {
              in: ['SCHEDULED', 'COMPLETED'],
            },
          },
          orderBy: {
            classTime: 'desc',
          },
          take: 5,
        },
        invoices: {
          orderBy: {
            dueDate: 'desc',
          },
          take: 5,
        },
        progressLogs: {
          orderBy: {
            logDate: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (error: any) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch student' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PATCH /api/students/[id] - Update student details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);
    const { id: studentId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateStudentSchema.parse(body);

    // Build query with role-based scoping
    const whereClause = await applyScopeToStudents(user, { id: studentId });

    // Check if student exists and user has access
    const existingStudent = await prisma.student.findFirst({
      where: whereClause,
    });

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found or access denied' },
        { status: 404 }
      );
    }

    // Teachers cannot change teacherId (only admin can reassign)
    if (user.role === 'TEACHER' && validatedData.teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teachers cannot reassign students. Contact admin.' },
        { status: 403 }
      );
    }

    // If changing teacher, verify new teacher exists
    if (validatedData.teacherId) {
      const newTeacher = await prisma.teacher.findUnique({
        where: { id: validatedData.teacherId },
      });
      if (!newTeacher || !newTeacher.isActive) {
        return NextResponse.json(
          { success: false, error: 'Invalid or inactive teacher' },
          { status: 400 }
        );
      }
    }

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(validatedData.fullName && { fullName: validatedData.fullName }),
        ...(validatedData.age !== undefined && { age: validatedData.age }),
        ...(validatedData.contactEmail && { contactEmail: validatedData.contactEmail }),
        ...(validatedData.contactPhone !== undefined && {
          contactPhone: validatedData.contactPhone,
        }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.teacherId && { teacherId: validatedData.teacherId }),
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
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully',
    });
  } catch (error: any) {
    console.error('Update student error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE /api/students/[id] - Deactivate a student (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id: studentId } = await params;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Soft delete: Update status to INACTIVE
    const deactivatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        status: 'INACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student deactivated successfully',
      data: deactivatedStudent,
    });
  } catch (error: any) {
    console.error('Deactivate student error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to deactivate student' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

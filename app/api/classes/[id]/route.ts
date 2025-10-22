import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for updating a class
const updateClassSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

// GET /api/classes/[id] - Get single class details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { id: classId } = await params;

    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            status: true,
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

    if (!classRecord) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Authorization: Check if user has access to this class
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher || classRecord.teacherId !== teacher.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student || classRecord.studentId !== student.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: classRecord,
    });
  } catch (error: any) {
    console.error('Get class error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch class' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PATCH /api/classes/[id] - Update class details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);
    const { id: classId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateClassSchema.parse(body);

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Authorization: Teachers can only update their own classes
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher || existingClass.teacherId !== teacher.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(validatedData.scheduledAt && {
          scheduledAt: new Date(validatedData.scheduledAt),
        }),
        ...(validatedData.duration !== undefined && {
          duration: validatedData.duration,
        }),
        ...(validatedData.status && {
          status: validatedData.status,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            status: true,
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
      data: updatedClass,
      message: 'Class updated successfully',
    });
  } catch (error: any) {
    console.error('Update class error:', error);

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
      { success: false, error: error.message || 'Failed to update class' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE /api/classes/[id] - Cancel a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);
    const { id: classId } = await params;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Authorization: Teachers can only cancel their own classes
    if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher || existingClass.teacherId !== teacher.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Soft delete: Update status to CANCELLED instead of hard delete
    const cancelledClass = await prisma.class.update({
      where: { id: classId },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Class cancelled successfully',
      data: cancelledClass,
    });
  } catch (error: any) {
    console.error('Cancel class error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel class' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

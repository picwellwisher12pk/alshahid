import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, getTeacherId } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for updating a progress log
const updateProgressLogSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  notes: z.string().min(1).optional(),
  logDate: z.string().datetime().optional(),
});

// GET /api/progress-logs/[id] - Get single progress log
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const logId = params.id;

    const progressLog = await prisma.progressLog.findUnique({
      where: { id: logId },
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

    if (!progressLog) {
      return NextResponse.json(
        { success: false, error: 'Progress log not found' },
        { status: 404 }
      );
    }

    // Authorization: Check if user has access to this progress log
    if (user.role === 'TEACHER') {
      const teacherId = await getTeacherId(user.id);
      if (!teacherId || progressLog.teacherId !== teacherId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student || progressLog.studentId !== student.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: progressLog,
    });
  } catch (error: any) {
    console.error('Get progress log error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch progress log' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PATCH /api/progress-logs/[id] - Update progress log (Teacher only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['TEACHER']);
    const logId = params.id;
    const body = await request.json();

    // Validate request body
    const validatedData = updateProgressLogSchema.parse(body);

    // Get teacher ID
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Check if progress log exists and belongs to this teacher
    const existingLog = await prisma.progressLog.findUnique({
      where: { id: logId },
    });

    if (!existingLog) {
      return NextResponse.json(
        { success: false, error: 'Progress log not found' },
        { status: 404 }
      );
    }

    if (existingLog.teacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own progress logs' },
        { status: 403 }
      );
    }

    // Update the progress log
    const updatedLog = await prisma.progressLog.update({
      where: { id: logId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.notes && { notes: validatedData.notes }),
        ...(validatedData.logDate && {
          logDate: new Date(validatedData.logDate),
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
      data: updatedLog,
      message: 'Progress log updated successfully',
    });
  } catch (error: any) {
    console.error('Update progress log error:', error);

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
      { success: false, error: error.message || 'Failed to update progress log' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE /api/progress-logs/[id] - Delete progress log (Teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['TEACHER']);
    const logId = params.id;

    // Get teacher ID
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Check if progress log exists and belongs to this teacher
    const existingLog = await prisma.progressLog.findUnique({
      where: { id: logId },
    });

    if (!existingLog) {
      return NextResponse.json(
        { success: false, error: 'Progress log not found' },
        { status: 404 }
      );
    }

    if (existingLog.teacherId !== teacherId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own progress logs' },
        { status: 403 }
      );
    }

    // Hard delete the progress log
    await prisma.progressLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({
      success: true,
      message: 'Progress log deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete progress log error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete progress log' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

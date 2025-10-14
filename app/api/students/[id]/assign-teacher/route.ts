import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { requireRole } from '@/src/lib/rbac';

const assignTeacherSchema = z.object({
  teacherId: z.string(),
});

// POST - Assign or reassign student to teacher (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id: studentId } = await params;

    const body = await request.json();
    const validation = assignTeacherSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { teacherId } = validation.data;

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Verify student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Update student's teacher
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { teacherId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        teacher: {
          select: {
            id: true,
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
      message: `Student ${existingStudent.teacher ? 'reassigned' : 'assigned'} to teacher successfully`,
      data: student,
      previousTeacher: existingStudent.teacher?.user.fullName || null,
      newTeacher: student.teacher?.user.fullName || null,
    });
  } catch (error: any) {
    console.error('Assign teacher error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';

const updateTeacherSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get single teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);
    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
          },
        },
        students: {
          select: {
            id: true,
            fullName: true,
            status: true,
          },
        },
        _count: {
          select: {
            students: true,
            classes: true,
            progressLogs: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: teacher });
  } catch (error: any) {
    console.error('Get teacher error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update teacher
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id } = await params;

    const body = await request.json();
    const validation = updateTeacherSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, bio, profilePictureUrl, isActive } = validation.data;

    const teacher = await prisma.$transaction(async (tx) => {
      // Update teacher profile
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          bio,
          profilePictureUrl,
          isActive,
        },
      });

      // Update user if fullName provided
      if (fullName) {
        await tx.user.update({
          where: { id: updatedTeacher.userId },
          data: { fullName },
        });
      }

      // Fetch complete teacher data
      return tx.teacher.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error: any) {
    console.error('Update teacher error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id } = await params;

    // Deactivate instead of delete
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Teacher deactivated successfully',
      data: teacher,
    });
  } catch (error: any) {
    console.error('Deactivate teacher error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

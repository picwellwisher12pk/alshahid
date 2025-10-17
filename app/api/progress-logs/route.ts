import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, getTeacherId } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for creating a progress log
const createProgressLogSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  notes: z.string().min(1, 'Notes are required'),
  logDate: z.string().datetime().optional(), // Defaults to now if not provided
});

// POST /api/progress-logs - Create a new progress log (Teacher only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['TEACHER']);
    const body = await request.json();

    // Validate request body
    const validatedData = createProgressLogSchema.parse(body);

    // Get teacher ID
    const teacherId = await getTeacherId(user.id);
    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Verify student exists and belongs to this teacher
    const student = await prisma.student.findFirst({
      where: {
        id: validatedData.studentId,
        teacherId: teacherId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Create the progress log
    const progressLog = await prisma.progressLog.create({
      data: {
        studentId: validatedData.studentId,
        teacherId: teacherId,
        title: validatedData.title,
        notes: validatedData.notes,
        logDate: validatedData.logDate
          ? new Date(validatedData.logDate)
          : new Date(),
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: progressLog,
        message: 'Progress log created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create progress log error:', error);

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
      { success: false, error: error.message || 'Failed to create progress log' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// GET /api/progress-logs - List progress logs (scoped by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Filters
    const studentId = searchParams.get('studentId');

    // Build where clause based on role
    let whereClause: any = {};

    if (user.role === 'TEACHER') {
      const teacherId = await getTeacherId(user.id);
      if (!teacherId) {
        return NextResponse.json(
          { success: false, error: 'Teacher profile not found' },
          { status: 404 }
        );
      }
      whereClause.teacherId = teacherId;
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student profile not found' },
          { status: 404 }
        );
      }
      whereClause.studentId = student.id;
    }

    // Apply student filter if provided
    if (studentId) {
      // Verify access to this student
      if (user.role === 'TEACHER') {
        const teacherId = await getTeacherId(user.id);
        const student = await prisma.student.findFirst({
          where: {
            id: studentId,
            teacherId: teacherId,
          },
        });
        if (!student) {
          return NextResponse.json(
            { success: false, error: 'Student not found or access denied' },
            { status: 403 }
          );
        }
      }
      whereClause.studentId = studentId;
    }

    // Fetch progress logs with pagination
    const [progressLogs, total] = await Promise.all([
      prisma.progressLog.findMany({
        where: whereClause,
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
        orderBy: {
          logDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.progressLog.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: progressLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List progress logs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch progress logs' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

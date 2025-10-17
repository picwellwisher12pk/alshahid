import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole, applyScopeToClasses, getTeacherId } from '@/lib/rbac';

const createClassSchema = z.object({
  studentId: z.string(),
  classTime: z.string().datetime(),
  durationMinutes: z.number().int().positive().default(30),
  notes: z.string().optional(),
});

// POST - Create class (Teacher + Admin)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);

    const body = await request.json();
    const validation = createClassSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { studentId, classTime, durationMinutes, notes } = validation.data;

    // Get teacher ID
    let teacherId: string;
    if (user.role === 'TEACHER') {
      const tid = await getTeacherId(user.id);
      if (!tid) throw new Error('Teacher profile not found');
      teacherId = tid;

      // Verify teacher owns student
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { teacherId: true },
      });

      if (student?.teacherId !== teacherId) {
        return NextResponse.json(
          { error: 'Forbidden: Student not assigned to you' },
          { status: 403 }
        );
      }
    } else {
      // Admin: get teacher from student
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { teacherId: true },
      });

      if (!student?.teacherId) {
        return NextResponse.json(
          { error: 'Student must be assigned to a teacher first' },
          { status: 400 }
        );
      }
      teacherId = student.teacherId;
    }

    const classRecord = await prisma.class.create({
      data: {
        studentId,
        teacherId,
        classTime: new Date(classTime),
        durationMinutes,
        notes,
        status: 'SCHEDULED',
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
          },
        },
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

    return NextResponse.json(
      {
        message: 'Class scheduled successfully',
        data: classRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create class error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List classes (scoped by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    const skip = (page - 1) * limit;

    let where: any = {};

    if (status) {
      where.status = status;
    }

    if (studentId && user.role === 'ADMIN') {
      where.studentId = studentId;
    }

    where = await applyScopeToClasses(user, where);

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
            },
          },
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
        orderBy: { classTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.class.count({ where }),
    ]);

    return NextResponse.json({
      data: classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get classes error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

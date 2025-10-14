import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/auth';
import { requireRole, applyScopeToStudents } from '@/src/lib/rbac';

const createStudentSchema = z.object({
  fullName: z.string().min(2),
  age: z.number().int().positive().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  teacherId: z.string(), // Admin assigns teacher
  createLoginAccount: z.boolean().default(false),
  email: z.string().email().optional(), // Required if createLoginAccount true
  password: z.string().min(8).optional(), // Required if createLoginAccount true
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRIAL']).default('ACTIVE'),
});

// POST - Create student (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN']);

    const body = await request.json();
    const validation = createStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, age, contactPhone, contactEmail, teacherId, createLoginAccount, email, password, status } = validation.data;

    // Validate teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // If creating login account, validate email and password
    if (createLoginAccount && (!email || !password)) {
      return NextResponse.json(
        { error: 'Email and password required for login account' },
        { status: 400 }
      );
    }

    let student;

    if (createLoginAccount && email && password) {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Create user and student in transaction
      const hashedPassword = await hashPassword(password);

      student = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            fullName,
            password: hashedPassword,
            role: 'STUDENT',
            emailVerified: true,
          },
        });

        return tx.student.create({
          data: {
            userId: newUser.id,
            fullName,
            age,
            contactPhone,
            contactEmail: contactEmail || email,
            teacherId,
            status,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
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
      });
    } else {
      // Create student without login account
      student = await prisma.student.create({
        data: {
          fullName,
          age,
          contactPhone,
          contactEmail,
          teacherId,
          status,
        },
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
    }

    return NextResponse.json(
      {
        message: 'Student created successfully',
        data: student,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create student error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List students (scoped by role)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');
    const skip = (page - 1) * limit;

    let where: any = {};

    // Apply status filter
    if (status) {
      where.status = status;
    }

    // Admin can filter by teacher, teacher automatically scoped
    if (teacherId && user.role === 'ADMIN') {
      where.teacherId = teacherId;
    }

    // Apply role-based scoping
    where = await applyScopeToStudents(user, where);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          _count: {
            select: {
              classes: true,
              invoices: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get students error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

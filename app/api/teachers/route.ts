import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { requireRole } from '@/lib/rbac';

const createTeacherSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  bio: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
});

// POST - Create new teacher (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN']);

    const body = await request.json();
    const validation = createTeacherSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, fullName, password, bio, profilePictureUrl } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user and teacher profile in transaction
    const hashedPassword = await hashPassword(password);

    const teacher = await prisma.$transaction(async (tx) => {
      // Create user account
      const newUser = await tx.user.create({
        data: {
          email,
          fullName,
          password: hashedPassword,
          role: 'TEACHER',
          emailVerified: true,
        },
      });

      // Create teacher profile
      const newTeacher = await tx.teacher.create({
        data: {
          userId: newUser.id,
          bio,
          profilePictureUrl,
        },
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
        },
      });

      return newTeacher;
    });

    return NextResponse.json(
      {
        message: 'Teacher created successfully',
        data: teacher,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create teacher error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List all teachers (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isActive = searchParams.get('isActive');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
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
          _count: {
            select: {
              students: true,
              classes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.teacher.count({ where }),
    ]);

    return NextResponse.json({
      data: teachers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get teachers error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

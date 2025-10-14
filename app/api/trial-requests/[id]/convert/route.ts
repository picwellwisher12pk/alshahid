import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/auth';
import { requireRole } from '@/src/lib/rbac';

const convertTrialSchema = z.object({
  teacherId: z.string(),
  createLoginAccount: z.boolean().default(true),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  status: z.enum(['ACTIVE', 'TRIAL']).default('TRIAL'),
});

// POST - Convert trial request to actual student (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id: trialRequestId } = await params;

    const body = await request.json();
    const validation = convertTrialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { teacherId, createLoginAccount, email, password, status } = validation.data;

    // Get trial request
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id: trialRequestId },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }

    if (trialRequest.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Trial request already converted' },
        { status: 400 }
      );
    }

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

    // If creating login, validate credentials
    if (createLoginAccount && (!email || !password)) {
      return NextResponse.json(
        { error: 'Email and password required for login account' },
        { status: 400 }
      );
    }

    // Create student and update trial request in transaction
    const result = await prisma.$transaction(async (tx) => {
      let newStudent;

      if (createLoginAccount && email && password) {
        // Check if email exists
        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const hashedPassword = await hashPassword(password);

        // Create user account
        const newUser = await tx.user.create({
          data: {
            email,
            fullName: trialRequest.studentName,
            password: hashedPassword,
            role: 'STUDENT',
            emailVerified: true,
          },
        });

        // Create student with user link
        newStudent = await tx.student.create({
          data: {
            userId: newUser.id,
            fullName: trialRequest.studentName,
            age: trialRequest.studentAge || undefined,
            contactPhone: trialRequest.contactPhone || undefined,
            contactEmail: trialRequest.contactEmail,
            teacherId,
            status,
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
      } else {
        // Create student without login
        newStudent = await tx.student.create({
          data: {
            fullName: trialRequest.studentName,
            age: trialRequest.studentAge || undefined,
            contactPhone: trialRequest.contactPhone || undefined,
            contactEmail: trialRequest.contactEmail,
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

      // Update trial request status
      const updatedTrialRequest = await tx.trialRequest.update({
        where: { id: trialRequestId },
        data: { status: 'CONVERTED' },
      });

      return { student: newStudent, trialRequest: updatedTrialRequest };
    });

    return NextResponse.json({
      message: 'Trial request converted to student successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Convert trial error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === 'User with this email already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

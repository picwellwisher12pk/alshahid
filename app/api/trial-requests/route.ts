import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const trialRequestSchema = z.object({
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  course: z.string().min(1, 'Course is required'),
  preferredTime: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// POST - Create new trial request (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = trialRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Create trial request - map fields to match Prisma schema
    const trialRequest = await prisma.trialRequest.create({
      data: {
        requesterName: validation.data.parentName,
        studentName: validation.data.studentName,
        contactEmail: validation.data.email,
        contactPhone: validation.data.phone,
        courseName: validation.data.course, // Save course name
        preferredTime: validation.data.preferredTime,
        additionalNotes: validation.data.additionalNotes,
      },
    });

    return NextResponse.json(
      {
        message: 'Trial request submitted successfully',
        data: trialRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create trial request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all trial requests (protected endpoint)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const authHeader = request.headers.get('Authorization');
    const token = accessToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Get trial requests
    const [trialRequests, total] = await Promise.all([
      prisma.trialRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.trialRequest.count({ where }),
    ]);

    return NextResponse.json({
      data: trialRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get trial requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

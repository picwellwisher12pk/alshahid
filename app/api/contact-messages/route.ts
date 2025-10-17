import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// POST - Create new contact message (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = contactMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: validation.data,
    });

    return NextResponse.json(
      {
        message: 'Contact message submitted successfully',
        data: contactMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all contact messages (protected endpoint)
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

    // Get contact messages
    const [contactMessages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      data: contactMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

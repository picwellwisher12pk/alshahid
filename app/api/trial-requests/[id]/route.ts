import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const updateTrialRequestSchema = z.object({
  status: z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'CONVERTED', 'CANCELLED']).optional(),
});

// Authentication helper
async function authenticate(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const authHeader = request.headers.get('Authorization');
  const token = accessToken || authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// GET - Get single trial request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: trialRequest });
  } catch (error) {
    console.error('Get trial request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update trial request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateTrialRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id } = await params;
    const trialRequest = await prisma.trialRequest.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      message: 'Trial request updated successfully',
      data: trialRequest,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }
    console.error('Update trial request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete trial request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.trialRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Trial request deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }
    console.error('Delete trial request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

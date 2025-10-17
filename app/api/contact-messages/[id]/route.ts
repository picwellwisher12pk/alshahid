import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const updateContactMessageSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'REPLIED', 'ARCHIVED']).optional(),
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

// GET - Get single contact message
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
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: contactMessage });
  } catch (error) {
    console.error('Get contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update contact message status
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
    const validation = updateContactMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id } = await params;
    const contactMessage = await prisma.contactMessage.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      message: 'Contact message updated successfully',
      data: contactMessage,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }
    console.error('Update contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact message
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
    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Contact message deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

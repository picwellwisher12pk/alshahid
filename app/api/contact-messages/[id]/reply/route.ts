import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { sendContactReply } from '@/lib/email';

const replySchema = z.object({
  message: z.string().min(10, 'Reply message must be at least 10 characters'),
});

// POST - Send reply to contact message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const authHeader = request.headers.get('Authorization');
    const token = accessToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the user to get admin name
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { fullName: true, email: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can reply to messages' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = replySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get the contact message
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Send the reply email
    await sendContactReply(
      contactMessage.email,
      contactMessage.name,
      contactMessage.message,
      validation.data.message,
      user.fullName || 'Al-Shahid Academy Team'
    );

    // Update message status to REPLIED
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'REPLIED' },
    });

    return NextResponse.json({
      message: 'Reply sent successfully',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Send reply error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

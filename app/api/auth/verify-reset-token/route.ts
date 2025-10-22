import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token to match what's stored in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          }
        }
      },
    });

    // Check if token exists
    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid reset token',
      });
    }

    // Check if token is used
    if (resetToken.used) {
      return NextResponse.json({
        valid: false,
        error: 'This reset token has already been used',
      });
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({
        valid: false,
        error: 'This reset token has expired',
      });
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      email: resetToken.user.email,
      name: resetToken.user.fullName,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { valid: false, error: 'An error occurred while verifying the token' },
      { status: 500 }
    );
  }
}

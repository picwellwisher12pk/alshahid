import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

// This endpoint should be protected - only admins can create users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, role } = body;

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, TEACHER, or STUDENT' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a random temporary password
    const temporaryPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create user with mustResetPassword flag
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName,
        password: hashedPassword,
        role,
        mustResetPassword: true, // Force password reset on first login
      },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration to 7 days from now (longer for new user setup)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send welcome email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}`;

    try {
      const { sendWelcomeEmail } = await import('@/lib/email');
      await sendWelcomeEmail(user.email, user.fullName || 'User', temporaryPassword, resetUrl);
    } catch (error) {
      console.error('Email service error:', error);
      // Continue anyway - in development, we'll log the URL
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== NEW USER CREATED ===');
        console.log('Email:', user.email);
        console.log('Temporary Password:', temporaryPassword);
        console.log('Reset URL:', resetUrl);
        console.log('========================\n');
      }
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'User created successfully. An email has been sent with setup instructions.',
      user: userWithoutPassword,
      // In development, return the reset URL for testing
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl,
        temporaryPassword,
      }),
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
}

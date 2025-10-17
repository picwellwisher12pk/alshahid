import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, generateAccessToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }

      return NextResponse.json(
        { error: 'Session expired or not found' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Set new access token cookie
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return NextResponse.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken, // For mobile apps
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

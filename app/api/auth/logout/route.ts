import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Delete refresh token from database if it exists
    if (refreshToken) {
      try {
        await prisma.session.delete({
          where: { token: refreshToken },
        });
      } catch (error) {
        // Token might not exist in database, continue with logout
        console.error('Error deleting session:', error);
      }
    }

    // Clear cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

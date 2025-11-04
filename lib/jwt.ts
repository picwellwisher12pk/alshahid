import { SignJWT, jwtVerify, type JWTPayload as JoseJWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate access token (expires in 15 minutes)
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

// Generate refresh token (expires in 7 days)
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

// Verify and decode token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Verify authentication from request and return user
export async function verifyAuth(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Also check Authorization header for mobile apps
    const authHeader = request.headers.get('Authorization');
    const token = accessToken || authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

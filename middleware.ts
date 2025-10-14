import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/src/lib/jwt';

// Define protected routes
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route
  if (isProtectedRoute) {
    // No access token, redirect to login
    if (!accessToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Verify access token
    const payload = await verifyToken(accessToken);
    if (!payload) {
      // Token invalid, clear cookies and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    // Token valid, allow access
    return NextResponse.next();
  }

  // If accessing auth routes (login) while already authenticated
  if (isAuthRoute && accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      // Already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes and their required roles
const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login'];

// Role-based route access control
const roleBasedRoutes = {
  admin: [
    '/dashboard/teachers',
    '/dashboard/all-students',
    '/dashboard/trial-requests',
    '/dashboard/payment-verification',
    '/dashboard/invoices',
  ],
  teacher: [
    '/dashboard/my-students',
    '/dashboard/classes',
    '/dashboard/progress-logs',
    '/dashboard/teacher',
  ],
  student: [
    '/portal/schedule',
    '/portal/progress',
    '/portal/invoices',
    '/portal/profile',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isRoleBasedRoute =
    Object.values(roleBasedRoutes).flat().some(route => pathname.startsWith(route));

  // If accessing protected route or role-based route
  if (isProtectedRoute || isRoleBasedRoute) {
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

    // Check role-based access
    if (isRoleBasedRoute && payload.role) {
      const userRole = payload.role.toLowerCase();
      let hasAccess = false;

      // Check if user's role has access to this route
      if (userRole === 'admin') {
        // Admin has access to all routes
        hasAccess = true;
      } else if (userRole === 'teacher') {
        hasAccess = roleBasedRoutes.teacher.some(route => pathname.startsWith(route));
      } else if (userRole === 'student') {
        hasAccess = roleBasedRoutes.student.some(route => pathname.startsWith(route));
      }

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        let redirectPath = '/dashboard';
        if (userRole === 'admin') {
          redirectPath = '/dashboard/teachers';
        } else if (userRole === 'teacher') {
          redirectPath = '/dashboard/my-students';
        } else if (userRole === 'student') {
          redirectPath = '/portal/schedule';
        }
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Token valid and has access, allow access
    return NextResponse.next();
  }

  // If accessing auth routes (login) while already authenticated
  if (isAuthRoute && accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      // Already logged in, redirect to appropriate dashboard based on role
      let redirectPath = '/dashboard';
      if (payload.role) {
        const userRole = payload.role.toLowerCase();
        if (userRole === 'admin') {
          redirectPath = '/dashboard/teachers';
        } else if (userRole === 'teacher') {
          redirectPath = '/dashboard/my-students';
        } else if (userRole === 'student') {
          redirectPath = '/portal/schedule';
        }
      }
      return NextResponse.redirect(new URL(redirectPath, request.url));
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

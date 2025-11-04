import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { UserRole } from '@prisma/client';

// Force middleware to use Node.js runtime
export const runtime = 'nodejs';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth',
  '/api/enrollment', // Enrollment API (uses magic token auth)
  '/enroll',
  '/enrollment-success',
  '/_next',
  '/favicon.ico'
];

// Define protected routes and their required roles
const protectedRoutes = ['/dashboard'];

// Role-based route access control
const roleBasedRoutes: Record<UserRole, string[]> = {
  ADMIN: [
    '/dashboard/teachers',
    '/dashboard/students',
    '/dashboard/trial-requests',
    '/dashboard/enrollments',
    '/dashboard/invoices',
    '/dashboard/settings'
  ],
  TEACHER: [
    '/dashboard/classes',
    '/dashboard/students',
    '/dashboard/progress',
    '/dashboard/attendance'
  ],
  STUDENT: [
    '/dashboard/schedule',
    '/dashboard/progress',
    '/dashboard/invoices',
    '/dashboard/profile'
  ]
} as const;

// Type guard to check if a string is a valid UserRole
function isUserRole(role: string | undefined): role is UserRole {
  return !!role && ['ADMIN', 'TEACHER', 'STUDENT'].includes(role);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  try {
    // Get JWT token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    // Verify token and get user info
    let userRole: UserRole | undefined;
    if (accessToken) {
      const payload = await verifyToken(accessToken);
      if (payload && payload.role) {
        userRole = payload.role as UserRole;
      }
    }

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

    const isRoleBasedRoute = Object.values(roleBasedRoutes).some(routes =>
      routes.some(route => pathname.startsWith(route))
    );

    // Handle protected routes
    if (isProtectedRoute || isRoleBasedRoute) {
      // No token or invalid role, redirect to login
      if (!accessToken || !userRole || !isUserRole(userRole)) {
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Check role-based access for role-based routes
      if (isRoleBasedRoute) {
        const userRoutes = roleBasedRoutes[userRole] || [];
        const hasAccess = userRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on role
          const defaultRoutes: Record<UserRole, string> = {
            ADMIN: '/dashboard',
            TEACHER: '/dashboard/classes',
            STUDENT: '/dashboard/schedule'
          };

          const defaultRoute = defaultRoutes[userRole] || '/login';
          return NextResponse.redirect(new URL(defaultRoute, request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, redirect to login
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'SessionError');
    return NextResponse.redirect(url);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - assets folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/|assets/).*)',
  ],
};

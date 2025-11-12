"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  MessageSquare,
  UserPlus,
  Home,
  Menu,
  X,
  Users,
  School,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  BookOpen,
  User,
  ChevronDown,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';

// Role-based navigation configurations
const adminNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Teachers', href: '/dashboard/teachers', icon: School },
  { name: 'All Students', href: '/dashboard/all-students', icon: Users },
  { name: 'Trial Requests', href: '/dashboard/trial-requests', icon: UserPlus },
  { name: 'Contact Messages', href: '/dashboard/contact-messages', icon: MessageSquare },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DollarSign },
  { name: 'Payment Verification', href: '/dashboard/payment-verification', icon: CheckCircle },
];

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Students', href: '/dashboard/my-students', icon: Users },
  { name: 'Classes', href: '/dashboard/classes', icon: Calendar },
  { name: 'Progress Logs', href: '/dashboard/progress-logs', icon: BookOpen },
];

const studentNavigation = [
  { name: 'Dashboard', href: '/portal', icon: Home },
  { name: 'My Schedule', href: '/portal/schedule', icon: Calendar },
  { name: 'My Progress', href: '/portal/progress', icon: BookOpen },
  { name: 'Invoices', href: '/portal/invoices', icon: DollarSign },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine navigation based on user role
  const navigation = useMemo(() => {
    if (!user) return [];
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN') return adminNavigation;
    if (role === 'TEACHER') return teacherNavigation;
    if (role === 'STUDENT') return studentNavigation;
    return [];
  }, [user]);

  // Determine dashboard title based on role
  const dashboardTitle = useMemo(() => {
    if (!user) return 'Dashboard';
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN') return 'Admin Dashboard';
    if (role === 'TEACHER') return 'Teacher Dashboard';
    if (role === 'STUDENT') return 'Student Portal';
    return 'Dashboard';
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-semibold">{dashboardTitle}</h1>
            </div>
            <nav className="flex-1 px-2 space-y-1 bg-white">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors ${pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with user info */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* Spacer for desktop */}
              <div className="hidden lg:block flex-1"></div>

              {/* User dropdown - aligned right */}
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center focus:outline-none">
                    <div className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors">
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {user?.fullName || user?.email || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {user?.role?.toLowerCase() || 'Guest'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user?.fullName || user?.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push('/dashboard/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white shadow-md">
            <nav className="px-2 pt-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors ${pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

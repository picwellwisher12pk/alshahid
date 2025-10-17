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
  GraduationCap,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
import { useState, useMemo } from 'react';

// Role-based navigation configurations
const adminNavigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Teachers', href: '/dashboard/teachers', icon: GraduationCap },
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-semibold">{dashboardTitle}</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="bg-white shadow-md">
            <nav className="px-2 pt-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-400" aria-hidden="true" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold">{dashboardTitle}</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1 bg-white">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600 group-hover:text-red-500">Logout</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

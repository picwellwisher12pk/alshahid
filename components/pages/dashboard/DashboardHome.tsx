"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Clock, CheckCircle, GraduationCap, Calendar, DollarSign, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface DashboardStats {
  teachers: number;
  students: number;
  classes: number;
  invoices: number;
  pendingPayments: number;
  trialRequests: number;
}

export function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch statistics from various endpoints
      const [teachersRes, studentsRes, classesRes, invoicesRes] = await Promise.all([
        fetch('/api/teachers', { credentials: 'include' }),
        fetch('/api/students', { credentials: 'include' }),
        fetch('/api/classes', { credentials: 'include' }),
        fetch('/api/invoices?status=PENDING_VERIFICATION', { credentials: 'include' }),
      ]);

      const [teachers, students, classes, invoices] = await Promise.all([
        teachersRes.ok ? teachersRes.json() : { pagination: { total: 0 } },
        studentsRes.ok ? studentsRes.json() : { pagination: { total: 0 } },
        classesRes.ok ? classesRes.json() : { pagination: { total: 0 } },
        invoicesRes.ok ? invoicesRes.json() : { pagination: { total: 0 } },
      ]);

      setStats({
        teachers: teachers.pagination?.total || 0,
        students: students.pagination?.total || 0,
        classes: classes.pagination?.total || 0,
        invoices: invoices.pagination?.total || 0,
        pendingPayments: invoices.pagination?.total || 0,
        trialRequests: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const role = user?.role?.toUpperCase();

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {role === 'ADMIN' ? 'Admin Dashboard' : role === 'TEACHER' ? 'Teacher Dashboard' : 'Student Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.fullName || user?.email}! Here's your overview.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
        </div>
      )}

      {/* Admin Stats */}
      {!loading && role === 'ADMIN' && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teachers}</div>
              <p className="text-xs text-gray-500 mt-1">Active educators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
              <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes}</div>
              <p className="text-xs text-gray-500 mt-1">Total classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              <p className="text-xs text-red-500 mt-1">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Teacher Stats */}
      {!loading && role === 'TEACHER' && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
              <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Logs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-gray-500 mt-1">Student progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Stats */}
      {!loading && role === 'STUDENT' && stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classes}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled for you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.invoices}</div>
              <p className="text-xs text-red-500 mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions for Admin */}
      {!loading && role === 'ADMIN' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/teachers">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Manage Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Add, edit, or deactivate teachers
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/all-students">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View and manage all students
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/payment-verification">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Verify Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Review and approve payment receipts
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Quick Actions for Teacher */}
      {!loading && role === 'TEACHER' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/my-students">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Users className="h-5 w-5 mr-2" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View and manage your students
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/classes">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Manage your class schedule
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/progress-logs">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Progress Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Add student progress notes
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Quick Actions for Student */}
      {!loading && role === 'STUDENT' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/portal/schedule">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Calendar className="h-5 w-5 mr-2" />
                  My Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  View your upcoming classes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/invoices">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Invoices & Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Manage your payments
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}

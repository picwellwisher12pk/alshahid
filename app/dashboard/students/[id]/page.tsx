"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  DollarSign,
  FileText,
  Edit,
} from 'lucide-react';
import Link from 'next/link';

interface StudentDetails {
  id: string;
  fullName: string;
  contactEmail?: string;
  contactPhone?: string;
  age?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  createdAt: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  teacher?: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
  };
  classes: Array<{
    id: string;
    classTime: string;
    durationMinutes: number;
    status: string;
    notes?: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    amount: string;
    currency: string;
    status: string;
    dueDate: string;
  }>;
  progressLogs: Array<{
    id: string;
    logDate: string;
    title: string;
    notes?: string;
  }>;
}

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/${studentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const result = await response.json();
      setStudent(result.data);
    } catch (err) {
      setError('Failed to load student details');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'PENDING_VERIFICATION':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClassStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading student details...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Student not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.fullName}</h1>
            <p className="text-sm text-gray-500">Student ID: {student.id}</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{student.fullName}</p>
            </div>
            {student.age && (
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{student.age} years old</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusColor(student.status)}>
                {student.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Enrolled Date</p>
              <p className="font-medium">
                {new Date(student.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                {student.user?.email || student.contactEmail || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{student.contactPhone || 'N/A'}</p>
            </div>
            {student.teacher && (
              <div>
                <p className="text-sm text-gray-500">Assigned Teacher</p>
                <Link
                  href={`/dashboard/teachers/${student.teacher.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {student.teacher.user.fullName}
                </Link>
              </div>
            )}
            {student.user && (
              <div>
                <p className="text-sm text-gray-500">Login Account</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Classes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Classes
            </CardTitle>
            <Link href={`/dashboard/students/${student.id}/classes`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <CardDescription>Last 5 classes</CardDescription>
        </CardHeader>
        <CardContent>
          {student.classes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No classes scheduled yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      {new Date(classItem.classTime).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                    <TableCell>{classItem.durationMinutes} min</TableCell>
                    <TableCell>
                      <Badge className={getClassStatusColor(classItem.status)}>
                        {classItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {classItem.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Progress Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Progress Logs
            </CardTitle>
            <Link href={`/dashboard/students/${student.id}/progress`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <CardDescription>Recent learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          {student.progressLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No progress logs yet
            </p>
          ) : (
            <div className="space-y-4">
              {student.progressLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{log.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(log.logDate).toLocaleDateString()}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Invoices & Payments
            </CardTitle>
            <Link href={`/dashboard/students/${student.id}/invoices`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <CardDescription>Recent invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {student.invoices.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No invoices yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.invoiceType}</Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.amount} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getInvoiceStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

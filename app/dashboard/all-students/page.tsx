"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, UserPlus, Mail, Calendar, User, MoreVertical, Trash2, UserX, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Student {
  id: string;
  fullName: string;
  contactEmail?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  teacher?: {
    id: string;
    user: {
      fullName: string;
    };
  };
  user?: {
    email: string;
    fullName: string;
  };
  createdAt: string;
}

export default function AllStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const result = await response.json();
      setStudents(result.data || []);
    } catch (err) {
      setError('Failed to load students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (studentId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'TRIAL') => {
    try {
      setUpdatingStatus(studentId);
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update student status');
      }

      // Update local state
      setStudents(students.map(s =>
        s.id === studentId ? { ...s, status: newStatus } : s
      ));

      toast.success(`Student status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update student status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;

    try {
      const response = await fetch(`/api/students/${deletingStudent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate student');
      }

      // Update local state - mark as INACTIVE
      setStudents(students.map(s =>
        s.id === deletingStudent.id ? { ...s, status: 'INACTIVE' } : s
      ));

      toast.success(`${deletingStudent.fullName} has been deactivated`);
      setDeletingStudent(null);
    } catch (err) {
      console.error('Error deactivating student:', err);
      toast.error('Failed to deactivate student');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage all students in the system
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Students ({filteredStudents.length})</CardTitle>
              <CardDescription>View and manage all enrolled students</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new student'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.fullName}</TableCell>
                      <TableCell>
                        {student.user?.email || student.contactEmail || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{student.contactPhone || <span className="text-gray-400">N/A</span>}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.teacher ? (
                          <Link
                            href={`/dashboard/teachers/${student.teacher.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {student.teacher.user.fullName}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/students/${student.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={updatingStatus === student.id}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Change Status
                              </DropdownMenuLabel>

                              {student.status !== 'ACTIVE' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(student.id, 'ACTIVE')}
                                  className="cursor-pointer"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Mark as Active
                                </DropdownMenuItem>
                              )}

                              {student.status !== 'TRIAL' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(student.id, 'TRIAL')}
                                  className="cursor-pointer"
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Mark as Trial
                                </DropdownMenuItem>
                              )}

                              {student.status !== 'INACTIVE' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(student.id, 'INACTIVE')}
                                  className="cursor-pointer"
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Mark as Inactive
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => setDeletingStudent(student)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deactivate Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{deletingStudent?.fullName}</strong>?
              This will mark the student as INACTIVE. The student record will remain in the system
              but they will no longer be counted as active students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

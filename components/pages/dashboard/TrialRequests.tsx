"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Search, Filter, Loader2, Eye, Copy, Check, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrialRequest {
  id: string;
  requesterName: string;
  studentName: string;
  contactEmail: string;
  contactPhone: string | null;
  courseName: string | null;
  preferredTime: string | null;
  additionalNotes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function TrialRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TrialRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; fullName: string }>>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [enrollmentFee, setEnrollmentFee] = useState('5000');
  const [currency, setCurrency] = useState('PKR');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch trial requests from API
  useEffect(() => {
    const fetchTrialRequests = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/trial-requests');

        if (!response.ok) {
          throw new Error('Failed to fetch trial requests');
        }

        const result = await response.json();
        setTrialRequests(result.data || []);
      } catch (err) {
        console.error('Error fetching trial requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trial requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialRequests();
  }, []);

  const filteredRequests = trialRequests.filter((request) => {
    const matchesSearch =
      request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contactPhone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const viewDetails = (request: TrialRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    // If converting to student, open the conversion dialog
    if (newStatus === 'CONVERTED') {
      setIsDetailsOpen(false);
      setIsConvertDialogOpen(true);
      // Fetch teachers for the dropdown
      try {
        const response = await fetch('/api/teachers');
        if (response.ok) {
          const result = await response.json();
          const teachersList = result.data || [];
          setTeachers(teachersList);

          // Auto-select first teacher if available, or use special value for auto-assign
          if (teachersList.length > 0) {
            setSelectedTeacherId(teachersList[0].id);
          } else {
            // Use special value that backend will recognize to auto-create teacher
            setSelectedTeacherId('auto-assign-admin');
          }
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        // If fetch fails, still allow conversion with auto-assign
        setSelectedTeacherId('auto-assign-admin');
      }
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/trial-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setTrialRequests((prev) =>
        prev.map((req) => (req.id === selectedRequest.id ? { ...req, status: newStatus } : req))
      );

      setIsDetailsOpen(false);
      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating trial request status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConvertToStudent = async () => {
    if (!selectedRequest || !selectedTeacherId || !enrollmentFee) {
      alert('Please select a teacher and enter enrollment fee');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/trial-requests/${selectedRequest.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          enrollmentFee: parseFloat(enrollmentFee),
          currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert trial request');
      }

      const result = await response.json();

      // Update local state
      setTrialRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id ? { ...req, status: 'SCHEDULED' } : req
        )
      );

      setIsConvertDialogOpen(false);
      alert(result.message || 'Trial request converted successfully! Enrollment email sent to student.');

      // Refresh the list
      const refreshResponse = await fetch('/api/trial-requests');
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        setTrialRequests(refreshResult.data || []);
      }
    } catch (err) {
      console.error('Error converting trial request:', err);
      alert(err instanceof Error ? err.message : 'Failed to convert trial request. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openDeleteDialog = (request: TrialRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/trial-requests/${selectedRequest.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete trial request');
      }

      // Remove from local state
      setTrialRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id));

      setIsDeleteDialogOpen(false);
      setIsDetailsOpen(false);
      alert('Trial request deleted successfully!');
    } catch (err) {
      console.error('Error deleting trial request:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete trial request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold">Trial Class Requests</h1>
          <p className="text-sm text-muted-foreground">
            Manage and respond to trial class requests
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2 sm:space-y-0 sm:space-x-4 sm:flex">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter === 'pending' ? 'Pending' : 'Completed'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => setStatusFilter('all')}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'pending'}
                  onCheckedChange={() => setStatusFilter('pending')}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'completed'}
                  onCheckedChange={() => setStatusFilter('completed')}
                >
                  Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Preferred Time</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.requesterName}</TableCell>
                        <TableCell>{request.studentName}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{request.contactEmail}</div>
                          {request.contactPhone && (
                            <div className="text-sm text-muted-foreground">{request.contactPhone}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.courseName || <span className="text-muted-foreground italic">Not specified</span>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {request.preferredTime || <span className="text-muted-foreground italic">Not specified</span>}
                        </TableCell>
                        <TableCell suppressHydrationWarning>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={request.status.toLowerCase() === 'completed' ? 'default' : 'secondary'}>
                            {request.status.toLowerCase() === 'completed' ? (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            ) : (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewDetails(request)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(request)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No trial requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trial Request Details</DialogTitle>
            <DialogDescription>
              View and manage trial class request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Parent/Guardian Name</p>
                  <p className="text-sm">{selectedRequest.requesterName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                  <p className="text-sm">{selectedRequest.studentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{selectedRequest.contactEmail}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedRequest.contactEmail, 'email')}
                    >
                      {copiedEmail ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  {selectedRequest.contactPhone ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{selectedRequest.contactPhone}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(selectedRequest.contactPhone!, 'phone')}
                      >
                        {copiedPhone ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Course Interest</p>
                <p className="text-sm">
                  {selectedRequest.courseName || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Time</p>
                <p className="text-sm">
                  {selectedRequest.preferredTime || <span className="text-muted-foreground italic">Not specified</span>}
                </p>
              </div>

              {selectedRequest.additionalNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedRequest.additionalNotes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested On</p>
                  <p className="text-sm">{format(new Date(selectedRequest.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{format(new Date(selectedRequest.updatedAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Update Status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CONVERTED">Converted to Student</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                setIsDetailsOpen(false);
                setIsDeleteDialogOpen(true);
              }}
              disabled={isUpdatingStatus}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)} disabled={isUpdatingStatus}>
                Close
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || newStatus === selectedRequest?.status}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Student Dialog */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert to Student</DialogTitle>
            <DialogDescription>
              Assign a teacher and set enrollment fee. Student will receive an email with payment link.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium mb-2">Student: {selectedRequest.studentName}</p>
                <p className="text-sm text-muted-foreground">Email: {selectedRequest.contactEmail}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Teacher</label>
                {teachers.length > 0 ? (
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                    <p className="text-amber-900">
                      No teachers available. The student will be automatically assigned to you (Admin).
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enrollment Fee</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={enrollmentFee}
                    onChange={(e) => setEnrollmentFee(e.target.value)}
                    placeholder="5000"
                    className="flex-1"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PKR">PKR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <p className="font-medium text-blue-900 mb-1">What happens next:</p>
                <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                  <li>Student receives email with payment link (48h validity)</li>
                  <li>Student uploads payment proof via the link</li>
                  <li>Admin verifies payment and approves enrollment</li>
                  <li>Student gets account credentials and access to portal</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button onClick={handleConvertToStudent} disabled={isUpdatingStatus || !selectedTeacherId || !enrollmentFee}>
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert & Send Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Trial Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trial request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-2 py-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <p className="text-sm font-medium text-red-900 mb-2">Request Details:</p>
                <p className="text-sm text-red-800">Parent: {selectedRequest.requesterName}</p>
                <p className="text-sm text-red-800">Student: {selectedRequest.studentName}</p>
                <p className="text-sm text-red-800">Email: {selectedRequest.contactEmail}</p>
                <p className="text-sm text-red-800 mt-2">Status: {selectedRequest.status}</p>
              </div>
              {selectedRequest.status === 'CONVERTED' && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                  <p className="text-amber-900 font-medium">Warning:</p>
                  <p className="text-amber-800">
                    This trial request has been converted to a student. Deleting it may not be allowed.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRequest} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

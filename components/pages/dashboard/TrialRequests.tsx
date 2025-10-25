"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Search, Filter, Loader2, Eye, Copy, Check, X } from 'lucide-react';
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
                          {request.preferredTime || <span className="text-muted-foreground">Not specified</span>}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
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
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

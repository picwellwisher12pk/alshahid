"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      (request.contactPhone && request.contactPhone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/trial-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the list
      const result = await fetch('/api/trial-requests');
      const data = await result.json();
      setTrialRequests(data.data || []);
    } catch (err) {
      console.error('Error updating trial request status:', err);
      alert('Failed to update status. Please try again.');
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
                        <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
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
                            {request.status.toLowerCase() === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(request.id, 'COMPLETED')}
                              >
                                Mark as Completed
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
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
    </div>
  );
}

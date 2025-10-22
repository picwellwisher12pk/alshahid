"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data - replace with API calls in a real app
const trialRequests = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    phone: '+1234567890',
    course: 'Quran for Beginners',
    message: 'I would like to learn proper Tajweed',
    status: 'pending',
    requestedAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima@example.com',
    phone: '+1987654321',
    course: 'Advanced Tajweed',
    message: 'Looking for advanced level classes',
    status: 'completed',
    requestedAt: new Date('2023-05-10T14:45:00'),
  },
  {
    id: '3',
    name: 'Ibrahim Mohamed',
    email: 'ibrahim@example.com',
    phone: '+1122334455',
    course: 'Quran Memorization',
    message: 'Interested in Hifz program for my son',
    status: 'pending',
    requestedAt: new Date('2023-05-05T09:15:00'),
  },
];

export function TrialRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRequests = trialRequests.filter((request) => {
    const matchesSearch = 
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.includes(searchTerm) ||
      request.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: string) => {
    // In a real app, this would be an API call
    console.log(`Updating trial request ${id} to status: ${newStatus}`);
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{request.email}</div>
                        <div className="text-sm text-muted-foreground">{request.phone}</div>
                      </TableCell>
                      <TableCell>{request.course}</TableCell>
                      <TableCell>{format(request.requestedAt, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                          {request.status === 'completed' ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(request.id, 'completed')}
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      No trial requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

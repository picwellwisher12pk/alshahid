"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Filter, Eye, Reply, Trash2 } from 'lucide-react';
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
const contactMessages = [
  {
    id: '1',
    name: 'Mohamed Ali',
    email: 'mohamed@example.com',
    subject: 'Question about Quran courses',
    message: 'I would like to know more about your advanced Tajweed program...',
    status: 'unread',
    receivedAt: new Date('2023-05-18T09:30:00'),
  },
  {
    id: '2',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    subject: 'Registration inquiry',
    message: 'How can I register my child for the weekend classes?...',
    status: 'read',
    receivedAt: new Date('2023-05-17T14:15:00'),
  },
  {
    id: '3',
    name: 'Omar Farooq',
    email: 'omar@example.com',
    subject: 'Private lessons',
    message: 'Interested in one-on-one Tajweed lessons...',
    status: 'replied',
    receivedAt: new Date('2023-05-16T11:20:00'),
  },
];

export function ContactMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const filteredMessages = contactMessages.filter((message) => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const viewMessage = (message: any) => {
    setSelectedMessage(message);
    setIsViewerOpen(true);
    
    // Mark as read when viewed
    if (message.status === 'unread') {
      // In a real app, this would be an API call
      console.log(`Marking message ${message.id} as read`);
    }
  };

  const deleteMessage = (id: string) => {
    // In a real app, this would be an API call
    console.log(`Deleting message ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">
            View and manage messages from the contact form
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
                placeholder="Search messages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter === 'all' 
                    ? 'All Messages' 
                    : statusFilter === 'unread' 
                      ? 'Unread' 
                      : statusFilter === 'read' 
                        ? 'Read' 
                        : 'Replied'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'all'}
                  onCheckedChange={() => setStatusFilter('all')}
                >
                  All Messages
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'unread'}
                  onCheckedChange={() => setStatusFilter('unread')}
                >
                  Unread
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'read'}
                  onCheckedChange={() => setStatusFilter('read')}
                >
                  Read
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'replied'}
                  onCheckedChange={() => setStatusFilter('replied')}
                >
                  Replied
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
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${message.status === 'unread' ? 'font-medium' : ''}`}
                      onClick={() => viewMessage(message)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{message.name}</div>
                            <div className="text-sm text-muted-foreground">{message.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{message.subject}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="truncate">{message.message}</div>
                      </TableCell>
                      <TableCell>{format(message.receivedAt, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            message.status === 'unread' ? 'default' : 
                            message.status === 'replied' ? 'secondary' : 'outline'
                          }
                        >
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewMessage(message);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle reply
                              console.log('Reply to:', message.email);
                            }}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this message?')) {
                                deleteMessage(message.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No messages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Message Viewer Dialog - Would be implemented with a Dialog component */}
      {isViewerOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
              <button 
                onClick={() => setIsViewerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="font-medium">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedMessage.receivedAt, 'EEEE, MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge 
                  variant={
                    selectedMessage.status === 'unread' ? 'default' : 
                    selectedMessage.status === 'replied' ? 'secondary' : 'outline'
                  }
                  className="self-start"
                >
                  {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                </Badge>
              </div>
              <div className="prose max-w-none">
                <p>{selectedMessage.message}</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsViewerOpen(false)}>
                Close
              </Button>
              <Button>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

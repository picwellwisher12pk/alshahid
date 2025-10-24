"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Filter, Eye, Reply, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function ContactMessages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch contact messages from API
  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/contact-messages');

        if (!response.ok) {
          throw new Error('Failed to fetch contact messages');
        }

        const result = await response.json();
        setContactMessages(result.data || []);
      } catch (err) {
        console.error('Error fetching contact messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load contact messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactMessages();
  }, []);

  const filteredMessages = contactMessages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || message.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const viewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewerOpen(true);

    // Mark as read when viewed
    if (message.status.toLowerCase() === 'unread') {
      try {
        await fetch(`/api/contact-messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'READ' }),
        });

        // Update local state
        setContactMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? { ...msg, status: 'READ' } : msg))
        );
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/contact-messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Remove from local state
      setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message. Please try again.');
    }
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
                    filteredMessages.map((message) => {
                      const messageStatus = message.status.toLowerCase();
                      const statusVariant = messageStatus === 'unread' ? 'default' : messageStatus === 'replied' ? 'secondary' : 'outline';

                      return (
                        <TableRow
                          key={message.id}
                          className={`cursor-pointer hover:bg-muted/50 ${messageStatus === 'unread' ? 'font-medium' : ''}`}
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
                          <TableCell className="font-medium">
                            {message.subject || <span className="text-muted-foreground italic">No subject</span>}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <div className="truncate">{message.message}</div>
                          </TableCell>
                          <TableCell>{format(new Date(message.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1).toLowerCase()}
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
                                  window.location.href = `mailto:${message.email}`;
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
                      );
                    })
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
          )}
        </CardContent>
      </Card>

      {/* Message Viewer Dialog */}
      {isViewerOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedMessage.subject || 'No Subject'}
              </h2>
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
                    {format(new Date(selectedMessage.createdAt), 'EEEE, MMMM d, yyyy h:mm a')}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedMessage.status.toLowerCase() === 'unread'
                      ? 'default'
                      : selectedMessage.status.toLowerCase() === 'replied'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="self-start"
                >
                  {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1).toLowerCase()}
                </Badge>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsViewerOpen(false)}>
                Close
              </Button>
              <Button onClick={() => (window.location.href = `mailto:${selectedMessage.email}`)}>
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

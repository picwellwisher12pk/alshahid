"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Search, Filter, Eye, Reply, Trash2, Loader2, Copy, Check, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

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

  const handleCopyContact = (text: string, type: 'email' | 'phone' = 'email') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openReplyModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyMessage('');
    setIsReplyModalOpen(true);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;

    try {
      setIsSendingReply(true);
      const response = await fetch(`/api/contact-messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      // Update message status to REPLIED
      setContactMessages((prev) =>
        prev.map((msg) => (msg.id === selectedMessage.id ? { ...msg, status: 'REPLIED' } : msg))
      );

      setIsReplyModalOpen(false);
      setReplyMessage('');
      alert('Reply sent successfully!');
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
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
                  {(() => {
                    if (statusFilter === 'all') return 'All Messages';
                    if (statusFilter === 'unread') return 'Unread';
                    if (statusFilter === 'read') return 'Read';
                    return 'Replied';
                  })()}
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
                      let statusVariant: 'default' | 'secondary' | 'outline' = 'outline';
                      if (messageStatus === 'unread') {
                        statusVariant = 'default';
                      } else if (messageStatus === 'replied') {
                        statusVariant = 'secondary';
                      }

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
                          <TableCell suppressHydrationWarning>{format(new Date(message.createdAt), 'MMM d, yyyy')}</TableCell>
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
                                  openReplyModal(message);
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
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || 'No Subject'}</DialogTitle>
            <DialogDescription>
              Message from {selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">From:</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Email:</p>
                    <div className="flex items-center gap-2">
                      <p>{selectedMessage.email}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyContact(selectedMessage.email, 'email')}
                      >
                        {copiedEmail ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">Date:</p>
                    <p className="text-sm">
                      {format(new Date(selectedMessage.createdAt), 'EEEE, MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                {(() => {
                  const status = selectedMessage.status.toLowerCase();
                  let variant: 'default' | 'secondary' | 'outline' = 'outline';
                  if (status === 'unread') {
                    variant = 'default';
                  } else if (status === 'replied') {
                    variant = 'secondary';
                  }
                  return (
                    <Badge variant={variant} className="self-start">
                      {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1).toLowerCase()}
                    </Badge>
                  );
                })()}
              </div>
              <div className="border-t pt-4">
                <p className="font-medium text-sm text-muted-foreground mb-2">Message:</p>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsViewerOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewerOpen(false);
                if (selectedMessage) openReplyModal(selectedMessage);
              }}
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Replying to {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium text-sm text-muted-foreground mb-2">Original Message:</p>
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-message">Your Reply</Label>
                <Textarea
                  id="reply-message"
                  placeholder="Type your reply here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)} disabled={isSendingReply}>
              Cancel
            </Button>
            <Button onClick={sendReply} disabled={isSendingReply || !replyMessage.trim()}>
              {isSendingReply ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

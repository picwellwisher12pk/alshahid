'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { MoreHorizontal, Mail, UserPlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

type TrialRequest = {
  id: string;
  requesterName: string;
  studentName: string;
  contactEmail: string;
  contactPhone: string | null;
  courseName: string | null;
  status: string;
  createdAt: string;
  enrollmentPayment?: {
    status: string;
  } | null;
};

interface TrialRequestsTableProps {
  trialRequests: TrialRequest[];
  onEnroll: (id: string) => Promise<void>;
}

export function TrialRequestsTable({ trialRequests, onEnroll }: TrialRequestsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleEnroll = async (id: string) => {
    try {
      setLoadingId(id);
      await onEnroll(id);
      
      toast({
        title: 'Enrollment email sent',
        description: 'The student has been sent an email to complete their enrollment.',
      });
    } catch (error) {
      console.error('Error sending enrollment email:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to send enrollment email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'PENDING_ENROLLMENT':
        return <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">Awaiting Payment</Badge>;
      case 'PENDING_PAYMENT_VERIFICATION':
        return <Badge variant="outline" className="border-blue-200 text-blue-800 bg-blue-50">Verifying Payment</Badge>;
      case 'CONVERTED':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (trialRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No trial requests found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trialRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                <div>{request.studentName}</div>
                <div className="text-sm text-muted-foreground">
                  {request.requesterName}
                </div>
              </TableCell>
              <TableCell>
                <div>{request.contactEmail}</div>
                {request.contactPhone && (
                  <div className="text-sm text-muted-foreground">
                    {request.contactPhone}
                  </div>
                )}
              </TableCell>
              <TableCell>{request.courseName || 'N/A'}</TableCell>
              <TableCell>
                {format(new Date(request.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {getStatusBadge(request.status, request.enrollmentPayment?.status)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {request.status === 'PENDING' && (
                        <DropdownMenuItem 
                          onClick={() => handleEnroll(request.id)}
                          disabled={loadingId === request.id}
                        >
                          {loadingId === request.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="mr-2 h-4 w-4" />
                          )}
                          <span>Send Enrollment Email</span>
                        </DropdownMenuItem>
                      )}
                      {request.status === 'PENDING_PAYMENT_VERIFICATION' && (
                        <DropdownMenuItem 
                          onClick={() => {
                            // Navigate to payment verification page
                            router.push(`/admin/trial-requests/${request.id}/verify-payment`);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Verify Payment</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

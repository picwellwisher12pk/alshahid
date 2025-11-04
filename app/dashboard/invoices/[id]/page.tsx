"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, FileText, User, Download, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  invoiceType: 'ENROLLMENT' | 'MONTHLY' | 'OTHER';
  amount: number;
  currency: string;
  month?: string | null;
  year?: number | null;
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'PENDING_VERIFICATION' | 'CANCELLED';
  dueDate: string;
  issueDate: string;
  notes?: string | null;
  student?: {
    id: string;
    fullName: string;
    contactEmail?: string;
    contactPhone?: string;
    teacher?: {
      user: {
        fullName: string;
      };
    };
  } | null;
  trialRequest?: {
    id: string;
    studentName: string;
    contactEmail: string;
    contactPhone?: string;
    courseName?: string | null;
  } | null;
  teacher?: {
    user: {
      fullName: string;
    };
  } | null;
  paymentReceipts: {
    id: string;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy?: string;
    verificationStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    verifiedAt?: string;
    rejectionReason?: string;
    notes?: string;
  }[];
  createdAt: string;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/invoices/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        setInvoice(data.data);
      } catch (err) {
        setError('Failed to load invoice details');
        console.error('Error fetching invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params]);

  const getStatusColor = (status: string) => {
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

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceTypeLabel = (type: string) => {
    switch (type) {
      case 'ENROLLMENT':
        return 'Enrollment';
      case 'MONTHLY':
        return 'Monthly';
      case 'OTHER':
        return 'Other';
      default:
        return type;
    }
  };

  const getPeriodDisplay = () => {
    if (!invoice) return 'N/A';
    if (invoice.invoiceType === 'ENROLLMENT') {
      return 'Enrollment Fee';
    }
    if (invoice.month && invoice.year) {
      return `${invoice.month} ${invoice.year}`;
    }
    return 'N/A';
  };

  const getStudentInfo = () => {
    if (invoice?.student) {
      return {
        name: invoice.student.fullName,
        email: invoice.student.contactEmail || 'N/A',
        phone: invoice.student.contactPhone || 'N/A',
      };
    }
    if (invoice?.trialRequest) {
      return {
        name: invoice.trialRequest.studentName,
        email: invoice.trialRequest.contactEmail,
        phone: invoice.trialRequest.contactPhone || 'N/A',
      };
    }
    return { name: 'N/A', email: 'N/A', phone: 'N/A' };
  };

  const getTeacherName = () => {
    return invoice?.teacher?.user.fullName || invoice?.student?.teacher?.user.fullName || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || 'Invoice not found'}</p>
            <Button onClick={() => router.push('/dashboard/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentInfo = getStudentInfo();

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/invoices')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
          <p className="mt-2 text-sm text-gray-700">
            Invoice #{invoice.invoiceNumber}
          </p>
        </div>
        <Badge variant={invoice.invoiceType === 'ENROLLMENT' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
          {getInvoiceTypeLabel(invoice.invoiceType)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">{invoice.currency} {invoice.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Period</p>
              <p className="font-medium">{getPeriodDisplay()}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Teacher</p>
              <p className="font-medium">{getTeacherName()}</p>
            </div>

            {invoice.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {invoice.invoiceType === 'ENROLLMENT' ? 'Trial Request' : 'Student'} Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{studentInfo.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{studentInfo.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{studentInfo.phone}</p>
            </div>

            {invoice.trialRequest?.courseName && (
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{invoice.trialRequest.courseName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Receipts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Payment Receipts ({invoice.paymentReceipts.length})</CardTitle>
          <CardDescription>
            Uploaded payment proofs and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.paymentReceipts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Waiting for payment proof to be submitted
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoice.paymentReceipts.map((receipt) => (
                <Card key={receipt.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getReceiptStatusColor(receipt.verificationStatus)}>
                            {receipt.verificationStatus}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Uploaded {new Date(receipt.uploadedAt).toLocaleString()}
                          </span>
                        </div>

                        {receipt.uploadedBy && (
                          <div>
                            <p className="text-sm text-muted-foreground">Uploaded by</p>
                            <p className="text-sm font-medium">{receipt.uploadedBy}</p>
                          </div>
                        )}

                        {receipt.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-sm">{receipt.notes}</p>
                          </div>
                        )}

                        {receipt.verifiedAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Verified</p>
                            <p className="text-sm">{new Date(receipt.verifiedAt).toLocaleString()}</p>
                          </div>
                        )}

                        {receipt.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                            <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                            <p className="text-sm text-red-800 mt-1">{receipt.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(receipt.fileUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

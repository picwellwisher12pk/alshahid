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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, CheckCircle, XCircle, Loader2, ExternalLink, Eye, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentReceipt {
  id: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy?: string;
  verificationStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  notes?: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceType: 'ENROLLMENT' | 'MONTHLY' | 'OTHER';
    amount: number;
    currency: string;
    month?: string;
    year?: number;
    student?: {
      id: string;
      fullName: string;
    };
    trialRequest?: {
      id: string;
      studentName: string;
      contactEmail: string;
    };
  };
}

export default function PaymentVerificationPage() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentReceipt | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices?status=PENDING_VERIFICATION');

      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const result = await response.json();

      // Extract receipts from invoices (both enrollment and monthly)
      const allReceipts: PaymentReceipt[] = [];
      result.data?.forEach((invoice: any) => {
        invoice.paymentReceipts?.forEach((receipt: any) => {
          if (receipt.verificationStatus === 'SUBMITTED' || receipt.verificationStatus === 'PENDING') {
            allReceipts.push({
              ...receipt,
              invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                invoiceType: invoice.invoiceType,
                amount: invoice.amount,
                currency: invoice.currency,
                month: invoice.month,
                year: invoice.year,
                student: invoice.student,
                trialRequest: invoice.trialRequest,
              },
            });
          }
        });
      });
      setReceipts(allReceipts);
    } catch (err) {
      setError('Failed to load payment receipts');
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.invoice.student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.invoice.trialRequest?.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || receipt.invoice.invoiceType === filterType;

    return matchesSearch && matchesType;
  });

  const handleApprove = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setDialogType('approve');
    setShowDialog(true);
  };

  const handleReject = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setDialogType('reject');
    setRejectionReason('');
    setShowDialog(true);
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setViewingReceipt(receipt);
    setShowViewModal(true);
  };

  const handleApproveFromModal = () => {
    if (viewingReceipt) {
      setShowViewModal(false);
      handleApprove(viewingReceipt);
    }
  };

  const handleRejectFromModal = () => {
    if (viewingReceipt) {
      setShowViewModal(false);
      handleReject(viewingReceipt);
    }
  };

  const confirmAction = async () => {
    if (!selectedReceipt) return;

    try {
      setProcessing(true);
      const endpoint = `/api/invoices/${selectedReceipt.invoice.id}/verify-payment`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId: selectedReceipt.id,
          approved: dialogType === 'approve',
          rejectionReason: dialogType === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment verification');
      }

      // Refresh the list
      await fetchReceipts();
      setShowDialog(false);
      setSelectedReceipt(null);
      setRejectionReason('');
    } catch (err) {
      setError('Failed to process payment verification');
      console.error('Error processing payment:', err);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStudentName = (receipt: PaymentReceipt) => {
    return receipt.invoice.student?.fullName || receipt.invoice.trialRequest?.studentName || 'N/A';
  };

  const getInvoiceTypeLabel = (type: string) => {
    switch (type) {
      case 'ENROLLMENT':
        return 'Enrollment';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return type;
    }
  };

  const getPeriodDisplay = (receipt: PaymentReceipt) => {
    if (receipt.invoice.invoiceType === 'ENROLLMENT') {
      return 'Enrollment Fee';
    }
    if (receipt.invoice.month && receipt.invoice.year) {
      return `${receipt.invoice.month} ${receipt.invoice.year}`;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
        <p className="mt-2 text-sm text-gray-700">
          Review and verify payment receipts for enrollment and monthly invoices
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
              <CardTitle>Pending Verifications ({filteredReceipts.length})</CardTitle>
              <CardDescription>Review uploaded payment receipts</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ENROLLMENT">Enrollment</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All receipts have been verified'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        <Badge variant={receipt.invoice.invoiceType === 'ENROLLMENT' ? 'default' : 'secondary'}>
                          {getInvoiceTypeLabel(receipt.invoice.invoiceType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {receipt.invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{getStudentName(receipt)}</TableCell>
                      <TableCell>{getPeriodDisplay(receipt)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(receipt.invoice.amount, receipt.invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {new Date(receipt.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(receipt)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(receipt)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
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

      {/* View Receipt Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Payment Receipt</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            {viewingReceipt && (
              <DialogDescription>
                Invoice #{viewingReceipt.invoice.invoiceNumber} - {getStudentName(viewingReceipt)}
              </DialogDescription>
            )}
          </DialogHeader>

          {viewingReceipt && (
            <div className="space-y-4">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant={viewingReceipt.invoice.invoiceType === 'ENROLLMENT' ? 'default' : 'secondary'}>
                    {getInvoiceTypeLabel(viewingReceipt.invoice.invoiceType)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(viewingReceipt.invoice.amount, viewingReceipt.invoice.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="font-medium">{getPeriodDisplay(viewingReceipt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {new Date(viewingReceipt.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Student Notes */}
              {viewingReceipt.notes && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Student Notes:</p>
                  <p className="text-sm text-blue-800">{viewingReceipt.notes}</p>
                </div>
              )}

              {/* Receipt Preview */}
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="p-2 bg-gray-100 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Receipt Preview</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(viewingReceipt.fileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in New Tab
                  </Button>
                </div>
                <div className="p-4 bg-white min-h-[400px] flex items-center justify-center">
                  {viewingReceipt.fileUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={viewingReceipt.fileUrl}
                      className="w-full h-[500px] border-0"
                      title="Payment Receipt"
                    />
                  ) : (
                    <img
                      src={viewingReceipt.fileUrl}
                      alt="Payment Receipt"
                      className="max-w-full max-h-[500px] object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={handleRejectFromModal}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveFromModal}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'approve'
                ? 'Are you sure you want to approve this payment receipt? This will mark the invoice as paid.'
                : 'Please provide a reason for rejecting this payment receipt.'}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <Badge>{getInvoiceTypeLabel(selectedReceipt.invoice.invoiceType)}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Invoice</p>
                  <p className="font-medium">{selectedReceipt.invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Student</p>
                  <p className="font-medium">{getStudentName(selectedReceipt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">
                    {formatCurrency(selectedReceipt.invoice.amount, selectedReceipt.invoice.currency)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Period</p>
                  <p className="font-medium">{getPeriodDisplay(selectedReceipt)}</p>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-900">Student Notes:</p>
                  <p className="text-sm text-blue-800 mt-1">{selectedReceipt.notes}</p>
                </div>
              )}

              {dialogType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explain why this receipt is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={processing || (dialogType === 'reject' && !rejectionReason.trim())}
              className={
                dialogType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : dialogType === 'approve' ? (
                'Approve Payment'
              ) : (
                'Reject Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

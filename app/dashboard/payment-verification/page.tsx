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
import { Search, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';

interface PaymentReceipt {
  id: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    month: string;
    year: number;
    student: {
      fullName: string;
    };
  };
}

export default function PaymentVerificationPage() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

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

      const data = await response.json();
      // Extract receipts from invoices
      const allReceipts: PaymentReceipt[] = [];
      data.invoices?.forEach((invoice: any) => {
        invoice.paymentReceipts?.forEach((receipt: any) => {
          if (receipt.status === 'PENDING') {
            allReceipts.push({
              ...receipt,
              invoice: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.amount,
                month: invoice.month,
                year: invoice.year,
                student: invoice.student,
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

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.invoice.student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading payment receipts...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
        <p className="mt-2 text-sm text-gray-700">
          Review and verify student payment receipts
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
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search receipts..."
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search' : 'All receipts have been verified'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell className="font-medium">
                        {receipt.invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{receipt.invoice.student.fullName}</TableCell>
                      <TableCell>
                        {receipt.invoice.month} {receipt.invoice.year}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(receipt.invoice.amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(receipt.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <a
                          href={receipt.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </a>
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
                  <p className="text-gray-500">Invoice</p>
                  <p className="font-medium">{selectedReceipt.invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Student</p>
                  <p className="font-medium">{selectedReceipt.invoice.student.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedReceipt.invoice.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Period</p>
                  <p className="font-medium">
                    {selectedReceipt.invoice.month} {selectedReceipt.invoice.year}
                  </p>
                </div>
              </div>

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
              {processing
                ? 'Processing...'
                : dialogType === 'approve'
                ? 'Approve Payment'
                : 'Reject Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

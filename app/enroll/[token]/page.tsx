'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EnrollmentPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<{
    invoiceId: string;
    invoiceNumber: string;
    trialRequestId: string;
    studentName: string;
    courseName: string | null;
    amount: number;
    currency: string;
    status: string;
    dueDate: string;
    lastReceiptStatus?: string;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/enrollment?token=${resolvedParams.token}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Invalid enrollment link');
        }

        const data = await response.json();
        setEnrollmentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid enrollment link');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [params]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 5MB');
      setFile(null);
      // Reset the input
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, JPG, or PNG file');
      setFile(null);
      // Reset the input
      e.target.value = '';
      return;
    }

    // Clear any previous errors
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload file to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceId', enrollmentData!.invoiceId);
      formData.append('notes', notes);

      const response = await fetch('/api/enrollment/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload payment proof');
      }

      setSuccess(true);
      // Redirect to success page or show success message
      setTimeout(() => {
        router.push('/enrollment-success');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload payment proof');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              onClick={() => router.push('/')}
              className="mt-4"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-green-500">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Payment Proof Submitted Successfully!</CardTitle>
            <CardDescription>
              Thank you for submitting your payment proof. We'll verify it shortly and contact you with further instructions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check if student has already submitted and is awaiting verification
  const isPendingVerification = enrollmentData?.lastReceiptStatus === 'SUBMITTED';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Enrollment</CardTitle>
          <CardDescription>
            {isPendingVerification
              ? 'Your payment proof is currently under review. You can submit a new proof if needed.'
              : 'Please upload your enrollment fee payment proof to complete the registration process.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Enrollment Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{enrollmentData?.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{enrollmentData?.courseName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-medium">{enrollmentData?.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enrollment Fee</p>
                  <p className="font-medium text-lg">{enrollmentData?.currency} {enrollmentData?.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{enrollmentData?.dueDate ? new Date(enrollmentData.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">
                    {isPendingVerification ? (
                      <span className="text-yellow-600">Pending Verification</span>
                    ) : (
                      enrollmentData?.status.toLowerCase().replace('_', ' ')
                    )}
                  </p>
                </div>
              </div>
            </div>

            {isPendingVerification && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <p className="text-sm text-yellow-800">
                  Your previous payment proof is under review. You can submit a new proof if you want to replace it.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payment-proof">Payment Proof * (PDF, JPG, PNG, max 5MB)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="payment-proof"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      file
                        ? 'bg-green-50 border-green-300 hover:bg-green-100'
                        : 'bg-muted/50 hover:bg-muted/30 border-muted-foreground/25'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      {file ? (
                        <>
                          <CheckCircle className="w-8 h-8 mb-3 text-green-600" />
                          <p className="mb-2 text-sm font-semibold text-green-700">
                            File Selected
                          </p>
                          <p className="text-xs text-green-600 break-all px-4">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Click to change file
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="payment-proof"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={submitting}
                      required
                    />
                  </label>
                </div>
                {!file && (
                  <p className="text-xs text-red-600">
                    * Payment proof is required to complete enrollment
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., Transaction ID, payment method, etc."
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!file || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Payment Proof...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {isPendingVerification ? 'Submit New Payment Proof' : 'Submit Payment Proof'}
                    </>
                  )}
                </Button>
                {!file && (
                  <p className="text-xs text-center text-muted-foreground">
                    Please select a file to enable submission
                  </p>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

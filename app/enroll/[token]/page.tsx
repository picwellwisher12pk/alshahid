'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EnrollmentPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [trialRequest, setTrialRequest] = useState<{
    id: string;
    studentName: string;
    courseName: string | null;
  } | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      try {
        const resolvedParams = await params;
        setToken(resolvedParams.token);
        const response = await fetch(`/api/enrollment?token=${resolvedParams.token}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Invalid enrollment link');
        }

        const data = await response.json();
        setTrialRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid enrollment link');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [params]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
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
      // Upload file to storage (you'll need to implement this)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('trialRequestId', trialRequest!.id);
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Enrollment</CardTitle>
          <CardDescription>
            Please upload your enrollment fee payment proof to complete the registration process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Student Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-md">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-medium">{trialRequest?.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{trialRequest?.courseName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payment-proof">Payment Proof (PDF, JPG, PNG, max 5MB)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="payment-proof"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file ? file.name : 'PDF, JPG, or PNG (MAX. 5MB)'}
                      </p>
                    </div>
                    <input
                      id="payment-proof"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                  </label>
                </div>
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
                />
              </div>

              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={!file || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Payment Proof'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

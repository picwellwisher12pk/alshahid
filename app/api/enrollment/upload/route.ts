import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const trialRequestId = formData.get('trialRequestId') as string;
    const notes = (formData.get('notes') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!trialRequestId) {
      return NextResponse.json(
        { error: 'Trial request ID is required' },
        { status: 400 }
      );
    }

    // Verify trial request exists and is valid
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id: trialRequestId },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Invalid trial request' },
        { status: 404 }
      );
    }

    // Upload file to storage (you'll need to implement this)
    // For now, we'll just store the file name
    const fileName = `enrollment-${Date.now()}-${file.name}`;
    
    // In a real implementation, you would upload the file to a storage service here
    // For example, using Supabase Storage, AWS S3, or similar
    // const fileUrl = await uploadFileToStorage(file, fileName);
    
    // For now, we'll just use a placeholder
    const fileUrl = `/uploads/${fileName}`;

    // Create enrollment payment record
    const enrollmentPayment = await prisma.enrollmentPayment.create({
      data: {
        trialRequestId,
        amount: 0, // Set the actual amount as needed
        paymentProofUrl: fileUrl,
        notes,
        status: 'PENDING',
      },
    });

    // Update trial request with enrollment payment ID
    await prisma.trialRequest.update({
      where: { id: trialRequestId },
      data: {
        enrollmentPaymentId: enrollmentPayment.id,
        status: 'PENDING_PAYMENT_VERIFICATION',
      },
    });

    // TODO: Send notification to admin about new payment proof

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
}

// Example function to upload file to storage (implement according to your storage solution)
async function uploadFileToStorage(file: File, fileName: string): Promise<string> {
  // Implement file upload logic here
  // Example with Supabase Storage:
  /*
  const { data, error } = await supabase.storage
    .from('enrollment-payments')
    .upload(fileName, file);

  if (error) {
    throw error;
  }

  return data.path;
  */
  
  // For now, return a placeholder
  return `/uploads/${fileName}`;
}

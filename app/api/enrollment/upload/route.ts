import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Check if enrollment payment already exists
    const existingPayment = await prisma.enrollmentPayment.findUnique({
      where: { trialRequestId },
    });

    if (existingPayment) {
      // Update existing payment with proof
      await prisma.enrollmentPayment.update({
        where: { id: existingPayment.id },
        data: {
          paymentProofUrl: fileUrl,
          notes,
          status: 'PENDING',
        },
      });
    } else {
      // Create new enrollment payment record
      await prisma.enrollmentPayment.create({
        data: {
          trialRequestId,
          amount: 0, // Will be set by admin when converting trial
          paymentProofUrl: fileUrl,
          notes,
          status: 'PENDING',
        },
      });
    }

    // Update trial request status to indicate payment proof submitted
    await prisma.trialRequest.update({
      where: { id: trialRequestId },
      data: {
        status: 'SCHEDULED', // Waiting for admin to verify payment
      },
    });

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

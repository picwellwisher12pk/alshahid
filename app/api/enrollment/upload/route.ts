import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFileToSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const invoiceId = formData.get('invoiceId') as string;
    const notes = (formData.get('notes') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, WebP) and PDFs are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Verify invoice exists and is valid
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        trialRequest: true,
        paymentReceipts: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invalid invoice' },
        { status: 404 }
      );
    }

    // Check if it's an enrollment invoice
    if (invoice.invoiceType !== 'ENROLLMENT') {
      return NextResponse.json(
        { error: 'This endpoint is for enrollment invoices only' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice has already been paid and approved' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 50); // Limit original name length
    const fileName = `enrollment-${Date.now()}-${sanitizedOriginalName}`;
    const storagePath = `enrollment/${fileName}`;

    // Upload to Supabase Storage
    const fileUrl = await uploadFileToSupabase(
      'payment-receipts', // Bucket name
      storagePath,
      file,
      file.type
    );

    // Store payment proof as a receipt
    await prisma.$transaction(async (tx) => {
      // Create payment receipt
      await tx.paymentReceipt.create({
        data: {
          invoiceId,
          fileUrl,
          notes,
          uploadedBy: invoice.trialRequest?.contactEmail || 'Unknown',
          verificationStatus: 'SUBMITTED', // Student has submitted proof
        },
      });

      // Update invoice status to pending verification
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PENDING_VERIFICATION',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment proof submitted successfully. Admin will verify it shortly.',
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing Supabase environment variables')) {
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      if (error.message.includes('Failed to upload file')) {
        return NextResponse.json(
          { error: 'Failed to upload file to storage. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
}


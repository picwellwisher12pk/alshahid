import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // Upload file to local storage in public/uploads directory
    const fileName = `enrollment-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // File URL that can be accessed from the browser
    const fileUrl = `/uploads/${fileName}`;

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
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
}


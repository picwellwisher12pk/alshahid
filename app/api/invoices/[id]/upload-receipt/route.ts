import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for uploading a receipt
const uploadReceiptSchema = z.object({
  fileUrl: z.string().url('Invalid file URL'),
  notes: z.string().optional(),
});

// POST /api/invoices/[id]/upload-receipt - Upload payment receipt (Student only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['STUDENT']);
    const invoiceId = params.id;
    const body = await request.json();

    // Validate request body
    const validatedData = uploadReceiptSchema.parse(body);

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Verify invoice exists and belongs to this student
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.studentId !== student.id) {
      return NextResponse.json(
        { success: false, error: 'You can only upload receipts for your own invoices' },
        { status: 403 }
      );
    }

    // Check if invoice is already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Invoice is already marked as paid' },
        { status: 400 }
      );
    }

    // Create payment receipt and update invoice status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment receipt
      const receipt = await tx.paymentReceipt.create({
        data: {
          invoiceId: invoiceId,
          fileUrl: validatedData.fileUrl,
          uploadedBy: user.id,
          verificationStatus: 'PENDING',
          notes: validatedData.notes,
        },
      });

      // Update invoice status to PENDING_VERIFICATION
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PENDING_VERIFICATION',
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              contactEmail: true,
            },
          },
        },
      });

      return { receipt, invoice: updatedInvoice };
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Payment receipt uploaded successfully. Awaiting admin verification.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload receipt error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload receipt' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// GET /api/invoices/[id]/upload-receipt - List receipts for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'TEACHER', 'STUDENT']);
    const invoiceId = params.id;

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          select: {
            id: true,
            teacherId: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student || invoice.studentId !== student.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    } else if (user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (!teacher || invoice.student.teacherId !== teacher.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Fetch all receipts for this invoice
    const receipts = await prisma.paymentReceipt.findMany({
      where: { invoiceId: invoiceId },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: receipts,
    });
  } catch (error: any) {
    console.error('Get receipts error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch receipts' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';

// Validation schema for verifying payment
const verifyPaymentSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
  action: z.enum(['APPROVE', 'REJECT'], {
    required_error: 'Action must be either APPROVE or REJECT',
  }),
  rejectionReason: z.string().optional(),
});

// POST /api/invoices/[id]/verify-payment - Verify payment receipt (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id: invoiceId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = verifyPaymentSchema.parse(body);

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify receipt exists and belongs to this invoice
    const receipt = await prisma.paymentReceipt.findUnique({
      where: { id: validatedData.receiptId },
    });

    if (!receipt) {
      return NextResponse.json(
        { success: false, error: 'Receipt not found' },
        { status: 404 }
      );
    }

    if (receipt.invoiceId !== invoiceId) {
      return NextResponse.json(
        { success: false, error: 'Receipt does not belong to this invoice' },
        { status: 400 }
      );
    }

    // Check if receipt is already verified
    if (receipt.verificationStatus !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: `Receipt has already been ${receipt.verificationStatus.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // If rejecting, require a reason
    if (validatedData.action === 'REJECT' && !validatedData.rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required when rejecting a receipt' },
        { status: 400 }
      );
    }

    // Update receipt and invoice in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update receipt verification status
      const updatedReceipt = await tx.paymentReceipt.update({
        where: { id: validatedData.receiptId },
        data: {
          verificationStatus: validatedData.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          verifiedByUserId: user.id,
          verifiedAt: new Date(),
          ...(validatedData.rejectionReason && {
            rejectionReason: validatedData.rejectionReason,
          }),
        },
      });

      // Update invoice status based on action
      let newInvoiceStatus: 'PAID' | 'UNPAID' |'OVERDUE';
      if (validatedData.action === 'APPROVE') {
        newInvoiceStatus = 'PAID';
      } else {
        // If rejected, set back to UNPAID (or OVERDUE if past due date)
        const now = new Date();
        const dueDate = new Date(invoice.dueDate);
        newInvoiceStatus = now > dueDate ? 'OVERDUE' : 'UNPAID';
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newInvoiceStatus,
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              contactEmail: true,
            },
          },
          paymentReceipts: true,
        },
      });

      return { receipt: updatedReceipt, invoice: updatedInvoice };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message:
        validatedData.action === 'APPROVE'
          ? 'Payment approved successfully. Invoice marked as paid.'
          : 'Payment rejected. Invoice status updated.',
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);

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
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// GET /api/invoices/[id]/verify-payment - Get verification history for an invoice (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN']);
    const { id: invoiceId } = await params;

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
          },
        },
        paymentReceipts: {
          orderBy: {
            uploadedAt: 'desc',
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

    return NextResponse.json({
      success: true,
      data: {
        invoice: invoice,
        receipts: invoice.paymentReceipts,
        pendingCount: invoice.paymentReceipts.filter(
          (r) => r.verificationStatus === 'PENDING'
        ).length,
        approvedCount: invoice.paymentReceipts.filter(
          (r) => r.verificationStatus === 'APPROVED'
        ).length,
        rejectedCount: invoice.paymentReceipts.filter(
          (r) => r.verificationStatus === 'REJECTED'
        ).length,
      },
    });
  } catch (error: any) {
    console.error('Get verification history error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch verification history' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

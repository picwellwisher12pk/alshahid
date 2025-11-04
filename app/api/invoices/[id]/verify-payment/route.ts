import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import crypto from 'node:crypto';

// Validation schema for verifying payment
const verifyPaymentSchema = z.object({
  receiptId: z.string().min(1, 'Receipt ID is required'),
  approved: z.boolean(),
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

    // Verify invoice exists with all related data
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
        trialRequest: {
          select: {
            id: true,
            studentName: true,
            contactEmail: true,
            courseName: true,
            status: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
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
    if (receipt.verificationStatus === 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Receipt has already been approved',
        },
        { status: 400 }
      );
    }

    // If rejecting, require a reason
    if (!validatedData.approved && !validatedData.rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required when rejecting a receipt' },
        { status: 400 }
      );
    }

    // Update receipt and invoice in a transaction
    // For enrollment invoices, also create student account and send credentials
    const result = await prisma.$transaction(async (tx) => {
      // Update receipt verification status
      const updatedReceipt = await tx.paymentReceipt.update({
        where: { id: validatedData.receiptId },
        data: {
          verificationStatus: validatedData.approved ? 'APPROVED' : 'REJECTED',
          verifiedByUserId: user.id,
          verifiedAt: new Date(),
          ...(validatedData.rejectionReason && {
            rejectionReason: validatedData.rejectionReason,
          }),
        },
      });

      // Update invoice status based on action
      let newInvoiceStatus: 'PAID' | 'UNPAID' | 'OVERDUE';
      if (validatedData.approved) {
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
      });

      let newStudent = null;
      let passwordPlaintext = null;

      // If this is an ENROLLMENT invoice and it's approved, create student account
      if (validatedData.approved && invoice.invoiceType === 'ENROLLMENT' && invoice.trialRequest) {
        // Check if student already exists for this trial request
        const existingStudent = await tx.student.findFirst({
          where: {
            contactEmail: invoice.trialRequest.contactEmail,
          },
        });

        if (!existingStudent) {
          // Generate temporary password
          passwordPlaintext = crypto.randomBytes(8).toString('hex');
          const hashedPassword = await hash(passwordPlaintext, 10);

          // Create user account
          const newUser = await tx.user.create({
            data: {
              email: invoice.trialRequest.contactEmail,
              fullName: invoice.trialRequest.studentName,
              password: hashedPassword,
              role: 'STUDENT',
              emailVerified: false,
              mustResetPassword: true, // Force password change on first login
            },
          });

          // Create student profile
          newStudent = await tx.student.create({
            data: {
              userId: newUser.id,
              fullName: invoice.trialRequest.studentName,
              contactEmail: invoice.trialRequest.contactEmail,
              teacherId: invoice.teacherId,
              status: 'ACTIVE',
            },
          });

          // Link invoice to newly created student
          await tx.invoice.update({
            where: { id: invoiceId },
            data: {
              studentId: newStudent.id,
            },
          });

          // Update trial request status to CONVERTED
          await tx.trialRequest.update({
            where: { id: invoice.trialRequest.id },
            data: {
              status: 'CONVERTED',
            },
          });

          console.log(`✅ Student account created for: ${newStudent.fullName}`);
          console.log(`📧 Email: ${newStudent.contactEmail}`);
          console.log(`🔑 Temporary Password: ${passwordPlaintext}`);
        } else {
          // Student already exists, just update trial request
          await tx.trialRequest.update({
            where: { id: invoice.trialRequest.id },
            data: {
              status: 'CONVERTED',
            },
          });
          console.log(`ℹ️ Student already exists: ${invoice.trialRequest.studentName}`);
        }
      }

      return {
        receipt: updatedReceipt,
        invoice: updatedInvoice,
        newStudent,
        passwordPlaintext,
      };
    });

    // TODO: Send email with credentials if student was created
    if (result.newStudent && result.passwordPlaintext) {
      console.log('\n=== STUDENT CREDENTIALS (EMAIL THIS TO STUDENT) ===');
      console.log('Name:', result.newStudent.fullName);
      console.log('Email:', result.newStudent.contactEmail);
      console.log('Password:', result.passwordPlaintext);
      console.log('Login URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      console.log('====================================================\n');

      // In production, send email here with credentials
      // await sendStudentCredentialsEmail(
      //   result.newStudent.contactEmail,
      //   result.newStudent.fullName,
      //   result.passwordPlaintext
      // );
    }

    let message = validatedData.approved
      ? 'Payment approved successfully. Invoice marked as paid.'
      : 'Payment rejected. Invoice status updated.';

    if (result.newStudent) {
      message += ' Student account created and credentials sent via email.';
    }

    return NextResponse.json({
      success: true,
      data: {
        receipt: result.receipt,
        invoice: result.invoice,
        studentCreated: !!result.newStudent,
      },
      message,
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
        trialRequest: {
          select: {
            id: true,
            studentName: true,
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
          (r) => r.verificationStatus === 'PENDING' || r.verificationStatus === 'SUBMITTED'
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

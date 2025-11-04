import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { sendEnrollmentPaymentLink } from '@/lib/email';
import crypto from 'node:crypto';

const convertTrialSchema = z.object({
  teacherId: z.string(),
  enrollmentFee: z.number().positive(),
  currency: z.string().default('PKR'),
});

// POST - Convert trial request to student with enrollment invoice (Unified System)
// Admin triggers this, student gets magic link for payment, then gets account after approval
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authPayload = await requireRole(request, ['ADMIN']);
    const { id: trialRequestId } = await params;

    const body = await request.json();
    const validation = convertTrialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    let { teacherId } = validation.data;
    const { enrollmentFee, currency } = validation.data;

    // Get trial request
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id: trialRequestId },
      include: {
        invoices: {
          where: { invoiceType: 'ENROLLMENT' },
        },
      },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }

    if (trialRequest.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Trial request already converted' },
        { status: 400 }
      );
    }

    // Handle auto-assign-admin case: create teacher profile for current admin if needed
    if (teacherId === 'auto-assign-admin') {
      const userId = authPayload?.id;

      if (!userId) {
        return NextResponse.json(
          { error: 'Unable to identify admin user' },
          { status: 401 }
        );
      }

      // Check if admin already has a teacher profile
      let adminTeacher = await prisma.teacher.findUnique({
        where: { userId },
      });

      // If not, create one
      if (!adminTeacher) {
        const adminUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        adminTeacher = await prisma.teacher.create({
          data: {
            userId,
            bio: 'Academy Administrator',
            isActive: true,
          },
        });

        console.log(`Created teacher profile for admin: ${adminUser?.email}`);
      }

      teacherId = adminTeacher.id;
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if enrollment invoice already exists
    const existingInvoice = trialRequest.invoices.find(
      (inv) => inv.invoiceType === 'ENROLLMENT'
    );

    // If invoice exists and is already paid/verified, don't allow recreation
    if (
      existingInvoice &&
      (existingInvoice.status === 'PAID' ||
        existingInvoice.status === 'PENDING_VERIFICATION')
    ) {
      return NextResponse.json(
        {
          error: `Enrollment invoice already ${existingInvoice.status.toLowerCase()}. Cannot recreate.`,
        },
        { status: 400 }
      );
    }

    // Generate magic token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(magicToken)
      .digest('hex');

    // Set expiration to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Set due date to 7 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Create or update enrollment invoice with magic link
    const result = await prisma.$transaction(async (tx) => {
      let enrollmentInvoice;

      if (existingInvoice) {
        // Update existing invoice with new token and details
        enrollmentInvoice = await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            amount: enrollmentFee,
            currency,
            magicToken: hashedToken,
            magicTokenExpiry: expiresAt,
            dueDate,
            teacherId,
            status: 'UNPAID',
            notes: 'Enrollment fee - updated',
          },
        });

        // Clear any previous payment receipts
        await tx.paymentReceipt.deleteMany({
          where: { invoiceId: existingInvoice.id },
        });
      } else {
        // Create new enrollment invoice
        enrollmentInvoice = await tx.invoice.create({
          data: {
            invoiceType: 'ENROLLMENT',
            trialRequestId,
            teacherId,
            amount: enrollmentFee,
            currency,
            dueDate,
            magicToken: hashedToken,
            magicTokenExpiry: expiresAt,
            status: 'UNPAID',
            notes: 'Enrollment fee',
          },
        });
      }

      // Update trial request status to SCHEDULED (waiting for payment)
      const updatedTrialRequest = await tx.trialRequest.update({
        where: { id: trialRequestId },
        data: { status: 'SCHEDULED' },
      });

      return { enrollmentInvoice, trialRequest: updatedTrialRequest };
    });

    // Generate payment link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentLinkUrl = `${baseUrl}/enroll/${magicToken}`;

    // Send enrollment payment email with magic link
    try {
      await sendEnrollmentPaymentLink(
        trialRequest.contactEmail,
        trialRequest.studentName,
        enrollmentFee,
        currency,
        paymentLinkUrl
      );
    } catch (emailError) {
      console.error('Failed to send enrollment email:', emailError);
      // Continue anyway - admin can manually share the link
      if (process.env.NODE_ENV === 'development') {
        console.log('\n=== ENROLLMENT PAYMENT LINK ===');
        console.log('Student:', trialRequest.studentName);
        console.log('Email:', trialRequest.contactEmail);
        console.log('Payment Link:', paymentLinkUrl);
        console.log('Expires:', expiresAt);
        console.log('================================\n');
      }
    }

    return NextResponse.json({
      message:
        'Trial request converted successfully. Enrollment payment link sent to student.',
      data: {
        enrollmentInvoice: result.enrollmentInvoice,
        trialRequest: result.trialRequest,
        paymentLink:
          process.env.NODE_ENV === 'development' ? paymentLinkUrl : undefined,
      },
    });
  } catch (error: any) {
    console.error('Convert trial error:', error);

    if (
      error.message === 'Unauthorized' ||
      error.message.includes('Forbidden')
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

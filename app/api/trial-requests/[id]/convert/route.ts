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

// POST - Convert trial request to student with enrollment payment (Option B)
// Admin triggers this, student gets magic link for payment, then gets account after approval
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, ['ADMIN']);
    const { id: trialRequestId } = await params;

    const body = await request.json();
    const validation = convertTrialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { teacherId, enrollmentFee, currency } = validation.data;

    // Get trial request
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id: trialRequestId },
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

    // Generate magic token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(magicToken).digest('hex');

    // Set expiration to 48 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create enrollment payment record with magic link
    const result = await prisma.$transaction(async (tx) => {
      // Create enrollment payment record
      const enrollmentPayment = await tx.enrollmentPayment.create({
        data: {
          trialRequestId,
          amount: enrollmentFee,
          currency,
          magicToken: hashedToken,
          magicTokenExpiry: expiresAt,
          status: 'PENDING',
        },
      });

      // Update trial request status to SCHEDULED (waiting for payment)
      const updatedTrialRequest = await tx.trialRequest.update({
        where: { id: trialRequestId },
        data: { status: 'SCHEDULED' },
      });

      return { enrollmentPayment, trialRequest: updatedTrialRequest };
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
      message: 'Trial request converted successfully. Enrollment payment link sent to student.',
      data: {
        enrollmentPayment: result.enrollmentPayment,
        trialRequest: result.trialRequest,
        paymentLink: process.env.NODE_ENV === 'development' ? paymentLinkUrl : undefined,
      },
    });
  } catch (error: any) {
    console.error('Convert trial error:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'node:crypto';

// GET - Validate magic token and get enrollment invoice details
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Find invoice by hashed magic token
    const invoice = await prisma.invoice.findFirst({
      where: {
        magicToken: hashedToken,
        invoiceType: 'ENROLLMENT',
      },
      include: {
        trialRequest: true,
        paymentReceipts: {
          orderBy: { uploadedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!invoice) {
      console.error('Enrollment invoice not found for token');
      return NextResponse.json(
        { error: 'Invalid enrollment link' },
        { status: 400 }
      );
    }

    // Check expiry separately for better error message
    const now = new Date();
    if (!invoice.magicTokenExpiry || invoice.magicTokenExpiry <= now) {
      console.error('Enrollment link expired:', {
        expiry: invoice.magicTokenExpiry,
        now,
      });
      return NextResponse.json(
        {
          error:
            'Enrollment link has expired. Please request a new link from the administrator.',
        },
        { status: 400 }
      );
    }

    if (!invoice.trialRequest) {
      console.error('Trial request not found for enrollment invoice');
      return NextResponse.json(
        { error: 'Invalid enrollment link' },
        { status: 400 }
      );
    }

    // Check if already paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        {
          error:
            'This enrollment has already been paid and processed. Please contact the administrator.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      trialRequestId: invoice.trialRequest.id,
      studentName: invoice.trialRequest.studentName,
      courseName: invoice.trialRequest.courseName,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.dueDate,
      // Include last payment receipt status if exists
      lastReceiptStatus: invoice.paymentReceipts[0]?.verificationStatus,
    });
  } catch (error) {
    console.error('Error validating enrollment token:', error);
    return NextResponse.json(
      { error: 'Failed to validate enrollment link' },
      { status: 500 }
    );
  }
}

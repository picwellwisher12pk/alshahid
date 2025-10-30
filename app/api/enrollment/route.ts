import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'node:crypto';
import { sendEnrollmentEmail } from '@/lib/email/templates/enrollment';

export async function POST(req: Request) {
  try {
    const { trialRequestId } = await req.json();

    // Find the trial request
    const trialRequest = await prisma.trialRequest.findUnique({
      where: { id: trialRequestId },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }

    // Generate a secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 36); // 36 hours expiry

    // Update trial request with token
    await prisma.trialRequest.update({
      where: { id: trialRequestId },
      data: {
        enrollmentToken: token,
        enrollmentTokenExpiresAt: expiresAt,
      },
    });

    // Send enrollment email with the token
    const enrollmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enroll/${token}`;
    await sendEnrollmentEmail(trialRequest.contactEmail, {
      studentName: trialRequest.studentName,
      enrollmentUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error generating enrollment link:', error);
    return NextResponse.json(
      { error: 'Failed to generate enrollment link' },
      { status: 500 }
    );
  }
}

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

    // Find trial request by token
    const trialRequest = await prisma.trialRequest.findFirst({
      where: {
        enrollmentToken: token,
        enrollmentTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired enrollment link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      trialRequestId: trialRequest.id,
      studentName: trialRequest.studentName,
      courseName: trialRequest.courseName,
    });
  } catch (error) {
    console.error('Error validating enrollment token:', error);
    return NextResponse.json(
      { error: 'Failed to validate enrollment link' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { auth, handlers } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { initiateEnrollmentProcess } from '@/lib/enrollment';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const trialRequestId = params.id;

    // Initiate the enrollment process
    const updatedRequest = await initiateEnrollmentProcess(trialRequestId);

    return NextResponse.json({
      success: true,
      data: {
        trialRequestId: updatedRequest.id,
        status: updatedRequest.status,
      },
    });
  } catch (error) {
    console.error('Error initiating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to initiate enrollment process' },
      { status: 500 }
    );
  }
}

export const { GET, POST: _ } = handlers;

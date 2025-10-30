import { prisma } from './prisma';
import { randomBytes } from 'node:crypto';
import { sendEnrollmentEmail } from './email/templates/enrollment';

export async function initiateEnrollmentProcess(trialRequestId: string) {
  // Generate a secure token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 36); // 36 hours expiry

  // Update trial request with token
  const updatedRequest = await prisma.trialRequest.update({
    where: { id: trialRequestId },
    data: {
      enrollmentToken: token,
      enrollmentTokenExpiresAt: expiresAt,
      status: 'SCHEDULED',
    },
  });

  // Send enrollment email
  const enrollmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enroll/${token}`;
  await sendEnrollmentEmail(updatedRequest.contactEmail, {
    studentName: updatedRequest.studentName,
    enrollmentUrl,
  });

  return updatedRequest;
}

export async function verifyEnrollmentToken(token: string) {
  return prisma.trialRequest.findFirst({
    where: {
      enrollmentToken: token,
      enrollmentTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function createStudentFromTrial(trialRequestId: string, userId: string) {
  const trialRequest = await prisma.trialRequest.findUnique({
    where: { id: trialRequestId },
    include: {
      enrollmentPayment: true,
    },
  });

  if (!trialRequest) {
    throw new Error('Trial request not found');
  }

  if (!trialRequest.enrollmentPayment) {
    throw new Error('No enrollment payment found');
  }

  // Create student record
  const student = await prisma.student.create({
    data: {
      fullName: trialRequest.studentName,
      contactEmail: trialRequest.contactEmail,
      contactPhone: trialRequest.contactPhone,
      age: trialRequest.studentAge,
      enrollmentPaymentId: trialRequest.enrollmentPayment.id,
      status: 'ACTIVE',
    },
  });

  // Update enrollment payment status
  await prisma.enrollmentPayment.update({
    where: { id: trialRequest.enrollmentPayment.id },
    data: {
      status: 'APPROVED',
      verifiedByUserId: userId,
      verifiedAt: new Date(),
    },
  });

  // Update trial request status
  await prisma.trialRequest.update({
    where: { id: trialRequestId },
    data: {
      status: 'CONVERTED',
    },
  });

  // TODO: Send welcome email with login credentials

  return student;
}

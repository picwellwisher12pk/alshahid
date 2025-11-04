import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteStudent(email: string) {
  console.log(`\n🔍 Looking for student with email: ${email}\n`);

  // Find student by email (could be user email or contact email)
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { contactEmail: email },
        { user: { email: email } },
      ],
    },
    include: {
      user: true,
      classes: true,
      invoices: {
        include: {
          paymentReceipts: true,
        },
      },
      progressLogs: true,
    },
  });

  if (!student) {
    console.log('❌ Student not found with that email');
    return;
  }

  console.log('✅ Found student:');
  console.log(`   Name: ${student.fullName}`);
  console.log(`   ID: ${student.id}`);
  console.log(`   Status: ${student.status}`);
  console.log(`   User Account: ${student.user ? student.user.email : 'No login account'}`);
  console.log(`   Classes: ${student.classes.length}`);
  console.log(`   Invoices: ${student.invoices.length}`);
  console.log(`   Progress Logs: ${student.progressLogs.length}`);

  // Find trial request if exists
  const trialRequest = await prisma.trialRequest.findFirst({
    where: { contactEmail: email },
  });

  if (trialRequest) {
    console.log(`   Trial Request: ${trialRequest.id} (Status: ${trialRequest.status})`);
  }

  console.log('\n⚠️  Deleting student and all related data...\n');

  // Delete everything in a transaction
  await prisma.$transaction(async (tx) => {
    // Delete payment receipts first
    for (const invoice of student.invoices) {
      await tx.paymentReceipt.deleteMany({
        where: { invoiceId: invoice.id },
      });
      console.log(`   ✓ Deleted ${invoice.paymentReceipts.length} payment receipts for invoice ${invoice.invoiceNumber}`);
    }

    // Delete invoices
    await tx.invoice.deleteMany({
      where: { studentId: student.id },
    });
    console.log(`   ✓ Deleted ${student.invoices.length} invoices`);

    // Delete classes
    await tx.class.deleteMany({
      where: { studentId: student.id },
    });
    console.log(`   ✓ Deleted ${student.classes.length} classes`);

    // Delete progress logs
    await tx.progressLog.deleteMany({
      where: { studentId: student.id },
    });
    console.log(`   ✓ Deleted ${student.progressLogs.length} progress logs`);

    // Delete student profile
    await tx.student.delete({
      where: { id: student.id },
    });
    console.log(`   ✓ Deleted student profile`);

    // Delete user account if exists
    if (student.userId) {
      await tx.user.delete({
        where: { id: student.userId },
      });
      console.log(`   ✓ Deleted user account: ${student.user?.email}`);
    }

    // Reset trial request if exists
    if (trialRequest) {
      await tx.trialRequest.update({
        where: { id: trialRequest.id },
        data: { status: 'PENDING' },
      });
      console.log(`   ✓ Reset trial request to PENDING status`);

      // Delete invoices associated with trial request
      await tx.invoice.deleteMany({
        where: { trialRequestId: trialRequest.id },
      });
      console.log(`   ✓ Deleted trial request invoices`);
    }
  });

  console.log('\n✅ Student completely deleted from database!');
  console.log(`   You can now create a new trial request with email: ${email}\n`);
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Please provide an email address');
  console.log('Usage: bun run scripts/delete-student.ts <email>\n');
  console.log('Example: bun run scripts/delete-student.ts picwellwisher12pk@gmail.com\n');
  process.exit(1);
}

deleteStudent(email)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

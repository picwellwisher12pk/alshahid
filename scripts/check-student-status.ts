import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudentStatus() {
  console.log('\n=== CHECKING STUDENT STATUS ===\n');

  // Check trial requests
  const trialRequests = await prisma.trialRequest.findMany({
    include: {
      invoices: {
        include: {
          paymentReceipts: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`📋 Total Trial Requests: ${trialRequests.length}\n`);

  for (const trial of trialRequests) {
    console.log(`\n--- Trial Request ---`);
    console.log(`ID: ${trial.id}`);
    console.log(`Student Name: ${trial.studentName}`);
    console.log(`Contact Email: ${trial.contactEmail}`);
    console.log(`Status: ${trial.status}`);

    if (trial.invoices.length > 0) {
      console.log(`\nInvoices (${trial.invoices.length}):`);
      for (const invoice of trial.invoices) {
        console.log(`  - Invoice ID: ${invoice.id}`);
        console.log(`    Type: ${invoice.invoiceType}`);
        console.log(`    Status: ${invoice.status}`);
        console.log(`    Amount: ${invoice.amount} ${invoice.currency}`);
        console.log(`    Student ID: ${invoice.studentId || 'NOT LINKED'}`);

        if (invoice.paymentReceipts.length > 0) {
          console.log(`    Receipts (${invoice.paymentReceipts.length}):`);
          for (const receipt of invoice.paymentReceipts) {
            console.log(`      - Receipt ID: ${receipt.id}`);
            console.log(`        Status: ${receipt.verificationStatus}`);
            console.log(`        Uploaded: ${receipt.uploadedAt}`);
            console.log(`        Verified: ${receipt.verifiedAt || 'Not verified'}`);
          }
        }
      }
    }
    console.log('');
  }

  // Check students
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
      teacher: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n👥 Total Students: ${students.length}\n`);

  for (const student of students) {
    console.log(`\n--- Student Record ---`);
    console.log(`ID: ${student.id}`);
    console.log(`Full Name: ${student.fullName}`);
    console.log(`Contact Email: ${student.contactEmail}`);
    console.log(`Status: ${student.status}`);
    console.log(`Teacher: ${student.teacher?.user.fullName || 'Not assigned'}`);
    console.log(`User Account: ${student.user ? `${student.user.email} (${student.user.role})` : 'No login account'}`);
    console.log(`Created: ${student.createdAt}`);
  }

  // Check users with STUDENT role
  const studentUsers = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      studentProfile: true,
    },
  });

  console.log(`\n\n👤 Total STUDENT Users: ${studentUsers.length}\n`);

  for (const user of studentUsers) {
    console.log(`--- User Account ---`);
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Full Name: ${user.fullName}`);
    console.log(`Email Verified: ${user.emailVerified}`);
    console.log(`Must Reset Password: ${user.mustResetPassword}`);
    console.log(`Has Student Profile: ${!!user.studentProfile}`);
    if (user.studentProfile) {
      console.log(`  Student ID: ${user.studentProfile.id}`);
      console.log(`  Student Name: ${user.studentProfile.fullName}`);
    }
    console.log('');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Trial Requests with CONVERTED status: ${trialRequests.filter(t => t.status === 'CONVERTED').length}`);
  console.log(`Trial Requests with SCHEDULED status: ${trialRequests.filter(t => t.status === 'SCHEDULED').length}`);
  console.log(`Total Student Records: ${students.length}`);
  console.log(`Total Student User Accounts: ${studentUsers.length}`);
  console.log(`Students without User Account: ${students.filter(s => !s.userId).length}`);
  console.log(`Students with User Account: ${students.filter(s => s.userId).length}`);

  await prisma.$disconnect();
}

checkStudentStatus().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alshahid.com' },
    update: {},
    create: {
      email: 'admin@alshahid.com',
      fullName: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Sample Teachers
  console.log('\nCreating teachers...');

  const teacher1Password = await bcrypt.hash('Teacher123!', 12);
  const teacher1User = await prisma.user.upsert({
    where: { email: 'ustadh.ahmed@alshahid.com' },
    update: {},
    create: {
      email: 'ustadh.ahmed@alshahid.com',
      fullName: 'Ustadh Ahmed Rahman',
      password: teacher1Password,
      role: 'TEACHER',
      emailVerified: true,
    },
  });

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      userId: teacher1User.id,
      bio: 'Hafiz with 15 years of teaching experience. Specializes in Tajweed and Quran memorization.',
      isActive: true,
    },
  });
  console.log('✅ Teacher 1 created:', teacher1User.email);

  const teacher2Password = await bcrypt.hash('Teacher123!', 12);
  const teacher2User = await prisma.user.upsert({
    where: { email: 'ustadh.ibrahim@alshahid.com' },
    update: {},
    create: {
      email: 'ustadh.ibrahim@alshahid.com',
      fullName: 'Ustadh Ibrahim Ali',
      password: teacher2Password,
      role: 'TEACHER',
      emailVerified: true,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      userId: teacher2User.id,
      bio: 'Expert in Quranic Arabic and Islamic studies with Ijazah in multiple Qira\'at.',
      isActive: true,
    },
  });
  console.log('✅ Teacher 2 created:', teacher2User.email);

  // 3. Create Sample Students with Login Accounts
  console.log('\nCreating students with login accounts...');

  const student1Password = await bcrypt.hash('Student123!', 12);
  const student1User = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      fullName: 'Aisha Mohammed',
      password: student1Password,
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  const student1 = await prisma.student.upsert({
    where: { userId: student1User.id },
    update: {},
    create: {
      userId: student1User.id,
      fullName: 'Aisha Mohammed',
      age: 12,
      contactEmail: 'parent1@example.com',
      contactPhone: '+1-555-0101',
      teacherId: teacher1.id,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Student 1 created:', student1User.email);

  const student2Password = await bcrypt.hash('Student123!', 12);
  const student2User = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      fullName: 'Omar Hassan',
      password: student2Password,
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { userId: student2User.id },
    update: {},
    create: {
      userId: student2User.id,
      fullName: 'Omar Hassan',
      age: 15,
      contactEmail: 'parent2@example.com',
      contactPhone: '+1-555-0102',
      teacherId: teacher1.id,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Student 2 created:', student2User.email);

  // 4. Create Student without Login (parent managed)
  console.log('\nCreating students without login...');

  const student3 = await prisma.student.upsert({
    where: { id: 'seed-student-3' },
    update: {},
    create: {
      id: 'seed-student-3',
      fullName: 'Fatima Ali',
      age: 8,
      contactEmail: 'parent3@example.com',
      contactPhone: '+1-555-0103',
      teacherId: teacher2.id,
      status: 'TRIAL',
    },
  });
  console.log('✅ Student 3 created (no login):', student3.fullName);

  // 5. Create Sample Classes
  console.log('\nCreating sample classes...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const class1 = await prisma.class.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1.id,
      classTime: tomorrow,
      durationMinutes: 30,
      status: 'SCHEDULED',
      notes: 'Continuing Surah Al-Baqarah',
    },
  });
  console.log('✅ Class 1 scheduled');

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  const class2 = await prisma.class.create({
    data: {
      studentId: student2.id,
      teacherId: teacher1.id,
      classTime: nextWeek,
      durationMinutes: 45,
      status: 'SCHEDULED',
      notes: 'Tajweed rules review',
    },
  });
  console.log('✅ Class 2 scheduled');

  // 6. Create Progress Logs
  console.log('\nCreating progress logs...');

  const log1 = await prisma.progressLog.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1.id,
      title: 'Completed Surah Al-Fatiha memorization',
      notes: 'Excellent progress! Aisha has successfully memorized Surah Al-Fatiha with proper Tajweed. Ready to move to Surah Al-Baqarah.',
      logDate: new Date(),
    },
  });
  console.log('✅ Progress log 1 created');

  const log2 = await prisma.progressLog.create({
    data: {
      studentId: student2.id,
      teacherId: teacher1.id,
      title: 'Tajweed improvement',
      notes: 'Omar is making great progress with Tajweed rules. Focusing on proper pronunciation of letters from the throat.',
      logDate: new Date(),
    },
  });
  console.log('✅ Progress log 2 created');

  // 7. Create Invoices
  console.log('\nCreating invoices...');

  const dueDate = new Date();
  dueDate.setMonth(dueDate.getMonth() + 1);

  const invoice1 = await prisma.invoice.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1.id,
      amount: 150.00,
      dueDate: dueDate,
      status: 'UNPAID',
      month: 'November 2025',
      notes: 'Monthly tuition fee - 4 classes',
    },
  });
  console.log('✅ Invoice 1 created');

  const invoice2 = await prisma.invoice.create({
    data: {
      studentId: student2.id,
      teacherId: teacher1.id,
      amount: 180.00,
      dueDate: dueDate,
      status: 'PAID',
      month: 'October 2025',
      notes: 'Monthly tuition fee - 6 classes',
    },
  });
  console.log('✅ Invoice 2 created');

  // 8. Create Sample Trial Requests
  console.log('\nCreating trial requests...');

  const trial1 = await prisma.trialRequest.create({
    data: {
      requesterName: 'Sarah Johnson',
      studentName: 'Yusuf Johnson',
      studentAge: 10,
      contactEmail: 'sarah.johnson@example.com',
      contactPhone: '+1-555-0201',
      preferredTime: 'Weekday evenings',
      additionalNotes: 'Complete beginner, very interested in learning Quran',
      status: 'PENDING',
    },
  });
  console.log('✅ Trial request 1 created');

  const trial2 = await prisma.trialRequest.create({
    data: {
      requesterName: 'Mohammed Abdullah',
      studentName: 'Zaynab Abdullah',
      studentAge: 14,
      contactEmail: 'mohammed.a@example.com',
      contactPhone: '+1-555-0202',
      preferredTime: 'Weekend mornings',
      additionalNotes: 'Has basic knowledge, wants to improve Tajweed',
      status: 'SCHEDULED',
    },
  });
  console.log('✅ Trial request 2 created');

  // 9. Create Contact Messages
  console.log('\nCreating contact messages...');

  const contact1 = await prisma.contactMessage.create({
    data: {
      name: 'Abdullah Rahman',
      email: 'abdullah.r@example.com',
      subject: 'Question about class timings',
      message: 'Are weekend classes available? I am interested in enrolling my daughter.',
      status: 'UNREAD',
    },
  });
  console.log('✅ Contact message 1 created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('─────────────────────────────────────────');
  console.log('Admin:');
  console.log('  Email: admin@alshahid.com');
  console.log('  Password: Admin123!');
  console.log('\nTeacher 1:');
  console.log('  Email: ustadh.ahmed@alshahid.com');
  console.log('  Password: Teacher123!');
  console.log('\nTeacher 2:');
  console.log('  Email: ustadh.ibrahim@alshahid.com');
  console.log('  Password: Teacher123!');
  console.log('\nStudent 1:');
  console.log('  Email: student1@example.com');
  console.log('  Password: Student123!');
  console.log('\nStudent 2:');
  console.log('  Email: student2@example.com');
  console.log('  Password: Student123!');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

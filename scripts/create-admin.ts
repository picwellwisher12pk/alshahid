/**
 * Secure Admin User Creation Script
 *
 * This script creates the first admin user with a secure process:
 * 1. Prompts for admin details (not stored in code)
 * 2. Generates a temporary password
 * 3. Forces password reset on first login
 * 4. Sends credentials via email (or displays if email not configured)
 *
 * Usage:
 *   npm run create-admin
 *   or
 *   npx tsx scripts/create-admin.ts
 */

import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AdminDetails {
  email: string;
  fullName: string;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisified question function
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate secure random password
function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Send email or display credentials
async function sendOrDisplayCredentials(
  email: string,
  fullName: string,
  resetUrl: string
): Promise<void> {
  try {
    // Try to import email service
    const { sendWelcomeEmail } = await import('../src/lib/email');
    await sendWelcomeEmail(email, fullName, 'N/A', resetUrl);
    console.log('\n✅ Welcome email sent successfully!');
  } catch (error) {
    // Email service not configured - display credentials
    console.log('\n' + '='.repeat(70));
    console.log('📧 EMAIL SERVICE NOT CONFIGURED - CREDENTIALS BELOW:');
    console.log('='.repeat(70));
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('\nAdmin Password Reset URL:');
    console.log(`\n  ${resetUrl}`);
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  This URL will expire in 7 days.');
    console.log('⚠️  Copy this URL and send it to the admin via secure channel.');
    console.log('⚠️  Delete this terminal output after copying.');
    console.log('='.repeat(70) + '\n');
  }
}

async function createAdmin() {
  console.log('\n' + '='.repeat(70));
  console.log('🔐 SECURE ADMIN USER CREATION');
  console.log('='.repeat(70) + '\n');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      const override = await question(
        '⚠️  An admin user already exists. Create another? (yes/no): '
      );
      if (override.toLowerCase() !== 'yes') {
        console.log('\nℹ️  Admin creation cancelled.');
        rl.close();
        await prisma.$disconnect();
        return;
      }
    }

    // Get admin details
    let email = '';
    while (!email || !isValidEmail(email)) {
      email = await question('Admin Email: ');
      if (!isValidEmail(email)) {
        console.log('❌ Invalid email format. Please try again.');
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('\n❌ Error: A user with this email already exists.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    const fullName = await question('Admin Full Name: ');

    console.log('\n' + '-'.repeat(70));
    console.log('📋 Review Admin Details:');
    console.log('-'.repeat(70));
    console.log(`Email:     ${email}`);
    console.log(`Full Name: ${fullName}`);
    console.log(`Role:      ADMIN`);
    console.log('-'.repeat(70) + '\n');

    const confirm = await question('Create this admin user? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\nℹ️  Admin creation cancelled.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    console.log('\n⏳ Creating admin user...');

    // Generate temporary password (will be forced to reset)
    const temporaryPassword = generateSecurePassword(20);
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create admin user with mustResetPassword flag
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName,
        password: hashedPassword,
        role: 'ADMIN',
        mustResetPassword: true,
        emailVerified: true, // Auto-verify admin
      },
    });

    console.log('✅ Admin user created successfully!');

    // Generate password reset token
    console.log('⏳ Generating password reset token...');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.passwordResetToken.create({
      data: {
        userId: admin.id,
        token: hashedToken,
        expiresAt,
      },
    });

    console.log('✅ Password reset token created!');

    // Generate reset URL
    const appUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Send email or display credentials
    await sendOrDisplayCredentials(email, fullName, resetUrl);

    console.log('\n✅ Admin user setup complete!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Send the password reset URL to the admin via secure channel');
    console.log('   2. Admin should open the URL and set their password');
    console.log('   3. Admin can then login at /login');
    console.log('   4. Clear this terminal output for security\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

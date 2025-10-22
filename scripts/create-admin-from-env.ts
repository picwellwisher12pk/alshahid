/**
 * Create Admin User from Environment Variables
 *
 * This script creates an admin user using environment variables.
 * Useful for automated deployments or CI/CD pipelines.
 *
 * IMPORTANT: Only use this in secure environments where env vars
 * are properly managed (e.g., deployment platforms, not in .env file)
 *
 * Required Environment Variables:
 *   ADMIN_EMAIL       - Admin email address
 *   ADMIN_FULL_NAME   - Admin full name
 *   ADMIN_SEND_EMAIL  - Whether to send email (true/false, default: true)
 *
 * Usage:
 *   ADMIN_EMAIL="admin@example.com" ADMIN_FULL_NAME="Admin User" npm run create-admin:env
 *
 * Or in deployment platform (e.g., Vercel, Railway):
 *   Set environment variables in platform dashboard
 *   Run as post-deploy script
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate secure random password
function generateSecurePassword(length: number = 20): string {
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

async function createAdminFromEnv() {
  console.log('\n🔐 Creating Admin User from Environment Variables\n');

  try {
    // Get environment variables
    const email = process.env.ADMIN_EMAIL;
    const fullName = process.env.ADMIN_FULL_NAME;
    const sendEmail = process.env.ADMIN_SEND_EMAIL !== 'false'; // default true

    // Validate required variables
    if (!email) {
      throw new Error('ADMIN_EMAIL environment variable is required');
    }

    if (!fullName) {
      throw new Error('ADMIN_FULL_NAME environment variable is required');
    }

    if (!isValidEmail(email)) {
      throw new Error('ADMIN_EMAIL is not a valid email address');
    }

    console.log('📋 Admin Details:');
    console.log(`   Email:     ${email}`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`   Role:      ADMIN\n`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log('ℹ️  Admin user already exists. Skipping creation.');
      await prisma.$disconnect();
      return;
    }

    console.log('⏳ Creating admin user...');

    // Generate temporary password
    const temporaryPassword = generateSecurePassword(20);
    const hashedPassword = await hashPassword(temporaryPassword);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName,
        password: hashedPassword,
        role: 'ADMIN',
        mustResetPassword: true,
        emailVerified: true,
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

    // Try to send email if configured
    if (sendEmail) {
      try {
        const { sendWelcomeEmail } = await import('../lib/email');
        await sendWelcomeEmail(email, fullName, 'N/A', resetUrl);
        console.log('\n✅ Welcome email sent successfully!');
      } catch (error) {
        console.log('\n⚠️  Email service not configured. Displaying credentials:\n');
        console.log('='.repeat(70));
        console.log('Password Reset URL:');
        console.log(`\n  ${resetUrl}\n`);
        console.log('='.repeat(70));
        console.log('⚠️  Save this URL securely - it will expire in 7 days.');
        console.log('='.repeat(70) + '\n');
      }
    } else {
      console.log('\n📧 Email sending disabled. Password Reset URL:\n');
      console.log('='.repeat(70));
      console.log(`\n  ${resetUrl}\n`);
      console.log('='.repeat(70));
      console.log('⚠️  Save this URL securely - it will expire in 7 days.');
      console.log('='.repeat(70) + '\n');
    }

    console.log('✅ Admin user setup complete!\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminFromEnv().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

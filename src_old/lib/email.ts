// Email service for sending password reset emails
// Using Resend as the email provider (install with: npm install resend)

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'Al-Shahid Academy <noreply@alshahid.com>';

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string
) {
  // If Resend is not configured, log to console in development
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log('To:', to);
      console.log('Name:', userName);
      console.log('Reset URL:', resetUrl);
      console.log('===========================\n');
      return { success: true, mode: 'development' };
    }
    throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset Your Password - Al-Shahid Academy',
      html: getPasswordResetEmailHtml(userName, resetUrl),
      text: getPasswordResetEmailText(userName, resetUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

function getPasswordResetEmailHtml(userName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin-top: 0;">Reset Your Password</h1>
    <p>Hello ${userName || 'there'},</p>
    <p>We received a request to reset your password for your Al-Shahid Academy account.</p>
    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Reset Password
      </a>
    </div>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
      <a href="${resetUrl}" style="color: #10b981;">${resetUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

    <p style="font-size: 14px; color: #6c757d;">
      <strong>Didn't request this?</strong><br>
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function getPasswordResetEmailText(userName: string, resetUrl: string): string {
  return `
Reset Your Password

Hello ${userName || 'there'},

We received a request to reset your password for your Al-Shahid Academy account.

Click the link below to reset your password. This link will expire in 1 hour:

${resetUrl}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
© ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.
  `.trim();
}

export async function sendWelcomeEmail(
  to: string,
  userName: string,
  temporaryPassword: string,
  resetUrl: string
) {
  // If Resend is not configured, log to console in development
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== WELCOME EMAIL ===');
      console.log('To:', to);
      console.log('Name:', userName);
      console.log('Temporary Password:', temporaryPassword);
      console.log('Reset URL:', resetUrl);
      console.log('=====================\n');
      return { success: true, mode: 'development' };
    }
    throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Welcome to Al-Shahid Academy - Set Your Password',
      html: getWelcomeEmailHtml(userName, temporaryPassword, resetUrl),
      text: getWelcomeEmailText(userName, temporaryPassword, resetUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

function getWelcomeEmailHtml(
  userName: string,
  temporaryPassword: string,
  resetUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Al-Shahid Academy</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin-top: 0;">Welcome to Al-Shahid Academy!</h1>
    <p>Hello ${userName || 'there'},</p>
    <p>Your account has been created successfully. To get started, you need to set your password.</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Important:</strong> For security reasons, you must set a new password before you can use your account.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Set Your Password
      </a>
    </div>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="background-color: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
      <a href="${resetUrl}" style="color: #10b981;">${resetUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

    <p style="font-size: 14px; color: #6c757d;">
      <strong>Need Help?</strong><br>
      If you have any questions or issues, please contact your administrator.
    </p>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function getWelcomeEmailText(
  userName: string,
  temporaryPassword: string,
  resetUrl: string
): string {
  return `
Welcome to Al-Shahid Academy!

Hello ${userName || 'there'},

Your account has been created successfully. To get started, you need to set your password.

IMPORTANT: For security reasons, you must set a new password before you can use your account.

Click the link below to set your password:

${resetUrl}

Need Help?
If you have any questions or issues, please contact your administrator.

---
© ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.
  `.trim();
}

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

export async function sendContactReply(
  to: string,
  recipientName: string,
  originalMessage: string,
  replyMessage: string,
  adminName: string
) {
  // If Resend is not configured, log to console in development
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== CONTACT REPLY EMAIL ===');
      console.log('To:', to);
      console.log('Recipient Name:', recipientName);
      console.log('Admin Name:', adminName);
      console.log('Reply Message:', replyMessage);
      console.log('===========================\n');
      return { success: true, mode: 'development' };
    }
    throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Re: Your message to Al-Shahid Academy',
      html: getContactReplyEmailHtml(recipientName, originalMessage, replyMessage, adminName),
      text: getContactReplyEmailText(recipientName, originalMessage, replyMessage, adminName),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send contact reply email:', error);
    throw error;
  }
}

function getContactReplyEmailHtml(
  recipientName: string,
  originalMessage: string,
  replyMessage: string,
  adminName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: Your message to Al-Shahid Academy</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin-top: 0;">Re: Your Message</h1>
    <p>Hello ${recipientName},</p>
    <p>Thank you for contacting Al-Shahid Academy. Here is our response to your inquiry:</p>

    <div style="background-color: #ffffff; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

    <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #6c757d;">Your Original Message:</p>
      <p style="margin: 0; white-space: pre-wrap;">${originalMessage}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

    <p style="font-size: 14px; color: #6c757d;">
      <strong>Need Further Assistance?</strong><br>
      Feel free to reply to this email or contact us directly at infoalshahidinstitute@gmail.com or +92 310 4362226.
    </p>

    <p style="font-size: 14px; color: #6c757d; margin-top: 20px;">
      Best regards,<br>
      ${adminName}<br>
      Al-Shahid Academy
    </p>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function getContactReplyEmailText(
  recipientName: string,
  originalMessage: string,
  replyMessage: string,
  adminName: string
): string {
  return `
Re: Your Message to Al-Shahid Academy

Hello ${recipientName},

Thank you for contacting Al-Shahid Academy. Here is our response to your inquiry:

${replyMessage}

---
Your Original Message:
${originalMessage}
---

Need Further Assistance?
Feel free to reply to this email or contact us directly at infoalshahidinstitute@gmail.com or +92 310 4362226.

Best regards,
${adminName}
Al-Shahid Academy

---
© ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.
  `.trim();
}

export async function sendEnrollmentPaymentLink(
  to: string,
  studentName: string,
  amount: number,
  currency: string,
  paymentLinkUrl: string
) {
  // If Resend is not configured, log to console in development
  if (!resend) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== ENROLLMENT PAYMENT EMAIL ===');
      console.log('To:', to);
      console.log('Student Name:', studentName);
      console.log('Amount:', `${currency} ${amount}`);
      console.log('Payment Link:', paymentLinkUrl);
      console.log('================================\n');
      return { success: true, mode: 'development' };
    }
    throw new Error('Email service not configured. Please set RESEND_API_KEY in .env');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Welcome to Al-Shahid Academy - Complete Your Enrollment',
      html: getEnrollmentPaymentEmailHtml(studentName, amount, currency, paymentLinkUrl),
      text: getEnrollmentPaymentEmailText(studentName, amount, currency, paymentLinkUrl),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send enrollment payment email:', error);
    throw error;
  }
}

function getEnrollmentPaymentEmailHtml(
  studentName: string,
  amount: number,
  currency: string,
  paymentLinkUrl: string
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
    <p>Assalamu Alaikum ${studentName},</p>

    <p>Congratulations! Your trial class request has been approved. We're excited to have you begin your Quran learning journey with us.</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Next Step:</strong> Please complete your enrollment by submitting your payment proof.</p>
    </div>

    <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;"><strong>Enrollment Fee:</strong></p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981;">${currency} ${amount}</p>
    </div>

    <p><strong>Payment Instructions:</strong></p>
    <ol>
      <li>Transfer the enrollment fee using your preferred payment method</li>
      <li>Take a screenshot or photo of your payment receipt</li>
      <li>Click the button below to upload your payment proof</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentLinkUrl}"
         style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Upload Payment Proof
      </a>
    </div>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Important:</strong> This link is valid for 48 hours. Please upload your payment proof before it expires.</p>
    </div>

    <p style="font-size: 14px; color: #6c757d; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${paymentLinkUrl}" style="color: #10b981; word-break: break-all;">${paymentLinkUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">

    <p><strong>What happens next?</strong></p>
    <ul>
      <li>Our admin team will verify your payment (usually within 24 hours)</li>
      <li>Once approved, you'll receive login credentials to access your student portal</li>
      <li>You can then view your class schedule, track progress, and manage future payments</li>
    </ul>

    <p style="font-size: 14px; color: #6c757d;">
      <strong>Need Help?</strong><br>
      If you have any questions, please contact us at infoalshahidinstitute@gmail.com or +92 310 4362226.
    </p>
  </div>

  <div style="text-align: center; color: #6c757d; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

function getEnrollmentPaymentEmailText(
  studentName: string,
  amount: number,
  currency: string,
  paymentLinkUrl: string
): string {
  return `
Welcome to Al-Shahid Academy!

Assalamu Alaikum ${studentName},

Congratulations! Your trial class request has been approved. We're excited to have you begin your Quran learning journey with us.

NEXT STEP: Please complete your enrollment by submitting your payment proof.

Enrollment Fee: ${currency} ${amount}

Payment Instructions:
1. Transfer the enrollment fee using your preferred payment method
2. Take a screenshot or photo of your payment receipt
3. Use the link below to upload your payment proof

Upload Payment Proof:
${paymentLinkUrl}

IMPORTANT: This link is valid for 48 hours. Please upload your payment proof before it expires.

What happens next?
- Our admin team will verify your payment (usually within 24 hours)
- Once approved, you'll receive login credentials to access your student portal
- You can then view your class schedule, track progress, and manage future payments

Need Help?
If you have any questions, please contact us at infoalshahidinstitute@gmail.com or +92 310 4362226.

---
© ${new Date().getFullYear()} Al-Shahid Academy. All rights reserved.
  `.trim();
}

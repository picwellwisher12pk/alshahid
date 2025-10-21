# Password Reset & User Management System

## Overview

A complete forgot password and reset password system has been implemented with the following features:

- **Forgot Password Flow** - Users can request password reset links
- **Secure Reset Tokens** - Cryptographically secure tokens with expiration
- **Email Notifications** - Automated emails with reset links (via Resend)
- **Force Password Reset** - New users must set their own password
- **Admin User Creation** - Admins can create users who must reset password on first login

## Features

### 1. Forgot Password
- Users can request a password reset via email
- Secure tokens are generated and hashed before storage
- Tokens expire after 1 hour
- Email enumeration protection (always returns success message)
- Previous unused tokens are automatically invalidated

### 2. Reset Password
- Tokens are validated before allowing reset
- Password strength requirements (minimum 8 characters)
- All existing sessions are invalidated after reset
- `mustResetPassword` flag is cleared after successful reset

### 3. New User Flow
- Admins can create users via API
- New users receive welcome email with setup instructions
- Users must reset password before they can log in
- Reset tokens for new users expire in 7 days (vs 1 hour for forgot password)

### 4. Security Features
- Tokens are hashed with SHA-256 before storage
- One-time use tokens (marked as used after reset)
- Token expiration validation
- Session invalidation after password change
- Prevents brute force attacks through email enumeration protection

## Database Schema

### User Model Updates
```prisma
model User {
  // ... existing fields
  mustResetPassword   Boolean                @default(false) @map("must_reset_password")
  passwordResetTokens PasswordResetToken[]
}
```

### New PasswordResetToken Model
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### 1. Forgot Password
**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### 2. Verify Reset Token
**POST** `/api/auth/verify-reset-token`

Request:
```json
{
  "token": "reset-token-here"
}
```

Response (valid):
```json
{
  "valid": true,
  "email": "user@example.com",
  "name": "User Name"
}
```

Response (invalid):
```json
{
  "valid": false,
  "error": "Invalid or expired reset token"
}
```

### 3. Reset Password
**POST** `/api/auth/reset-password`

Request:
```json
{
  "token": "reset-token-here",
  "password": "newPassword123"
}
```

Response:
```json
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

### 4. Create User (Admin Only)
**POST** `/api/admin/create-user`

Request:
```json
{
  "email": "teacher@example.com",
  "fullName": "John Doe",
  "role": "TEACHER"
}
```

Response:
```json
{
  "message": "User created successfully. An email has been sent with setup instructions.",
  "user": {
    "id": "...",
    "email": "teacher@example.com",
    "fullName": "John Doe",
    "role": "TEACHER",
    "mustResetPassword": true
  }
}
```

In development mode, also returns:
```json
{
  "resetUrl": "http://localhost:3000/reset-password?token=...",
  "temporaryPassword": "..."
}
```

## User Interface

### Login Page
- Located at `/login`
- Added "Forgot password?" link
- Shows error message if user must reset password

### Forgot Password Page
- Located at `/forgot-password`
- Email input form
- Success message after submission
- Link back to login

### Reset Password Page
- Located at `/reset-password?token=...`
- Token verification on page load
- Password and confirm password fields
- Password requirements displayed
- Success message with auto-redirect to login

## Email Service Setup

The system uses [Resend](https://resend.com) for sending emails.

### Configuration

1. Sign up for Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add to `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=Al-Shahid Academy <noreply@yourdomain.com>
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Development Mode

If `RESEND_API_KEY` is not set, the system will:
- Log email details to console in development
- Continue without sending actual emails
- Display reset URLs in API responses and console

### Email Templates

Two email templates are included:

1. **Password Reset Email** - Sent when user requests password reset
2. **Welcome Email** - Sent when admin creates new user

Both templates are professionally designed with:
- HTML and plain text versions
- Clear call-to-action buttons
- Branding for Al-Shahid Academy
- Security instructions

## User Flows

### Flow 1: Forgot Password (Existing User)

1. User clicks "Forgot password?" on login page
2. User enters their email address
3. System generates reset token and sends email
4. User receives email with reset link
5. User clicks link → redirected to `/reset-password?token=...`
6. System verifies token
7. User enters new password (twice)
8. Password is updated and all sessions are cleared
9. User is redirected to login page

### Flow 2: New User Setup (Admin Created)

1. Admin creates user via `/api/admin/create-user`
2. System generates temporary password and reset token
3. User receives welcome email with reset link
4. User clicks link → redirected to `/reset-password?token=...`
5. User sets their password
6. User goes to login page
7. User logs in with new password

### Flow 3: Forced Password Reset

1. User tries to log in with `mustResetPassword = true`
2. Login endpoint returns 403 error with message
3. Login page shows error message
4. User must check email for reset instructions
5. After resetting password, `mustResetPassword` is set to `false`
6. User can now log in normally

## Testing

### Test Forgot Password Flow

```bash
# 1. Request password reset
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 2. Check console for reset URL (development mode)

# 3. Verify token
curl -X POST http://localhost:3000/api/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_URL"}'

# 4. Reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_URL","password":"newPassword123"}'
```

### Test Admin Create User

```bash
# Create new user (requires admin auth)
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email":"newteacher@example.com",
    "fullName":"Jane Smith",
    "role":"TEACHER"
  }'
```

## Security Considerations

1. **Token Storage**: Tokens are hashed before storage in database
2. **Token Expiration**:
   - Forgot password tokens: 1 hour
   - New user setup tokens: 7 days
3. **One-time Use**: Tokens are marked as used and cannot be reused
4. **Session Invalidation**: All sessions are cleared when password is reset
5. **Email Enumeration**: System doesn't reveal if email exists
6. **Password Validation**: Minimum 8 characters (can be enhanced)
7. **HTTPS Required**: In production, all tokens should be sent over HTTPS

## Environment Variables

Add these to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/alshahid_db"

# JWT
JWT_SECRET="your-secure-random-string"

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL="Al-Shahid Academy <noreply@yourdomain.com>"

# App URL
NEXT_PUBLIC_API_URL="http://localhost:3000"  # Change in production
NODE_ENV="development"
```

## File Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── forgot-password/
│   │   │   └── route.ts          # Request password reset
│   │   ├── reset-password/
│   │   │   └── route.ts          # Reset password with token
│   │   ├── verify-reset-token/
│   │   │   └── route.ts          # Verify token validity
│   │   └── login/
│   │       └── route.ts          # Updated to check mustResetPassword
│   └── admin/
│       └── create-user/
│           └── route.ts          # Create user with forced reset
├── forgot-password/
│   └── page.tsx                  # Forgot password UI
└── reset-password/
    └── page.tsx                  # Reset password UI

src/
├── lib/
│   └── email.ts                  # Email service with templates
└── pages/
    └── Login.tsx                 # Updated with forgot password link

prisma/
└── schema.prisma                 # Updated with password reset models
```

## Future Enhancements

1. **Email Verification**: Verify email addresses before allowing password reset
2. **Rate Limiting**: Limit password reset requests per email/IP
3. **Password Complexity**: Enforce stronger password requirements
4. **Two-Factor Authentication**: Add 2FA support
5. **Password History**: Prevent reusing recent passwords
6. **Account Lockout**: Lock account after multiple failed reset attempts
7. **Audit Logging**: Log all password reset activities
8. **Multi-language Support**: Translate emails and UI
9. **Custom Email Templates**: Allow admins to customize email templates
10. **SMS Reset Option**: Alternative to email-based reset

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly in `.env`
2. Verify your Resend account is active
3. Check console logs for error messages
4. In development, check console for email content

### Token Invalid/Expired

1. Tokens expire after 1 hour (7 days for new users)
2. Tokens can only be used once
3. Request a new reset link if token expired

### User Can't Login After Reset

1. Ensure `mustResetPassword` was cleared (check database)
2. Verify password was actually updated
3. Check if sessions were properly invalidated

### Reset URL Not Working

1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Ensure token is included in URL
3. Check token hasn't been used or expired

## Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Configure Resend API key and verify domain
- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXT_PUBLIC_API_URL` to production URL
- [ ] Enable HTTPS/SSL
- [ ] Test all email flows end-to-end
- [ ] Add rate limiting to prevent abuse
- [ ] Set up error monitoring
- [ ] Configure proper email sending domain
- [ ] Test password reset on production database
- [ ] Review security headers
- [ ] Set up backup email provider (optional)

## Support

For issues or questions:
- Review this guide for common solutions
- Check [AUTH_README.md](./AUTH_README.md) for authentication details
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API reference
- Check [Resend documentation](https://resend.com/docs)

---

**Last Updated**: 2025-10-22
**Version**: 1.0.0

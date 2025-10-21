# Secure Admin User Creation Guide

## Overview

This guide explains how to securely create the first admin user for your Al-Shahid Academy application **without exposing credentials in code or version control**.

## Security Principles

✅ **Never hardcode credentials** - No passwords in code, .env files, or git
✅ **Force password reset** - Admin must set their own password
✅ **Secure token generation** - Cryptographically secure random tokens
✅ **Time-limited access** - Reset tokens expire in 7 days
✅ **Email delivery** - Credentials sent via secure email (when configured)

## Methods for Creating Admin User

We provide **two methods** depending on your use case:

### Method 1: Interactive Script (Recommended for Local/Development)
Best for: Manual setup, local development, or one-time admin creation

### Method 2: Environment Variables (Recommended for Production/CI-CD)
Best for: Automated deployments, CI/CD pipelines, deployment platforms

---

## Method 1: Interactive Script

This script prompts you for admin details and never stores credentials in files.

### Step 1: Run the Script

```bash
npm run create-admin
```

### Step 2: Follow the Prompts

The script will ask you for:
1. **Admin Email** - Must be valid email format
2. **Admin Full Name** - Display name for the admin

Example interaction:
```
🔐 SECURE ADMIN USER CREATION
======================================================================

Admin Email: admin@alshahid.com
Admin Full Name: Ahmed Al-Shahid

📋 Review Admin Details:
----------------------------------------------------------------------
Email:     admin@alshahid.com
Full Name: Ahmed Al-Shahid
Role:      ADMIN
----------------------------------------------------------------------

Create this admin user? (yes/no): yes

⏳ Creating admin user...
✅ Admin user created successfully!
⏳ Generating password reset token...
✅ Password reset token created!
```

### Step 3: Handle the Credentials

**If Email Service is Configured:**
```
✅ Welcome email sent successfully!
```
The admin will receive an email with a password reset link.

**If Email Service is NOT Configured:**
```
======================================================================
📧 EMAIL SERVICE NOT CONFIGURED - CREDENTIALS BELOW:
======================================================================

⚠️  IMPORTANT: Save these credentials securely!

Admin Password Reset URL:

  http://localhost:3000/reset-password?token=abc123...xyz789

======================================================================
⚠️  This URL will expire in 7 days.
⚠️  Copy this URL and send it to the admin via secure channel.
⚠️  Delete this terminal output after copying.
======================================================================
```

### Step 4: Send Credentials Securely

**Secure methods to share the reset URL:**
- ✅ Encrypted email (ProtonMail, Tutanota)
- ✅ Secure messaging (Signal, WhatsApp)
- ✅ Password manager sharing (1Password, Bitwarden)
- ✅ In-person (show on screen, don't send)

**Insecure methods to avoid:**
- ❌ Plain text email
- ❌ Slack/Teams messages
- ❌ SMS
- ❌ Committing to git

### Step 5: Admin Sets Password

1. Admin opens the reset URL
2. System verifies the token
3. Admin enters their new password (twice)
4. Password is updated, `mustResetPassword` flag is cleared
5. Admin can now login at `/login`

---

## Method 2: Environment Variables (Production/CI-CD)

This method uses environment variables for automated deployments.

### Step 1: Set Environment Variables

**Important:** Set these in your deployment platform's dashboard, NOT in `.env` file!

Required variables:
```env
ADMIN_EMAIL="admin@alshahid.com"
ADMIN_FULL_NAME="Ahmed Al-Shahid"
ADMIN_SEND_EMAIL="true"  # Optional, defaults to true
```

### Step 2: Run the Script

**Locally (for testing):**
```bash
ADMIN_EMAIL="admin@alshahid.com" ADMIN_FULL_NAME="Ahmed Al-Shahid" npm run create-admin:env
```

**In CI/CD or Deployment Platform:**
```bash
npm run create-admin:env
```

### Platform-Specific Examples

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `ADMIN_EMAIL` and `ADMIN_FULL_NAME`
3. Add to build command: `npm run create-admin:env && npm run build`

**Railway:**
1. Go to Variables tab
2. Add `ADMIN_EMAIL` and `ADMIN_FULL_NAME`
3. Add deployment script: `npm run create-admin:env`

**Heroku:**
```bash
heroku config:set ADMIN_EMAIL="admin@alshahid.com"
heroku config:set ADMIN_FULL_NAME="Ahmed Al-Shahid"
```

**Docker/Kubernetes:**
```yaml
env:
  - name: ADMIN_EMAIL
    value: "admin@alshahid.com"
  - name: ADMIN_FULL_NAME
    value: "Ahmed Al-Shahid"
```

### Step 3: Script Output

The script will:
1. Check if admin already exists (skip if yes)
2. Create admin user with `mustResetPassword=true`
3. Generate password reset token
4. Send email (if configured) or display reset URL

---

## Email Service Configuration

To send emails automatically, configure Resend:

### Step 1: Get Resend API Key

1. Sign up at https://resend.com
2. Verify your domain (or use test mode)
3. Get your API key from dashboard

### Step 2: Add to Environment

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
FROM_EMAIL="Al-Shahid Academy <noreply@yourdomain.com>"
```

### Step 3: Test Email Sending

Run the admin creation script again - emails will now be sent automatically!

---

## Security Best Practices

### ✅ DO:

1. **Use the interactive script for initial setup**
   - Prompts for input, nothing stored in files
   - Credentials only in terminal (can be cleared)

2. **Use environment variables in production**
   - Set in deployment platform dashboard
   - Never commit to git

3. **Send reset URLs securely**
   - Encrypted channels only
   - In-person when possible

4. **Clear terminal history after setup**
   ```bash
   # Linux/Mac
   history -c

   # Windows PowerShell
   Clear-History
   ```

5. **Use strong passwords when resetting**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

6. **Enable 2FA (future enhancement)**
   - Add extra security layer

### ❌ DON'T:

1. **Never hardcode credentials**
   - No passwords in code
   - No credentials in .env file committed to git
   - No credentials in seed files

2. **Never use default passwords**
   - Scripts generate random passwords
   - Admin must set their own

3. **Never share credentials insecurely**
   - No plain text email
   - No public Slack channels
   - No SMS (can be intercepted)

4. **Never reuse passwords**
   - Each admin should have unique password
   - Don't use same password across systems

---

## Troubleshooting

### Problem: Script says admin already exists

**Solution:**
```bash
# Check existing admins in database
npx prisma studio
# Navigate to User model, filter by role=ADMIN
```

If you need to create another admin, the script will ask for confirmation.

### Problem: Email not sending

**Check:**
1. Is `RESEND_API_KEY` set in `.env`?
2. Is `FROM_EMAIL` configured?
3. Is your domain verified in Resend?

**Development workaround:**
- Script will display reset URL in console
- Copy URL manually and send to admin

### Problem: Reset token expired

**Solution:**
Run the script again to generate a new token:
```bash
npm run create-admin
# Enter the same email address
# Script will create new reset token
```

### Problem: Admin can't login after reset

**Check:**
1. Did password reset complete successfully?
2. Is `mustResetPassword` flag cleared in database?
3. Are there any session conflicts?

**Solution:**
```sql
-- Check user status
SELECT email, "mustResetPassword", "emailVerified"
FROM users
WHERE email = 'admin@example.com';

-- If needed, manually clear the flag
UPDATE users
SET "mustResetPassword" = false
WHERE email = 'admin@example.com';
```

---

## Alternative: Manual Database Insert (Not Recommended)

If you absolutely cannot use the scripts, you can manually create an admin with SQL:

```sql
-- Generate password hash separately (use bcrypt with 12 rounds)
-- Example: bcrypt.hash('temporaryPassword123', 12)

INSERT INTO users (id, email, full_name, password, role, must_reset_password, email_verified, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  'Admin User',
  '$2b$12$...', -- bcrypt hash of temporary password
  'ADMIN',
  true,  -- Force password reset
  true,
  NOW(),
  NOW()
);
```

**⚠️ Warning:** This method is insecure and not recommended. Use the scripts instead.

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Email service (Resend) configured and tested
- [ ] Domain verified in Resend
- [ ] Admin creation script tested in staging
- [ ] Environment variables set in deployment platform (not in .env file)
- [ ] Reset token expiration appropriate for your use case
- [ ] HTTPS enabled for all password reset URLs
- [ ] Admin email address verified
- [ ] Backup admin creation method documented
- [ ] Team knows how to create additional admins
- [ ] Password policy documented and enforced
- [ ] Audit logging enabled for admin actions

---

## Creating Additional Admins

Once the first admin is set up, they can create additional admins via the API:

```bash
# Admin must be authenticated
curl -X POST https://your-domain.com/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "email": "newadmin@example.com",
    "fullName": "New Admin",
    "role": "ADMIN"
  }'
```

The new admin will receive a welcome email with password setup instructions.

---

## Security Incident Response

If admin credentials are compromised:

1. **Immediately reset the password:**
   - Go to forgot password flow
   - Or run admin creation script again

2. **Invalidate all sessions:**
   ```sql
   DELETE FROM sessions WHERE user_id = (
     SELECT id FROM users WHERE email = 'compromised@example.com'
   );
   ```

3. **Audit recent activity:**
   - Check application logs
   - Review database changes
   - Identify unauthorized actions

4. **Notify affected parties:**
   - Other admins
   - System administrators
   - Security team

5. **Update security measures:**
   - Rotate all API keys
   - Review access logs
   - Enable 2FA (if not already enabled)

---

## Summary

**For Development/Local:**
```bash
npm run create-admin
# Follow prompts
# Copy reset URL from console
# Send to admin securely
```

**For Production/CI-CD:**
```bash
# Set environment variables in deployment platform
ADMIN_EMAIL="admin@example.com"
ADMIN_FULL_NAME="Admin User"

# Run during deployment
npm run create-admin:env
```

**Key Points:**
- ✅ Never hardcode credentials
- ✅ Always force password reset
- ✅ Use secure channels for credential delivery
- ✅ Clear terminal history after setup
- ✅ Configure email service for production

---

**Need Help?**
- Review [PASSWORD_RESET_GUIDE.md](PASSWORD_RESET_GUIDE.md) for password reset details
- Check [AUTH_README.md](AUTH_README.md) for authentication system overview
- See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference

**Last Updated:** 2025-10-22

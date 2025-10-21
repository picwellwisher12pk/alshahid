# Quick Start - Admin Setup & Password Reset

## 🚀 First Time Setup

### 1. Create Your First Admin User

```bash
npm run create-admin
```

**What it does:**
- Prompts for admin email and name
- Generates secure credentials (no passwords stored!)
- Creates password reset token
- Displays reset URL in console (or sends via email)

**Next step:** Copy the reset URL and open it in your browser to set your password.

---

## 📋 Complete Setup Checklist

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Setup database
npx prisma generate
npx prisma db push

# 3. Create first admin
npm run create-admin

# 4. (Optional) Configure email service
# Add to .env:
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# FROM_EMAIL="Al-Shahid Academy <noreply@yourdomain.com>"

# 5. Start development server
npm run dev
```

---

## 🔐 Admin Creation Methods

### Interactive (Recommended for Local)
```bash
npm run create-admin
```
- Prompts for details
- Shows reset URL in console
- Nothing stored in files

### Environment Variables (For Production/CI-CD)
```bash
ADMIN_EMAIL="admin@example.com" \
ADMIN_FULL_NAME="Admin User" \
npm run create-admin:env
```
- Uses environment variables
- Good for automated deployments
- Set vars in deployment platform

---

## 🎯 Common Commands

```bash
# Create admin user
npm run create-admin

# Create admin from env vars
npm run create-admin:env

# Start development
npm run dev

# Database operations
npx prisma studio          # Open database GUI
npx prisma generate        # Generate Prisma client
npx prisma db push        # Update database schema
```

---

## 🔑 User Flows

### Admin Sets Up Account
```
1. Run: npm run create-admin
2. Enter email and name
3. Copy reset URL from console
4. Open URL in browser
5. Set password
6. Login at /login
```

### User Forgot Password
```
1. Go to /login
2. Click "Forgot password?"
3. Enter email
4. Check email (or console in dev)
5. Click reset link
6. Set new password
7. Login
```

### Admin Creates New User
```
1. Use API: POST /api/admin/create-user
2. New user receives email
3. User clicks link and sets password
4. User can login
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md) | Complete admin creation guide |
| [PASSWORD_RESET_GUIDE.md](PASSWORD_RESET_GUIDE.md) | Password reset system details |
| [PASSWORD_RESET_SUMMARY.md](PASSWORD_RESET_SUMMARY.md) | Quick overview |
| [AUTH_README.md](AUTH_README.md) | Authentication system docs |
| [scripts/create-admin.ts](scripts/create-admin.ts) | Interactive admin creation |
| [scripts/create-admin-from-env.ts](scripts/create-admin-from-env.ts) | Env-based admin creation |

---

## 🛡️ Security Notes

### ✅ DO:
- Use `npm run create-admin` for first admin
- Send reset URLs via secure channels
- Clear terminal history after setup
- Use strong passwords (12+ characters)

### ❌ DON'T:
- Never hardcode credentials in code
- Never commit passwords to git
- Never store passwords in .env (use reset flow)
- Never share reset URLs via plain text

---

## 🔧 Troubleshooting

### "Admin already exists"
```bash
# Check existing admins
npx prisma studio
# Navigate to User model, filter role=ADMIN
```

### "Email not sending"
- Check if `RESEND_API_KEY` is set in .env
- In development, URL is shown in console
- See email service setup in docs

### "Token expired"
- Run `npm run create-admin` again with same email
- New token will be generated

---

## 📞 Need Help?

- **Admin Setup**: [ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md)
- **Password Reset**: [PASSWORD_RESET_GUIDE.md](PASSWORD_RESET_GUIDE.md)
- **Auth System**: [AUTH_README.md](AUTH_README.md)
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## ⚡ Quick Reference

```bash
# Most common workflow
npm run create-admin          # Create first admin
# Copy URL from console
# Open in browser, set password
npm run dev                   # Start app
# Login at http://localhost:3000/login
```

**That's it!** You're ready to use the system.

---

**Status**: ✅ Ready to Use
**Last Updated**: 2025-10-22

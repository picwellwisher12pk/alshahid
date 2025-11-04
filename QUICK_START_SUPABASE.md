# Quick Start: Fix Vercel Upload Error

## The Problem
❌ **Error on Vercel**: `ENOENT: no such file or directory, open '/var/task/public/uploads/...'`

## The Solution
✅ **Use Supabase Storage** (cloud storage instead of local files)

---

## Setup (5-10 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Name it (e.g., "alshahid-academy")
4. Wait 1-2 minutes for provisioning

### Step 2: Create Storage Bucket
1. Click **Storage** in left sidebar
2. Click **"New bucket"**
3. Settings:
   - Name: `payment-receipts`
   - Public: ✅ **Enable**
   - File size limit: `5242880` (5MB)
4. Click **"Create bucket"**

### Step 3: Set Policies
1. Click on `payment-receipts` bucket
2. Go to **Policies** tab
3. Click **"New Policy"** → **"Custom"**

**Policy 1: Allow uploads**
```
Policy name: Allow authenticated uploads
Target roles: authenticated
Allowed operation: INSERT
Policy: ((bucket_id = 'payment-receipts'::text))
```

**Policy 2: Allow public read**
```
Policy name: Allow public read access
Target roles: public
Allowed operation: SELECT
Policy: ((bucket_id = 'payment-receipts'::text))
```

### Step 4: Get Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGci...` (long token)

### Step 5: Add to `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."
```

### Step 6: Add to Vercel
1. Go to your project on Vercel
2. **Settings** → **Environment Variables**
3. Add both variables (all environments)
4. **Redeploy** your site

---

## Test It

### Local Test
```bash
bun run dev
# Try uploading a receipt
```

### Production Test
1. Deploy to Vercel
2. Upload a receipt on your live site
3. Check Supabase Storage for the file

---

## Verify Success

✅ **Check Supabase Dashboard**:
- Go to **Storage** → `payment-receipts`
- You should see files in `enrollment/` folder

✅ **Check Your App**:
- Upload should succeed without errors
- Receipt should be visible in admin dashboard

---

## Still Having Issues?

### Error: "Missing Supabase environment variables"
- Check `.env.local` has both variables
- Restart dev server: `bun run dev`
- For Vercel: Verify environment variables are set

### Error: "Failed to upload file"
- Verify bucket name is exactly `payment-receipts`
- Check both policies are created
- Ensure bucket is marked as **public**

### 403 Forbidden
- Check service role key is correct
- Regenerate key in Supabase if needed

---

## Files Created

New files you can reference:
- 📄 [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md) - Detailed setup guide
- 📄 [MIGRATION_TO_SUPABASE_STORAGE.md](MIGRATION_TO_SUPABASE_STORAGE.md) - What changed
- 📄 [lib/supabase.ts](lib/supabase.ts) - Utility functions

---

## Quick Commands

```bash
# Install dependencies (already done)
bun add @supabase/supabase-js

# Run locally
bun run dev

# Deploy to Vercel
git add .
git commit -m "Add Supabase Storage for file uploads"
git push
```

---

## Cost: FREE ✨

Supabase free tier includes:
- 1GB storage
- 2GB bandwidth/month
- More than enough for getting started

---

**That's it!** Your file uploads will now work on Vercel. 🚀

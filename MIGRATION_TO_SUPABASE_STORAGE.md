# Migration to Supabase Storage - Summary

## Problem

Your enrollment payment receipt upload was failing on Vercel with:
```
Error: ENOENT: no such file or directory, open '/var/task/public/uploads/...'
```

This happened because:
- Vercel uses serverless functions with **read-only filesystems**
- Local file storage (`fs.writeFile` to `/public/uploads/`) doesn't work on Vercel
- Files need to be stored in cloud storage instead

## Solution

Migrated from local filesystem storage to **Supabase Storage** (cloud-based).

## Changes Made

### 1. Package Installation
- ✅ Installed `@supabase/supabase-js@2.78.0`

### 2. New Files Created

#### [lib/supabase.ts](lib/supabase.ts)
New utility module with functions:
- `uploadFileToSupabase()` - Upload files to Supabase Storage
- `deleteFileFromSupabase()` - Delete files from storage
- `extractPathFromUrl()` - Parse Supabase URLs
- `supabaseAdmin` - Server-side Supabase client

#### [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)
Complete step-by-step setup guide covering:
- Creating a Supabase project
- Setting up storage bucket (`payment-receipts`)
- Configuring bucket policies
- Getting API credentials
- Environment variable setup
- Testing and troubleshooting

#### [MIGRATION_TO_SUPABASE_STORAGE.md](MIGRATION_TO_SUPABASE_STORAGE.md)
This file - migration summary and quick reference

### 3. Files Modified

#### [app/api/enrollment/upload/route.ts](app/api/enrollment/upload/route.ts)
**Before**: Used `fs.writeFile()` to save to `/public/uploads/`
**After**: Uses `uploadFileToSupabase()` to save to cloud storage

Key improvements:
- ✅ Works on Vercel serverless functions
- ✅ Added file type validation (JPEG, PNG, WebP, PDF only)
- ✅ Added file size validation (max 5MB)
- ✅ Better error handling with specific messages
- ✅ Files organized in `enrollment/` folder within bucket

#### [.env.example](.env.example)
Added required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

#### [SETUP_AND_RUN.md](SETUP_AND_RUN.md)
- Updated setup instructions to include Supabase Storage setup
- Added reference to detailed setup guide
- Marked Supabase as **REQUIRED** (not optional)

## What You Need to Do

### 1. Set Up Supabase (Required)

Follow [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md) to:

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project

2. **Create Storage Bucket**
   - Name: `payment-receipts`
   - Make it public
   - Set file size limit: 5MB

3. **Configure Policies**
   - Allow authenticated uploads
   - Allow public read access

4. **Get Credentials**
   - Copy your project URL
   - Copy your service role key

### 2. Add Environment Variables

#### Local Development
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Vercel Production
1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add both variables
4. Redeploy

### 3. Test

1. **Local**: Try uploading a payment receipt in dev mode
2. **Production**: Deploy to Vercel and test upload
3. **Verify**: Check files appear in Supabase Storage dashboard

## Files Organization

Files will be stored in Supabase with this structure:
```
payment-receipts/           (bucket)
└── enrollment/            (folder)
    ├── enrollment-1234567890-receipt.jpg
    ├── enrollment-1234567891-proof.pdf
    └── ...
```

## API Changes

### Enrollment Upload Endpoint
**Endpoint**: `POST /api/enrollment/upload`

**What Changed**:
- ❌ No longer writes to `/public/uploads/`
- ✅ Now uploads to Supabase Storage
- ✅ Returns Supabase public URL in response

**Client-Side Impact**: None - the API contract is the same

### Response Format (Unchanged)
```json
{
  "success": true,
  "message": "Payment proof submitted successfully..."
}
```

## Other Upload Routes

### [app/api/invoices/[id]/upload-receipt/route.ts](app/api/invoices/[id]/upload-receipt/route.ts)
This route expects the client to handle the upload and pass the URL:
- Uses a different pattern (client-side uploads)
- No changes needed - already compatible with Supabase

## Security

✅ **Implemented**:
- File type validation (images and PDFs only)
- File size limits (5MB max)
- Server-side upload using service role key
- Public read access for receipt viewing

⚠️ **Important**:
- Never commit `.env.local` to git
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Service role key is only used in server-side API routes

## Cost

**Supabase Free Tier** (sufficient for small/medium scale):
- 1GB storage
- 2GB bandwidth/month
- Up to 50MB per file (app limits to 5MB)

**If you exceed free tier**:
- Upgrade to Supabase Pro ($25/month)
- Or use alternative storage (S3, Cloudinary, etc.)

## Backward Compatibility

### Old Files in `/public/uploads/`
If you had existing files in `/public/uploads/`:
- They remain accessible locally
- **Not accessible on Vercel** (not uploaded to cloud)
- Consider manual migration or leaving as archived records

### Old URLs
Old URLs like `/uploads/filename.jpg` will:
- ✅ Work locally (if files exist)
- ❌ Break on Vercel (404 error)

New URLs look like:
```
https://xxxxx.supabase.co/storage/v1/object/public/payment-receipts/enrollment/filename.jpg
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has both variables
- Restart dev server
- For Vercel: check environment variables in settings

### Upload fails with 403 error
- Verify bucket policies are configured
- Check service role key is correct
- Ensure bucket name is `payment-receipts`

### Files not accessible
- Verify bucket is set to **public**
- Check public read policy is enabled

## Monitoring

**Check Supabase Dashboard**:
1. Go to **Storage** → `payment-receipts`
2. View uploaded files in `enrollment/` folder
3. Monitor storage usage in **Settings** → **Billing**

## Next Steps After Setup

1. ✅ Complete Supabase setup following the guide
2. ✅ Add environment variables locally and on Vercel
3. ✅ Test upload functionality
4. ✅ Deploy to Vercel
5. ✅ Verify everything works in production
6. 📝 Monitor storage usage
7. 📝 Set up billing alerts in Supabase (optional)

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/storage
- **This Project**: Check [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)

---

**Status**: ✅ Code migration complete - waiting for Supabase setup
**Next**: Follow [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)

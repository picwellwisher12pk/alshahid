# Supabase Storage Setup Guide

## Bucket Configuration

The `payment-receipts` bucket has been created and should be configured as follows:

### Required Settings

1. **Bucket Name**: `payment-receipts`
2. **Public Access**: ✅ **Must be PUBLIC** (so receipts can be viewed via URL)
3. **File Size Limit**: 5MB
4. **Allowed File Types**:
   - `image/jpeg`
   - `image/jpg`
   - `image/png`
   - `image/webp`
   - `application/pdf`

### Verifying Bucket Settings

1. Go to: https://app.supabase.com/project/[your-project-id]/storage/buckets
2. Click on the `payment-receipts` bucket
3. Go to "Configuration" tab
4. Ensure **"Public bucket"** is checked ✅

### Storage Policies (RLS)

Since this is a public bucket, you may want to set up Row Level Security policies:

#### Policy 1: Allow authenticated uploads
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');
```

#### Policy 2: Allow public reads (so invoice links work)
```sql
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'payment-receipts');
```

#### Policy 3: Allow service role all access
```sql
CREATE POLICY "Service role has full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'payment-receipts');
```

### Environment Variables Check

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Service role key (not anon key!)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # Anon key for client-side
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** key, NOT the anon key. The service role key bypasses RLS policies.

### Testing Upload

Try uploading a payment receipt again through your enrollment form. If it still fails, check:

1. ✅ Bucket exists and is public
2. ✅ Environment variables are set correctly
3. ✅ Service role key is correct (not anon key)
4. ✅ Dev server has been restarted after adding env vars

### Troubleshooting

**Error: "Bucket not found"**
- Bucket doesn't exist → Create it in Supabase dashboard
- Wrong bucket name in code → Check it's `payment-receipts`

**Error: "Not authorized"**
- Using anon key instead of service role key
- RLS policies blocking access

**Error: "Invalid file type"**
- Bucket MIME type restrictions
- Check bucket configuration allows your file types

### Storage Structure

Files will be organized as:
```
payment-receipts/
├── enrollment/
│   ├── enrollment-1234567890-receipt.jpg
│   ├── enrollment-1234567891-proof.pdf
│   └── ...
└── monthly/ (for future monthly invoices)
    ├── monthly-1234567890-receipt.jpg
    └── ...
```

### File URL Format

Public URLs will look like:
```
https://xxx.supabase.co/storage/v1/object/public/payment-receipts/enrollment/filename.jpg
```

These URLs can be:
- Stored in database (`paymentReceipts.fileUrl`)
- Shared with admins for verification
- Displayed in admin dashboard

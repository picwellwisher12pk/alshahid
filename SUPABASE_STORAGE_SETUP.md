# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for handling payment receipt uploads in your Al-Shahid Academy application.

## Why Supabase Storage?

The application uses Supabase Storage instead of local file storage because:

- **Vercel Compatibility**: Vercel serverless functions have read-only filesystems
- **Scalability**: Cloud storage scales automatically with your needs
- **Reliability**: Files are backed up and highly available
- **Security**: Built-in access control and secure file URLs

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your project deployed or ready to deploy

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `alshahid-academy` (or your preferred name)
   - **Database Password**: Generate a secure password and save it
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Create Storage Bucket

1. In your Supabase project dashboard, navigate to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `payment-receipts`
   - **Public bucket**: ✅ Enable (so files can be accessed via public URLs)
   - **File size limit**: 5242880 (5MB in bytes)
   - **Allowed MIME types**: Leave empty to allow all, or specify:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `application/pdf`
4. Click **"Create bucket"**

## Step 3: Configure Bucket Policies

### Policy 1: Allow Authenticated Uploads

1. Click on the `payment-receipts` bucket
2. Go to the **Policies** tab
3. Click **"New Policy"**
4. Choose **"Custom"**
5. Configure:
   - **Policy name**: `Allow authenticated uploads`
   - **Target roles**: `authenticated`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
   ```sql
   ((bucket_id = 'payment-receipts'::text))
   ```
6. Click **"Review"** then **"Save policy"**

### Policy 2: Allow Public Read Access

1. Click **"New Policy"** again
2. Choose **"Custom"**
3. Configure:
   - **Policy name**: `Allow public read access`
   - **Target roles**: `public`
   - **Allowed operation**: `SELECT`
   - **Policy definition**:
   ```sql
   ((bucket_id = 'payment-receipts'::text))
   ```
4. Click **"Review"** then **"Save policy"**

## Step 4: Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:

### Project URL
```
https://your-project-ref.supabase.co
```

### Service Role Key (Secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT**: The service role key has admin privileges. Never expose it in client-side code or commit it to version control.

## Step 5: Configure Environment Variables

### Local Development

1. Add to your `.env.local` file:

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview, Development |

4. Click **"Save"**
5. Redeploy your application for the changes to take effect

## Step 6: Test the Setup

### Test Upload Locally

1. Start your development server:
   ```bash
   bun run dev
   ```

2. Navigate to the enrollment payment page
3. Upload a test receipt file
4. Verify the file appears in your Supabase Storage bucket

### Check Supabase Storage

1. Go to **Storage** → **payment-receipts** in Supabase
2. You should see your uploaded file in the `enrollment/` folder
3. Click on the file to preview it

### Test on Vercel

1. Deploy to Vercel: `git push`
2. Wait for deployment to complete
3. Test the upload functionality on your live site
4. Verify files are being stored in Supabase

## File Organization

Files are automatically organized in the bucket:

```
payment-receipts/
└── enrollment/
    ├── enrollment-1234567890-receipt.jpg
    ├── enrollment-1234567891-proof.pdf
    └── ...
```

## Storage Limits

### Free Tier Limits
- **Storage**: 1GB
- **Bandwidth**: 2GB per month
- **File upload size**: Up to 50MB per file

### Application Limits
The application enforces:
- **Max file size**: 5MB per file
- **Allowed formats**: JPEG, PNG, WebP, PDF

## Security Best Practices

1. ✅ **Never commit** `.env.local` to version control
2. ✅ **Use service role key** only in server-side code
3. ✅ **Validate file types** before upload (already implemented)
4. ✅ **Limit file sizes** to prevent abuse (already implemented)
5. ✅ **Monitor storage usage** in Supabase dashboard

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Environment variables not set correctly

**Solution**:
1. Verify `.env.local` has both variables
2. Restart your dev server: `bun run dev`
3. For Vercel, check environment variables in project settings

### Error: "Failed to upload file"

**Cause**: Bucket doesn't exist or policies not configured

**Solution**:
1. Verify bucket name is exactly `payment-receipts`
2. Check bucket policies are set up correctly
3. Ensure the bucket is public

### Files Not Accessible

**Cause**: Bucket is not public or read policy missing

**Solution**:
1. Go to Storage → payment-receipts
2. Enable **Public bucket**
3. Add the public read policy (see Step 3)

### 403 Forbidden on Upload

**Cause**: Missing or incorrect service role key

**Solution**:
1. Regenerate the service role key in Supabase
2. Update environment variables
3. Redeploy (for Vercel)

## Monitoring and Maintenance

### Check Storage Usage

1. Go to **Settings** → **Billing**
2. View current storage and bandwidth usage
3. Set up alerts for approaching limits

### Clean Up Old Files (Optional)

You can set up lifecycle policies or manually delete old receipts:

1. Go to **Storage** → **payment-receipts**
2. Select files to delete
3. Click the delete icon

## Migration from Local Storage

If you previously used local file storage, files were stored in `/public/uploads/`. These files are not automatically migrated. You can:

1. **Manual migration**: Upload old files to Supabase manually
2. **Keep old files**: Leave them in `/public/uploads/` for archived records
3. **Ignore**: New uploads will use Supabase, old URLs will break

## Next Steps

- ✅ Set up Supabase Storage
- ✅ Configure environment variables
- ✅ Test file uploads
- 📝 Monitor storage usage regularly
- 📝 Consider upgrading to Pro if you exceed free tier limits

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

---

Last updated: 2025-01-04

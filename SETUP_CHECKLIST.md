# Supabase Storage Setup Checklist

## ✅ Completed
- [x] Added Supabase credentials to `.env.local`
- [x] Installed `@supabase/supabase-js` package
- [x] Created upload utility functions

## 🔲 To Do in Supabase Dashboard

### Step 1: Create Storage Bucket
1. Go to https://app.supabase.com/project/byttrttywoegnhoenjvy/storage/buckets
2. Click **"New bucket"**
3. Configure:
   - **Name**: `payment-receipts` (exactly this name)
   - **Public bucket**: ✅ **Check this box**
   - **File size limit**: `5242880` (5MB in bytes)
4. Click **"Create bucket"**

### Step 2: Set Bucket Policies

#### Policy 1: Allow Authenticated Uploads
1. Click on the `payment-receipts` bucket
2. Go to **Policies** tab
3. Click **"New Policy"** → **"For full customization"**
4. Fill in:
   - **Policy name**: `Allow authenticated uploads`
   - **Policy definition**: SELECT the operation INSERT
   - **Target roles**: `authenticated`
   - In the SQL editor, use:
   ```sql
   ((bucket_id = 'payment-receipts'::text))
   ```
5. Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Public Read Access
1. Click **"New Policy"** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Allow public read access`
   - **Policy definition**: SELECT the operation SELECT
   - **Target roles**: `public`
   - In the SQL editor, use:
   ```sql
   ((bucket_id = 'payment-receipts'::text))
   ```
4. Click **"Review"** then **"Save policy"**

#### Alternative: Use Policy Templates (Easier)
If you see policy templates:
1. For uploads: Choose **"Allow uploads for authenticated users only"**
2. For reads: Choose **"Allow public access for SELECT"**

### Step 3: Verify Setup
- [ ] Bucket `payment-receipts` exists
- [ ] Bucket is marked as **public**
- [ ] Two policies are created (upload + read)

## 🧪 Testing

### Local Test
```bash
# Restart dev server to pick up new env vars
bun run dev
```

Then:
1. Navigate to enrollment payment page
2. Upload a test receipt file
3. Check for success message
4. Verify file appears in Supabase Storage under `payment-receipts/enrollment/`

### Production Test (After Setup)
1. Add same env vars to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Deploy: `git push`
3. Test upload on live site
4. Verify in Supabase Storage

## 🚨 Troubleshooting

### "Bucket not found" error
- Double-check bucket name is exactly `payment-receipts` (no typos)
- Refresh Supabase dashboard

### Upload fails with 403
- Verify policies are created correctly
- Check service role key is correct
- Ensure bucket is public

### Can't see uploaded files
- Check bucket policies allow SELECT for public
- Verify bucket is marked as public

## ✅ Success Indicators
- [ ] File uploads complete without errors
- [ ] Files visible in Supabase Storage dashboard
- [ ] Files accessible via public URL
- [ ] Payment receipts appear in admin verification page

---

**Current Status**: Environment configured ✅ | Bucket setup needed 🔲
**Next**: Create the storage bucket and policies in Supabase

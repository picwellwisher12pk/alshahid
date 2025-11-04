/**
 * Setup script for Supabase Storage buckets
 * Run this once to create the required storage buckets
 *
 * Usage: bun run scripts/setup-supabase-storage.ts
 */

import { supabaseAdmin } from '../lib/supabase';

const BUCKET_NAME = 'payment-receipts';

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      process.exit(1);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
      return;
    }

    // Create the bucket
    console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
    const { data, error } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true, // Make files publicly accessible
      fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
      ],
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully created bucket "${BUCKET_NAME}"`);
    console.log('\n📝 Bucket configuration:');
    console.log('  - Public: Yes (files are publicly accessible)');
    console.log('  - File size limit: 5MB');
    console.log('  - Allowed file types: JPEG, PNG, WebP, PDF');
    console.log('\n✨ Setup complete! You can now upload payment receipts.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
setupStorage();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

// Server-side Supabase client with service role key for file uploads
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name (e.g., 'payment-receipts')
 * @param path - The path within the bucket (e.g., 'enrollment/filename.jpg')
 * @param file - The file to upload (File or Buffer)
 * @param contentType - MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToSupabase(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType: string
): Promise<string> {
  let fileData: ArrayBuffer | Buffer;

  if (file instanceof File) {
    fileData = await file.arrayBuffer();
  } else {
    fileData = file;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileData, {
      contentType,
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path to the file within the bucket
 */
export async function deleteFileFromSupabase(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Extract the storage path from a Supabase public URL
 * @param url - The full public URL
 * @param bucket - The bucket name
 * @returns The file path within the bucket
 */
export function extractPathFromUrl(url: string, bucket: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts[1] || '';
  } catch {
    return '';
  }
}

-- Migration: 002_add_storage_bucket
-- Description: Create storage bucket for pantry item images
-- Created: 2026-01-05
-- Note: This needs to be run via Supabase Dashboard under Storage > New Bucket

-- Create storage bucket for pantry images
-- Go to Storage in Supabase Dashboard and create a bucket named 'pantry-images'
-- Set it to public if you want images to be publicly accessible

-- Then run this SQL to set up the storage policies:

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pantry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'pantry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pantry-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to images (if bucket is public)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pantry-images');

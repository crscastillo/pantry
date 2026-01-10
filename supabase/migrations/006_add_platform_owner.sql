-- Add is_platform_owner column to profiles table
-- Run this migration in your Supabase SQL editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_platform_owner BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_platform_owner 
ON profiles(is_platform_owner) 
WHERE is_platform_owner = TRUE;

-- Add comment
COMMENT ON COLUMN profiles.is_platform_owner IS 'Indicates if this user is a platform owner with admin access';

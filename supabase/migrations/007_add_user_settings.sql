-- Migration: 007_add_user_settings
-- Description: Add settings JSONB column to profiles table for storing user preferences
-- Created: 2026-01-10

-- Add settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance on settings queries
CREATE INDEX IF NOT EXISTS idx_profiles_settings ON public.profiles USING gin(settings);

-- Add comment
COMMENT ON COLUMN public.profiles.settings IS 'User preferences and settings stored as JSONB (e.g., language, theme, notifications)';

-- Example settings structure:
-- {
--   "language": "en",
--   "theme": "light",
--   "notifications": {
--     "email": true,
--     "expiry_alerts": true
--   }
-- }

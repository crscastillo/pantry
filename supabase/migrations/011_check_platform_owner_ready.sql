-- Migration: 011_check_platform_owner_ready
-- Description: Add function to check if platform owner is fully set up and ready to login
-- Created: 2026-01-10

-- Function to check if platform owner auth user exists and is confirmed
CREATE OR REPLACE FUNCTION public.check_platform_owner_ready(owner_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  auth_user_exists BOOLEAN;
  auth_user_confirmed BOOLEAN;
  profile_is_owner BOOLEAN;
BEGIN
  -- Check if auth user exists with this email
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = owner_email
  ) INTO auth_user_exists;
  
  IF NOT auth_user_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if auth user email is confirmed
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = owner_email 
    AND email_confirmed_at IS NOT NULL
  ) INTO auth_user_confirmed;
  
  IF NOT auth_user_confirmed THEN
    RETURN FALSE;
  END IF;
  
  -- Check if profile has is_platform_owner = true
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE email = owner_email 
    AND is_platform_owner = TRUE
  ) INTO profile_is_owner;
  
  -- All checks must pass for platform owner to be ready
  RETURN profile_is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.check_platform_owner_ready(TEXT) IS 'Returns true only if platform owner auth user exists, is confirmed, and profile has is_platform_owner = true';

-- Grant execute permission to anon and authenticated users (anyone can check if setup is needed)
GRANT EXECUTE ON FUNCTION public.check_platform_owner_ready(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_platform_owner_ready(TEXT) TO authenticated;

-- Migration: 010_add_email_confirmed_status
-- Description: Add function for platform owners to check email confirmation status
-- Created: 2026-01-10

-- Function to get email confirmed status for a user
-- Only accessible by platform owners
CREATE OR REPLACE FUNCTION public.get_user_email_confirmed(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Only allow platform owners to call this function
  IF NOT public.is_platform_owner() THEN
    RAISE EXCEPTION 'Access denied: Only platform owners can access this function';
  END IF;
  
  -- Get email_confirmed_at from auth.users
  SELECT email_confirmed_at INTO confirmed_at
  FROM auth.users
  WHERE id = user_id;
  
  -- Return true if email is confirmed (email_confirmed_at is not null)
  RETURN confirmed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION public.get_user_email_confirmed(UUID) IS 'Returns true if user has confirmed their email. Only accessible by platform owners.';

-- Grant execute permission to authenticated users (the function itself checks for platform owner)
GRANT EXECUTE ON FUNCTION public.get_user_email_confirmed(UUID) TO authenticated;

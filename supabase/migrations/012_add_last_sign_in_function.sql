-- Migration: Add function to get user last sign in
-- Description: Creates a function that platform owners can use to get last_sign_in_at from auth.users

-- Function to get user's last sign in timestamp
CREATE OR REPLACE FUNCTION get_user_last_sign_in(user_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_sign_in TIMESTAMPTZ;
BEGIN
  -- Only allow platform owners to call this function
  IF NOT is_platform_owner() THEN
    RAISE EXCEPTION 'Only platform owners can access this function';
  END IF;

  -- Get last_sign_in_at from auth.users
  SELECT last_sign_in_at INTO last_sign_in
  FROM auth.users
  WHERE id = user_id;

  RETURN last_sign_in;
END;
$$;

-- Grant execute permission to authenticated users (function checks is_platform_owner internally)
GRANT EXECUTE ON FUNCTION get_user_last_sign_in TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_last_sign_in IS 'Returns the last sign in timestamp for a user from auth.users. Only accessible by platform owners.';

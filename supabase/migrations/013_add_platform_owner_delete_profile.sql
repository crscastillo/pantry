-- Migration: Add platform owner delete policy for profiles
-- Description: Allow platform owners to delete user profiles

-- Platform owner can delete all profiles (except their own for safety)
CREATE POLICY "Platform owner can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (public.is_platform_owner() AND id != auth.uid());

COMMENT ON POLICY "Platform owner can delete profiles" ON public.profiles 
IS 'Allows platform owners to delete user profiles (except their own account)';

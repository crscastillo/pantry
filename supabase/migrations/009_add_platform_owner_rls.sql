-- Migration: 009_add_platform_owner_rls
-- Description: Add RLS policies for platform owners to read all data across all users
-- Created: 2026-01-10

-- Helper function to check if user is platform owner
CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_platform_owner = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add comment
COMMENT ON FUNCTION public.is_platform_owner() IS 'Returns true if the current user is a platform owner';

-- ====================
-- PROFILES TABLE
-- ====================

-- Platform owner can view all profiles
CREATE POLICY "Platform owner can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_platform_owner());

-- Platform owner can update all profiles (if needed)
CREATE POLICY "Platform owner can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_platform_owner());

-- ====================
-- PANTRY_ITEMS TABLE
-- ====================

-- Platform owner can view all pantry items
CREATE POLICY "Platform owner can view all items"
  ON public.pantry_items
  FOR SELECT
  USING (public.is_platform_owner());

-- Platform owner can update all pantry items (if needed)
CREATE POLICY "Platform owner can update all items"
  ON public.pantry_items
  FOR UPDATE
  USING (public.is_platform_owner());

-- Platform owner can delete all pantry items (if needed)
CREATE POLICY "Platform owner can delete all items"
  ON public.pantry_items
  FOR DELETE
  USING (public.is_platform_owner());

-- ====================
-- RECIPES TABLE (if exists)
-- ====================

-- Platform owner can view all recipes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipes') THEN
    EXECUTE 'CREATE POLICY "Platform owner can view all recipes"
      ON public.recipes
      FOR SELECT
      USING (public.is_platform_owner())';
    
    -- Platform owner can update all recipes (if needed)
    EXECUTE 'CREATE POLICY "Platform owner can update all recipes"
      ON public.recipes
      FOR UPDATE
      USING (public.is_platform_owner())';
    
    -- Platform owner can delete all recipes (if needed)
    EXECUTE 'CREATE POLICY "Platform owner can delete all recipes"
      ON public.recipes
      FOR DELETE
      USING (public.is_platform_owner())';
  END IF;
END $$;

-- ====================
-- RECIPE_INGREDIENTS TABLE (if exists)
-- ====================

-- Platform owner can view all recipe ingredients
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'recipe_ingredients') THEN
    EXECUTE 'CREATE POLICY "Platform owner can view all ingredients"
      ON public.recipe_ingredients
      FOR SELECT
      USING (public.is_platform_owner())';
    
    -- Platform owner can update all recipe ingredients (if needed)
    EXECUTE 'CREATE POLICY "Platform owner can update all ingredients"
      ON public.recipe_ingredients
      FOR UPDATE
      USING (public.is_platform_owner())';
    
    -- Platform owner can delete all recipe ingredients (if needed)
    EXECUTE 'CREATE POLICY "Platform owner can delete all ingredients"
      ON public.recipe_ingredients
      FOR DELETE
      USING (public.is_platform_owner())';
  END IF;
END $$;

-- Add index to improve performance of is_platform_owner checks
CREATE INDEX IF NOT EXISTS idx_profiles_uid_platform_owner 
ON public.profiles(id) 
WHERE is_platform_owner = TRUE;

-- Note: The existing user policies remain in place, so regular users can still access their own data
-- Platform owners get additional access to all data through these new policies

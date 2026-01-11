import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  email: string
  full_name: string | null
  pantry_items_count: number
  last_sign_in_at: string | null
  email_confirmed: boolean
}

interface DeleteUserResult {
  success: boolean
  userId: string
  deletedPantryItems: number
  deletedRecipes: number
  error?: string
}

/**
 * Platform service for administrative operations
 * Only accessible by platform owners
 */
export class PlatformService {
  /**
   * Get list of all users with their data and confirmation status
   * @returns Array of user data
   */
  static async getUserList(): Promise<UserData[]> {
    try {
      // Get all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false })
      
      if (profilesError) throw profilesError

      // Get additional data for each user
      const usersWithData = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          // Get pantry item count
          const { count } = await supabase
            .from('pantry_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
          
          // Get email confirmation status
          let emailConfirmed = false
          try {
            const { data: confirmData } = await (supabase as any)
              .rpc('get_user_email_confirmed', { user_id: profile.id })
            emailConfirmed = confirmData ?? false
          } catch (error) {
            console.error('Error checking email confirmation:', error)
          }
          
          // Get last sign in timestamp
          let lastSignIn = null
          try {
            const { data: signInData } = await (supabase as any)
              .rpc('get_user_last_sign_in', { user_id: profile.id })
            lastSignIn = signInData
          } catch (error) {
            console.error('Error getting last sign in:', error)
          }
          
          return {
            id: profile.id,
            email: profile.email || 'N/A',
            full_name: profile.full_name,
            pantry_items_count: count || 0,
            last_sign_in_at: lastSignIn,
            email_confirmed: emailConfirmed
          }
        })
      )

      return usersWithData
    } catch (error) {
      console.error('Error loading user list:', error)
      throw error
    }
  }
  /**
   * Delete a user and all their associated data
   * @param userId - The ID of the user to delete
   * @returns Summary of deletion operation
   */
  static async deleteUser(userId: string): Promise<DeleteUserResult> {
    try {
      // Count items before deletion
      const { count: pantryCount } = await supabase
        .from('pantry_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { count: recipesCount } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Delete recipe ingredients (if table exists)
      // Will cascade automatically, but we can delete explicitly if needed
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id')
        .eq('user_id', userId)

      if (recipes && recipes.length > 0) {
        const recipeIds = recipes.map((r: any) => r.id)
        await supabase
          .from('recipe_ingredients')
          .delete()
          .in('recipe_id', recipeIds)
      }

      // Delete recipes
      const { error: recipesError } = await supabase
        .from('recipes')
        .delete()
        .eq('user_id', userId)

      if (recipesError) {
        console.error('Error deleting recipes:', recipesError)
      }

      // Delete pantry items
      const { error: pantryError } = await supabase
        .from('pantry_items')
        .delete()
        .eq('user_id', userId)

      if (pantryError) {
        throw new Error(`Failed to delete pantry items: ${pantryError.message}`)
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        throw new Error(`Failed to delete profile: ${profileError.message}`)
      }

      // Note: auth.users record remains - requires service role to delete
      // Can be handled separately via Supabase Dashboard or admin API

      return {
        success: true,
        userId,
        deletedPantryItems: pantryCount || 0,
        deletedRecipes: recipesCount || 0,
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        success: false,
        userId,
        deletedPantryItems: 0,
        deletedRecipes: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

import { supabase } from '@/lib/supabase'
import type {
  Recipe,
  RecipeIngredient,
  RecipeWithIngredients,
  CreateRecipeDto,
  UpdateRecipeDto,
} from '@/types/recipe'

class RecipeService {
  /**
   * Get all recipes for a user
   */
  async getRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[RecipeService] Error fetching recipes:', error)
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a single recipe by ID with its ingredients
   */
  async getRecipeById(recipeId: string, userId: string): Promise<RecipeWithIngredients> {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('user_id', userId)
      .single()

    if (recipeError) {
      console.error('[RecipeService] Error fetching recipe:', recipeError)
      throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
    }

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true })

    if (ingredientsError) {
      console.error('[RecipeService] Error fetching ingredients:', ingredientsError)
      throw new Error(`Failed to fetch ingredients: ${ingredientsError.message}`)
    }

    return {
      ...(recipe as Recipe),
      ingredients: ingredients || [],
    } as RecipeWithIngredients
  }

  /**
   * Create a new recipe with ingredients
   */
  async createRecipe(userId: string, recipeData: CreateRecipeDto): Promise<RecipeWithIngredients> {
    // Create the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: userId,
          name: recipeData.name,
          description: recipeData.description || null,
          servings: recipeData.servings,
          prep_time: recipeData.prep_time || null,
          cook_time: recipeData.cook_time || null,
          instructions: recipeData.instructions,
          image_url: recipeData.image_url || null,
          category: recipeData.category,
          cuisine: recipeData.cuisine || null,
          difficulty: recipeData.difficulty,
          tags: recipeData.tags || null,
        },
      ] as any)
      .select()
      .single()

    if (recipeError || !recipe) {
      console.error('[RecipeService] Error creating recipe:', recipeError)
      throw new Error(`Failed to create recipe: ${recipeError?.message || 'No data returned'}`)
    }

    // Create ingredients if provided
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredientsToInsert = recipeData.ingredients.map((ing) => ({
        recipe_id: (recipe as any).id,
        pantry_item_id: ing.pantry_item_id || null,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes || null,
      }))

      const { data: ingredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert as any)
        .select()

      if (ingredientsError) {
        console.error('[RecipeService] Error creating ingredients:', ingredientsError)
        // Recipe was created, so we don't throw, just return empty ingredients
        return { ...(recipe as Recipe), ingredients: [] } as RecipeWithIngredients
      }

      return { ...(recipe as Recipe), ingredients: ingredients || [] } as RecipeWithIngredients
    }

    return { ...(recipe as Recipe), ingredients: [] } as RecipeWithIngredients
  }

  /**
   * Update a recipe
   */
  async updateRecipe(
    recipeId: string,
    userId: string,
    updates: UpdateRecipeDto
  ): Promise<Recipe> {
    const updateData: Record<string, any> = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description || null
    if (updates.servings !== undefined) updateData.servings = updates.servings
    if (updates.prep_time !== undefined) updateData.prep_time = updates.prep_time || null
    if (updates.cook_time !== undefined) updateData.cook_time = updates.cook_time || null
    if (updates.instructions !== undefined) updateData.instructions = updates.instructions
    if (updates.image_url !== undefined) updateData.image_url = updates.image_url || null
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.cuisine !== undefined) updateData.cuisine = updates.cuisine || null
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
    if (updates.tags !== undefined) updateData.tags = updates.tags || null

    const { data, error } = await (supabase
      .from('recipes') as any)
      .update(updateData)
      .eq('id', recipeId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[RecipeService] Error updating recipe:', error)
      throw new Error(`Failed to update recipe: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from update')
    }

    return data
  }

  /**
   * Delete a recipe (ingredients will be cascade deleted)
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recipeId)
      .eq('user_id', userId)

    if (error) {
      console.error('[RecipeService] Error deleting recipe:', error)
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(userId: string, category: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[RecipeService] Error fetching recipes by category:', error)
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search recipes by name
   */
  async searchRecipes(userId: string, searchTerm: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[RecipeService] Error searching recipes:', error)
      throw new Error(`Failed to search recipes: ${error.message}`)
    }

    return data || []
  }

  /**
   * Check if user has all ingredients for a recipe
   */
  async checkRecipeAvailability(
    recipeId: string
  ): Promise<{ available: boolean; missingIngredients: RecipeIngredient[] }> {
    const { data: ingredients, error } = await supabase
      .from('recipe_ingredients')
      .select('*, pantry_items!recipe_ingredients_pantry_item_id_fkey(*)')
      .eq('recipe_id', recipeId)

    if (error) {
      console.error('[RecipeService] Error checking availability:', error)
      throw new Error(`Failed to check recipe availability: ${error.message}`)
    }

    const missing: RecipeIngredient[] = []

    for (const ingredient of ingredients || []) {
      const pantryItem = (ingredient as any).pantry_items

      if (!pantryItem || pantryItem.quantity < (ingredient as any).quantity) {
        missing.push(ingredient as RecipeIngredient)
      }
    }

    return {
      available: missing.length === 0,
      missingIngredients: missing,
    }
  }
}

export const recipeService = new RecipeService()

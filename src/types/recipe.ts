export interface Recipe {
  id: string
  user_id: string
  name: string
  description: string | null
  servings: number
  prep_time: number | null // in minutes
  cook_time: number | null // in minutes
  instructions: string
  image_url: string | null
  category: string
  cuisine: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  pantry_item_id: string | null
  name: string
  quantity: number
  unit: string
  notes: string | null
  created_at: string
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[]
}

// DTOs for creating/updating recipes
export interface CreateRecipeDto {
  name: string
  description?: string
  servings: number
  prep_time?: number
  cook_time?: number
  instructions: string
  image_url?: string
  category: string
  cuisine?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  ingredients: CreateRecipeIngredientDto[]
}

export interface CreateRecipeIngredientDto {
  pantry_item_id?: string
  name: string
  quantity: number
  unit: string
  notes?: string
}

export interface UpdateRecipeDto {
  name?: string
  description?: string
  servings?: number
  prep_time?: number
  cook_time?: number
  instructions?: string
  image_url?: string
  category?: string
  cuisine?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

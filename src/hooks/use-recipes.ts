import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipeService } from '@/services'
import { useAuthStore } from '@/store/auth'
import type { CreateRecipeDto, UpdateRecipeDto } from '@/types/recipe'

// Query keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (userId: string) => [...recipeKeys.lists(), userId] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  byCategory: (userId: string, category: string) =>
    [...recipeKeys.all, 'category', userId, category] as const,
  search: (userId: string, term: string) =>
    [...recipeKeys.all, 'search', userId, term] as const,
}

/**
 * Fetch all recipes for the current user
 */
export function useRecipes() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: recipeKeys.list(user?.id || ''),
    queryFn: () => recipeService.getRecipes(user!.id),
    enabled: !!user,
  })
}

/**
 * Fetch a single recipe by ID with ingredients
 */
export function useRecipe(recipeId: string | undefined) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: recipeKeys.detail(recipeId || ''),
    queryFn: () => recipeService.getRecipeById(recipeId!, user!.id),
    enabled: !!user && !!recipeId,
  })
}

/**
 * Create a new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (recipeData: CreateRecipeDto) => {
      if (!user) throw new Error('User not authenticated')
      return recipeService.createRecipe(user.id, recipeData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
    },
  })
}

/**
 * Update a recipe
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateRecipeDto }) => {
      if (!user) throw new Error('User not authenticated')
      return recipeService.updateRecipe(id, user.id, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) })
    },
  })
}

/**
 * Delete a recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: (recipeId: string) => {
      if (!user) throw new Error('User not authenticated')
      return recipeService.deleteRecipe(recipeId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
    },
  })
}

/**
 * Get recipes by category
 */
export function useRecipesByCategory(category: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: recipeKeys.byCategory(user?.id || '', category),
    queryFn: () => recipeService.getRecipesByCategory(user!.id, category),
    enabled: !!user && !!category,
  })
}

/**
 * Search recipes
 */
export function useSearchRecipes(searchTerm: string) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: recipeKeys.search(user?.id || '', searchTerm),
    queryFn: () => recipeService.searchRecipes(user!.id, searchTerm),
    enabled: !!user && searchTerm.length > 0,
  })
}

/**
 * Check recipe availability (if user has all ingredients)
 */
export function useRecipeAvailability(recipeId: string | undefined) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: [...recipeKeys.detail(recipeId || ''), 'availability'],
    queryFn: () => recipeService.checkRecipeAvailability(recipeId!),
    enabled: !!user && !!recipeId,
  })
}

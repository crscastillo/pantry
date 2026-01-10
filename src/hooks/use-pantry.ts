import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pantryService, CreatePantryItemDto } from '@/services'
import { useAuthStore } from '@/store/auth'

export function usePantryItems() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: async () => {
      if (!user) return []
      return pantryService.getItems(user.id)
    },
    enabled: !!user,
  })
}

export function useAddPantryItem() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (item: CreatePantryItemDto) => {
      if (!user) throw new Error('User not authenticated')
      return pantryService.createItem(user.id, item)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreatePantryItemDto> & { id: string }) => {
      if (!user) throw new Error('User not authenticated')
      return pantryService.updateItem(id, user.id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')
      return pantryService.deleteItem(id, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

export function useQuickAdjustQuantity() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      if (!user) throw new Error('User not authenticated')
      
      // Get current item
      const currentItem = await pantryService.getItemById(id, user.id)
      if (!currentItem) throw new Error('Item not found')

      // Calculate new quantity (don't go below 0)
      const newQuantity = Math.max(0, currentItem.quantity + delta)

      // Update quantity
      return pantryService.updateQuantity(id, user.id, newQuantity)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

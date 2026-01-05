import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PantryItem } from '@/types'
import { useAuthStore } from '@/store/auth'

export function usePantryItems() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as PantryItem[]
    },
    enabled: !!user,
  })
}

export function useAddPantryItem() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (item: Omit<PantryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated')

      const insertData = {
        ...item,
        user_id: user.id,
      }

      const { data, error } = await (supabase as any)
        .from('pantry_items')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return data as PantryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PantryItem> & { id: string }) => {
      // Remove read-only fields that shouldn't be updated
      const { created_at, updated_at, user_id, ...rest } = updates as any

      const { data, error } = await (supabase as any)
        .from('pantry_items')
        .update(rest)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as PantryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] })
    },
  })
}

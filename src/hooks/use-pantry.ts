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

      // Convert empty strings to null for optional fields
      const insertData = {
        ...item,
        user_id: user.id,
        expiry_date: item.expiry_date || null,
        purchase_date: item.purchase_date || null,
        location: item.location || null,
        notes: item.notes || null,
      }

      const { data, error } = await supabase
        .from('pantry_items')
        .insert([insertData] as any)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      if (!data) throw new Error('No data returned from insert')
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

      // Convert empty strings to null for optional fields
      const updateData = {
        ...rest,
        expiry_date: rest.expiry_date || null,
        purchase_date: rest.purchase_date || null,
        location: rest.location || null,
        notes: rest.notes || null,
      }

      const { data, error } = await (supabase as any)
        .from('pantry_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        throw error
      }
      if (!data) throw new Error('No data returned from update')
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

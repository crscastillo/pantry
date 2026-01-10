import { supabase } from '@/lib/supabase'
import { PantryItem } from '@/types'

export interface CreatePantryItemDto {
  name: string
  category: string
  quantity: number
  expected_amount?: number | null
  unit: string
  expiry_date?: string | null
  purchase_date?: string | null
  location?: string | null
  notes?: string | null
  image_url?: string | null
}

export interface UpdatePantryItemDto extends Partial<CreatePantryItemDto> {
  id: string
}

export class PantryService {
  /**
   * Fetch all pantry items for a user
   */
  async getItems(userId: string): Promise<PantryItem[]> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[PantryService] Error fetching items:', error)
      throw new Error(`Failed to fetch pantry items: ${error.message}`)
    }

    return data as PantryItem[]
  }

  /**
   * Get a single pantry item by ID
   */
  async getItemById(itemId: string, userId: string): Promise<PantryItem | null> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('[PantryService] Error fetching item:', error)
      throw new Error(`Failed to fetch item: ${error.message}`)
    }

    return data as PantryItem
  }

  /**
   * Create a new pantry item
   */
  async createItem(userId: string, item: CreatePantryItemDto): Promise<PantryItem> {
    const insertData = {
      ...item,
      user_id: userId,
      expiry_date: item.expiry_date || null,
      purchase_date: item.purchase_date || null,
      location: item.location || null,
      notes: item.notes || null,
      expected_amount: item.expected_amount || null,
      image_url: item.image_url || null,
    }

    const { data, error } = await supabase
      .from('pantry_items')
      .insert([insertData] as any)
      .select()
      .single()

    if (error) {
      console.error('[PantryService] Error creating item:', error)
      throw new Error(`Failed to create item: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from insert')
    }

    return data as PantryItem
  }

  /**
   * Update an existing pantry item
   */
  async updateItem(itemId: string, userId: string, updates: Partial<CreatePantryItemDto>): Promise<PantryItem> {
    // Ensure we're only updating allowed fields
    const updateData = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.expected_amount !== undefined && { expected_amount: updates.expected_amount }),
      ...(updates.unit !== undefined && { unit: updates.unit }),
      ...(updates.expiry_date !== undefined && { expiry_date: updates.expiry_date || null }),
      ...(updates.purchase_date !== undefined && { purchase_date: updates.purchase_date || null }),
      ...(updates.location !== undefined && { location: updates.location || null }),
      ...(updates.notes !== undefined && { notes: updates.notes || null }),
      ...(updates.image_url !== undefined && { image_url: updates.image_url || null }),
    }

    const { data, error } = await (supabase
      .from('pantry_items') as any)
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[PantryService] Error updating item:', error)
      throw new Error(`Failed to update item: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from update')
    }

    return data as PantryItem
  }

  /**
   * Delete a pantry item
   */
  async deleteItem(itemId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) {
      console.error('[PantryService] Error deleting item:', error)
      throw new Error(`Failed to delete item: ${error.message}`)
    }
  }

  /**
   * Update item quantity (quick adjust)
   */
  async updateQuantity(itemId: string, userId: string, newQuantity: number): Promise<PantryItem> {
    return this.updateItem(itemId, userId, { quantity: newQuantity })
  }

  /**
   * Get items expiring soon (within X days)
   */
  async getExpiringItems(userId: string, daysAhead: number = 7): Promise<PantryItem[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString())
      .order('expiry_date', { ascending: true })

    if (error) {
      console.error('[PantryService] Error fetching expiring items:', error)
      throw new Error(`Failed to fetch expiring items: ${error.message}`)
    }

    return data as PantryItem[]
  }

  /**
   * Get low stock items (quantity < expected_amount)
   */
  async getLowStockItems(userId: string): Promise<PantryItem[]> {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId)
      .not('expected_amount', 'is', null)
      .order('quantity', { ascending: true })

    if (error) {
      console.error('[PantryService] Error fetching low stock items:', error)
      throw new Error(`Failed to fetch low stock items: ${error.message}`)
    }

    // Filter in memory for quantity < expected_amount
    return (data as PantryItem[]).filter(
      item => item.expected_amount && item.quantity < item.expected_amount
    )
  }
}

// Export singleton instance
export const pantryService = new PantryService()

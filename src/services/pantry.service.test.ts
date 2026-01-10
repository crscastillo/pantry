import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pantryService } from '@/services/pantry.service'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('PantryService', () => {
  const mockUserId = 'user-123'
  const mockItem = {
    id: 'item-1',
    user_id: mockUserId,
    name: 'Milk',
    category: 'Dairy & Eggs',
    quantity: 2,
    unit: 'l',
    expiry_date: '2026-01-15',
    purchase_date: '2026-01-10',
    location: 'Fridge',
    notes: 'Fresh milk',
    expected_amount: 3,
    image_url: null,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getItems', () => {
    it('should fetch all items for a user', async () => {
      const mockData = [mockItem]
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })

      ;(supabase.from as any).mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await pantryService.getItems(mockUserId)

      expect(supabase.from).toHaveBeenCalledWith('pantry_items')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockData)
    })

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' }
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError })

      ;(supabase.from as any).mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        order: mockOrder,
      })

      await expect(pantryService.getItems(mockUserId)).rejects.toThrow('Failed to fetch pantry items')
    })
  })

  describe('createItem', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Bread',
        category: 'Bakery & Bread',
        quantity: 1,
        unit: 'piece',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: { ...mockItem, ...newItem }, error: null })

      ;(supabase.from as any).mockReturnValue({
        insert: mockInsert,
      })
      mockInsert.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await pantryService.createItem(mockUserId, newItem)

      expect(supabase.from).toHaveBeenCalledWith('pantry_items')
      expect(mockInsert).toHaveBeenCalled()
      expect(result).toHaveProperty('name', newItem.name)
    })
  })

  describe('updateItem', () => {
    it('should update an existing item', async () => {
      const updates = { quantity: 3 }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { ...mockItem, ...updates }, 
        error: null 
      })

      ;(supabase.from as any).mockReturnValue({
        update: mockUpdate,
      })
      mockUpdate.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await pantryService.updateItem(mockItem.id, mockUserId, updates)

      expect(result.quantity).toBe(3)
    })
  })

  describe('deleteItem', () => {
    it('should delete an item', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      ;(supabase.from as any).mockReturnValue({
        delete: mockDelete,
      })
      mockDelete.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      await pantryService.deleteItem(mockItem.id, mockUserId)

      expect(supabase.from).toHaveBeenCalledWith('pantry_items')
      expect(mockDelete).toHaveBeenCalled()
    })
  })

  describe('updateQuantity', () => {
    it('should update only quantity field', async () => {
      const newQuantity = 5

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { ...mockItem, quantity: newQuantity }, 
        error: null 
      })

      ;(supabase.from as any).mockReturnValue({
        update: mockUpdate,
      })
      mockUpdate.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: mockSelect,
        }),
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await pantryService.updateQuantity(mockItem.id, mockUserId, newQuantity)

      expect(result.quantity).toBe(newQuantity)
    })
  })
})

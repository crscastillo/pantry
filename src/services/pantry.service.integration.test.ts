import { describe, it, expect, beforeEach } from 'vitest'
import { pantryService } from '@/services/pantry.service'
import type { CreatePantryItemDto } from '@/services/pantry.service'

/**
 * Integration tests for Pantry Service
 * 
 * These tests verify the complete flow of pantry operations.
 * Note: These tests require a test database connection.
 * In a real environment, you would set up a test Supabase project.
 */
describe('Pantry Service Integration', () => {
  const testUserId = 'test-user-integration'
  let createdItemId: string

  const testItem: CreatePantryItemDto = {
    name: 'Integration Test Item',
    category: 'Other',
    quantity: 5,
    unit: 'piece',
    location: 'Test Location',
    notes: 'Created by integration test',
  }

  // Skip these tests in CI/CD unless test database is configured
  describe.skip('Full CRUD flow', () => {
    it('should create, read, update, and delete an item', async () => {
      // CREATE
      const created = await pantryService.createItem(testUserId, testItem)
      expect(created).toBeDefined()
      expect(created.name).toBe(testItem.name)
      expect(created.quantity).toBe(testItem.quantity)
      createdItemId = created.id

      // READ - Get all items
      const allItems = await pantryService.getItems(testUserId)
      expect(allItems).toContainEqual(expect.objectContaining({
        id: createdItemId,
        name: testItem.name,
      }))

      // READ - Get single item
      const singleItem = await pantryService.getItemById(createdItemId, testUserId)
      expect(singleItem).toBeDefined()
      expect(singleItem?.id).toBe(createdItemId)

      // UPDATE
      const updatedItem = await pantryService.updateItem(
        createdItemId,
        testUserId,
        { quantity: 10 }
      )
      expect(updatedItem.quantity).toBe(10)

      // UPDATE QUANTITY
      const quantityUpdated = await pantryService.updateQuantity(
        createdItemId,
        testUserId,
        15
      )
      expect(quantityUpdated.quantity).toBe(15)

      // DELETE
      await pantryService.deleteItem(createdItemId, testUserId)

      // VERIFY DELETION
      const deletedItem = await pantryService.getItemById(createdItemId, testUserId)
      expect(deletedItem).toBeNull()
    })

    it('should get expiring items', async () => {
      // Create item expiring soon
      const expiringItem = await pantryService.createItem(testUserId, {
        ...testItem,
        name: 'Expiring Item',
        expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      })

      const expiringItems = await pantryService.getExpiringItems(testUserId, 7)
      expect(expiringItems).toContainEqual(expect.objectContaining({
        id: expiringItem.id,
      }))

      // Cleanup
      await pantryService.deleteItem(expiringItem.id, testUserId)
    })

    it('should get low stock items', async () => {
      // Create low stock item
      const lowStockItem = await pantryService.createItem(testUserId, {
        ...testItem,
        name: 'Low Stock Item',
        quantity: 2,
        expected_amount: 10,
      })

      const lowStockItems = await pantryService.getLowStockItems(testUserId)
      expect(lowStockItems).toContainEqual(expect.objectContaining({
        id: lowStockItem.id,
      }))

      // Cleanup
      await pantryService.deleteItem(lowStockItem.id, testUserId)
    })

    it('should handle errors gracefully', async () => {
      // Try to get item with invalid user ID
      await expect(
        pantryService.getItemById('non-existent-id', 'invalid-user')
      ).resolves.toBeNull()

      // Try to update non-existent item
      await expect(
        pantryService.updateItem('non-existent-id', testUserId, { quantity: 5 })
      ).rejects.toThrow()
    })
  })
})

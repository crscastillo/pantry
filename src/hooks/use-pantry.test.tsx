import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import type { PantryItem } from '../types'

// Mock supabase - must be hoisted, so define inline
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

const mockUseAuthStore = vi.fn()
vi.mock('../store/auth', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

import {
  usePantryItems,
  useAddPantryItem,
  useUpdatePantryItem,
  useDeletePantryItem,
} from './use-pantry'
import { supabase } from '../lib/supabase'

// Get reference to mocked functions
const mockFrom = supabase.from as any

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePantryItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({ user: { id: 'user123' } })
  })

  it('should fetch pantry items successfully', async () => {
    const mockItems: PantryItem[] = [
      {
        id: '1',
        user_id: 'user123',
        name: 'Item 1',
        quantity: 2,
        unit: 'pieces',
        category: 'other',
        location: 'Pantry',
        expiry_date: null,
        purchase_date: null,
        notes: null,
        expected_amount: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    const selectMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockReturnThis()
    const orderMock = vi.fn().mockResolvedValue({ data: mockItems, error: null })

    mockFrom.mockReturnValue({
      select: selectMock,
      eq: eqMock,
      order: orderMock,
    })

    const { result } = renderHook(() => usePantryItems(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockItems)
    expect(selectMock).toHaveBeenCalledWith('*')
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user123')
  })

  it('should return empty array when no user', async () => {
    mockUseAuthStore.mockReturnValue({ user: null })

    const { result } = renderHook(() => usePantryItems(), { wrapper: createWrapper() })

    // When query is disabled (no user), data is undefined
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle fetch error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    })

    const { result } = renderHook(() => usePantryItems(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useAddPantryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({ user: { id: 'user123' } })
  })

  it('should add pantry item successfully', async () => {
    const newItem = {
      name: 'New Item',
      quantity: 5,
      unit: 'pieces',
      category: 'other' as const,
      location: 'Pantry',
    }

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { ...newItem, id: '1', user_id: 'user123' }, error: null }),
      }),
    })
    mockFrom.mockReturnValue({
      insert: insertMock,
    })

    const { result } = renderHook(() => useAddPantryItem(), { wrapper: createWrapper() })

    await result.current.mutateAsync(newItem)

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ...newItem,
        user_id: 'user123',
      })
    )
  })

  it('should throw error when user is not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({ user: null })

    const { result } = renderHook(() => useAddPantryItem(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({ name: 'Test' } as any)).rejects.toThrow()
  })
})

describe('useUpdatePantryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update pantry item successfully', async () => {
    const updates = { name: 'Updated Name', quantity: 10 }
    const itemId = '123'

    const updateMock = vi.fn().mockReturnThis()
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      }),
    })

    const { result} = renderHook(() => useUpdatePantryItem(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ id: itemId, updates })

    await waitFor(() => {
      expect(singleMock).toHaveBeenCalled()
    })
  })

  it('should handle update error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
    })

    const { result } = renderHook(() => useUpdatePantryItem(), { wrapper: createWrapper() })

    await expect(
      result.current.mutateAsync({ id: '123', updates: { name: 'Test' } })
    ).rejects.toThrow()
  })
})

describe('useDeletePantryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete pantry item successfully', async () => {
    const itemId = '123'

    const deleteMock = vi.fn().mockReturnThis()
    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockFrom.mockReturnValue({
      delete: deleteMock,
      eq: eqMock,
    })

    const { result } = renderHook(() => useDeletePantryItem(), { wrapper: createWrapper() })

    await result.current.mutateAsync(itemId)

    expect(deleteMock).toHaveBeenCalled()
    expect(eqMock).toHaveBeenCalledWith('id', itemId)
  })

  it('should handle delete error', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Delete failed' } }),
    })

    const { result } = renderHook(() => useDeletePantryItem(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync('123')).rejects.toThrow()
  })
})

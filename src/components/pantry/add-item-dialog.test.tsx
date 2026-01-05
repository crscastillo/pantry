import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AddItemDialog } from './add-item-dialog'
import type { PantryItem } from '../../types'

const mockAddItem = vi.fn()
const mockUpdateItem = vi.fn()
const mockDeleteItem = vi.fn()

vi.mock('../../hooks/use-pantry', () => ({
  useAddPantryItem: () => ({ mutateAsync: mockAddItem }),
  useUpdatePantryItem: () => ({ mutateAsync: mockUpdateItem }),
  useDeletePantryItem: () => ({ mutateAsync: mockDeleteItem }),
}))

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

describe('AddItemDialog', () => {
  const mockOnOpenChange = vi.fn()

  const mockItem: PantryItem = {
    id: '1',
    user_id: 'user123',
    name: 'Test Item',
    quantity: 5,
    unit: 'pieces',
    category: 'other',
    location: 'Pantry',
    expiry_date: '2026-12-31',
    purchase_date: '2026-01-01',
    notes: 'Test notes',
    expected_amount: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render in add mode when no editing item', () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={null} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText(/add item/i)).toBeInTheDocument()
  })

  it('should render in edit mode with existing item data', () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={mockItem} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument()
  })

  it('should submit new item with valid data', async () => {
    const user = userEvent.setup()
    mockAddItem.mockResolvedValue({})

    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={null} />, {
      wrapper: createWrapper(),
    })

    const nameInput = screen.getByPlaceholderText(/item name/i)
    const submitButton = screen.getByText(/add item/i).closest('button')

    await user.clear(nameInput)
    await user.type(nameInput, 'New Item')
    if (submitButton) fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled()
    })
  })

  it('should update existing item', async () => {
    const user = userEvent.setup()
    mockUpdateItem.mockResolvedValue({})

    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={mockItem} />, {
      wrapper: createWrapper(),
    })

    const nameInput = screen.getByPlaceholderText(/item name/i)
    const submitButton = screen.getByText(/update item/i).closest('button')

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Item')
    if (submitButton) fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalled()
    })
  })

  it('should show delete button in edit mode', () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={mockItem} />, {
      wrapper: createWrapper(),
    })

    // Delete button should be present in edit mode (icon button)
    const buttons = screen.getAllByRole('button')
    const hasDeleteButton = buttons.some(btn => {
      const svg = btn.querySelector('svg.text-red-600')
      return svg !== null
    })
    expect(hasDeleteButton).toBe(true)
  })

  it('should not show delete button in add mode', () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={null} />, {
      wrapper: createWrapper(),
    })

    const buttons = screen.getAllByRole('button')
    const hasDeleteButton = buttons.some(btn => {
      const svg = btn.querySelector('svg.text-red-600')
      return svg !== null
    })
    expect(hasDeleteButton).toBe(false)
  })

  it('should handle delete confirmation', async () => {
    mockDeleteItem.mockResolvedValue({})

    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={mockItem} />, {
      wrapper: createWrapper(),
    })

    // Find and click delete button (icon button with red trash icon)
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(btn => {
      const svg = btn.querySelector('svg.text-red-600')
      return svg !== null
    })
    
    expect(deleteButton).toBeDefined()
    if (deleteButton) fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteItem).toHaveBeenCalledWith(mockItem.id)
    })
  })

  it('should validate required fields', async () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={null} />, {
      wrapper: createWrapper(),
    })

    const submitButton = screen.getByText(/add item/i).closest('button')
    if (submitButton) fireEvent.click(submitButton)

    // Form should show validation errors for required fields
    await waitFor(() => {
      expect(mockAddItem).not.toHaveBeenCalled()
    }, { timeout: 500 })
  })

  it('should close dialog on back button', () => {
    render(<AddItemDialog open={true} onOpenChange={mockOnOpenChange} editingItem={null} />, {
      wrapper: createWrapper(),
    })

    // Find back button (has ArrowLeft icon)
    const buttons = screen.getAllByRole('button')
    const backButton = buttons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-arrow-left')
    )
    
    if (backButton) fireEvent.click(backButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})

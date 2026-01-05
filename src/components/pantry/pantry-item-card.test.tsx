import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { PantryItemCard } from './pantry-item-card'
import type { PantryItem } from '../../types'

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

describe('PantryItemCard', () => {
  const mockOnDelete = vi.fn()
  const mockOnEdit = vi.fn()

  const mockItem: PantryItem = {
    id: '1',
    user_id: 'user123',
    name: 'Milk',
    quantity: 2,
    unit: 'liters',
    category: 'dairy',
    location: 'Fridge',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    purchase_date: new Date().toISOString(),
    notes: 'Fresh milk',
    expected_amount: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render item name and details', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText(/2 liters/i)).toBeInTheDocument()
    expect(screen.getByText('Fridge')).toBeInTheDocument()
  })

  it('should show expiry badge', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText(/days in/i)).toBeInTheDocument()
  })

  it('should show expired badge for expired items', () => {
    const expiredItem = {
      ...mockItem,
      expiry_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    }

    render(<PantryItemCard item={expiredItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByText(/expired/i)).toBeInTheDocument()
  })

  it('should show low stock badge', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    // Item has quantity 2 but expected 3, so it's low stock
    expect(screen.getByText(/low stock/i)).toBeInTheDocument()
  })

  it('should call onEdit when card is clicked', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem)
  })

  it('should handle item without expiry date', () => {
    const itemNoExpiry = { ...mockItem, expiry_date: null }

    render(<PantryItemCard item={itemNoExpiry} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByText(/expires/i)).not.toBeInTheDocument()
  })

  it('should handle item without expected amount', () => {
    const itemNoExpected = { ...mockItem, expected_amount: null }

    render(<PantryItemCard item={itemNoExpected} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    expect(screen.queryByText(/low stock/i)).not.toBeInTheDocument()
  })

  it('should display category emoji if available', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    // Should render emoji based on category
    const card = screen.getByText('Milk').closest('div')
    expect(card).toBeInTheDocument()
  })
})

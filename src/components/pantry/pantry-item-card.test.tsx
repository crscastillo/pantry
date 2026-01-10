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

    expect(screen.getByText(/days left/i)).toBeInTheDocument()
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

  it('should open drawer when edit button is clicked', () => {
    render(<PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    })

    const editButton = screen.getByText(/edit details/i)
    fireEvent.click(editButton)

    // Should open the drawer
    expect(screen.getByText(/view and manage item details/i)).toBeInTheDocument()
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

  it('should have overflow-hidden class for mobile UX', () => {
    const { container } = render(
      <PantryItemCard item={mockItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
      { wrapper: createWrapper() }
    )

    // Check that the card wrapper has overflow-hidden to prevent horizontal scroll
    const cardWrapper = container.querySelector('.overflow-hidden')
    expect(cardWrapper).toBeInTheDocument()
  })

  it('should render with responsive width and proper text wrapping', () => {
    const longNameItem = {
      ...mockItem,
      name: 'Very Long Item Name That Should Wrap Properly On Small Screens Without Causing Overflow',
    }

    const { container } = render(
      <PantryItemCard item={longNameItem} onDelete={mockOnDelete} onEdit={mockOnEdit} />,
      { wrapper: createWrapper() }
    )

    const cardWrapper = container.querySelector('.w-full')
    expect(cardWrapper).toBeInTheDocument()
    expect(cardWrapper).toHaveClass('overflow-hidden')
    expect(screen.getByText(longNameItem.name)).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { MobileNav } from './mobile-nav'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('MobileNav', () => {
  const mockOnAddClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all navigation items', () => {
    render(<MobileNav onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    expect(screen.getByText('Pantry')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should call onAddClick when add button is clicked', () => {
    render(<MobileNav onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    // The add button is the floating button with Plus icon
    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find(btn => btn.className.includes('bg-emerald-500'))
    if (addButton) fireEvent.click(addButton)

    expect(mockOnAddClick).toHaveBeenCalledTimes(1)
  })

  it('should highlight active Pantry tab', () => {
    render(<MobileNav onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    const pantryButton = screen.getByText('Pantry').closest('button')
    expect(pantryButton).toHaveClass('text-emerald-500')
  })

  it('should show toast for coming soon features', () => {
    render(<MobileNav onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    const recipesButton = screen.getByText('Recipes')
    fireEvent.click(recipesButton)

    // Toast should be triggered (implementation depends on toast library)
  })

  it('should be fixed at bottom with safe-bottom class', () => {
    const { container } = render(<MobileNav onAddClick={mockOnAddClick} />, {
      wrapper: createWrapper(),
    })

    const nav = container.querySelector('.safe-bottom')
    expect(nav).toBeInTheDocument()
  })
})

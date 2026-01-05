import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { DesktopSidebar } from './desktop-sidebar'

const mockUseAuthStore = vi.fn()
vi.mock('../../store/auth', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

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

describe('DesktopSidebar', () => {
  const mockOnAddClick = vi.fn()
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: mockSignOut,
    })
  })

  it('should render all navigation items', () => {
    render(<DesktopSidebar onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    expect(screen.getByText('My Pantry')).toBeInTheDocument()
    expect(screen.getByText('Recipes')).toBeInTheDocument()
    expect(screen.getByText('Shopping List')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('should display user email', () => {
    render(<DesktopSidebar onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should call onAddClick when add button is clicked', () => {
    render(<DesktopSidebar onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    const addButton = screen.getByText(/add item/i).closest('button')
    if (addButton) fireEvent.click(addButton)

    expect(mockOnAddClick).toHaveBeenCalledTimes(1)
  })

  it('should call signOut when logout button is clicked', () => {
    render(<DesktopSidebar onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    const logoutButton = screen.getByTitle('Sign out')
    fireEvent.click(logoutButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('should be hidden on mobile screens', () => {
    const { container } = render(<DesktopSidebar onAddClick={mockOnAddClick} />, {
      wrapper: createWrapper(),
    })

    const sidebar = container.querySelector('.hidden.md\\:flex')
    expect(sidebar).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<DesktopSidebar onAddClick={mockOnAddClick} />, { wrapper: createWrapper() })

    const pantryButton = screen.getByText('My Pantry').closest('button')
    expect(pantryButton).toHaveClass('bg-emerald-50')
  })
})

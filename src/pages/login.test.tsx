import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { LoginPage } from './login'
import { useAuthStore } from '@/store/auth'

// Mock the auth store
vi.mock('@/store/auth', () => ({
  useAuthStore: vi.fn(),
}))

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  )
}

describe('LoginPage - Social Sign In', () => {
  const mockSignIn = vi.fn()
  const mockSignInWithProvider = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      initialized: true,
      signIn: mockSignIn,
      signInWithProvider: mockSignInWithProvider,
      signUp: vi.fn(),
      signOut: vi.fn(),
      checkAuth: vi.fn(),
      initialize: vi.fn(),
    })
  })

  it('should render social login buttons', () => {
    render(<LoginPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  it('should call signInWithProvider when Google button is clicked', async () => {
    mockSignInWithProvider.mockResolvedValue(undefined)

    render(<LoginPage />, { wrapper: createWrapper() })

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  it('should call signInWithProvider when Facebook button is clicked', async () => {
    mockSignInWithProvider.mockResolvedValue(undefined)

    render(<LoginPage />, { wrapper: createWrapper() })

    const facebookButton = screen.getByRole('button', { name: /facebook/i })
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('facebook')
    })
  })

  it('should disable social buttons while loading', async () => {
    mockSignInWithProvider.mockImplementation(() => new Promise(() => {}))

    render(<LoginPage />, { wrapper: createWrapper() })

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(googleButton).toBeDisabled()
      expect(screen.getByRole('button', { name: /facebook/i })).toBeDisabled()
    })
  })

  it('should handle OAuth error gracefully', async () => {
    const error = new Error('OAuth failed')
    mockSignInWithProvider.mockRejectedValue(error)

    render(<LoginPage />, { wrapper: createWrapper() })

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })

    // Buttons should be re-enabled after error
    await waitFor(() => {
      expect(googleButton).not.toBeDisabled()
    })
  })

  it('should still allow email/password sign in', async () => {
    mockSignIn.mockResolvedValue(undefined)

    render(<LoginPage />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /^sign in$/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})

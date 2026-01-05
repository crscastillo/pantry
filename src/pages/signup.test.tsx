import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { SignupPage } from './signup'
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

describe('SignupPage - Social Sign In', () => {
  const mockSignUp = vi.fn()
  const mockSignInWithProvider = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      loading: false,
      initialized: true,
      signIn: vi.fn(),
      signInWithProvider: mockSignInWithProvider,
      signUp: mockSignUp,
      signOut: vi.fn(),
      checkAuth: vi.fn(),
      initialize: vi.fn(),
    })
  })

  it('should render social signup buttons', () => {
    render(<SignupPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  it('should call signInWithProvider when Google button is clicked', async () => {
    mockSignInWithProvider.mockResolvedValue(undefined)

    render(<SignupPage />, { wrapper: createWrapper() })

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  it('should call signInWithProvider when Facebook button is clicked', async () => {
    mockSignInWithProvider.mockResolvedValue(undefined)

    render(<SignupPage />, { wrapper: createWrapper() })

    const facebookButton = screen.getByRole('button', { name: /facebook/i })
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(mockSignInWithProvider).toHaveBeenCalledWith('facebook')
    })
  })

  it('should disable social buttons while loading', async () => {
    mockSignInWithProvider.mockImplementation(() => new Promise(() => {}))

    render(<SignupPage />, { wrapper: createWrapper() })

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(googleButton).toBeDisabled()
      expect(screen.getByRole('button', { name: /facebook/i })).toBeDisabled()
    })
  })

  it('should still allow email/password sign up', async () => {
    mockSignUp.mockResolvedValue(undefined)

    render(<SignupPage />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const fullNameInput = screen.getByLabelText(/full name/i)
    const signUpButton = screen.getByRole('button', { name: /^create account$/i })

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signUpButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'John Doe')
    })
  })
})

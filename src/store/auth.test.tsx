import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import type { User } from '@supabase/supabase-js'

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
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import { useAuthStore } from './auth'
import { supabase } from '../lib/supabase'

// Get reference to mocked functions
const mockAuth = supabase.auth as any
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

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, loading: false })
  })

  it('should initialize with null user and loading false', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle successful sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' } as User
    
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: vi.fn().mockReturnThis(),
    })

    const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

    await result.current.signIn('test@example.com', 'password')

    await waitFor(() => {
      expect(result.current.user).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }))
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle sign in error', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    })

    const { result } = renderHook(() => useAuthStore())

    await expect(result.current.signIn('test@example.com', 'wrong')).rejects.toThrow()
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('should handle successful sign up', async () => {
    const mockUser = { id: '123', email: 'new@example.com' } as User

    mockAuth.signUp.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    })

    const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

    await result.current.signUp('new@example.com', 'password')

    // signUp only logs the message, doesn't set user - user gets set on auth state change
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: {
        data: {
          full_name: undefined,
        },
      },
    })
  })

  it('should handle sign out', async () => {
    const mockUser = { id: '123', email: 'test@example.com' } as User
    useAuthStore.setState({ user: mockUser, loading: false })

    mockAuth.signOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuthStore())

    await result.current.signOut()

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  it('should create profile if missing on sign in', async () => {
    const mockUser = { id: '123', email: 'test@example.com' } as User
    
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    })

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      insert: insertMock,
    })

    const { result } = renderHook(() => useAuthStore())

    await result.current.signIn('test@example.com', 'password')

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }))
    })
  })
})

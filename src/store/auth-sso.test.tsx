import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock supabase - must be hoisted, so define inline
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
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

import { useAuthStore } from './auth'
import { supabase } from '../lib/supabase'

// Get reference to mocked functions
const mockAuth = supabase.auth as any

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

describe('useAuthStore - Social Sign In', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, loading: false })
  })

  describe('signInWithProvider', () => {
    it('should call signInWithOAuth with Google provider', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await result.current.signInWithProvider('google')

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/dashboard'),
        },
      })
    })

    it('should call signInWithOAuth with Facebook provider', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'facebook', url: 'https://www.facebook.com/oauth' },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await result.current.signInWithProvider('facebook')

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: expect.stringContaining('/dashboard'),
        },
      })
    })

    it('should call signInWithOAuth with correct options', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await result.current.signInWithProvider('google')

      // Should call with correct structure
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/dashboard'),
        }),
      })
    })

    it('should handle OAuth error', async () => {
      const error = { message: 'OAuth provider not configured' }
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error,
      })

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await expect(result.current.signInWithProvider('google')).rejects.toThrow()

      // Should reset loading state on error
      expect(result.current.loading).toBe(false)
    })

    it('should handle network error during OAuth', async () => {
      const networkError = new Error('Network error')
      mockAuth.signInWithOAuth.mockRejectedValue(networkError)

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await expect(result.current.signInWithProvider('facebook')).rejects.toThrow('Network error')

      expect(result.current.loading).toBe(false)
    })

    it('should use correct redirect URL with window.location.origin', async () => {
      const originalLocation = window.location
      delete (window as any).location
      window.location = { ...originalLocation, origin: 'https://my-app.com' }

      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null,
      })

      const { result } = renderHook(() => useAuthStore(), { wrapper: createWrapper() })

      await result.current.signInWithProvider('google')

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://my-app.com/dashboard',
        },
      })

      window.location = originalLocation
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '@/services/auth.service'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('AuthService', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
  }

  const mockSession = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: { full_name: mockUser.full_name },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('should sign in with valid credentials', async () => {
      ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      })

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })

      ;(supabase.from as any).mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should return error for invalid credentials', async () => {
      const mockError = { message: 'Invalid credentials' }
      ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('should create a new user account', async () => {
      ;(supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      })

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })

      ;(supabase.from as any).mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await authService.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      })

      expect(result.user).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      ;(supabase.auth.signOut as any).mockResolvedValue({ error: null })

      const result = await authService.signOut()

      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('getSession', () => {
    it('should return current session', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await authService.getSession()

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should return null for no session', async () => {
      ;(supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await authService.getSession()

      expect(result.session).toBeNull()
    })
  })

  describe('createBasicUser', () => {
    it('should create basic user object', () => {
      const user = authService.createBasicUser('user-123', 'test@example.com', 'Test User')

      expect(user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: null,
      })
    })

    it('should handle null full name', () => {
      const user = authService.createBasicUser('user-123', 'test@example.com', null)

      expect(user.full_name).toBeNull()
    })
  })
})

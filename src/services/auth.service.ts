import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import type { AuthError, Session } from '@supabase/supabase-js'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  fullName?: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      console.error('[AuthService] Sign in error:', error)
      return { user: null, session: null, error }
    }

    // Try to get profile
    let user: User | null = null
    if (data.user) {
      user = await this.getProfile(data.user.id)
    }

    return { user, session: data.session, error: null }
  }

  /**
   * Sign up with email and password
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    })

    if (error) {
      console.error('[AuthService] Sign up error:', error)
      return { user: null, session: null, error }
    }

    // Profile will be created automatically by trigger
    let user: User | null = null
    if (data.user) {
      user = await this.getProfile(data.user.id)
    }

    return { user, session: data.session, error: null }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'google' | 'facebook'): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error(`[AuthService] ${provider} sign in error:`, error)
    }

    return { error }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
      console.error('[AuthService] Sign out error:', error)
    } else {
      // Clear local storage
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('language')
      sessionStorage.clear()
    }

    return { error }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('[AuthService] Get session error:', error)
      return { session: null, error }
    }

    return { session: data.session, error: null }
  }

  /**
   * Get user profile from database
   */
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist yet
        console.warn('[AuthService] Profile not found for user:', userId)
        return null
      }
      console.error('[AuthService] Error fetching profile:', error)
      return null
    }

    return data as User
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    // Remove read-only fields
    const { id, email, created_at, updated_at, ...allowedUpdates } = updates as any

    const { data, error } = await (supabase
      .from('profiles') as any)
      .update(allowedUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('[AuthService] Error updating profile:', error)
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data as User
  }

  /**
   * Create a basic user profile from session data
   */
  createBasicUser(userId: string, email: string, fullName?: string | null): User {
    return {
      id: userId,
      email,
      full_name: fullName || null,
      avatar_url: null,
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

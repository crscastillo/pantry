import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<void>
  signUp: (email: string, password: string, fullName?: string, emailRedirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false, // Start with false, set to true only during initialization
  initialized: false,
  
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      console.log('🔐 Signing in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in error:', error)
        set({ loading: false })
        throw error
      }
      
      console.log('✅ Auth successful:', data.user?.email)
      
      if (data.user) {
        // Try to get profile, if it doesn't exist, create a basic user object
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Profile fetch error:', profileError.message)
        }
        
        if (profile) {
          console.log('✅ Profile loaded:', (profile as User).email)
          set({ user: profile as User, loading: false })
        } else {
          console.log('⚠️  No profile found, creating one in database')
          // Profile doesn't exist, create it in the database
          const basicUser: User = {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            avatar_url: null,
          }
          
          const { error: insertError } = await (supabase as any)
            .from('profiles')
            .insert(basicUser)
          
          if (insertError && insertError.code !== '23505') {
            // Ignore duplicate key error (23505), otherwise log and throw
            console.error('❌ Failed to create profile:', insertError)
            // Still set the user even if insert fails (might already exist)
          }
          
          console.log('✅ Profile created/loaded:', basicUser.email)
          set({ user: basicUser, loading: false })
        }
      }
    } catch (error) {
      console.error('❌ SignIn exception:', error)
      set({ loading: false })
      throw error
    }
  },
  
  signInWithProvider: async (provider: 'google' | 'facebook') => {
    try {
      set({ loading: true })
      console.log(`🔐 Signing in with ${provider}...`)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        },
      })
      
      if (error) {
        console.error(`❌ ${provider} sign in error:`, error)
        throw error
      }
      
      // OAuth will redirect, so we don't need to do anything else here
      console.log(`✅ Redirecting to ${provider} login...`)
    } catch (error) {
      console.error(`❌ ${provider} SignIn exception:`, error)
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, fullName?: string, emailRedirectTo?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: emailRedirectTo,
      },
    })
    
    if (error) throw error
    
    if (data.user) {
      // Profile will be created automatically by trigger
      console.log('✅ User signed up:', data.user.email)
    }
  },
  
  signOut: async () => {
    try {
      console.log('🚪 Signing out...')
      
      // Clear all tokens and session data from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Sign out error:', error)
        throw error
      }
      
      // Clear user state
      set({ user: null, loading: false })
      
      // Clear any cached data from localStorage
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('language')
      
      // Clear session storage as well
      sessionStorage.clear()
      
      console.log('✅ Successfully signed out and cleared all tokens')
    } catch (error) {
      console.error('❌ SignOut exception:', error)
      // Even if there's an error, clear local state
      set({ user: null, loading: false })
      localStorage.clear()
      sessionStorage.clear()
      throw error
    }
  },
  
  checkAuth: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      set({ user: profile, loading: false })
    } else {
      set({ user: null, loading: false })
    }
  },
  
  initialize: () => {
    const state = get()
    if (state.initialized) {
      console.log('⚠️  Already initialized')
      return
    }
    
    console.log('🚀 Initializing auth...')
    set({ initialized: true, loading: true })
    
    // Aggressive safety timeout - ALWAYS stop loading after 3 seconds
    setTimeout(() => {
      const currentState = get()
      if (currentState.loading) {
        console.warn('⏱️  FORCING loading to false after timeout')
        set({ loading: false })
      }
    }, 3000)
    
    // Initial auth check
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ Session error:', error)
          set({ user: null, loading: false })
          return
        }
        
        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          
          // Try to get profile, but don't block on it
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                console.log('✅ Profile loaded')
                set({ user: profile as User, loading: false })
              } else {
                console.log('⚠️  Using session data')
                set({ 
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name || null,
                    avatar_url: null,
                  }, 
                  loading: false 
                })
              }
            }, () => {
              console.log('⚠️  Profile fetch failed, using session data')
              set({ 
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || null,
                  avatar_url: null,
                }, 
                loading: false 
              })
            })
        } else {
          console.log('ℹ️  No session found')
          set({ user: null, loading: false })
        }
      })
      .catch((error) => {
        console.error('❌ Auth initialization error:', error)
        set({ user: null, loading: false })
      })
    
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Immediately set user from session - don't wait for profile
        const basicUser = {
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || null,
          avatar_url: null,
        }
        
        console.log('✅ Setting user from session in auth state change')
        set({ user: basicUser, loading: false })
        
        // Try to fetch profile in background (non-blocking, non-critical)
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(
            ({ data: profile }) => {
              if (profile) {
                console.log('✅ Updated with profile data from auth state change')
                set({ user: profile as User })
              }
            },
            () => {
              console.log('⚠️  Profile fetch failed in auth state change (non-critical)')
              // User is already set, so this is fine
            }
          )
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, loading: false })
      }
    })
  },
}))

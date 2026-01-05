import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  
  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in error:', error)
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
        
        if (profileError) {
          console.log('⚠️  Profile fetch error:', profileError.message)
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
          
          if (insertError) {
            console.error('❌ Failed to create profile:', insertError)
            throw new Error('Failed to create user profile')
          }
          
          console.log('✅ Profile created:', basicUser.email)
          set({ user: basicUser, loading: false })
        }
      }
    } catch (error) {
      console.error('❌ SignIn exception:', error)
      set({ loading: false })
      throw error
    }
  },
  
  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (error) throw error
    
    if (data.user) {
      // Profile will be created automatically by trigger
      console.log('✅ User signed up:', data.user.email)
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
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
    set({ initialized: true })
    
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in via state change')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError) {
          console.log('⚠️  Profile error in state change:', profileError.message)
        }
        
        if (profile) {
          console.log('✅ Profile set from state change')
          set({ user: profile as User, loading: false })
        } else {
          console.log('⚠️  Creating profile from state change')
          // Profile doesn't exist, create it in the database
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: null,
          }
          
          const { error: insertError } = await (supabase as any)
            .from('profiles')
            .insert(basicUser)
          
          if (insertError) {
            console.error('❌ Failed to create profile in state change:', insertError)
          }
          
          set({ user: basicUser, loading: false })
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        set({ user: null, loading: false })
      }
    })
    
    // Initial auth check - do this immediately
    const checkInitialAuth = async () => {
      try {
        console.log('🔍 Checking initial auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          set({ user: null, loading: false })
          return
        }
        
        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileError) {
            console.log('⚠️  Profile error:', profileError.message, profileError.code)
          }
          
          if (profile) {
            console.log('✅ Profile loaded on init')
            set({ user: profile as User, loading: false })
          } else {
            console.log('⚠️  No profile, creating one on init')
            // Profile doesn't exist, create it in the database
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || null,
              avatar_url: null,
            }
            
            const { error: insertError } = await (supabase as any)
              .from('profiles')
              .insert(basicUser)
            
            if (insertError) {
              console.error('❌ Failed to create profile on init:', insertError)
            }
            
            set({ user: basicUser, loading: false })
          }
        } else {
          console.log('ℹ️  No session found')
          set({ user: null, loading: false })
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        set({ user: null, loading: false })
      }
    }
    
    checkInitialAuth()
  },
}))

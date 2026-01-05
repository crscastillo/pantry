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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      set({ user: profile, loading: false })
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
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      })
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
    const { initialized } = useAuthStore.getState()
    if (initialized) return
    
    set({ initialized: true })
    
    // Listen to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ user: profile, loading: false })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, loading: false })
      }
    })
    
    // Initial auth check
    useAuthStore.getState().checkAuth()
  },
}))

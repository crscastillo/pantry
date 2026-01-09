import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom storage adapter to track last activity
const customStorage = {
  getItem: (key: string) => {
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value)
    // Update last activity timestamp whenever session is updated
    if (key.includes('auth-token')) {
      localStorage.setItem('last-activity', Date.now().toString())
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key)
  },
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: customStorage,
    // Refresh tokens are valid for 1 day (86400 seconds)
    // Access tokens will auto-refresh if app is active
  },
})

// Check for inactivity on app load and periodically
const checkInactivity = () => {
  const lastActivity = localStorage.getItem('last-activity')
  if (lastActivity) {
    const timeSinceActivity = Date.now() - parseInt(lastActivity, 10)
    const oneDayInMs = 24 * 60 * 60 * 1000 // 1 day in milliseconds
    
    if (timeSinceActivity > oneDayInMs) {
      console.log('⏰ Session expired due to inactivity (>24h)')
      supabase.auth.signOut()
    }
  }
}

// Track user activity
const updateActivity = () => {
  localStorage.setItem('last-activity', Date.now().toString())
}

// Check inactivity on load
checkInactivity()

// Track activity on user interactions
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true })
  })
  
  // Check inactivity every 5 minutes
  setInterval(checkInactivity, 5 * 60 * 1000)
}

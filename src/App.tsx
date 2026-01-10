import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { DashboardPage } from '@/pages/dashboard'
import { ShoppingListPage } from '@/pages/shopping-list'
import { SettingsPage } from '@/pages/settings'
import RecipesPage from '@/pages/recipes'
import { Toaster } from '@/components/ui/toaster'
import { Package } from 'lucide-react'
import { getSubdomain } from '@/lib/subdomain'

const queryClient = new QueryClient()

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Package className="h-12 w-12 mx-auto text-emerald-500 animate-pulse mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()

  // Show loading only during initial authentication check
  if (!initialized) {
    return <LoadingScreen />
  }

  // If we're still loading after initialization (shouldn't happen often)
  if (loading) {
    return <LoadingScreen />
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()

  // Show loading only during initial authentication check
  if (!initialized) {
    return <LoadingScreen />
  }

  // If we're still loading after initialization (shouldn't happen often)
  if (loading) {
    return <LoadingScreen />
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Landing page routes (root domain)
function LandingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// App routes (app subdomain)
function AppOnlyRoutes() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <ProtectedRoute>
            <ShoppingListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

// Platform routes (platform subdomain) - Coming soon
function PlatformRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Platform Dashboard</h1>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main routing component that determines which routes to show based on subdomain
function AppRoutes() {
  const subdomain = getSubdomain()

  if (subdomain === 'root') {
    return <LandingRoutes />
  }

  if (subdomain === 'platform') {
    return <PlatformRoutes />
  }

  // Default to app routes
  return <AppOnlyRoutes />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

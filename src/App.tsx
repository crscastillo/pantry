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
import { PlatformLoginPage } from '@/pages/platform-login'
import { PlatformDashboardPage } from '@/pages/platform-dashboard'
import { PlatformSetupPage } from '@/pages/platform-setup'
import { Toaster } from '@/components/ui/toaster'
import { Package } from 'lucide-react'

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

function PlatformProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore()

  // Show loading only during initial authentication check
  if (!initialized) {
    return <LoadingScreen />
  }

  // If we're still loading after initialization
  if (loading) {
    return <LoadingScreen />
  }

  // Check if user is platform owner
  const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL
  const isRootUser = user?.email === rootUserEmail && (user as any)?.is_platform_owner === true

  if (!isRootUser) {
    return <Navigate to="/platform/login" replace />
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

  // If user is authenticated, redirect to app dashboard
  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

// App routes (app subdomain)
function AppOnlyRoutes() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      
      {/* App Routes */}
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/shopping"
        element={
          <ProtectedRoute>
            <ShoppingListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/recipes"
        element={
          <ProtectedRoute>
            <RecipesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Platform Routes */}
      <Route path="/platform/setup" element={<PlatformSetupPage />} />
      <Route path="/platform/login" element={<PlatformLoginPage />} />
      <Route
        path="/platform/dashboard"
        element={
          <PlatformProtectedRoute>
            <PlatformDashboardPage />
          </PlatformProtectedRoute>
        }
      />
      <Route path="/platform" element={<Navigate to="/platform/dashboard" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main routing component that determines which routes to show based on subdomain
function AppRoutes() {
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

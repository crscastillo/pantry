import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Database, Settings, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function PlatformDashboardPage() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is root user and platform owner
    const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL
    if (!user || user.email !== rootUserEmail || !(user as any)?.is_platform_owner) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold">Platform Admin</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Platform Dashboard</h2>
          <p className="text-muted-foreground">
            Manage users, monitor system health, and configure platform settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Users Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Users</CardTitle>
              </div>
              <CardDescription>Manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">Coming Soon</div>
              <p className="text-sm text-muted-foreground">
                User management features will be available here
              </p>
            </CardContent>
          </Card>

          {/* Database Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <CardTitle>Database</CardTitle>
              </div>
              <CardDescription>Monitor database health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">Coming Soon</div>
              <p className="text-sm text-muted-foreground">
                Database monitoring and management tools
              </p>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <CardTitle>Settings</CardTitle>
              </div>
              <CardDescription>Platform configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">Coming Soon</div>
              <p className="text-sm text-muted-foreground">
                Configure platform-wide settings and features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current platform status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="text-lg font-semibold">Development</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform URL</p>
                <p className="text-lg font-semibold">{import.meta.env.VITE_PLATFORM_URL}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">App URL</p>
                <p className="text-lg font-semibold">{import.meta.env.VITE_APP_URL}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Root Admin</p>
                <p className="text-lg font-semibold">{import.meta.env.VITE_ROOT_USER_EMAIL}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

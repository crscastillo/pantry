import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Database, Settings, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  email: string
  full_name: string | null
  pantry_items_count: number
  last_sign_in_at: string | null
}

interface PlatformMetrics {
  totalUsers: number
  totalPantryItems: number
  itemsExpiringSoon: number
  itemsExpired: number
  averageItemsPerUser: number
  activeUsersThisWeek: number
}

export function PlatformDashboardPage() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    totalPantryItems: 0,
    itemsExpiringSoon: 0,
    itemsExpired: 0,
    averageItemsPerUser: 0,
    activeUsersThisWeek: 0
  })
  const [users, setUsers] = useState<UserData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [showUserList, setShowUserList] = useState(false)

  useEffect(() => {
    // Check if user is root user and platform owner
    const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL
    if (!user || user.email !== rootUserEmail || !(user as any)?.is_platform_owner) {
      navigate('/login')
    } else {
      // Load all metrics
      loadMetrics()
    }
  }, [user, navigate])

  const loadMetrics = async () => {
    setLoadingMetrics(true)
    try {
      // Total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Total pantry items
      const { count: itemsCount } = await supabase
        .from('pantry_items')
        .select('*', { count: 'exact', head: true })
      
      // Items expiring in next 7 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      const { count: expiringSoonCount } = await supabase
        .from('pantry_items')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', sevenDaysFromNow.toISOString())
        .gte('expiry_date', new Date().toISOString())
      
      // Expired items
      const { count: expiredCount } = await supabase
        .from('pantry_items')
        .select('*', { count: 'exact', head: true })
        .lt('expiry_date', new Date().toISOString())
      
      // Calculate average items per user
      const avgItems = usersCount && itemsCount 
        ? Math.round((itemsCount / usersCount) * 10) / 10
        : 0

      // Active users this week (users with updated_at in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString())

      setMetrics({
        totalUsers: usersCount || 0,
        totalPantryItems: itemsCount || 0,
        itemsExpiringSoon: expiringSoonCount || 0,
        itemsExpired: expiredCount || 0,
        averageItemsPerUser: avgItems,
        activeUsersThisWeek: activeUsers || 0
      })
    } catch (error) {
      console.error('Error loading metrics:', error)
      toast({
        title: "Error",
        description: "Failed to load platform metrics",
        variant: "destructive",
      })
    } finally {
      setLoadingMetrics(false)
    }
  }

  const loadUserList = async () => {
    setLoadingUsers(true)
    try {
      // Get all users with their pantry item counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false })
      
      if (profilesError) throw profilesError

      // Get pantry item counts for each user
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const { count } = await supabase
            .from('pantry_items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
          
          // Get last sign in from auth.users (requires service role)
          // For now we'll use null, can be enhanced with proper auth access
          return {
            id: profile.id,
            email: profile.email || 'N/A',
            full_name: profile.full_name,
            pantry_items_count: count || 0,
            last_sign_in_at: null // Would need service role key to access auth.users
          }
        })
      )

      setUsers(usersWithCounts)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Error",
        description: "Failed to load user list",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const toggleUserList = () => {
    if (!showUserList && users.length === 0) {
      loadUserList()
    }
    setShowUserList(!showUserList)
  }

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Platform Dashboard</h2>
            <p className="text-muted-foreground">
              Manage users, monitor system health, and configure platform settings
            </p>
          </div>
          <Button 
            onClick={loadMetrics} 
            variant="outline"
            disabled={loadingMetrics}
          >
            {loadingMetrics ? 'Loading...' : 'Refresh Metrics'}
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loadingMetrics ? '...' : metrics.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loadingMetrics ? '...' : metrics.totalPantryItems}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Items/User</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loadingMetrics ? '...' : metrics.averageItemsPerUser}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expiring Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loadingMetrics ? '...' : metrics.itemsExpiringSoon}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expired Items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loadingMetrics ? '...' : metrics.itemsExpired}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active This Week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {loadingMetrics ? '...' : metrics.activeUsersThisWeek}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Users Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>User Management</CardTitle>
              </div>
              <CardDescription>View and manage users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={toggleUserList} 
                variant="outline" 
                size="sm"
                disabled={loadingUsers}
                className="w-full"
              >
                {showUserList ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide User List
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    {loadingUsers ? 'Loading...' : 'View Detailed User List'}
                  </>
                )}
              </Button>
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

        {/* User List */}
        {showUserList && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User List</CardTitle>
              <CardDescription>All registered users with their activity</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No users found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Name</th>
                        <th className="text-left p-3 font-semibold">Email</th>
                        <th className="text-right p-3 font-semibold">Pantry Items</th>
                        <th className="text-right p-3 font-semibold">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{userData.full_name || 'N/A'}</td>
                          <td className="p-3">{userData.email}</td>
                          <td className="p-3 text-right">{userData.pantry_items_count}</td>
                          <td className="p-3 text-right text-sm text-muted-foreground">
                            {userData.last_sign_in_at 
                              ? new Date(userData.last_sign_in_at).toLocaleDateString() 
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

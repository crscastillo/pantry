import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Users, Database, Settings, LogOut, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { PlatformService } from '@/services/platform.service'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface UserData {
  id: string
  email: string
  full_name: string | null
  pantry_items_count: number
  last_sign_in_at: string | null
  email_confirmed: boolean
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
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)

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
      const users = await PlatformService.getUserList()
      setUsers(users)
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      const result = await PlatformService.deleteUser(userToDelete.id)
      
      if (result.success) {
        toast({
          title: "User Deleted",
          description: `Successfully deleted user and ${result.deletedPantryItems} pantry items, ${result.deletedRecipes} recipes.`,
        })
        
        // Refresh user list and metrics
        await loadUserList()
        await loadMetrics()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setUserToDelete(null)
    }
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
                        <th className="text-center p-3 font-semibold">Email Status</th>
                        <th className="text-right p-3 font-semibold">Pantry Items</th>
                        <th className="text-right p-3 font-semibold">Last Login</th>
                        <th className="text-center p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{userData.full_name || 'N/A'}</td>
                          <td className="p-3">{userData.email}</td>
                          <td className="p-3 text-center">
                            {userData.email_confirmed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Confirmed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⚠ Pending
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">{userData.pantry_items_count}</td>
                          <td className="p-3 text-right text-sm text-muted-foreground">
                            {userData.last_sign_in_at 
                              ? new Date(userData.last_sign_in_at).toLocaleDateString() 
                              : 'N/A'}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(userData)}
                              disabled={userData.id === user?.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <strong>{userToDelete?.email}</strong> and all their data:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>{userToDelete?.pantry_items_count || 0} pantry items</li>
                <li>All recipes and recipe ingredients</li>
                <li>User profile</li>
              </ul>
              <p className="mt-2 text-red-600 font-semibold">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

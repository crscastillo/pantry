import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Shield } from 'lucide-react'

export function PlatformLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [ownerExists, setOwnerExists] = useState(false)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL

  useEffect(() => {
    checkIfOwnerExists()
  }, [])

  const checkIfOwnerExists = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_platform_owner', true)
        .limit(1)
        .single()

      setOwnerExists(!!data)
    } catch (error) {
      setOwnerExists(false)
    } finally {
      setChecking(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email !== rootUserEmail) {
      toast({
        title: "Invalid Email",
        description: "This email is not authorized for platform access.",
        variant: "destructive",
      })
      return
    }

    // Redirect to setup
    navigate('/setup')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      
      // Check if user is root user
      if (email !== rootUserEmail) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the platform dashboard.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Welcome to Platform",
        description: "Access granted.",
      })
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-purple-600 animate-pulse mb-4" />
          <p className="text-muted-foreground">Checking platform status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl text-center">Platform Admin</CardTitle>
          <CardDescription className="text-center">
            {ownerExists 
              ? "Sign in to access the platform dashboard"
              : "Enter your email to begin platform setup"
            }
          </CardDescription>
        </CardHeader>
        
        {!ownerExists ? (
          // Email-only form for initial setup
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>First-time setup:</strong> Enter the authorized platform owner email to continue
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                Continue to Setup
              </Button>
            </CardFooter>
          </form>
        ) : (
          // Full login form when owner exists
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}

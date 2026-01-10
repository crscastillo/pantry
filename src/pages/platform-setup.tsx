import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Shield, CheckCircle } from 'lucide-react'

export function PlatformSetupPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL

  useEffect(() => {
    checkIfSetupComplete()
  }, [])

  const checkIfSetupComplete = async () => {
    try {
      // Check if root user already exists
      const { data } = await supabase
        .from('profiles')
        .select('id, is_platform_owner')
        .eq('email', rootUserEmail)
        .eq('is_platform_owner', true)
        .single()

      if (data) {
        // Setup already complete, redirect to login
        navigate('/login')
      }
    } catch (error) {
      // User doesn't exist, continue with setup
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create the platform owner account
      const platformUrl = import.meta.env.VITE_PLATFORM_URL
      const redirectUrl = `${window.location.protocol}//${platformUrl}/login`
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: rootUserEmail,
        password: password,
        options: {
          data: {
            full_name: fullName,
            is_platform_owner: true,
          },
          emailRedirectTo: redirectUrl,
        },
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Update the profile to mark as platform owner
        const { error: profileError } = await (supabase as any)
          .from('profiles')
          .update({ 
            full_name: fullName,
            is_platform_owner: true 
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
      }

      toast({
        title: "Setup Complete!",
        description: "Platform owner account created successfully. You can now sign in.",
      })

      // Sign out and redirect to login
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-purple-600 animate-pulse mb-4" />
          <p className="text-muted-foreground">Checking setup status...</p>
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
          <CardTitle className="text-2xl text-center">Platform Setup</CardTitle>
          <CardDescription className="text-center">
            Create your platform owner account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-purple-900">Root User Email</p>
                  <p className="text-purple-700">{rootUserEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Complete Setup'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

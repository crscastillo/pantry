import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ChefHat, Shield, Loader2 } from 'lucide-react'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [platformOwnerReady, setPlatformOwnerReady] = useState<boolean | null>(null)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const rootUserEmail = import.meta.env.VITE_ROOT_USER_EMAIL

  // Determine if this is a platform owner login attempt
  const isPlatformOwnerEmail = email === rootUserEmail

  /**
   * Check if platform owner user account exists and is confirmed in the database
   */
  const checkPlatformOwnerReady = async (): Promise<boolean> => {
    try {
      // Use RPC function to check if platform owner is fully ready
      const { data, error } = await (supabase as any)
        .rpc('check_platform_owner_ready', { owner_email: rootUserEmail })
      
      if (error) {
        console.error('Error checking platform owner ready:', error)
        return false
      }
      
      return data === true
    } catch (error) {
      console.error('Exception checking platform owner ready:', error)
      return false
    }
  }

  /**
   * Check platform owner status when email changes
   */
  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail)
    
    if (newEmail === rootUserEmail) {
      // Check if platform owner is ready
      setChecking(true)
      const isReady = await checkPlatformOwnerReady()
      setPlatformOwnerReady(isReady)
      setChecking(false)
    } else {
      setPlatformOwnerReady(null)
    }
  }

  /**
   * Handle continue to setup button
   */
  const handleContinueSetup = () => {
    navigate('/platform/setup')
  }

  /**
   * Handle regular user login
   */
  const handleRegularUserLogin = async () => {
    try {
      await signIn(email, password)
      
      toast({
        title: t('auth.welcomeBack'),
        description: t('auth.signInSuccess'),
      })
      navigate('/app/dashboard')
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Handle platform owner authentication
   */
  const handlePlatformOwnerAuth = async () => {
    try {
      await signIn(email, password)
      
      // Verify user is actually platform owner
      const { user: currentUser } = useAuthStore.getState()
      
      if (currentUser?.is_platform_owner !== true) {
        throw new Error("Unauthorized: Not a platform owner")
      }
      
      toast({
        title: "Welcome to Platform",
        description: "Access granted.",
      })
      navigate('/platform')
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Main form submission handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isPlatformOwnerEmail) {
        // If platform owner is not ready, this shouldn't happen (button should navigate to setup)
        // But handle it just in case
        if (platformOwnerReady === false) {
          handleContinueSetup()
          return
        }
        
        // Platform owner authentication flow
        await handlePlatformOwnerAuth()
      } else {
        // Regular user login flow
        await handleRegularUserLogin()
      }
    } catch (error) {
      handleLoginError(error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle login errors with appropriate messaging
   */
  const handleLoginError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : t('auth.signInError')
    
    // Check for specific error types
    if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
      toast({
        title: t('auth.emailNotVerified') || "Email Not Verified",
        description: t('auth.checkConfirmationEmail') || "Please check your email and click the confirmation link before signing in.",
        variant: "destructive",
        duration: 8000,
      })
    } else if (errorMessage.includes("Unauthorized")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the platform dashboard.",
        variant: "destructive",
      })
    } else {
      toast({
        title: t('auth.error'),
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            {isPlatformOwnerEmail ? (
              <Shield className="h-12 w-12 text-purple-600" />
            ) : (
              <ChefHat className="h-12 w-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isPlatformOwnerEmail ? "Platform Admin" : t('auth.welcomeTo')}
          </CardTitle>
          <CardDescription>
            {isPlatformOwnerEmail 
              ? "Sign in to access the platform dashboard"
              : t('auth.signInWithAI')
            }
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {/* Show checking spinner for platform owner */}
            {isPlatformOwnerEmail && checking && (
              <div className="flex items-center justify-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600 mr-2" />
                <p className="text-sm text-purple-900">Checking platform owner status...</p>
              </div>
            )}
            
            {/* Show password field only for regular users or platform owner that is ready */}
            {!checking && (!isPlatformOwnerEmail || platformOwnerReady === true) && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            {/* Show info message when platform owner needs setup */}
            {!checking && isPlatformOwnerEmail && platformOwnerReady === false && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-900">
                  <strong>Setup Required:</strong> Platform owner account needs to be created.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {isPlatformOwnerEmail && platformOwnerReady === false ? (
              <Button 
                type="button" 
                className="w-full" 
                disabled={loading}
                onClick={handleContinueSetup}
              >
                Continue Setup
              </Button>
            ) : (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            )}

            {!isPlatformOwnerEmail && (
              <p className="text-sm text-center text-muted-foreground">
                {t('auth.dontHaveAccount')}{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('auth.signUp')}
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

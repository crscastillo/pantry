import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ChefHat } from 'lucide-react'

export function SignupPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if emails match (only when confirmEmail has been touched)
  const emailsMatch = confirmEmail === '' || email === confirmEmail
  const showEmailError = confirmEmail !== '' && !emailsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate emails match
    if (email !== confirmEmail) {
      toast({
        title: t('auth.error'),
        description: t('auth.emailsDoNotMatch'),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const redirectUrl = `${window.location.origin}/login`
      await signUp(email, password, fullName, redirectUrl)
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.checkEmailVerify'),
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: error instanceof Error ? error.message : t('auth.signUpError'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.createAccountTitle')}</CardTitle>
          <CardDescription>
            {t('auth.signUpWithAI')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('auth.fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmEmail">{t('auth.confirmEmail')}</Label>
              <Input
                id="confirmEmail"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className={showEmailError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {showEmailError && (
                <p className="text-sm text-red-500">{t('auth.emailsDoNotMatch')}</p>
              )}
              {confirmEmail !== '' && emailsMatch && (
                <p className="text-sm text-green-600">{t('auth.emailsMatch')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || showEmailError}>
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

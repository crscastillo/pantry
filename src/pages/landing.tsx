import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { 
  ChefHat, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Bell, 
  Smartphone,
  ShoppingCart,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  Languages
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LandingPage() {
  const { t, i18n } = useTranslation()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }
  
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg sm:text-xl">{t('landing.appName')}</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-9 px-2 sm:px-3">
                  <Languages className="h-4 w-4" />
                  <span className="hidden xs:inline">{i18n.language.toUpperCase().slice(0, 2)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={i18n.language === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm">{t('landing.signIn')}</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="h-9">{t('landing.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm bg-background/60 backdrop-blur">
            <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
            <span className="font-medium">{t('landing.aiPowered')}</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-4xl">
            {t('landing.heroTitle')}
            <span className="text-primary"> {t('landing.heroTitleHighlight')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('landing.heroDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                {t('landing.startFreeTrial')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t('landing.signIn')}
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">{t('landing.activeUsers')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">$200+</p>
              <p className="text-sm text-muted-foreground">{t('landing.avgSavings')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">30%</p>
              <p className="text-sm text-muted-foreground">{t('landing.lessFoodWaste')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.featuresDescription')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-2" />
              <CardTitle>{t('landing.expiryTracking')}</CardTitle>
              <CardDescription>
                {t('landing.expiryTrackingDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-yellow-500 mb-2" />
              <CardTitle>{t('landing.aiRecipes')}</CardTitle>
              <CardDescription>
                {t('landing.aiRecipesDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-green-500 mb-2" />
              <CardTitle>{t('landing.smartAnalytics')}</CardTitle>
              <CardDescription>
                {t('landing.smartAnalyticsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bell className="h-12 w-12 text-orange-500 mb-2" />
              <CardTitle>{t('landing.expiryAlerts')}</CardTitle>
              <CardDescription>
                {t('landing.expiryAlertsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>{t('landing.shoppingLists')}</CardTitle>
              <CardDescription>
                {t('landing.shoppingListsDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-purple-500 mb-2" />
              <CardTitle>{t('landing.mobileFriendly')}</CardTitle>
              <CardDescription>
                {t('landing.mobileFriendlyDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('landing.whyChoose')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{t('landing.saveMoney')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.saveMoneyDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{t('landing.eatHealthier')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.eatHealthierDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{t('landing.helpEnvironment')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.helpEnvironmentDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{t('landing.saveTime')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.saveTimeDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-50 border-2">
            <CardHeader>
              <TrendingDown className="h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">{t('landing.impactStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">$540</p>
                <p className="text-muted-foreground">{t('landing.annualSavings')}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">300 lbs</p>
                <p className="text-muted-foreground">{t('landing.foodWastePrevented')}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">2 hrs</p>
                <p className="text-muted-foreground">{t('landing.timeSaved')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-primary to-purple-600 text-white border-none">
          <CardHeader>
            <CardTitle className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              {t('landing.ctaTitle')}
            </CardTitle>
            <CardDescription className="text-lg text-white/90 max-w-2xl mx-auto">
              {t('landing.ctaDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t('landing.startFreeTrial')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-white/80 mt-6">
              {t('landing.freeTrialNote')}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background/60 backdrop-blur">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">{t('landing.appName')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('landing.copyright')}
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">{t('landing.privacy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('landing.terms')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('landing.contact')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

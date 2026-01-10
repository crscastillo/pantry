import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowRight
} from 'lucide-react'
import { getSubdomainUrl } from '@/lib/subdomain'

export function LandingPage() {
  const appLoginUrl = getSubdomainUrl('app', '/login')
  const appSignupUrl = getSubdomainUrl('app', '/signup')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pantry</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href={appLoginUrl}>
              <Button variant="ghost">Sign In</Button>
            </a>
            <a href={appSignupUrl}>
              <Button>Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm bg-background/60 backdrop-blur">
            <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
            <span className="font-medium">AI-Powered Pantry Management</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-4xl">
            Never Waste Food
            <span className="text-primary"> Again</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Smart home pantry management with AI. Track your groceries, get expiry alerts, 
            and discover recipes based on what you have.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={appSignupUrl}>
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href={appLoginUrl}>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </a>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">$200+</p>
              <p className="text-sm text-muted-foreground">Avg. Savings/Year</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">30%</p>
              <p className="text-sm text-muted-foreground">Less Food Waste</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything You Need to Manage Your Pantry
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you save money, reduce waste, and eat better
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-2" />
              <CardTitle>Expiry Tracking</CardTitle>
              <CardDescription>
                Never let food go to waste. Get smart alerts before items expire.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-yellow-500 mb-2" />
              <CardTitle>AI Recipe Suggestions</CardTitle>
              <CardDescription>
                Get personalized recipe ideas based on ingredients you already have.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-green-500 mb-2" />
              <CardTitle>Smart Analytics</CardTitle>
              <CardDescription>
                Track spending patterns, waste reduction, and inventory insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bell className="h-12 w-12 text-orange-500 mb-2" />
              <CardTitle>Expiry Alerts</CardTitle>
              <CardDescription>
                Receive timely notifications for items about to expire.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-blue-500 mb-2" />
              <CardTitle>Shopping Lists</CardTitle>
              <CardDescription>
                Automatically generate shopping lists based on your inventory.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-purple-500 mb-2" />
              <CardTitle>Mobile Friendly</CardTitle>
              <CardDescription>
                Access your pantry anywhere with our responsive design.
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
              Why Choose Pantry?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Save Money</h3>
                  <p className="text-muted-foreground">
                    Reduce food waste by up to 30% and save hundreds of dollars annually.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Eat Healthier</h3>
                  <p className="text-muted-foreground">
                    Know exactly what you have and get inspired with healthy recipe suggestions.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Help the Environment</h3>
                  <p className="text-muted-foreground">
                    Reduce your carbon footprint by minimizing food waste.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Save Time</h3>
                  <p className="text-muted-foreground">
                    Quick inventory checks and smart shopping lists save you time planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-50 border-2">
            <CardHeader>
              <TrendingDown className="h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl">Impact Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">$540</p>
                <p className="text-muted-foreground">Average annual savings per household</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">300 lbs</p>
                <p className="text-muted-foreground">Food waste prevented per year</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">2 hours</p>
                <p className="text-muted-foreground">Saved weekly on meal planning</p>
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
              Ready to Transform Your Kitchen?
            </CardTitle>
            <CardDescription className="text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of households already saving money and reducing waste with Pantry.
              Start your free trial today, no credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={appSignupUrl}>
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
            <p className="text-sm text-white/80 mt-6">
              Free for 30 days. Cancel anytime. No credit card required.
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
              <span className="font-bold text-xl">Pantry</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Pantry. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigation } from '@/components/layout/navigation'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { Settings as SettingsIcon, Check, Zap, Sparkles, Crown, Camera, Languages } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getSubscriptionTiers } from '@/lib/subscription'
import { updateUserLanguage } from '@/lib/user-settings'
import type { SubscriptionTier } from '@/types/subscription'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [loadingTiers, setLoadingTiers] = useState(true)
  
  // TODO: Fetch actual subscription status from your backend
  const [currentTier, _setCurrentTier] = useState<'free' | 'pro-monthly' | 'pro-yearly'>('free')

  useEffect(() => {
    loadSubscriptionTiers()
  }, [])

  const loadSubscriptionTiers = async () => {
    try {
      const data = await getSubscriptionTiers()
      setTiers(data)
    } catch (error) {
      toast({
        title: "Error loading subscription tiers",
        description: error instanceof Error ? error.message : "Failed to load pricing",
        variant: "destructive",
      })
    } finally {
      setLoadingTiers(false)
    }
  }

  const handleAddClick = () => {
    setShowAddDialog(true)
  }

  const handleLanguageChange = async (language: string) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to change language',
        variant: 'destructive',
      })
      return
    }

    // Update language in i18n and localStorage immediately for instant feedback
    i18n.changeLanguage(language)
    localStorage.setItem('language', language)
    
    // Save to database
    const result = await updateUserLanguage(user.id, language as 'en' | 'es' | 'fr')
    
    if (result.success) {
      toast({
        title: t('settings.languageUpdated'),
        description: `Language changed to ${language.toUpperCase()}`,
      })
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save language preference',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation onAddClick={handleAddClick} />

      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <Tabs defaultValue="subscription" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="subscription">{t('settings.subscription')}</TabsTrigger>
                <TabsTrigger value="preferences">{t('settings.preferences')}</TabsTrigger>
                <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
              </TabsList>

              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-emerald-500" />
                      <CardTitle>{t('settings.language')}</CardTitle>
                    </div>
                    <CardDescription>{t('settings.selectLanguage')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('settings.language')}</Label>
                      <Select value={i18n.language} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language" className="w-full max-w-xs">
                          <SelectValue placeholder={t('settings.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{t('settings.currentPlan')}</h2>
                  <p className="text-gray-600">{t('settings.upgradePlan')}</p>
                </div>

                {loadingTiers ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading subscription plans...</p>
                  </div>
                ) : tiers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No subscription plans available</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {tiers.map((tier) => {
                      const isCurrentTier = currentTier === tier.id
                      const isFree = tier.price === 0
                      const isYearly = tier.interval === 'year'
                      
                      // Select icon based on tier
                      const TierIcon = isFree ? Zap : isYearly ? Sparkles : Camera
                      const iconBgColor = isFree ? 'bg-gray-100' : isYearly ? 'bg-amber-100' : 'bg-emerald-100'
                      const iconColor = isFree ? 'text-gray-600' : isYearly ? 'text-amber-600' : 'text-emerald-600'
                      
                      return (
                        <Card 
                          key={tier.id} 
                          className={`relative ${
                            isCurrentTier 
                              ? 'border-emerald-500 border-2' 
                              : isYearly 
                                ? 'border-amber-200 border-2' 
                                : ''
                          }`}
                        >
                          {(isCurrentTier || (isYearly && !isCurrentTier)) && (
                            <Badge className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                              isCurrentTier ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}>
                              {isCurrentTier ? 'Current Plan' : 'Best Value'}
                            </Badge>
                          )}
                          <CardHeader>
                            <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}>
                              <TierIcon className={`h-6 w-6 ${iconColor}`} />
                            </div>
                            <CardTitle className="flex items-center gap-2">
                              {tier.name}
                              {!isFree && <Crown className="h-4 w-4 text-amber-500" />}
                            </CardTitle>
                            <CardDescription>
                              {isFree ? 'Perfect for getting started' : 
                               isYearly ? 'Coming soon' : 
                               'Coming soon'}
                            </CardDescription>
                            <div className="mt-4">
                              <span className="text-2xl font-medium text-gray-400">Coming Soon</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-3 mb-6">
                              {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  <span className={`text-sm ${!isFree ? 'font-medium' : ''}`}>
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {isCurrentTier ? (
                              <Button disabled className="w-full">
                                Current Plan
                              </Button>
                            ) : (
                              <Button
                                disabled
                                className="w-full"
                              >
                                Coming Soon
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Features Comparison */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Feature Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Feature</th>
                            <th className="text-center py-3 px-4">Free</th>
                            <th className="text-center py-3 px-4">Pro</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4">Pantry Items</td>
                            <td className="text-center py-3 px-4">50</td>
                            <td className="text-center py-3 px-4">Unlimited</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">AI Photo Scans</td>
                            <td className="text-center py-3 px-4">5/month</td>
                            <td className="text-center py-3 px-4">Unlimited</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">Shopping List</td>
                            <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                            <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">Expiry Reminders</td>
                            <td className="text-center py-3 px-4">-</td>
                            <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">AI Recipe Suggestions</td>
                            <td className="text-center py-3 px-4">-</td>
                            <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-emerald-500 mx-auto" /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">Notifications</p>
                        <p className="text-sm text-gray-500">Receive expiry reminders</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">Data Export</p>
                        <p className="text-sm text-gray-500">Download your pantry data</p>
                      </div>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <AddItemDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  )
}

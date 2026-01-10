import { Package, ShoppingCart, UtensilsCrossed, LogOut, Settings, Plus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  onAddClick: () => void
}

export function Navigation({ onAddClick }: NavigationProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuthStore()

  const navItems = [
    { path: '/app/dashboard', label: t('navigation.pantry'), icon: Package },
    { path: '/app/shopping', label: t('navigation.shopping'), icon: ShoppingCart },
    { path: '/app/recipes', label: t('navigation.recipes'), icon: UtensilsCrossed },
    { path: '/app/settings', label: t('navigation.settings'), icon: Settings },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b">
            <Package className="h-8 w-8 text-emerald-500" />
            <h1 className="text-2xl font-bold">Pantry Fast</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pt-4 space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-emerald-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
                className="flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom z-50">
        <div className="max-w-2xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <button 
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                    isActive ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
            
            {/* Only Recipes - Settings moved to header */}
            <button 
              onClick={() => navigate('/app/recipes')}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                location.pathname === '/app/recipes' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <UtensilsCrossed className="h-6 w-6" />
              <span className="text-xs font-medium">{t('navigation.recipes')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

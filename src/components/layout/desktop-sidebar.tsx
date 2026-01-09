import { Package, UtensilsCrossed, ShoppingCart, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router-dom'

interface DesktopSidebarProps {
  onAddClick: () => void
}

export function DesktopSidebar({ onAddClick }: DesktopSidebarProps) {
  const { toast } = useToast()
  const { signOut, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Package className="h-8 w-8 text-emerald-500" />
          <h1 className="text-2xl font-bold">Pantry</h1>
        </div>

        {/* Add Item Button */}
        <div className="px-4 py-4">
          <Button 
            onClick={onAddClick}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            size="lg"
          >
            <Package className="h-5 w-5 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
              location.pathname === '/dashboard'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5" />
            Pantry
          </button>
          <button 
            onClick={() => navigate('/shopping')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
              location.pathname === '/shopping'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </button>
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            onClick={() => toast({ title: "Coming soon!", description: "Recipe suggestions feature is in development" })}
          >
            <UtensilsCrossed className="h-5 w-5" />
            Recipes
          </button>
        </nav>

        {/* User Section */}
        <div className="border-t px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
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
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

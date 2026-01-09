import { Package, Plus, ShoppingCart, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useNavigate, useLocation } from 'react-router-dom'

interface MobileNavProps {
  onAddClick: () => void
}

export function MobileNav({ onAddClick }: MobileNavProps) {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t safe-bottom z-50">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              location.pathname === '/dashboard' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package className="h-6 w-6" />
            <span className="text-xs font-medium">Pantry</span>
          </button>
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-14 h-14 -mt-6 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-7 w-7" />
          </button>
          <button 
            onClick={() => navigate('/shopping')}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${
              location.pathname === '/shopping' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs font-medium">Shopping</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400 hover:text-gray-600"
            onClick={() => signOut()}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

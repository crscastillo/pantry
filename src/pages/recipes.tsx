import { useState } from 'react'
import { ChefHat, UtensilsCrossed, Settings, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/layout/navigation'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { Button } from '@/components/ui/button'

export default function RecipesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleAddClick = () => {
    setShowAddDialog(true)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Responsive Navigation */}
      <Navigation onAddClick={handleAddClick} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-x-hidden w-full">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 overflow-x-hidden">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <UtensilsCrossed className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold">{t('navigation.recipes')}</h1>
              <div className="ml-auto flex items-center gap-2">
                <Button 
                  onClick={handleAddClick}
                  size="icon"
                  className="md:hidden bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/app/settings')}
                  className="md:hidden"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {/* Coming Soon Placeholder */}
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6">
                <ChefHat className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('pantry.comingSoon')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Recipe management feature is currently under development. Check back soon!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>In Development</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  )
}

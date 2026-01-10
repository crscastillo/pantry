import { useState } from 'react'
import { ChefHat, UtensilsCrossed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigation } from '@/components/layout/navigation'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import type { Recipe } from '@/types/recipe'

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
          <ChefHat className="h-16 w-16 text-emerald-600" />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{recipe.name}</h3>
        
        {recipe.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            ⏱️ {totalTime > 0 ? `${totalTime} min` : 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            👥 {recipe.servings} servings
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${
              recipe.difficulty === 'easy'
                ? 'bg-green-100 text-green-700'
                : recipe.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {recipe.difficulty}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {recipe.category}
          </span>
          {recipe.cuisine && (
            <span className="text-xs text-gray-500">
              🌍 {recipe.cuisine}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  const { t } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Recipes feature is not ready yet - disable API calls
  const isLoading = false
  const recipes: Recipe[] = []

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

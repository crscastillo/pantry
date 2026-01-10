import { useState } from 'react'
import { Plus, Search, ChefHat, UtensilsCrossed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRecipes } from '@/hooks/use-recipes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/layout/navigation'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { data: recipes, isLoading } = useRecipes()

  const handleAddClick = () => {
    setShowAddDialog(true)
  }

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRecipes = recipes?.length || 0
  const favoriteRecipes = recipes?.filter(r => r.cuisine === 'Italian').length || 0
  const recentRecipes = recipes?.slice(0, 3).length || 0

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Responsive Navigation */}
      <Navigation onAddClick={handleAddClick} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-x-hidden w-full">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 overflow-x-hidden">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            {/* Title and Search */}
            <div className="flex items-center gap-3 mb-4">
              <UtensilsCrossed className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold">{t('navigation.recipes')}</h1>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-0"
                />
              </div>
              <Button
                onClick={handleAddClick}
                className="hidden md:flex bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Total Recipes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{totalRecipes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Favorites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-amber-600">{favoriteRecipes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Recent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-emerald-600">{recentRecipes}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading recipes...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && totalRecipes === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start building your recipe collection by adding your first recipe
                </p>
              </div>
            )}

            {/* Recipe Grid */}
            {!isLoading && filteredRecipes && filteredRecipes.length > 0 && (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}

            {/* No Search Results */}
            {!isLoading &&
              recipes &&
              recipes.length > 0 &&
              filteredRecipes &&
              filteredRecipes.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                  <p className="text-sm text-gray-500">Try a different search term</p>
                </div>
              )}
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

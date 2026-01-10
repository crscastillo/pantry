import { useState } from 'react'
import { Plus, Search, ChefHat } from 'lucide-react'
import { useRecipes } from '@/hooks/use-recipes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [searchTerm, setSearchTerm] = useState('')
  const { data: recipes, isLoading } = useRecipes()

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-emerald-600" />
              My Recipes
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your recipe collection
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-600 mt-4">Loading recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!recipes || recipes.length === 0) && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your recipe collection by adding your first recipe
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipe
            </Button>
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && filteredRecipes && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-12">
              <p className="text-gray-600">No recipes found matching "{searchTerm}"</p>
            </div>
          )}
      </div>
    </div>
  )
}

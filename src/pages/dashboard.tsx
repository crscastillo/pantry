import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PantryQuickAdjustCard } from '@/components/pantry/pantry-quick-adjust-card'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { Navigation } from '@/components/layout/navigation'
import { usePantryItems } from '@/hooks/use-pantry'
import { PantryItem } from '@/types'
import { Plus, Search, Bell, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const getLocationTranslationKey = (location: string) => {
  const keyMap: Record<string, string> = {
    'Fridge': 'pantry.locations.fridge',
    'Freezer': 'pantry.locations.freezer',
    'Dry Pantry': 'pantry.locations.dryPantry',
    'Cupboard': 'pantry.locations.cupboard',
    'Counter': 'pantry.locations.counter',
  }
  return keyMap[location] || null
}

export function DashboardPage() {
  const { t } = useTranslation()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: items = [], isLoading } = usePantryItems()

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item)
    setShowAddDialog(true)
  }

  const handleAddClick = () => {
    setEditingItem(null)
    setShowAddDialog(true)
  }

  // Get all unique locations from items
  const getUniqueLocations = () => {
    const allLocations = items
      .map(item => item.location)
      .filter((loc): loc is string => !!loc && loc.trim() !== '')
    return ['All', ...Array.from(new Set(allLocations))]
  }

  const availableFilters = getUniqueLocations()

  // Filter items by location and search
  const filteredItems = items.filter(item => {
    const matchesLocation = activeFilter === 'All' || item.location === activeFilter
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesSearch
  })

  const getLocationCount = (location: string) => {
    if (location === 'All') return items.length
    return items.filter(i => i.location === location).length
  }

  const expiredItems = items.filter(
    item => item.expiry_date && new Date(item.expiry_date) < new Date()
  ).length

  const expiringItems = items.filter(
    item => item.expiry_date && new Date(item.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length

  const lowStockItems = items.filter(
    item => item.expected_amount && item.quantity < item.expected_amount
  ).length

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Responsive Navigation */}
      <Navigation onAddClick={handleAddClick} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-x-hidden w-full">
        {/* Mobile & Desktop Header */}
        <div className="bg-white border-b sticky top-0 z-10 overflow-x-hidden">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 md:mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('pantry.searchItems')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Desktop Add Button */}
                <Button
                  onClick={handleAddClick}
                  className="hidden md:flex bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('pantry.addItem')}
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {expiredItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {expiredItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Title - Mobile only */}
            <h1 className="text-3xl font-bold mb-4 md:hidden">{t('navigation.pantry')}</h1>

            {/* Desktop Stats */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('pantry.totalItems')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('pantry.expiringItems')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{expiringItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{t('pantry.lowStockItems')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{lowStockItems}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="relative -mx-4 md:mx-0">
              <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 snap-x snap-mandatory scroll-smooth pb-1">
                {availableFilters.map((filter) => {
                  const translationKey = getLocationTranslationKey(filter)
                  const displayName = filter === 'All' 
                    ? t('pantry.all') 
                    : translationKey 
                      ? t(translationKey) 
                      : filter
                  
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors snap-start flex-shrink-0 ${
                        activeFilter === filter
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {displayName}
                      <Badge variant="secondary" className={activeFilter === filter ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-gray-200'}>
                        {getLocationCount(filter)}
                      </Badge>
                    </button>
                  )
                })}
              </div>
              {/* Scroll Fade Indicators */}
              <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {/* Expired Items Warning */}
            {expiredItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  You have <span className="font-bold">{expiredItems} expired item{expiredItems !== 1 ? 's' : ''}</span>
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading your pantry...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No items found' : 'Your pantry is empty'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery ? 'Try a different search term' : 'Start by adding your first item'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
                {filteredItems.map((item) => (
                  <PantryQuickAdjustCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingItem(null)
        }}
        editingItem={editingItem}
      />
    </div>
  )
}

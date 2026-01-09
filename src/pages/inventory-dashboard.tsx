import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PantryQuickAdjustCard } from '@/components/pantry/pantry-quick-adjust-card'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { usePantryItems } from '@/hooks/use-pantry'
import { Plus, Search, Zap, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LocationFilter = 'All' | 'Fridge' | 'Freezer' | 'Dry pantry'

export function InventoryDashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeFilter, setActiveFilter] = useState<LocationFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: items = [], isLoading } = usePantryItems()

  const handleAddClick = () => {
    setShowAddDialog(true)
  }

  // Filter items by location and search
  const filteredItems = items.filter(item => {
    const matchesLocation = activeFilter === 'All' || 
      (item.location && item.location.toLowerCase().includes(activeFilter.toLowerCase()))
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesSearch
  })

  const locationCounts = {
    'All': items.length,
    'Fridge': items.filter(i => i.location?.toLowerCase().includes('fridge')).length,
    'Freezer': items.filter(i => i.location?.toLowerCase().includes('freezer')).length,
    'Dry pantry': items.filter(i => i.location?.toLowerCase().includes('pantry')).length,
  }

  const lowStockItems = items.filter(
    item => item.expected_amount && item.quantity < item.expected_amount
  ).length

  const totalItems = items.length
  const averageStock = items.length > 0 
    ? Math.round(items.reduce((sum, item) => {
        if (!item.expected_amount) return sum
        return sum + ((item.quantity / item.expected_amount) * 100)
      }, 0) / items.filter(i => i.expected_amount).length)
    : 0

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <DesktopSidebar onAddClick={handleAddClick} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-x-hidden w-full">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
            {/* Title and Search */}
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold">Quick Adjust Dashboard</h1>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0"
                />
              </div>
              <Button
                onClick={handleAddClick}
                className="hidden md:flex bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{totalItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Low Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-orange-600">{lowStockItems}</div>
                </CardContent>
              </Card>
              <Card className="hidden md:block">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Avg. Stock Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-emerald-600">
                    {averageStock}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide">
              {(['All', 'Fridge', 'Freezer', 'Dry pantry'] as LocationFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                  <Badge variant="secondary" className={activeFilter === filter ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-gray-200'}>
                    {locationCounts[filter]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading inventory...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No items found' : 'No items in this location'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Add items or try a different filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
                {filteredItems.map((item) => (
                  <PantryQuickAdjustCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onAddClick={handleAddClick} />
      </div>

      {/* Add/Edit Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  )
}

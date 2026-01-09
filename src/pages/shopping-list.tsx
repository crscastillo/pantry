import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PantryQuickAdjustCard } from '@/components/pantry/pantry-quick-adjust-card'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { usePantryItems } from '@/hooks/use-pantry'
import { PantryItem } from '@/types'
import { Plus, Search, ShoppingCart, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ShoppingListPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
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

  // Filter items that need restocking (quantity < expected_amount)
  // Default to showing items where stock is at or below 80% of expected
  const shoppingItems = items.filter(item => {
    if (!item.expected_amount) return false
    
    const stockPercentage = (item.quantity / item.expected_amount) * 100
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return stockPercentage <= 80 && matchesSearch
  })

  // Group by urgency
  const outOfStock = shoppingItems.filter(item => item.quantity === 0)
  const criticallyLow = shoppingItems.filter(item => 
    item.quantity > 0 && item.expected_amount && item.quantity < item.expected_amount * 0.3
  )
  const needsRestocking = shoppingItems.filter(item => 
    item.expected_amount && 
    item.quantity >= item.expected_amount * 0.3 && 
    item.quantity < item.expected_amount * 0.8
  )

  const totalItems = shoppingItems.length
  const estimatedValue = shoppingItems.length * 15 // Rough estimate

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
              <ShoppingCart className="h-8 w-8 text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold">Shopping List</h1>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Items to Buy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{totalItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Out of Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-red-600">{outOfStock.length}</div>
                </CardContent>
              </Card>
              <Card className="hidden md:block">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                    Est. Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-emerald-600">
                    ${estimatedValue}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading shopping list...</p>
              </div>
            ) : totalItems === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No items found' : 'Your shopping list is empty'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'All your items are well stocked! 🎉'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Out of Stock */}
                {outOfStock.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-1 bg-red-500 rounded"></div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Out of Stock ({outOfStock.length})
                      </h2>
                    </div>
                    <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
                      {outOfStock.map((item) => (
                        <PantryQuickAdjustCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Critically Low */}
                {criticallyLow.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-1 bg-orange-500 rounded"></div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Critically Low ({criticallyLow.length})
                      </h2>
                    </div>
                    <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
                      {criticallyLow.map((item) => (
                        <PantryQuickAdjustCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs Restocking */}
                {needsRestocking.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-1 bg-amber-500 rounded"></div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Needs Restocking ({needsRestocking.length})
                      </h2>
                    </div>
                    <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0">
                      {needsRestocking.map((item) => (
                        <PantryQuickAdjustCard
                          key={item.id}
                          item={item}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingItem(null)
        }}
        editingItem={editingItem}
      />
    </div>
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PantryItemCard } from '@/components/pantry/pantry-item-card'
import { PantryQuickAdjustCard } from '@/components/pantry/pantry-quick-adjust-card'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { usePantryItems, useDeletePantryItem } from '@/hooks/use-pantry'
import { useToast } from '@/hooks/use-toast'
import { PantryItem } from '@/types'
import { Plus, Search, Bell, SlidersHorizontal, Package, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type LocationFilter = 'All' | 'Fridge' | 'Freezer' | 'Dry pantry'
type ViewMode = 'manage' | 'adjust'

export function DashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [activeFilter, setActiveFilter] = useState<LocationFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('adjust')
  const { data: items = [], isLoading } = usePantryItems()
  const deleteMutation = useDeletePantryItem()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: "Item deleted",
        description: "The item has been removed from your pantry.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: PantryItem) => {
    setEditingItem(item)
    setShowAddDialog(true)
  }

  const handleAddClick = () => {
    setEditingItem(null)
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
      {/* Desktop Sidebar */}
      <DesktopSidebar onAddClick={handleAddClick} />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-x-hidden w-full">
        {/* Mobile & Desktop Header */}
        <div className="bg-white border-b sticky top-0 z-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
            {/* Search and Actions */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 md:mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-0"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Selector */}
                <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'adjust' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('adjust')}
                    className={viewMode === 'adjust' ? 'bg-white shadow-sm' : 'hover:bg-transparent'}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Adjust
                  </Button>
                  <Button
                    variant={viewMode === 'manage' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('manage')}
                    className={viewMode === 'manage' ? 'bg-white shadow-sm' : 'hover:bg-transparent'}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
                {/* Desktop Add Button */}
                <Button
                  onClick={handleAddClick}
                  className="hidden md:flex bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {expiredItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {expiredItems}
                    </span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Title - Mobile only */}
            <h1 className="text-3xl font-bold mb-4 md:hidden">Pantry</h1>
            
            {/* Mobile View Mode Toggle */}
            <div className="md:hidden flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4">
              <Button
                variant={viewMode === 'adjust' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('adjust')}
                className={`flex-1 ${viewMode === 'adjust' ? 'bg-white shadow-sm' : 'hover:bg-transparent'}`}
              >
                <Zap className="h-4 w-4 mr-2" />
                Quick Adjust
              </Button>
              <Button
                variant={viewMode === 'manage' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('manage')}
                className={`flex-1 ${viewMode === 'manage' ? 'bg-white shadow-sm' : 'hover:bg-transparent'}`}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>

            {/* Desktop Stats */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{items.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{expiringItems}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{lowStockItems}</div>
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
                  viewMode === 'adjust' ? (
                    <PantryQuickAdjustCard
                      key={item.id}
                      item={item}
                    />
                  ) : (
                    <PantryItemCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  )
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
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingItem(null)
        }}
        editingItem={editingItem}
      />
    </div>
  )
}

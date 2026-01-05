import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { PantryItemCard } from '@/components/pantry/pantry-item-card'
import { AddItemDialog } from '@/components/pantry/add-item-dialog'
import { usePantryItems, useDeletePantryItem } from '@/hooks/use-pantry'
import { useToast } from '@/hooks/use-toast'
import { PantryItem } from '@/types'
import { Plus, Sparkles, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
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

  const expiringItems = items.filter(
    item => item.expiry_date && new Date(item.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
              <p className="text-xs text-muted-foreground">
                In your pantry
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Within 7 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(items.map(item => item.category)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Different types
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => {
            setEditingItem(null)
            setShowAddDialog(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Get AI Recipe Suggestions
          </Button>
        </div>

        {/* Pantry Items */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Pantry</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your pantry...</p>
            </div>
          ) : items.length === 0 ? (
            <Card className="text-center py-12">
              <CardHeader>
                <CardTitle>Your pantry is empty</CardTitle>
                <CardDescription>
                  Start by adding your first item to track your groceries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <PantryItemCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>

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

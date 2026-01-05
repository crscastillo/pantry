import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAddPantryItem, useUpdatePantryItem } from '@/hooks/use-pantry'
import { useToast } from '@/hooks/use-toast'
import { PantryItem, PantryCategory, PantryUnit } from '@/types'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingItem?: PantryItem | null
}

const categories: PantryCategory[] = [
  'Fruits & Vegetables',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Pantry Staples',
  'Beverages',
  'Frozen',
  'Snacks',
  'Condiments',
  'Other',
]

const units: PantryUnit[] = [
  'piece',
  'kg',
  'g',
  'lb',
  'oz',
  'l',
  'ml',
  'cup',
  'tbsp',
  'tsp',
  'package',
  'can',
  'bottle',
]

export function AddItemDialog({ open, onOpenChange, editingItem }: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other' as PantryCategory,
    quantity: 1,
    unit: 'piece' as PantryUnit,
    expiry_date: '',
    purchase_date: '',
    location: '',
    notes: '',
  })

  const addMutation = useAddPantryItem()
  const updateMutation = useUpdatePantryItem()
  const { toast } = useToast()

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category as PantryCategory,
        quantity: editingItem.quantity,
        unit: editingItem.unit as PantryUnit,
        expiry_date: editingItem.expiry_date || '',
        purchase_date: editingItem.purchase_date || '',
        location: editingItem.location || '',
        notes: editingItem.notes || '',
      })
    } else {
      setFormData({
        name: '',
        category: 'Other',
        quantity: 1,
        unit: 'piece',
        expiry_date: '',
        purchase_date: '',
        location: '',
        notes: '',
      })
    }
  }, [editingItem, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          ...formData,
          expiry_date: formData.expiry_date || null,
          purchase_date: formData.purchase_date || null,
          location: formData.location || null,
          notes: formData.notes || null,
        })
        toast({
          title: "Item updated",
          description: "Your pantry item has been updated successfully.",
        })
      } else {
        await addMutation.mutateAsync({
          ...formData,
          expiry_date: formData.expiry_date || null,
          purchase_date: formData.purchase_date || null,
          location: formData.location || null,
          notes: formData.notes || null,
          image_url: null,
        })
        toast({
          title: "Item added",
          description: "Your item has been added to the pantry.",
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save item",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update the details of your pantry item' : 'Add a new item to your pantry'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as PantryCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value as PantryUnit })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Fridge, Pantry, Freezer"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

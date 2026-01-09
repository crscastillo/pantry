import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAddPantryItem, useUpdatePantryItem, useDeletePantryItem } from '@/hooks/use-pantry'
import { useToast } from '@/hooks/use-toast'
import { PantryItem, PantryCategory, PantryUnit } from '@/types'
import { ArrowLeft, Trash2, ShoppingBag, Camera, Loader2, Sparkles } from 'lucide-react'
import { analyzeProductImage, fileToDataURL, compressImage } from '@/lib/ai-service'

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
    expected_amount: null as number | null,
    unit: 'piece' as PantryUnit,
    expiry_date: '',
    purchase_date: '',
    location: '',
    notes: '',
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addMutation = useAddPantryItem()
  const updateMutation = useUpdatePantryItem()
  const deleteMutation = useDeletePantryItem()
  const { toast } = useToast()

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        category: editingItem.category as PantryCategory,
        quantity: editingItem.quantity,
        expected_amount: editingItem.expected_amount || null,
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
        expected_amount: null,
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
          expected_amount: formData.expected_amount || null,
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
          expected_amount: formData.expected_amount || null,
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

  const handleDelete = async () => {
    if (!editingItem) return
    try {
      await deleteMutation.mutateAsync(editingItem.id)
      toast({
        title: "Item deleted",
        description: "The item has been removed from your pantry.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'Fruits & Vegetables': '🥬',
      'Meat & Seafood': '🥩',
      'Dairy & Eggs': '🧀',
      'Bakery & Bread': '🍞',
      'Pantry Staples': '🌾',
      'Beverages': '🥤',
      'Frozen': '🧊',
      'Snacks': '🍿',
      'Condiments': '🍯',
      'Other': '📦'
    }
    return emojiMap[category] || '📦'
  }

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    try {
      // Compress image if needed
      const compressedFile = await compressImage(file)
      
      // Convert to base64
      const dataURL = await fileToDataURL(compressedFile)
      
      // Analyze with AI
      const productData = await analyzeProductImage(dataURL)
      
      // Auto-fill form
      setFormData({
        name: productData.name || formData.name,
        category: (productData.category as PantryCategory) || formData.category,
        quantity: productData.quantity || formData.quantity,
        expected_amount: formData.expected_amount,
        unit: (productData.unit as PantryUnit) || formData.unit,
        expiry_date: productData.expiryDate || formData.expiry_date,
        purchase_date: formData.purchase_date,
        location: productData.location || formData.location,
        notes: productData.notes || formData.notes,
      })
      
      toast({
        title: "Product recognized!",
        description: "Form has been auto-filled with product details.",
      })
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not analyze the image. Please fill in manually.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl h-[100vh] sm:h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-3 sm:p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              {!editingItem && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageCapture}
                    disabled={isAnalyzing}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    title="Scan product with AI"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                </>
              )}
              {editingItem && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => toast({ title: "Coming soon!" })}>
                    <ShoppingBag className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </Button>
                </>
              )}
            </div>
          </div>
          {isAnalyzing && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span className="text-sm text-emerald-800">Analyzing product with AI...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Item Header */}
          <div>
            <div className="text-5xl mb-4">{getCategoryEmoji(formData.category)}</div>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item name"
              className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0 break-words"
              required
            />
            <Badge variant="secondary" className="mt-2">
              {formData.category} {formData.location && `in ${formData.location}`}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">In pantry</div>
              <div className="font-semibold">
                {editingItem ? `${Math.floor((new Date().getTime() - new Date(editingItem.created_at).getTime()) / (1000 * 60 * 60 * 24))} days` : 'New'}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Expiring</div>
              <div className="font-semibold text-orange-600">
                {formData.expiry_date ? `in ${Math.floor((new Date(formData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` : 'Not set'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Amount</div>
              <div className="font-semibold">{formData.quantity} {formData.unit}</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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
                        {getCategoryEmoji(cat)} {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Fridge, Freezer..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Current Amount</Label>
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
                <Label htmlFor="expected_amount">Expected</Label>
                <Input
                  id="expected_amount"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.expected_amount || ''}
                  onChange={(e) => setFormData({ ...formData, expected_amount: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="sticky bottom-0 bg-white pt-4 pb-safe">
            <Button 
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-600" 
              size="lg"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

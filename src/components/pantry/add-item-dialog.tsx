import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent } from '@/components/ui/sheet'
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
  const { t } = useTranslation()
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
          title: t('pantry.itemUpdated'),
          description: t('pantry.itemUpdatedDesc'),
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
          title: t('pantry.itemAdded'),
          description: t('pantry.itemAddedDesc'),
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('pantry.error'),
        description: error instanceof Error ? error.message : t('pantry.error'),
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!editingItem) return
    try {
      await deleteMutation.mutateAsync(editingItem.id)
      toast({
        title: t('pantry.itemDeleted'),
        description: t('pantry.itemDeletedDesc'),
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: t('pantry.error'),
        description: t('pantry.deleteError'),
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

  const getCategoryTranslationKey = (category: string) => {
    const keyMap: Record<string, string> = {
      'Fruits & Vegetables': 'pantry.categories.fruitsVegetables',
      'Meat & Seafood': 'pantry.categories.meatSeafood',
      'Dairy & Eggs': 'pantry.categories.dairyEggs',
      'Bakery & Bread': 'pantry.categories.bakeryBread',
      'Pantry Staples': 'pantry.categories.pantryStaples',
      'Beverages': 'pantry.categories.beverages',
      'Frozen': 'pantry.categories.frozen',
      'Snacks': 'pantry.categories.snacks',
      'Condiments': 'pantry.categories.condiments',
      'Other': 'pantry.categories.other'
    }
    return keyMap[category] || 'pantry.categories.other'
  }

  const getUnitTranslationKey = (unit: string) => {
    return `pantry.units.${unit}`
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
        title: t('pantry.productRecognized'),
        description: t('pantry.productRecognizedDesc'),
      })
    } catch (error) {
      toast({
        title: t('pantry.analysisFailed'),
        description: error instanceof Error ? error.message : t('pantry.analysisFailedDesc'),
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="w-full h-[90vh] p-0 overflow-y-auto">
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline">{t('pantry.aiScan')}</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0">
                      AI
                    </Badge>
                  </Button>
                </>
              )}
              {editingItem && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => toast({ title: t('pantry.comingSoon') })}>
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
              <span className="text-sm text-emerald-800">{t('pantry.analyzingProduct')}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Item Header */}
          <div className="space-y-3">
            <div className="text-5xl text-center mb-4">{getCategoryEmoji(formData.category)}</div>
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-sm font-medium">{t('pantry.itemName')}</Label>
              <Input
                id="item-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('pantry.itemNamePlaceholder')}
                className="text-xl font-semibold h-12"
                required
                autoFocus
              />
            </div>
            <Badge variant="secondary" className="mt-2">
              {t(getCategoryTranslationKey(formData.category))} {formData.location && `${t('pantry.in')} ${formData.location}`}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-600 font-medium mb-1">{t('pantry.inPantry')}</div>
              <div className="font-semibold text-gray-900">
                {editingItem ? `${Math.floor((new Date().getTime() - new Date(editingItem.created_at).getTime()) / (1000 * 60 * 60 * 24))} ${t('pantry.days')}` : t('pantry.new')}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs text-orange-700 font-medium mb-1">{t('pantry.expiring')}</div>
              <div className="font-semibold text-orange-600">
                {formData.expiry_date ? `${t('pantry.in')} ${Math.floor((new Date(formData.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ${t('pantry.days')}` : t('pantry.notSet')}
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="text-xs text-emerald-700 font-medium mb-1">{t('pantry.amount')}</div>
              <div className="font-semibold text-emerald-900">{formData.quantity} {t(getUnitTranslationKey(formData.unit))}</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Category & Location */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pantry.categoryAndLocation')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('pantry.category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as PantryCategory })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryEmoji(cat)} {t(getCategoryTranslationKey(cat))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('pantry.location')}</Label>
                  <Input
                    id="location"
                    placeholder={t('pantry.locationPlaceholder')}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pantry.quantityAndUnit')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t('pantry.currentAmount')}</Label>
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
                  <Label htmlFor="expected_amount">{t('pantry.expected')}</Label>
                  <Input
                    id="expected_amount"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.expected_amount || ''}
                    onChange={(e) => setFormData({ ...formData, expected_amount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder={t('pantry.optional')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{t('pantry.unit')}</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value as PantryUnit })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {t(getUnitTranslationKey(unit))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pantry.dates')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">{t('pantry.purchaseDate')}</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">{t('pantry.expiryDate')}</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pantry.additionalInfo')}</h3>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('pantry.notes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('pantry.notesPlaceholder')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
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
              {editingItem ? t('pantry.updateItem') : t('pantry.addItem')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

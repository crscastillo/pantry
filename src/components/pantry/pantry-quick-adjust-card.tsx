import { useState } from 'react'
import { differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PantryItem } from '@/types'
import { Minus, Plus, Edit, Info } from 'lucide-react'
import { useQuickAdjustQuantity } from '@/hooks/use-pantry'
import { useToast } from '@/hooks/use-toast'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface PantryQuickAdjustCardProps {
  item: PantryItem
  onEdit?: (item: PantryItem) => void
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

export function PantryQuickAdjustCard({ item, onEdit }: PantryQuickAdjustCardProps) {
  const { toast } = useToast()
  const adjustMutation = useQuickAdjustQuantity()
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  const today = new Date()
  const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, today) : null
  
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 2

  const handleAdjust = async (delta: number) => {
    if (isAdjusting) return
    
    setIsAdjusting(true)
    try {
      await adjustMutation.mutateAsync({ id: item.id, delta })
      toast({
        title: "Quantity updated",
        description: `${item.name} quantity ${delta > 0 ? 'increased' : 'decreased'}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleEdit = () => {
    setShowDrawer(false)
    if (onEdit) {
      onEdit(item)
    }
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl p-4 border border-gray-100 overflow-hidden">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="text-4xl flex-shrink-0">
            {getCategoryEmoji(item.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                {item.location && (
                  <div className="text-xs text-gray-500">{item.location}</div>
                )}
              </div>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => setShowDrawer(true)}
                  title="View details"
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Expiry Status */}
            {item.expiry_date && (
              <div className={`text-xs font-medium mb-2 ${
                isExpired 
                  ? 'text-red-600' 
                  : isExpiringSoon 
                    ? 'text-orange-600' 
                    : 'text-gray-600'
              }`}>
                {isExpired 
                  ? `Expired ${Math.abs(daysUntilExpiry!)} day${Math.abs(daysUntilExpiry!) !== 1 ? 's' : ''} ago!`
                  : isExpiringSoon
                    ? `Expiring in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}!`
                    : `${daysUntilExpiry} days left`
                }
              </div>
            )}

            {/* Stock Status */}
            {item.expected_amount && (
              <div className="mb-3">
                {item.quantity < item.expected_amount ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    Low Stock ({item.quantity}/{item.expected_amount})
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Stocked ({item.quantity}/{item.expected_amount})
                  </Badge>
                )}
              </div>
            )}

            {/* Quantity Adjustment Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full flex-shrink-0"
                onClick={() => handleAdjust(-1)}
                disabled={isAdjusting || item.quantity === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 text-center">
                <div className="text-xl font-bold text-gray-900">
                  {item.quantity}
                </div>
                <div className="text-xs text-gray-500">{item.unit}</div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full flex-shrink-0"
                onClick={() => handleAdjust(1)}
                disabled={isAdjusting}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {onEdit && (
        <Sheet open={showDrawer} onOpenChange={setShowDrawer}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <span className="text-4xl">{getCategoryEmoji(item.category)}</span>
                <span>{item.name}</span>
              </SheetTitle>
              <SheetDescription>
                View and manage item details
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              {/* Item Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                
                {item.expected_amount && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Expected Amount</span>
                    <span className="font-medium">{item.expected_amount} {item.unit}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-500">Category</span>
                  <span className="font-medium">{item.category}</span>
                </div>

                {item.location && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="font-medium">{item.location}</span>
                  </div>
                )}

                {item.expiry_date && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Expiry Date</span>
                    <span className={`font-medium ${
                      isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : ''
                    }`}>
                      {new Date(item.expiry_date).toLocaleDateString()}
                      {daysUntilExpiry !== null && (
                        <span className="text-xs ml-2">
                          ({isExpired 
                            ? `Expired ${Math.abs(daysUntilExpiry)} days ago` 
                            : `${daysUntilExpiry} days left`})
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {item.purchase_date && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-500">Purchase Date</span>
                    <span className="font-medium">{new Date(item.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}

                {item.notes && (
                  <div className="py-2">
                    <span className="text-sm text-gray-500 block mb-1">Notes</span>
                    <p className="text-sm text-gray-900">{item.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4">
                <Button
                  onClick={handleEdit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Item
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

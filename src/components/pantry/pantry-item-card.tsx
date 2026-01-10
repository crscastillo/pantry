import { useState } from 'react'
import { differenceInDays } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PantryItem } from '@/types'
import { Edit, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PantryItemCardProps {
  item: PantryItem
  onDelete: (id: string) => void
  onEdit: (item: PantryItem) => void
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

const getUnitTranslationKey = (unit: string) => {
  return `pantry.units.${unit}`
}

export function PantryItemCard({ item, onDelete, onEdit }: PantryItemCardProps) {
  const { t } = useTranslation()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  const today = new Date()
  const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, today) : null
  
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 2

  const handleEdit = () => {
    setShowDrawer(false)
    onEdit(item)
  }

  const handleDelete = () => {
    setShowDrawer(false)
    setShowDeleteDialog(true)
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 overflow-hidden">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="text-4xl flex-shrink-0">
            {getCategoryEmoji(item.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-medium text-gray-900">{item.quantity} {t(getUnitTranslationKey(item.unit))}</div>
                {item.location && (
                  <div className="text-xs text-gray-500">{item.location}</div>
                )}
              </div>
            </div>

            {/* Expiry Status */}
            {item.expiry_date && (
              <div className={`text-sm font-medium ${
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
              <div className="mt-1">
                {item.quantity < item.expected_amount ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    {t('pantry.lowStock')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {t('pantry.stocked')}
                  </Badge>
                )}
              </div>
            )}

            {/* Edit Link */}
            <div className="mt-2">
              <button
                onClick={() => setShowDrawer(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
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
                <span className="font-medium">{item.quantity} {t(getUnitTranslationKey(item.unit))}</span>
              </div>
              
              {item.expected_amount && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-500">Expected Amount</span>
                  <span className="font-medium">{item.expected_amount} {t(getUnitTranslationKey(item.unit))}</span>
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
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={handleEdit}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(item.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import { useState } from 'react'
import { differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { PantryItem } from '@/types'
import { ChevronRight } from 'lucide-react'
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

export function PantryItemCard({ item, onDelete, onEdit }: PantryItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const today = new Date()
  const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, today) : null
  
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 2

  return (
    <>
      <button
        onClick={() => onEdit(item)}
        className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 text-left"
      >
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
                <div className="text-sm font-medium text-gray-900">{item.quantity} {item.unit}</div>
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
                    : `${daysUntilExpiry} days in`
                }
              </div>
            )}

            {/* Stock Status */}
            {item.expected_amount && (
              <div className="mt-1">
                {item.quantity < item.expected_amount ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                    Low Stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Stocked
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Arrow Icon */}
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
        </div>
      </button>

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

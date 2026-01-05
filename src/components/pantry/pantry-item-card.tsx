import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PantryItem } from '@/types'
import { Calendar, MapPin, Package, Trash2, Edit } from 'lucide-react'
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

export function PantryItemCard({ item, onDelete, onEdit }: PantryItemCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isExpiringSoon = item.expiry_date && 
    new Date(item.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date()

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {item.quantity} {item.unit}
            </span>
          </div>

          {item.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.location}</span>
            </div>
          )}

          {item.expiry_date && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Expires: {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
              </span>
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
              {isExpiringSoon && !isExpired && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Expiring Soon
                </Badge>
              )}
            </div>
          )}

          {item.notes && (
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          )}
        </CardContent>
      </Card>

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

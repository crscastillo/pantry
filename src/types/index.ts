export interface PantryItem {
  id: string
  user_id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiry_date?: string | null
  purchase_date?: string | null
  location?: string | null
  notes?: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
}

export type PantryCategory = 
  | 'Fruits & Vegetables'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Bakery & Bread'
  | 'Pantry Staples'
  | 'Beverages'
  | 'Frozen'
  | 'Snacks'
  | 'Condiments'
  | 'Other'

export type PantryUnit = 
  | 'piece'
  | 'kg'
  | 'g'
  | 'lb'
  | 'oz'
  | 'l'
  | 'ml'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'package'
  | 'can'
  | 'bottle'

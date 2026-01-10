# Developer Quick Reference

## 🏗️ Architecture Overview

```
Components → Hooks → Services → Supabase
```

**Never call Supabase directly from components or hooks!**

## 📦 Services

### Pantry Service

```typescript
import { pantryService } from '@/services'

// Get all items
const items = await pantryService.getItems(userId)

// Get single item
const item = await pantryService.getItemById(itemId, userId)

// Create item
const newItem = await pantryService.createItem(userId, {
  name: 'Milk',
  category: 'Dairy & Eggs',
  quantity: 2,
  unit: 'l',
})

// Update item
const updated = await pantryService.updateItem(itemId, userId, {
  quantity: 3,
})

// Delete item
await pantryService.deleteItem(itemId, userId)

// Update quantity only
await pantryService.updateQuantity(itemId, userId, 5)

// Get expiring items (next 7 days)
const expiring = await pantryService.getExpiringItems(userId, 7)

// Get low stock items
const lowStock = await pantryService.getLowStockItems(userId)
```

### Auth Service

```typescript
import { authService } from '@/services'

// Sign in
const { user, session, error } = await authService.signIn({
  email: 'user@example.com',
  password: 'password123',
})

// Sign up
await authService.signUp({
  email: 'new@example.com',
  password: 'password123',
  fullName: 'John Doe',
})

// OAuth
await authService.signInWithProvider('google')

// Sign out
await authService.signOut()

// Get session
const { session } = await authService.getSession()

// Get profile
const profile = await authService.getProfile(userId)

// Update profile
await authService.updateProfile(userId, {
  full_name: 'New Name',
  avatar_url: 'https://...',
})
```

### Subscription Service

```typescript
import { subscriptionService } from '@/services'

// Get all tiers
const tiers = await subscriptionService.getTiers()

// Get specific tier
const tier = await subscriptionService.getTierById('pro-monthly')

// Create checkout session (redirects to Stripe)
await subscriptionService.createCheckoutSession(tierId, userId)

// Get user subscription
const subscription = await subscriptionService.getUserSubscription(userId)
```

## 🪝 React Hooks

### Pantry Hooks

```typescript
import {
  usePantryItems,
  useAddPantryItem,
  useUpdatePantryItem,
  useDeletePantryItem,
  useQuickAdjustQuantity,
} from '@/hooks/use-pantry'

// Get all items (with React Query)
const { data: items, isLoading, error } = usePantryItems()

// Add item
const addMutation = useAddPantryItem()
await addMutation.mutateAsync({
  name: 'Bread',
  category: 'Bakery & Bread',
  quantity: 1,
  unit: 'piece',
})

// Update item
const updateMutation = useUpdatePantryItem()
await updateMutation.mutateAsync({
  id: itemId,
  quantity: 2,
})

// Delete item
const deleteMutation = useDeletePantryItem()
await deleteMutation.mutateAsync(itemId)

// Quick adjust (+ or - quantity)
const adjustMutation = useQuickAdjustQuantity()
await adjustMutation.mutateAsync({ id: itemId, delta: 1 })
```

### Auth Hook

```typescript
import { useAuthStore } from '@/store/auth'

function MyComponent() {
  const { user, loading, signOut } = useAuthStore()
  
  if (loading) return <Loading />
  if (!user) return <Login />
  
  return <div>Welcome, {user.email}</div>
}
```

## 🧪 Testing

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { pantryService } from '@/services/pantry.service'

vi.mock('@/lib/supabase')

describe('PantryService', () => {
  it('should fetch items', async () => {
    // Setup mock
    const mockData = [{ id: '1', name: 'Milk' }]
    ;(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })
    
    // Test
    const result = await pantryService.getItems('user-123')
    expect(result).toEqual(mockData)
  })
})
```

### Integration Test Example

```typescript
describe.skip('Pantry Integration', () => {
  it('should complete full CRUD flow', async () => {
    const created = await pantryService.createItem(userId, itemData)
    expect(created).toBeDefined()
    
    const fetched = await pantryService.getItemById(created.id, userId)
    expect(fetched).toEqual(created)
    
    await pantryService.updateItem(created.id, userId, { quantity: 5 })
    await pantryService.deleteItem(created.id, userId)
  })
})
```

## 📝 Common Patterns

### Loading & Error States

```typescript
const { data, isLoading, error } = usePantryItems()

if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!data || data.length === 0) return <EmptyState />

return <ItemsList items={data} />
```

### Optimistic Updates

```typescript
const updateMutation = useUpdatePantryItem()

const handleUpdate = async (id: string, newQuantity: number) => {
  try {
    await updateMutation.mutateAsync({ id, quantity: newQuantity })
    toast({ title: 'Updated successfully' })
  } catch (error) {
    toast({ title: 'Error', description: error.message, variant: 'destructive' })
  }
}
```

### Form Handling

```typescript
import { CreatePantryItemDto } from '@/services'

const [formData, setFormData] = useState<CreatePantryItemDto>({
  name: '',
  category: 'Other',
  quantity: 1,
  unit: 'piece',
})

const addMutation = useAddPantryItem()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await addMutation.mutateAsync(formData)
    toast({ title: 'Item added' })
    onClose()
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' })
  }
}
```

## 🎨 UI Components

### shadcn/ui Usage

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'

// Use them like regular components
<Button variant="default" size="lg">Click me</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## 🔧 Environment Variables

```bash
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx

# Optional
VITE_OPENAI_API_KEY=sk-xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## 📋 Checklist for New Features

- [ ] Create/update service method in `src/services/`
- [ ] Write unit test in `src/services/__tests__/`
- [ ] Create/update hook in `src/hooks/`
- [ ] Use hook in component
- [ ] Handle loading/error states
- [ ] Add TypeScript types/DTOs
- [ ] Test in browser
- [ ] Run `npm test` to ensure tests pass
- [ ] Update documentation if needed

## 🚨 Common Mistakes to Avoid

1. ❌ Calling Supabase directly from components
2. ❌ Not handling loading/error states
3. ❌ Not using TypeScript types
4. ❌ Not writing tests for new services
5. ❌ Hardcoding user IDs instead of using `useAuthStore`
6. ❌ Forgetting to invalidate queries after mutations
7. ❌ Not using DTOs for service parameters

## 📚 Resources

- [Architecture Docs](./ARCHITECTURE.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vitest Docs](https://vitest.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

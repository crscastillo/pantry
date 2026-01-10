# Project Architecture

## Overview

The Pantry app follows a clean architecture pattern with clear separation of concerns:

```
src/
├── components/         # React components (UI layer)
├── pages/             # Page components
├── hooks/             # Custom React hooks
├── services/          # Business logic & API calls (NEW!)
├── store/             # State management (Zustand)
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
└── test/              # Test utilities and setup
```

## Service Layer Architecture

### Why We Use Services

The service layer provides:
- **Single source of truth** for API calls
- **Testability** - Easy to mock and unit test
- **Maintainability** - Changes to API only affect service layer
- **Type safety** - Strongly typed DTOs and responses
- **Error handling** - Consistent error handling across the app

### Services

#### 1. PantryService (`src/services/pantry.service.ts`)

Handles all pantry item operations:

```typescript
// Get all items for a user
await pantryService.getItems(userId)

// Create new item
await pantryService.createItem(userId, {
  name: 'Milk',
  category: 'Dairy & Eggs',
  quantity: 2,
  unit: 'l',
})

// Update item
await pantryService.updateItem(itemId, userId, {
  quantity: 3,
})

// Delete item
await pantryService.deleteItem(itemId, userId)

// Quick adjust quantity
await pantryService.updateQuantity(itemId, userId, newQuantity)

// Get expiring items (next 7 days)
await pantryService.getExpiringItems(userId, 7)

// Get low stock items
await pantryService.getLowStockItems(userId)
```

#### 2. AuthService (`src/services/auth.service.ts`)

Manages authentication:

```typescript
// Sign in
await authService.signIn({ email, password })

// Sign up
await authService.signUp({ email, password, fullName })

// OAuth sign in
await authService.signInWithProvider('google')

// Sign out
await authService.signOut()

// Get current session
await authService.getSession()

// Get user profile
await authService.getProfile(userId)

// Update profile
await authService.updateProfile(userId, updates)
```

#### 3. SubscriptionService (`src/services/subscription.service.ts`)

Handles subscriptions:

```typescript
// Get available tiers
await subscriptionService.getTiers()

// Get specific tier
await subscriptionService.getTierById(tierId)

// Create checkout session
await subscriptionService.createCheckoutSession(tierId, userId)

// Get user subscription
await subscriptionService.getUserSubscription(userId)
```

### How to Use Services in Components

**❌ DON'T do this:**
```typescript
// Don't call Supabase directly from components
const { data } = await supabase.from('pantry_items').select('*')
```

**✅ DO this:**
```typescript
// Use hooks that call services
import { usePantryItems } from '@/hooks/use-pantry'

function MyComponent() {
  const { data: items, isLoading } = usePantryItems()
  // ...
}
```

### How to Use Services in Hooks

```typescript
import { pantryService } from '@/services'
import { useQuery } from '@tanstack/react-query'

export function usePantryItems() {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['pantry-items', user?.id],
    queryFn: () => pantryService.getItems(user!.id),
    enabled: !!user,
  })
}
```

## Data Transfer Objects (DTOs)

Services use DTOs for type safety:

```typescript
// CreatePantryItemDto - for creating new items
interface CreatePantryItemDto {
  name: string
  category: string
  quantity: number
  unit: string
  expected_amount?: number | null
  expiry_date?: string | null
  purchase_date?: string | null
  location?: string | null
  notes?: string | null
  image_url?: string | null
}

// UpdatePantryItemDto - for updating items
interface UpdatePantryItemDto extends Partial<CreatePantryItemDto> {
  id: string
}
```

## State Management

- **Zustand** for global state (auth)
- **React Query** for server state (API data)
- **React hooks** for component state

## Error Handling

Services throw errors with descriptive messages:

```typescript
try {
  await pantryService.createItem(userId, itemData)
} catch (error) {
  // Error message includes context
  console.error(error.message) // "Failed to create item: [reason]"
}
```

## Testing Strategy

### Unit Tests
- Test services in isolation with mocked Supabase
- Test utilities and helper functions
- Located in `__tests__` folders next to source files

### Integration Tests
- Test full CRUD flows
- Require test database setup
- Marked with `describe.skip` until test DB configured

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test pantry.service.test
```

## Best Practices

### 1. Never Call Supabase Directly from Components
```typescript
// ❌ Bad
import { supabase } from '@/lib/supabase'

function Component() {
  const fetchData = async () => {
    const { data } = await supabase.from('pantry_items').select('*')
  }
}

// ✅ Good
import { usePantryItems } from '@/hooks/use-pantry'

function Component() {
  const { data } = usePantryItems()
}
```

### 2. Use DTOs for Type Safety
```typescript
// ✅ Good - Uses DTO
const item: CreatePantryItemDto = {
  name: 'Bread',
  category: 'Bakery & Bread',
  quantity: 1,
  unit: 'piece',
}
await pantryService.createItem(userId, item)
```

### 3. Handle Loading and Error States
```typescript
const { data, isLoading, error } = usePantryItems()

if (isLoading) return <Loading />
if (error) return <Error message={error.message} />
return <List items={data} />
```

### 4. Write Tests for New Services
Every new service method should have:
- Unit test with mocked dependencies
- Integration test (if applicable)
- Error case coverage

## Adding New Features

### 1. Add Service Method
```typescript
// src/services/pantry.service.ts
async getDuplicateItems(userId: string): Promise<PantryItem[]> {
  // Implementation
}
```

### 2. Add Unit Test
```typescript
// src/services/__tests__/pantry.service.test.ts
it('should find duplicate items', async () => {
  // Test implementation
})
```

### 3. Create Hook
```typescript
// src/hooks/use-pantry.ts
export function useDuplicateItems() {
  return useQuery({
    queryKey: ['duplicate-items'],
    queryFn: () => pantryService.getDuplicateItems(userId),
  })
}
```

### 4. Use in Component
```typescript
// src/components/duplicates-list.tsx
function DuplicatesList() {
  const { data } = useDuplicateItems()
  // Render logic
}
```

## File Organization

```
src/
├── services/
│   ├── __tests__/
│   │   ├── pantry.service.test.ts
│   │   ├── auth.service.test.ts
│   │   └── subscription.service.test.ts
│   ├── pantry.service.ts
│   ├── auth.service.ts
│   ├── subscription.service.ts
│   └── index.ts                    # Barrel export
├── hooks/
│   ├── use-pantry.ts               # Uses pantryService
│   ├── use-pantry.test.tsx
│   └── use-toast.ts
└── components/
    └── pantry/
        ├── pantry-item-card.tsx    # Uses hooks
        └── add-item-dialog.tsx
```

## Dependencies

- **@tanstack/react-query** - Server state management
- **zustand** - Client state management
- **@supabase/supabase-js** - Database client
- **vitest** - Testing framework
- **msw** - API mocking for tests

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Vitest Docs](https://vitest.dev/)
- [Supabase Docs](https://supabase.com/docs)

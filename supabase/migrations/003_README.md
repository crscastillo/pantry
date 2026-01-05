# Migration: Add Expected Amount Field

This migration adds the `expected_amount` column to the `pantry_items` table, allowing users to track both the current amount and the expected/desired amount they want to maintain in stock.

## To Run This Migration

### Option 1: Using Supabase CLI (Recommended)
If you have Supabase CLI installed:
```bash
supabase db push
```

### Option 2: Manual SQL Execution
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `003_add_expected_amount.sql`
4. Click "Run"

### Option 3: Using the migration scripts
```bash
npm run migrate:exec supabase/migrations/003_add_expected_amount.sql
```

## What This Changes

- Adds `expected_amount` column (nullable decimal) to `pantry_items` table
- Allows tracking desired stock levels for each item
- UI now shows:
  - Current Amount (required)
  - Expected Amount (optional)
  - "Low Stock" badge when current < expected
  - "Stocked" badge when current >= expected

## Features Added

1. **Three-column layout** in the Add/Edit dialog:
   - Current Amount (required)
   - Expected Amount (optional)
   - Unit (required)

2. **Visual stock indicators** on item cards:
   - Shows "X / Y units" format when expected amount is set
   - Orange "Low Stock" badge when inventory is below expected
   - Green "Stocked" badge when inventory meets or exceeds expected

3. **Smart defaults**:
   - Expected amount is optional (null by default)
   - Only shows stock status when expected amount is defined

# Subscription Tiers Migration

This migration adds database-driven subscription tiers to the Pantry app, replacing hardcoded pricing in the frontend.

## What Changed

### Database Changes
- **New Table**: `subscription_tiers` - Stores all subscription plan details
- **Seeded Data**: 3 default tiers (Free, Pro Monthly, Pro Yearly)
- **RLS Policies**: Public read access for active tiers
- **Auto-Updated**: Trigger to update `updated_at` timestamp

### Code Changes

1. **New Files**:
   - `src/types/subscription.ts` - TypeScript types for subscription tiers and user subscriptions
   - `src/lib/subscription.ts` - Service functions for fetching tiers and creating checkout sessions
   - `supabase/migrations/004_add_subscription_tiers.sql` - Database migration

2. **Modified Files**:
   - `src/pages/settings.tsx` - Now fetches tiers from database dynamically
   - Removed `src/lib/stripe.ts` hardcoded subscription plans

## Running the Migration

### 1. Apply Database Migration

```bash
# If using Supabase CLI (locally)
supabase db reset

# Or manually apply the migration in Supabase Dashboard
# Copy contents of supabase/migrations/004_add_subscription_tiers.sql
# and run it in the SQL Editor
```

### 2. Update Stripe Price IDs (Optional)

After running the migration, you need to add your Stripe Price IDs to the database:

```sql
-- Update Pro Monthly tier with your Stripe Price ID
UPDATE subscription_tiers 
SET stripe_price_id = 'price_your_monthly_price_id_here'
WHERE id = 'pro-monthly';

-- Update Pro Yearly tier with your Stripe Price ID
UPDATE subscription_tiers 
SET stripe_price_id = 'price_your_yearly_price_id_here'
WHERE id = 'pro-yearly';
```

**Note**: You can get these Price IDs from your Stripe Dashboard > Products > Prices

## Benefits of Database-Driven Tiers

✅ **Easy Configuration**: Change pricing, features, or add new tiers without code changes  
✅ **A/B Testing**: Create experimental tiers and toggle them via `is_active` flag  
✅ **Admin Panel Ready**: Build an admin UI to manage tiers without database access  
✅ **Scalable**: Add unlimited tiers (e.g., Enterprise, Student, etc.)  
✅ **Audit Trail**: Track when tiers were created/updated via timestamps  

## Table Schema

```sql
subscription_tiers (
  id              TEXT PRIMARY KEY,          -- e.g., 'free', 'pro-monthly'
  name            TEXT NOT NULL,              -- Display name
  price           DECIMAL(10,2) NOT NULL,    -- Price in dollars
  interval        TEXT NOT NULL,              -- 'month', 'year', or 'lifetime'
  stripe_price_id TEXT,                       -- Stripe Price ID (nullable for free tier)
  features        JSONB NOT NULL,             -- Array of feature strings
  is_active       BOOLEAN DEFAULT true,       -- Enable/disable tiers
  display_order   INTEGER DEFAULT 0,          -- Sort order for UI
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
)
```

## Adding New Tiers

To add a new subscription tier (e.g., Enterprise):

```sql
INSERT INTO subscription_tiers (id, name, price, interval, stripe_price_id, features, display_order) 
VALUES (
  'enterprise',
  'Enterprise',
  299.00,
  'month',
  'price_stripe_enterprise_id',
  '["Unlimited everything", "Priority support", "Custom integrations", "Dedicated account manager"]'::jsonb,
  4
);
```

The frontend will automatically display the new tier on the settings page!

## Disabling a Tier

To temporarily hide a tier without deleting it:

```sql
UPDATE subscription_tiers 
SET is_active = false 
WHERE id = 'pro-yearly';
```

## Environment Variables

No changes to `.env` required. Stripe Price IDs are now stored in the database, but you still need:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Supabase Edge Functions will handle Stripe API calls with secret key
```

## Testing

1. Start the dev server: `npm run dev`
2. Navigate to Settings page
3. Verify all 3 tiers load from the database
4. Check that "Coming Soon" appears if `stripe_price_id` is NULL
5. After adding Stripe Price IDs, verify checkout works

## Rollback

If you need to rollback this migration:

```sql
DROP TABLE IF EXISTS subscription_tiers CASCADE;
```

Then restore the hardcoded tiers in `src/lib/stripe.ts` from git history.

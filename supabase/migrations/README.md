# Supabase Migrations

This directory contains database migrations for the Pantry app. Migrations are applied in order based on their numeric prefix.

## Migration Structure

Each migration file follows this naming convention:
```
{number}_{description}.sql
```

Example: `001_initial_schema.sql`

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:
```bash
supabase db push
```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open each migration file in order (001, 002, etc.)
4. Copy and paste the SQL content
5. Execute the query

### Option 3: Using the migration script

Run migrations programmatically:
```bash
npm run migrate
```

## Current Migrations

- **001_initial_schema.sql** - Initial database schema
  - Creates `profiles` table
  - Creates `pantry_items` table
  - Sets up Row Level Security (RLS) policies
  - Creates indexes for performance
  - Sets up triggers for auto-creating user profiles
  - Adds `updated_at` auto-update triggers

## Creating New Migrations

1. Create a new file with the next number:
```bash
touch supabase/migrations/002_your_migration_name.sql
```

2. Add your SQL changes:
```sql
-- Migration: 002_your_migration_name
-- Description: What this migration does
-- Created: YYYY-MM-DD

-- Your SQL here
```

3. Apply the migration using one of the methods above

## Best Practices

- **Never modify existing migrations** - Create new ones instead
- **Test migrations locally first** if possible
- **Always include rollback information** in comments if the migration can't be easily reversed
- **Use transactions** when appropriate
- **Document breaking changes** clearly

## Migration Checklist

Before applying a migration:
- [ ] SQL syntax is correct
- [ ] Handles existing data appropriately
- [ ] RLS policies are correctly set up
- [ ] Indexes are created for foreign keys
- [ ] Triggers and functions are properly defined
- [ ] Migration is idempotent (can run multiple times safely)

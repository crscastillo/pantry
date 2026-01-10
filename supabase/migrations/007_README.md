# User Settings Migration

## Overview
This migration adds a `settings` JSONB column to the `profiles` table to store user preferences like language, theme, and notification settings.

## Migration Details
- **File**: `007_add_user_settings.sql`
- **Date**: 2026-01-10
- **Table**: `profiles`
- **Column**: `settings JSONB DEFAULT '{}'::jsonb`

## To Apply Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `007_add_user_settings.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI
```bash
# If using Supabase CLI
supabase migration up
```

## Settings Structure

The `settings` column stores JSON data with the following structure:

```json
{
  "language": "en",
  "theme": "light",
  "notifications": {
    "email": true,
    "expiry_alerts": true
  }
}
```

### Supported Languages
- `en` - English
- `es` - Spanish (Español)
- `fr` - French (Français)

## Features Added

### 1. Database Storage
- User language preferences are now stored in the database
- Settings persist across devices for logged-in users
- JSONB column allows for flexible schema evolution

### 2. New Functions (`src/lib/user-settings.ts`)
- `getUserSettings(userId)` - Fetch user settings from database
- `updateUserSettings(userId, settings)` - Update user settings
- `updateUserLanguage(userId, language)` - Convenience function for language updates

### 3. Updated Components
- **Settings Page** (`src/pages/settings.tsx`)
  - Language changes now save to database
  - Instant UI feedback with localStorage
  - Error handling for failed updates

- **App.tsx**
  - Loads user settings on authentication
  - Syncs language preference automatically

### 4. Custom Hook
- `useUserSettings()` - Automatically loads and applies user settings when user logs in

## Usage

### Change Language Programmatically
```typescript
import { updateUserLanguage } from '@/lib/user-settings'

const userId = user.id
await updateUserLanguage(userId, 'es') // Change to Spanish
```

### Update Multiple Settings
```typescript
import { updateUserSettings } from '@/lib/user-settings'

await updateUserSettings(userId, {
  language: 'fr',
  theme: 'dark',
  notifications: {
    email: true,
    expiry_alerts: false
  }
})
```

## Benefits

1. **Cross-Device Sync**: Settings follow users across all their devices
2. **Persistence**: Settings are stored permanently in the database
3. **Flexibility**: JSONB allows adding new settings without schema changes
4. **Performance**: GIN index on settings column for fast queries
5. **Type Safety**: TypeScript interfaces ensure type-safe settings updates

## Migration Status

Run this SQL to check if migration is applied:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'settings';
```

Expected result:
```
column_name | data_type
settings    | jsonb
```

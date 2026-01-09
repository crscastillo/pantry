# Session Configuration

## JWT Expiry Settings

To ensure tokens expire after 1 day of inactivity, the following settings should be configured in your Supabase dashboard:

### In Supabase Dashboard:
1. Go to **Settings** → **Auth**
2. Set the following JWT expiry times:
   - **JWT Expiry Limit**: `86400` seconds (24 hours)
   - **Refresh Token Expiry**: `2592000` seconds (30 days)

### How It Works:
- **Access tokens** expire after 24 hours
- **Refresh tokens** are valid for 30 days
- The app automatically refreshes access tokens when the user is active
- If there's no activity for 24+ hours, the user will need to sign in again
- Activity is tracked via mouse, keyboard, scroll, touch, and click events

### Client-Side Implementation:
The `src/lib/supabase.ts` file implements:
- Custom storage adapter to track last activity timestamp
- Activity tracking on user interactions
- Periodic inactivity checks (every 5 minutes)
- Automatic sign-out after 24 hours of inactivity

### Testing:
To test the inactivity timeout:
1. Sign in to the app
2. Use the app normally
3. Close the browser/tab
4. Wait 24+ hours
5. Open the app again - you should be signed out

Or for faster testing, modify the timeout in `src/lib/supabase.ts`:
```typescript
const oneDayInMs = 24 * 60 * 60 * 1000 // Change to smaller value for testing
```

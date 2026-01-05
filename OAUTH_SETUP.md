# OAuth Setup Guide

## Setting up Google and Facebook SSO in Supabase

### Prerequisites
- Access to your Supabase dashboard
- Google Cloud Console account (for Google OAuth)
- Facebook Developer account (for Facebook OAuth)

---

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure the OAuth consent screen if prompted
7. Add authorized redirect URIs:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
8. Click **Create** and save your:
   - Client ID
   - Client Secret

### 2. Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and enable it
5. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

---

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in your app details and create the app
5. In the dashboard, go to **Settings** → **Basic**
6. Note your **App ID** and **App Secret**
7. Add **Facebook Login** product to your app
8. In **Facebook Login** → **Settings**, add OAuth redirect URI:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```

### 2. Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Facebook** and enable it
5. Enter your Facebook OAuth credentials:
   - **Client ID**: (App ID from Facebook)
   - **Client Secret**: (App Secret from Facebook)
6. Click **Save**

---

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login or signup page

3. Click the **Google** or **Facebook** button

4. You should be redirected to the provider's login page

5. After successful authentication, you'll be redirected back to `/dashboard`

---

## Important Notes

### Development URLs
For local development, you may need to add these URLs to your OAuth provider settings:
- Google: `http://localhost:5173/auth/callback`
- Facebook: `http://localhost:5173/auth/callback`

### Production URLs
Before deploying, update your OAuth provider settings with your production URLs:
- `https://yourdomain.com/auth/callback`

### Security
- Never commit OAuth secrets to your repository
- Store them as environment variables in Supabase
- Use different OAuth apps for development and production

### Troubleshooting

**Issue**: "redirect_uri_mismatch" error
- **Solution**: Ensure the redirect URI in your OAuth provider settings exactly matches the Supabase callback URL

**Issue**: Users not being created in database
- **Solution**: Check that your database trigger for user profile creation is working

**Issue**: Authentication works but profile isn't loaded
- **Solution**: Verify the `checkAuth()` function in your auth store is being called on app initialization

---

## Additional Configuration

### Customize OAuth Scopes (Optional)

You can customize what data you request from OAuth providers in `src/store/auth.ts`:

```typescript
signInWithProvider: async (provider: 'google' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'email profile', // Customize scopes here
    },
  })
  // ...
}
```

### Handle Profile Data

OAuth providers return different user metadata. You may want to extract and save additional profile information:

```typescript
// In your auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    const { user } = session
    // Access provider metadata
    const metadata = user.user_metadata
    // Save to your user profile table
  }
})
```

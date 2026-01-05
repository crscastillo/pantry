# OAuth Configuration Scripts

This directory contains scripts to automate OAuth provider setup in Supabase.

## Quick Start

### 1. Get Supabase Access Token

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click on your profile (bottom left)
3. Go to **Access Tokens**
4. Click **Generate New Token**
5. Give it a name like "OAuth Setup"
6. Copy the token (you'll only see it once!)

### 2. Get Your Project Reference

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find your **Project URL**: `https://YOUR-PROJECT-REF.supabase.co`
3. The `YOUR-PROJECT-REF` part is what you need

### 3. Create Environment File

Copy the example environment file:

```bash
cp .env.oauth.example .env.oauth
```

Edit `.env.oauth` and fill in your credentials:

```bash
# Required
SUPABASE_PROJECT_REF=abc123def456
SUPABASE_ACCESS_TOKEN=sbp_1234567890abcdef...

# At least one provider required
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

FACEBOOK_CLIENT_ID=1234567890123456
FACEBOOK_CLIENT_SECRET=abc123def456...
```

### 4. Run the Setup Script

```bash
# Load environment variables and run the script
export $(cat .env.oauth | xargs) && node scripts/setup-oauth.js
```

Or use the npm script:

```bash
npm run setup:oauth
```

## What the Script Does

The script uses the Supabase Management API to:

1. ✅ Enable Google OAuth provider (if credentials provided)
2. ✅ Configure Google client ID and secret
3. ✅ Set the correct redirect URI
4. ✅ Enable Facebook OAuth provider (if credentials provided)
5. ✅ Configure Facebook app ID and secret
6. ✅ Set the correct redirect URI

## Manual Configuration (Alternative)

If you prefer to configure OAuth providers manually or the script doesn't work:

1. Follow the instructions in [OAUTH_SETUP.md](../OAUTH_SETUP.md)
2. Configure providers through the Supabase Dashboard UI

## Troubleshooting

### "Missing required environment variables"

Make sure you've set all required variables in `.env.oauth`:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- At least one set of OAuth credentials

### "HTTP 401: Unauthorized"

Your `SUPABASE_ACCESS_TOKEN` is invalid or expired:
1. Generate a new access token in Supabase Dashboard
2. Update your `.env.oauth` file
3. Try again

### "HTTP 404: Not Found"

Your `SUPABASE_PROJECT_REF` is incorrect:
1. Check your project URL in Supabase Dashboard
2. Extract the project reference from the URL
3. Update your `.env.oauth` file

### "Failed to configure [Provider] OAuth"

The OAuth credentials might be incorrect:
1. Verify your client ID and secret
2. Make sure you copied them correctly
3. Check that there are no extra spaces or newlines

## Security Notes

⚠️ **Important**: 

- **Never commit `.env.oauth` to version control**
- The `.gitignore` file should already exclude it
- Access tokens have full project access - keep them secure
- Revoke tokens when no longer needed
- Use different tokens for different environments

## Testing

After running the script:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page

3. Click "Google" or "Facebook" button

4. You should be redirected to the OAuth provider

5. After successful authentication, you'll return to your app

## Additional Resources

- [Supabase Management API Docs](https://supabase.com/docs/reference/api)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup Guide](../OAUTH_SETUP.md#google-oauth-setup)
- [Facebook OAuth Setup Guide](../OAUTH_SETUP.md#facebook-oauth-setup)

# Supabase Email Templates

This directory contains custom HTML email templates for Supabase authentication emails.

## Available Templates

### 1. Confirm Signup (`confirm-signup.html`)
Used when a new user signs up and needs to verify their email address.

**Variables available:**
- `{{ .ConfirmationURL }}` - The confirmation link for email verification
- `{{ .Token }}` - The verification token (if needed)
- `{{ .TokenHash }}` - The hashed token (if needed)
- `{{ .SiteURL }}` - Your application URL

## How to Apply Templates to Supabase

### Method 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Confirm signup** from the template dropdown
4. Copy the contents of `confirm-signup.html`
5. Paste into the template editor
6. Click **Save**

### Method 2: Via Supabase CLI

You can update email templates using the Supabase CLI:

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Update the template using the API
# Note: This requires using the Management API directly
```

### Method 3: Via Management API

Use the Supabase Management API to update templates programmatically:

```bash
curl -X PUT "https://api.supabase.com/v1/projects/{project-ref}/config/auth" \
  -H "Authorization: Bearer {service-role-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "MAILER_TEMPLATES_CONFIRMATION": "<html>...</html>"
  }'
```

## Template Customization

### Colors
The template uses a green color scheme matching the Pantry Fast branding:
- Primary Green: `#10b981` (emerald-500)
- Dark Green: `#059669` (emerald-600)

### Fonts
Uses system fonts for maximum compatibility:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Responsive Design
The template is mobile-responsive with breakpoints at 600px.

## Template Variables

Supabase provides these variables that you can use in your templates:

| Variable | Description | Available In |
|----------|-------------|--------------|
| `{{ .ConfirmationURL }}` | Full confirmation link with token | Confirm Signup |
| `{{ .Token }}` | Raw confirmation token | Confirm Signup |
| `{{ .TokenHash }}` | Hashed token | Confirm Signup |
| `{{ .SiteURL }}` | Your application's URL | All templates |
| `{{ .Email }}` | User's email address | All templates |

## Testing Templates

### Local Testing with Inbucket

If you're running Supabase locally, emails are captured by Inbucket:

1. Start your local Supabase:
   ```bash
   supabase start
   ```

2. Access Inbucket at: `http://localhost:54324`

3. Sign up a test user in your app

4. Check Inbucket to see the rendered email

### Testing in Production

1. Update the template in your Supabase dashboard
2. Create a test account with a real email you can access
3. Check the email to verify formatting and links work correctly
4. Test on multiple email clients (Gmail, Outlook, Apple Mail, etc.)

## Other Supabase Email Templates

You may also want to customize these additional templates:

- **Invite User** - When inviting users to your application
- **Magic Link** - For passwordless authentication
- **Change Email Address** - When users change their email
- **Reset Password** - For password recovery

To create these, follow the same process and use the appropriate Supabase variables for each template type.

## Best Practices

1. **Keep it Simple**: Email clients have varying HTML/CSS support
2. **Inline CSS**: Use inline styles for better compatibility
3. **Test Thoroughly**: Test on multiple email clients and devices
4. **Clear CTAs**: Make action buttons prominent and easy to click
5. **Fallback Text**: Always provide a plain text version of links
6. **Branding**: Keep consistent with your app's visual identity
7. **Mobile First**: Ensure templates work well on mobile devices

## Support

For issues with Supabase email templates:
- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Discord Community](https://discord.supabase.com/)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

## Future Enhancements

Consider adding templates for:
- Password reset emails
- Email change confirmation
- Welcome email (already implemented via Resend)
- Account deletion confirmation
- Expiry alerts
- Shopping list reminders

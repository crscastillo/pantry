# Email Integration with Resend

## Overview
This project uses [Resend](https://resend.com) to send transactional emails to users. Currently implemented:
- **Welcome Email**: Sent automatically when a new user signs up

## Setup Instructions

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy your API key (starts with `re_`)

### 2. Configure Domain (Production)

For production emails, you need to verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `pantryfast.com`)
4. Add the provided DNS records to your domain:
   - TXT record for domain verification
   - MX records for email receiving (optional)
   - DKIM records for email authentication

**Note**: For development/testing, you can use Resend's test domain (`onboarding@resend.dev`), but emails will only be sent to your registered email address.

### 3. Deploy Supabase Edge Function

The email sending logic is handled by a Supabase Edge Function.

#### Local Development

```bash
# Make sure you have Supabase CLI installed
supabase functions serve send-welcome-email --env-file .env

# Test the function locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","fullName":"Test User","userId":"test-id"}'
```

#### Deploy to Supabase

```bash
# Deploy the function
supabase functions deploy send-welcome-email

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 4. Environment Variables

Add these to your environment:

#### Local Development (.env)
```env
RESEND_API_KEY=re_your_api_key_here
```

#### Supabase (Edge Function Secrets)
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

## Email Templates

### Welcome Email

**Trigger**: User signs up for the first time
**From**: `Pantry Fast <noreply@pantryfast.com>`
**Subject**: Welcome to Pantry Fast! 🎉

**Content Includes**:
- Personalized greeting with user's name
- Quick start guide with 4 key actions
- Call-to-action button to dashboard
- Pro tip about enabling expiry alerts
- Footer with unsubscribe and privacy links

## Customization

### Update Email Content

Edit the HTML template in `supabase/functions/send-welcome-email/index.ts`:

```typescript
html: `
  <!DOCTYPE html>
  <html>
    <!-- Your custom email template -->
  </html>
`
```

### Update "From" Email

Change the sender in the Edge Function:

```typescript
from: 'Pantry Fast <noreply@pantryfast.com>', // Update this
```

**Note**: The email address must be from your verified domain in Resend.

### Add More Email Types

Create new Edge Functions for different email types:

```bash
# Create a new email function
supabase functions new send-expiry-alert

# Deploy it
supabase functions deploy send-expiry-alert
```

## Testing

### Test Welcome Email Locally

1. Start the Edge Function locally:
```bash
supabase functions serve send-welcome-email --env-file .env
```

2. Sign up a new user through the app
3. Check the function logs for success/errors
4. Check your email inbox

### Test in Production

1. Deploy the function to Supabase
2. Sign up with a real email address
3. Check your inbox for the welcome email
4. Check Supabase function logs: **Dashboard → Edge Functions → send-welcome-email → Logs**

## Monitoring

### View Email Logs

**Resend Dashboard**:
- Go to [resend.com/emails](https://resend.com/emails)
- See all sent emails with delivery status
- Click any email to see full details and preview

**Supabase Logs**:
```bash
# View function logs
supabase functions logs send-welcome-email
```

Or in the Supabase Dashboard:
- **Edge Functions** → **send-welcome-email** → **Logs**

## Troubleshooting

### Email Not Sending

1. **Check Resend API Key**:
   - Verify it's set correctly in Supabase secrets
   - Make sure it starts with `re_`

2. **Check Function Logs**:
   ```bash
   supabase functions logs send-welcome-email --limit 50
   ```

3. **Verify Domain**:
   - If using custom domain, ensure DNS records are properly configured
   - Check domain verification status in Resend dashboard

4. **Test Function Directly**:
   ```bash
   curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-welcome-email' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"email":"your@email.com","fullName":"Test","userId":"test"}'
   ```

### Email Goes to Spam

1. **Setup SPF, DKIM, DMARC**:
   - Add all DNS records provided by Resend
   - Wait for DNS propagation (can take 24-48 hours)

2. **Warm Up Your Domain**:
   - Start by sending to engaged users
   - Gradually increase email volume

3. **Improve Email Content**:
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML structure

## Cost

Resend pricing:
- **Free Tier**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

[View full pricing](https://resend.com/pricing)

## Security

- API keys are stored as Supabase secrets (never in code)
- Edge Function requires authentication
- User can only send email to their own address
- Rate limiting handled by Resend

## Next Steps

Consider adding these email types:
- [ ] Password reset confirmation
- [ ] Expiry alerts (items about to expire)
- [ ] Weekly pantry summary
- [ ] Low stock notifications
- [ ] Recipe suggestions based on inventory

// Supabase Edge Function to send welcome emails using Resend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WelcomeEmailRequest {
  email: string
  fullName?: string
  userId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { email, fullName, userId }: WelcomeEmailRequest = await req.json()

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Pantry Fast <noreply@pantryfast.com>',
        to: [email],
        subject: 'Welcome to Pantry Fast! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Pantry Fast</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px;">🍽️ Welcome to Pantry Fast!</h1>
              </div>
              
              <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #10b981; margin-top: 0;">Hi${fullName ? ` ${fullName}` : ''}! 👋</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for joining Pantry Fast! We're excited to help you manage your home pantry smarter with AI.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <h3 style="margin-top: 0; color: #059669;">✨ Get Started:</h3>
                  <ul style="padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 10px;">Add your first pantry items</li>
                    <li style="margin-bottom: 10px;">Set expected amounts for smart restocking alerts</li>
                    <li style="margin-bottom: 10px;">Track expiry dates to reduce food waste</li>
                    <li style="margin-bottom: 10px;">Get AI-powered recipe suggestions</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${SUPABASE_URL.replace('.supabase.co', '')}/app/dashboard" 
                     style="background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                    Go to Dashboard
                  </a>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    💡 <strong>Pro Tip:</strong> Enable expiry alerts in settings to get notified before items expire!
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                  Need help? Reply to this email or visit our help center.
                </p>
                
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  Happy organizing! 🌟<br>
                  The Pantry Fast Team
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                <p style="margin: 0 0 10px 0;">© 2026 Pantry Fast. All rights reserved.</p>
                <p style="margin: 0;">
                  <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
                  <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})

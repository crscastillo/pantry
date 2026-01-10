import { supabase } from './supabase'

export interface SendWelcomeEmailParams {
  email: string
  fullName?: string
  userId: string
}

/**
 * Send welcome email to newly registered user via Supabase Edge Function
 */
export async function sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('No active session for sending email')
      return { success: false, error: 'No active session' }
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        email: params.email,
        fullName: params.fullName,
        userId: params.userId,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) {
      console.error('Error calling send-welcome-email function:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Welcome email sent successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Exception sending welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

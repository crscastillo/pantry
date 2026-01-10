import { supabase } from '@/lib/supabase'
import type { SubscriptionTier } from '@/types/subscription'

export class SubscriptionService {
  /**
   * Fetch all active subscription tiers from the database
   */
  async getTiers(): Promise<SubscriptionTier[]> {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[SubscriptionService] Error fetching tiers:', error)
      throw new Error(`Failed to fetch subscription tiers: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a specific subscription tier by ID
   */
  async getTierById(tierId: string): Promise<SubscriptionTier | null> {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('[SubscriptionService] Error fetching tier:', error)
      throw new Error(`Failed to fetch subscription tier: ${error.message}`)
    }

    return data
  }

  /**
   * Create a Stripe checkout session for a subscription
   */
  async createCheckoutSession(tierId: string, userId: string): Promise<void> {
    try {
      const tier = await this.getTierById(tierId)

      if (!tier) {
        throw new Error('Subscription tier not found')
      }

      if (!tier.stripe_price_id) {
        throw new Error('Stripe price ID not configured for this tier')
      }

      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: tier.stripe_price_id,
          userId: userId,
        },
      })

      if (error) throw error

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('[SubscriptionService] Error creating checkout session:', error)
      throw error
    }
  }

  /**
   * Create a Stripe customer portal session for managing subscriptions
   */
  async createPortalSession(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { userId },
      })

      if (error) throw error

      // Redirect to Stripe Customer Portal
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('[SubscriptionService] Error creating portal session:', error)
      throw error
    }
  }

  /**
   * Get user's current subscription status
   */
  async getUserSubscription(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No active subscription
      console.error('[SubscriptionService] Error fetching subscription:', error)
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    return data
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()

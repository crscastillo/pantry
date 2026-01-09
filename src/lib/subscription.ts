import { supabase } from './supabase'
import type { SubscriptionTier } from '@/types/subscription'

/**
 * Fetch all active subscription tiers from the database
 */
export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching subscription tiers:', error)
    throw new Error('Failed to fetch subscription tiers')
  }

  return data || []
}

/**
 * Get a specific subscription tier by ID
 */
export async function getSubscriptionTier(tierId: string): Promise<SubscriptionTier | null> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('id', tierId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching subscription tier:', error)
    return null
  }

  return data
}

/**
 * Create a Stripe checkout session for a subscription
 */
export async function createCheckoutSession(
  tierId: string,
  userId: string
): Promise<void> {
  try {
    // Get the subscription tier to get the Stripe price ID
    const tier = await getSubscriptionTier(tierId)
    
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
        userId,
        tierId: tier.id,
      },
    })

    if (error) {
      throw error
    }

    // Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

/**
 * Create a Stripe customer portal session for managing subscriptions
 */
export async function createPortalSession(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session')

    if (error) {
      throw error
    }

    // Redirect to Stripe Customer Portal
    if (data?.url) {
      window.location.href = data.url
    } else {
      throw new Error('No portal URL returned')
    }
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

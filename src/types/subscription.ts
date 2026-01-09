export interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'month' | 'year' | 'lifetime'
  stripe_price_id: string | null
  features: string[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

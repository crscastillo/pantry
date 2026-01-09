export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  stripePriceId: string
  features: string[]
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    stripePriceId: '',
    features: [
      'Up to 50 pantry items',
      'Manual pantry entry',
      '5 AI scans per month',
      'Shopping list',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 7,
    interval: 'month',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
    features: [
      'Unlimited pantry items',
      'Unlimited AI photo scans',
      'Expiry reminders',
      'AI recipe suggestions',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: 69,
    interval: 'year',
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || '',
    features: [
      'Unlimited pantry items',
      'Unlimited AI photo scans',
      'Expiry reminders',
      'AI recipe suggestions',
      'Save $15/year',
    ],
  },
]

export async function createCheckoutSession(priceId: string, userId: string) {
  try {
    // Call your backend to create a Stripe checkout session
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        successUrl: `${window.location.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/settings`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { url } = await response.json()

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function createPortalSession(customerId: string) {
  try {
    // Call your backend to create a Stripe portal session
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

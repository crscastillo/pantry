-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year', 'lifetime')),
  stripe_price_id TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for active tiers
CREATE INDEX idx_subscription_tiers_active ON subscription_tiers(is_active, display_order);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (id, name, price, interval, stripe_price_id, features, display_order) VALUES
(
  'free',
  'Free',
  0.00,
  'month',
  NULL,
  '["Up to 50 pantry items", "Manual pantry entry", "5 AI scans per month", "Shopping list"]'::jsonb,
  1
),
(
  'pro-monthly',
  'Pro Monthly',
  7.00,
  'month',
  NULL, -- Will be set via environment variable or admin panel
  '["Unlimited pantry items", "Unlimited AI photo scans", "Expiry reminders", "AI recipe suggestions"]'::jsonb,
  2
),
(
  'pro-yearly',
  'Pro Yearly',
  69.00,
  'year',
  NULL, -- Will be set via environment variable or admin panel
  '["Unlimited pantry items", "Unlimited AI photo scans", "Expiry reminders", "AI recipe suggestions", "Save $15/year"]'::jsonb,
  3
);

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active subscription tiers (public pricing)
CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers
  FOR SELECT
  USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_tiers_updated_at();

-- Grant permissions
GRANT SELECT ON subscription_tiers TO anon, authenticated;

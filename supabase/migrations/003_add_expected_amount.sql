-- Add expected_amount column to pantry_items table
ALTER TABLE pantry_items 
ADD COLUMN IF NOT EXISTS expected_amount DECIMAL(10, 2);

-- Add comment to describe the column
COMMENT ON COLUMN pantry_items.expected_amount IS 'The desired/expected quantity to maintain in stock';
